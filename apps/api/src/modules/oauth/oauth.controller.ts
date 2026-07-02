import type { Request, Response, NextFunction } from "express";

import { OAuthService } from "./oauth.service";
import { OAuthClientsService } from "./oauth-clients.service";
import { JwksService } from "./jwks.service";
import { ApiResponse } from "../../shared/utils/api-response.util";
import { ApiError } from "../../shared/utils/api-error.util";
import { authConfig } from "../../config/auth";
import { db } from "../../config/database";
import { users } from "../identity/models/users.model";
import { eq } from "drizzle-orm";
import { env } from "@/config";

export class OAuthController {
  /**
   * OIDC Discovery Endpoint
   * GET /.well-known/openid-configuration
   */
  static async getOpenIdConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const issuer = env.APP_URL; // Better to read from env or request host
      
      const config = {
        issuer,
        authorization_endpoint: `${issuer}/oauth/authorize`,
        token_endpoint: `${issuer}/oauth/token`,
        userinfo_endpoint: `${issuer}/oauth/userinfo`,
        jwks_uri: `${issuer}/oauth/jwks.json`,
        scopes_supported: ["openid", "profile", "email"],
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "client_credentials", "refresh_token"],
        token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post", "none"],
        claims_supported: ["sub", "iss", "aud", "exp", "iat", "email", "given_name", "family_name"],
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
        response_type,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        nonce,
      } = req.query;

      // 1. Basic Validations
      if (!client_id || typeof client_id !== "string") {
        throw ApiError.badRequest("Missing client_id");
      }
      if (!redirect_uri || typeof redirect_uri !== "string") {
        throw ApiError.badRequest("Missing redirect_uri");
      }
      if (response_type !== "code") {
        throw ApiError.badRequest("Unsupported response_type. Only 'code' is supported.");
      }
      if (!code_challenge || !code_challenge_method) {
        throw ApiError.badRequest("PKCE code_challenge and code_challenge_method are required.");
      }

      // 2. Validate client and redirect URI
      const client = await OAuthClientsService.getClientByClientId(client_id);
      if (!client) {
        throw ApiError.badRequest("Invalid client_id");
      }
      await OAuthService.validateRedirectUri(client_id, redirect_uri);

      // 3. Ensure user is authenticated.
      // If req.user is missing, redirect to login page with the auth request state in query params.
      if (!req.user) {
        // Build the current URL to redirect back to after login
        const returnTo = encodeURIComponent(req.originalUrl);
        return res.redirect(`/login?returnTo=${returnTo}`);
      }

      // 4. (Optional) Check Consent
      // For this implementation, we auto-consent. In production, you'd show a consent screen
      // and wait for a POST /oauth/authorize to confirm.
      
      const scopes = typeof scope === "string" ? scope.split(" ") : ["openid"];

      // 5. Generate Auth Code
      const code = await OAuthService.createAuthorizationCode(
        client_id,
        req.user.id,
        req.sessionId || null,
        redirect_uri,
        code_challenge as string,
        code_challenge_method as string,
        scopes,
        typeof nonce === "string" ? nonce : undefined,
      );

      // 6. Redirect back to client with code and state
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.append("code", code);
      if (state && typeof state === "string") {
        redirectUrl.searchParams.append("state", state);
      }

      res.redirect(redirectUrl.toString());
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
          const [id, secret] = Buffer.from(b64auth, "base64").toString().split(":");
          clientId = id;
          clientSecret = secret;
        }
      }

      if (!clientId) {
        throw ApiError.unauthorized("Missing client_id", "INVALID_CLIENT");
      }

      // Validate Client Credentials
      await OAuthClientsService.validateClientCredentials(clientId, clientSecret);

      if (grant_type === "authorization_code") {
        if (!code || !redirect_uri || !code_verifier) {
          throw ApiError.badRequest("Missing code, redirect_uri, or code_verifier");
        }

        const tokens = await OAuthService.exchangeAuthorizationCode(
          clientId,
          code,
          redirect_uri,
          code_verifier,
        );

        // OIDC spec requires setting Cache-Control headers on token endpoint
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.status(200).json(tokens);
      } else {
        throw ApiError.badRequest(`Unsupported grant_type: ${grant_type}`);
      }
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

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
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
}
