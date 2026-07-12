import crypto from "node:crypto";
import { eq, and, isNull } from "drizzle-orm";
import { SignJWT } from "jose";

import { db } from "../../config/database";
import { oauthAuthorizationCodes } from "./models/oauth-authorization-codes.model";
import { oauthConsents } from "./models/oauth-consents.model";
import { oauthClients } from "../clients/models/oauth-clients.model";
import { users } from "../identity/models/users.model";
import { TokenService } from "../security/services/token.service";
import { JwtService } from "../security/services/jwt.service";
import { ClientsService } from "../clients/clients.service";
import { ApiError } from "../../shared/utils/api-error.util";
import { refreshTokens } from "../sessions/models/refresh-tokens.model";
import { sessions } from "../sessions/models/sessions.model";

export class OAuthService {
  /**
   * Generate an authorization code during the authorization flow.
   */
  static async createAuthorizationCode(
    clientId: string,
    userId: string,
    sessionId: string | null,
    redirectUri: string,
    codeChallenge: string,
    codeChallengeMethod: string,
    scopes: string[],
    nonce?: string,
  ) {
    await ClientsService.validateRedirectUri(clientId, redirectUri);

    const code = TokenService.generateAuthorizationCode();
    const codeHash = TokenService.hashToken(code);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Auth codes expire in 10 minutes

    await db.insert(oauthAuthorizationCodes).values({
      codeHash,
      clientId,
      userId,
      sessionId: sessionId || undefined,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      scopes,
      nonce,
      expiresAt,
    });

    return code;
  }

  /**
   * Exchange an authorization code for tokens.
   */
  static async exchangeAuthorizationCode(
    clientId: string,
    code: string,
    redirectUri: string,
    codeVerifier: string,
  ) {
    const codeHash = TokenService.hashToken(code);

    const [authCode] = await db
      .select()
      .from(oauthAuthorizationCodes)
      .where(eq(oauthAuthorizationCodes.codeHash, codeHash))
      .limit(1);

    if (!authCode) {
      throw ApiError.unauthorized("Invalid authorization code", "INVALID_CODE");
    }

    if (authCode.clientId !== clientId) {
      throw ApiError.unauthorized("Client ID mismatch", "INVALID_CLIENT");
    }

    if (authCode.redirectUri !== redirectUri) {
      throw ApiError.unauthorized("Redirect URI mismatch", "INVALID_REDIRECT_URI");
    }

    if (new Date() > authCode.expiresAt) {
      throw ApiError.unauthorized("Authorization code expired", "EXPIRED_CODE");
    }

    if (authCode.consumedAt) {
      // Security: The code was already used. We should revoke all tokens issued by this code!
      throw ApiError.unauthorized("Authorization code already consumed", "REUSED_CODE");
    }

    // Verify PKCE
    let isValidPKCE = false;
    if (authCode.codeChallengeMethod === "S256") {
      const hashedVerifier = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");
      isValidPKCE = hashedVerifier === authCode.codeChallenge;
    } else if (authCode.codeChallengeMethod === "plain") {
      isValidPKCE = codeVerifier === authCode.codeChallenge;
    }

    if (!isValidPKCE) {
      throw ApiError.unauthorized("Invalid PKCE code_verifier", "INVALID_PKCE");
    }

    // Mark code as consumed
    await db
      .update(oauthAuthorizationCodes)
      .set({ consumedAt: new Date() })
      .where(eq(oauthAuthorizationCodes.id, authCode.id));

    return OAuthService.issueTokens(
      clientId,
      authCode.userId,
      authCode.sessionId || null,
      authCode.scopes,
      authCode.nonce || undefined,
    );
  }

  /**
   * Generate Access Token and ID Token.
   */
  static async issueTokens(
    clientId: string,
    userId: string,
    sessionId: string | null,
    scopes: string[],
    nonce?: string,
  ) {
    // 1. Generate Access Token (JWT format)
    const accessTokenPayload = {
      sub: userId,
      client_id: clientId,
      scope: scopes.join(" "),
      sid: sessionId || undefined,
    };

    const accessToken = await JwtService.signAccessToken(accessTokenPayload, "1h");

    // 2. Fetch User for ID Token claims
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw ApiError.internal("User not found during token issuance");
    }

