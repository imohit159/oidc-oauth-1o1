import type { Request, Response, NextFunction } from "express";

import { OAuthService } from "./oauth.service";
import { ClientsService } from "../clients/clients.service";
import { JwksService } from "./jwks.service";
import type { AuthorizeQueryDto, ConsentBodyDto } from "./dtos";
import { ApiResponse } from "../../shared/utils/api-response.util";
import { ApiError } from "../../shared/utils/api-error.util";
import { authConfig } from "../../config/auth";
import { db } from "../../config/database";
import { users } from "../identity/models/users.model";
import { oauthConsents } from "./models/oauth-consents.model";
import { eq, and, isNull } from "drizzle-orm";
import { env } from "@/config";

export class OAuthController {
  /**
   * OIDC Discovery Endpoint
   * GET /.well-known/openid-configuration
   */
  static async getOpenIdConfiguration(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const issuer = env.APP_URL; // Better to read from env or request host

      const config = {
        issuer,
        authorization_endpoint: `${issuer}/api/v1/oauth/authorize`,
        token_endpoint: `${issuer}/api/v1/oauth/token`,
        userinfo_endpoint: `${issuer}/api/v1/oauth/userinfo`,
        jwks_uri: `${issuer}/jwks.json`,
        scopes_supported: ["openid", "profile", "email"],
        response_types_supported: ["code"],
        grant_types_supported: [
          "authorization_code",
          "client_credentials",
          "refresh_token",
        ],
        token_endpoint_auth_methods_supported: [
          "client_secret_basic",
          "client_secret_post",
          "none",
        ],
        claims_supported: [
          "sub",
          "iss",
          "aud",
          "exp",
          "iat",
          "email",
          "given_name",
          "family_name",
        ],
        code_challenge_methods_supported: ["plain", "S256"],
      };

      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  }

