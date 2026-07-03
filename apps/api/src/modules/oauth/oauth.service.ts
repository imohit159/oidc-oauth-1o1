import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

import { db } from "../../config/database";
import { oauthAuthorizationCodes } from "./models/oauth-authorization-codes.model";
import { users } from "../identity/models/users.model";
import { TokenService } from "../security/services/token.service";
import { JwtService } from "../security/services/jwt.service";
import { ClientsService } from "../clients/clients.service";
import { ApiError } from "../../shared/utils/api-error.util";

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

    // TODO: Generate Refresh Token and store it in refresh_tokens table

    return {
      access_token: accessToken,
      id_token: idToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: scopes.join(" "),
    };
  }
}