    // 3. Generate ID Token (OIDC format)
    const jwk = await JwtService.getPublicJwk();
    const idTokenPayload: any = {
      iss: "http://localhost:8000",
      sub: userId,
      aud: clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    if (nonce) {
      idTokenPayload.nonce = nonce;
    }

    // Add profile claims if "profile" scope was requested
    if (scopes.includes("profile")) {
      idTokenPayload.given_name = user.givenName;
      idTokenPayload.family_name = user.familyName;
    }

    // Sign the ID Token using the private key configured in JwtService
    const idToken = await new SignJWT(idTokenPayload)
      .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: (jwk as any).kid })
      .sign(Reflect.get(JwtService, "privateKey")); // Access private key from JwtService

    // Generate Refresh Token and store it in refresh_tokens table if offline_access is requested
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const [newSession] = await db
        .insert(sessions)
        .values({ userId, expiresAt })
        .returning();
      if (newSession) {
        activeSessionId = newSession.id;
      }
    }

    let refreshTokenValue: string | undefined;

    if (scopes.includes("offline_access") && activeSessionId) {
      refreshTokenValue = TokenService.generateRefreshToken();
      const refreshTokenHash = TokenService.hashToken(refreshTokenValue);
      const tokenJti = `oauth:${clientId}:${TokenService.generateJti()}`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // OIDC refresh tokens valid for 30 days

      const [refreshTokenRecord] = await db
        .insert(refreshTokens)
        .values({
          sessionId: activeSessionId,
          tokenJti,
          tokenHash: refreshTokenHash,
          expiresAt,
        })
        .returning();

      if (refreshTokenRecord) {
        await db
          .update(sessions)
          .set({ currentRefreshTokenId: refreshTokenRecord.id })
          .where(eq(sessions.id, activeSessionId));
      }
    }

    return {
      access_token: accessToken,
      id_token: idToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: scopes.join(" "),
      ...(refreshTokenValue ? { refresh_token: refreshTokenValue } : {}),
    };
  }

  /**
   * Rotate an OIDC refresh token.
   */
  static async rotateRefreshToken(
    clientId: string,
    refreshTokenValue: string,
  ) {
    const refreshTokenHash = TokenService.hashToken(refreshTokenValue);

    // 1. Fetch current refresh token from DB
    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, refreshTokenHash),
          isNull(refreshTokens.revokedAt),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      throw ApiError.unauthorized("Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    // 2. Validate JTI binding contains client ID
    if (!tokenRecord.tokenJti.startsWith("oauth:")) {
      throw ApiError.unauthorized("Not an OIDC refresh token", "INVALID_REFRESH_TOKEN");
    }

    const parts = tokenRecord.tokenJti.split(":");
    const tokenClientId = parts[1];
    if (tokenClientId !== clientId) {
      throw ApiError.unauthorized("Client ID mismatch", "INVALID_CLIENT");
    }

    // 3. Verify expiration
    if (tokenRecord.expiresAt < new Date()) {
      await db
        .update(refreshTokens)
        .set({
          revokedAt: new Date(),
          revokedReason: "Token expired",
        })
        .where(eq(refreshTokens.id, tokenRecord.id));

      throw ApiError.unauthorized("Refresh token expired", "REFRESH_TOKEN_EXPIRED");
    }

    // 4. Verify session is active
    const [sessionRecord] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, tokenRecord.sessionId),
          isNull(sessions.revokedAt),
        ),
      )
      .limit(1);

    if (!sessionRecord) {
      throw ApiError.unauthorized("Session not found or revoked", "SESSION_INVALID");
    }

    // 5. Verify user is active
    const [userRecord] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, sessionRecord.userId),
          isNull(users.deletedAt),
          isNull(users.suspendedAt),
        ),
      )
      .limit(1);

    if (!userRecord) {
      throw ApiError.unauthorized("User not found or suspended", "USER_UNAVAILABLE");
    }

    // 6. Generate new access token
    const [consent] = await db
      .select()
      .from(oauthConsents)
      .where(
        and(
          eq(oauthConsents.userId, userRecord.id),
          eq(oauthConsents.clientId, clientId),
          isNull(oauthConsents.revokedAt),
        ),
      )
      .limit(1);

    const scopes = consent?.scopes || ["openid"];

    const accessTokenPayload = {
      sub: userRecord.id,
      client_id: clientId,
      scope: scopes.join(" "),
      sid: sessionRecord.id,
    };

    const accessToken = await JwtService.signAccessToken(accessTokenPayload, "1h");

    // 7. Generate new ID Token
    const jwk = await JwtService.getPublicJwk();
    const idTokenPayload: any = {
      iss: "http://localhost:8000",
      sub: userRecord.id,
      aud: clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    if (scopes.includes("profile")) {
      idTokenPayload.given_name = userRecord.givenName;
      idTokenPayload.family_name = userRecord.familyName;
    }

    const idToken = await new SignJWT(idTokenPayload)
      .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: (jwk as any).kid })
      .sign(Reflect.get(JwtService, "privateKey"));

    // 8. Generate rotated refresh token
    const newRefreshTokenValue = TokenService.generateRefreshToken();
    const newRefreshTokenHash = TokenService.hashToken(newRefreshTokenValue);
    const newTokenJti = `oauth:${clientId}:${TokenService.generateJti()}`;

    const [newRefreshToken] = await db
      .insert(refreshTokens)
      .values({
        sessionId: sessionRecord.id,
        tokenJti: newTokenJti,
        tokenHash: newRefreshTokenHash,
        expiresAt: tokenRecord.expiresAt,
        parentRefreshTokenId: tokenRecord.id,
      })
      .returning();

    if (!newRefreshToken) {
      throw ApiError.internal("Failed to create new refresh token");
    }

    // 9. Mark old refresh token as rotated/replaced
    await db
      .update(refreshTokens)
      .set({
        rotatedAt: new Date(),
        replacedByRefreshTokenId: newRefreshToken.id,
      })
      .where(eq(refreshTokens.id, tokenRecord.id));

    // 10. Update session record
    await db
      .update(sessions)
      .set({
        currentRefreshTokenId: newRefreshToken.id,
        lastActiveAt: new Date(),
      })
      .where(eq(sessions.id, sessionRecord.id));

    return {
      access_token: accessToken,
      id_token: idToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: scopes.join(" "),
      refresh_token: newRefreshTokenValue,
    };
  }

  /**
   * Create or merge scopes for user consent on a client.
   */
  static async upsertConsent(
    userId: string,
    clientId: string,
    scopes: string[],
  ) {
    const [existing] = await db
      .select()
      .from(oauthConsents)
      .where(
        and(
          eq(oauthConsents.userId, userId),
          eq(oauthConsents.clientId, clientId),
        ),
      )
      .limit(1);

    if (existing) {
      const mergedScopes = Array.from(new Set([...existing.scopes, ...scopes]));
      await db
        .update(oauthConsents)
        .set({
          scopes: mergedScopes,
          updatedAt: new Date(),
          revokedAt: null,
        })
        .where(eq(oauthConsents.id, existing.id));
    } else {
      await db.insert(oauthConsents).values({
        userId,
        clientId,
        scopes,
      });
    }
  }

  /**
   * List all active (unrevoked) consents of the user, joined with client application details.
   */
  static async listUserConsents(userId: string) {
    return db
      .select({
        id: oauthConsents.id,
        clientId: oauthConsents.clientId,
        scopes: oauthConsents.scopes,
        grantedAt: oauthConsents.grantedAt,
        lastUsedAt: oauthConsents.lastUsedAt,
        clientName: oauthClients.name,
        clientDescription: oauthClients.description,
      })
      .from(oauthConsents)
      .innerJoin(oauthClients, eq(oauthConsents.clientId, oauthClients.id))
      .where(
        and(
          eq(oauthConsents.userId, userId),
          isNull(oauthConsents.revokedAt),
        ),
      );
  }

  /**
   * Revoke a specific consent by marking revokedAt timestamp.
   */
  static async revokeUserConsent(userId: string, consentId: string) {
    // Check if the consent exists and belongs to the user
    const [consent] = await db
      .select()
      .from(oauthConsents)
      .where(
        and(
          eq(oauthConsents.id, consentId),
          eq(oauthConsents.userId, userId),
          isNull(oauthConsents.revokedAt),
        ),
      )
      .limit(1);

    if (!consent) {
      throw ApiError.notFound("Consent not found or already revoked");
    }

    await db
      .update(oauthConsents)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(oauthConsents.id, consentId));
  }
}
