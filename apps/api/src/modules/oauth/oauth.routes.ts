import { Router, type Router as RouterType } from "express";
import { OAuthController } from "./oauth.controller";
import { optionalAuthenticate } from "../../shared/middleware/optional-authenticate.middleware";
import { authenticate } from "../../shared/middleware/authenticate.middleware";
import { validateRequest } from "../../shared/middleware/validate-request.middleware";
import { authorizeQuerySchema, consentBodySchema } from "./dtos";

const router: RouterType = Router();

// 1. OIDC Discovery endpoint
// According to spec, this is usually at /.well-known/openid-configuration
// We will mount this specific route in app.ts, but we expose the handler here
router.get(
  "/.well-known/openid-configuration",
  OAuthController.getOpenIdConfiguration,
);

// 2. JWKS endpoint
router.get("/jwks.json", OAuthController.getJwks);

// 3. Authorization endpoint
// Uses optional authentication to redirect to login if the user is unauthenticated
router.get(
  "/api/v1/oauth/authorize",
  validateRequest({ query: authorizeQuerySchema }),
  optionalAuthenticate,
  OAuthController.authorize,
);

// 4. Consent endpoints
// Frontend posts user's choice to record consent and obtain an authorization code
router.post(
  "/api/v1/oauth/consent",
  authenticate,
  validateRequest({ body: consentBodySchema }),
  OAuthController.consent,
);
router.get("/api/v1/oauth/consents", authenticate, OAuthController.getConsents);
router.get(
  "/api/v1/oauth/client-info",
  authenticate,
  OAuthController.getClientInfo,
);
router.delete(
  "/api/v1/oauth/consents/:consentId",
  authenticate,
  OAuthController.revokeConsent,
);

// 5. Token endpoint
// Clients authenticate via Basic Auth or body parameters (handled in controller)
router.post("/api/v1/oauth/token", OAuthController.token);

// 6. UserInfo endpoint
// Requires a valid Bearer access token
router.get("/api/v1/oauth/userinfo", authenticate, OAuthController.userinfo);

export { router as oauthRoutes };