  /**
   * JWKS Endpoint
   * GET /oauth/jwks.json
   */
  static async getJwks(req: Request, res: Response, next: NextFunction) {
    try {
      const jwks = await JwksService.getJwks();
      res.status(200).json(jwks);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authorization Endpoint
   * GET /oauth/authorize
   */
  static async authorize(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        client_id,
        redirect_uri,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        nonce,
      } = req.query as AuthorizeQueryDto;

      // 1. Validate client and redirect URI
      const client = await ClientsService.getClientByClientId(client_id);
      if (!client) {
        throw ApiError.badRequest("Invalid client_id");
      }
      await ClientsService.validateRedirectUri(client_id, redirect_uri);

      // 2. Ensure user is authenticated.
      // If req.user is missing, redirect to login page with the auth request state in query params.
      if (!req.user) {
        // Build the current URL to redirect back to after login
        const returnTo = encodeURIComponent(req.originalUrl);
        return res.redirect(
          `${env.FRONTEND_APP_URL}/login?returnTo=${returnTo}`,
        );
      }

      // 3. Check Consent
      const requestedScopes = scope ? scope.split(" ") : ["openid"];

      const [existingConsent] = await db
        .select()
        .from(oauthConsents)
        .where(
          and(
            eq(oauthConsents.userId, req.user.id),
            eq(oauthConsents.clientId, client.id),
            isNull(oauthConsents.revokedAt),
          ),
        )
        .limit(1);

      const alreadyConsented =
        existingConsent &&
        requestedScopes.every((s) => existingConsent.scopes.includes(s));

      if (!alreadyConsented) {
        // Build the current URL to redirect back to after consent is given
        const returnTo = encodeURIComponent(req.originalUrl);
        return res.redirect(
          `${env.FRONTEND_APP_URL}/consent?client_id=${client_id}&scope=${scope}&state=${state || ""}&redirect_uri=${encodeURIComponent(
            redirect_uri,
          )}&code_challenge=${code_challenge}&code_challenge_method=${code_challenge_method}&nonce=${nonce || ""}&returnTo=${returnTo}`,
        );
      }

      // 4. Generate Auth Code
      const code = await OAuthService.createAuthorizationCode(
        client_id,
        req.user.id,
        req.sessionId || null,
        redirect_uri,
        code_challenge,
        code_challenge_method,
        requestedScopes,
        nonce,
      );

      // 5. Redirect back to client with code and state
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.append("code", code);
      if (state) {
        redirectUrl.searchParams.append("state", state);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Consent Endpoint
   * POST /oauth/consent
   */
  static async consent(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        client_id,
        approved,
        scope,
        redirect_uri,
        code_challenge,
        code_challenge_method,
        state,
        nonce,
      } = req.body as ConsentBodyDto;

      const userId = req.user!.id;
      const client = await ClientsService.getClientByClientId(client_id);
      if (!client) {
        throw ApiError.badRequest("Invalid client_id");
      }
      await ClientsService.validateRedirectUri(client_id, redirect_uri);

      const redirectUrl = new URL(redirect_uri);

      if (!approved) {
        redirectUrl.searchParams.append("error", "access_denied");
        redirectUrl.searchParams.append(
          "error_description",
          "User denied consent",
        );
        if (state) {
          redirectUrl.searchParams.append("state", state);
        }
        return ApiResponse.success(
          res,
          { redirectUrl: redirectUrl.toString() },
          "Consent denied by user",
        );
      }

      const scopes = scope ? scope.split(" ") : ["openid"];

      // 1. Record the consent in the database
      await OAuthService.upsertConsent(userId, client.id, scopes);

      // 2. Generate the auth code
      const code = await OAuthService.createAuthorizationCode(
        client_id,
        userId,
        req.sessionId || null,
        redirect_uri,
        code_challenge,
        code_challenge_method,
        scopes,
        nonce,
      );

      // 3. Return the redirect URL with the code to the frontend
      redirectUrl.searchParams.append("code", code);
      if (state) {
        redirectUrl.searchParams.append("state", state);
      }

      ApiResponse.success(
        res,
        { redirectUrl: redirectUrl.toString() },
        "Consent granted successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Token Endpoint
   * POST /oauth/token
   */
  static async token(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        grant_type,
        code,
        redirect_uri,
        client_id: bodyClientId,
        client_secret: bodyClientSecret,
        code_verifier,
      } = req.body;

      // Extract client credentials from Basic Auth or Body
      let clientId = bodyClientId;
      let clientSecret = bodyClientSecret;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Basic ")) {
        const b64auth = authHeader.split(" ")[1];
        if (b64auth) {
          const [id, secret] = Buffer.from(b64auth, "base64")
            .toString()
            .split(":");
          clientId = id;
          clientSecret = secret;
        }
      }

      if (!clientId) {
        throw ApiError.unauthorized("Missing client_id", "INVALID_CLIENT");
      }

      // Validate Client Credentials
      await ClientsService.validateClientCredentials(clientId, clientSecret);

      let tokens;
      if (grant_type === "authorization_code") {
        if (!code || !redirect_uri || !code_verifier) {
          throw ApiError.badRequest(
            "Missing code, redirect_uri, or code_verifier",
          );
        }

        tokens = await OAuthService.exchangeAuthorizationCode(
          clientId,
          code,
          redirect_uri,
          code_verifier,
        );
      } else if (grant_type === "refresh_token") {
        const { refresh_token } = req.body;
        if (!refresh_token) {
          throw ApiError.badRequest("Missing refresh_token");
        }

        tokens = await OAuthService.rotateRefreshToken(clientId, refresh_token);
      } else {
        throw ApiError.badRequest(`Unsupported grant_type: ${grant_type}`);
      }

      // OIDC spec requires setting Cache-Control headers on token endpoint
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * UserInfo Endpoint
   * GET /oauth/userinfo
   */
  static async userinfo(req: Request, res: Response, next: NextFunction) {
    try {
      // The authenticate middleware should have verified the Access Token and populated req.user
      const userId = req.user!.id;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!user) {
        throw ApiError.notFound("User not found");
      }

      const userInfo = {
        sub: user.id,
        given_name: user.givenName,
        family_name: user.familyName,
        // Optional logic: we could pull email from user_identities if we pass the email claim
      };

      res.status(200).json(userInfo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /oauth/consents
   * List all active consents for the authenticated user.
   */
  static async getConsents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const consents = await OAuthService.listUserConsents(userId);
      ApiResponse.success(res, consents, "Consents retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /oauth/consents/:consentId
   * Revoke a specific consent.
   */
  static async revokeConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const consentId = req.params.consentId as string;
      if (!consentId) {
        throw ApiError.badRequest("Missing consentId");
      }
      await OAuthService.revokeUserConsent(userId, consentId);
      ApiResponse.success(res, null, "Consent revoked successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/oauth/client-info
   * Get public details of a client by client_id.
   */
  static async getClientInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { client_id } = req.query as { client_id: string };
      if (!client_id) {
        throw ApiError.badRequest("Missing client_id");
      }
      const client = await ClientsService.getClientByClientId(client_id);
      if (!client) {
        throw ApiError.notFound("Client not found");
      }
      ApiResponse.success(
        res,
        {
          name: client.name,
          description: client.description,
          clientType: client.clientType,
          logoUrl: client.logoUrl,
          websiteUrl: client.websiteUrl,
          publisherName: client.publisherName,
          privacyPolicyUrl: client.privacyPolicyUrl,
          termsOfServiceUrl: client.termsOfServiceUrl,
          verificationStatus: client.verificationStatus,
        },
        "Client public info retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}
