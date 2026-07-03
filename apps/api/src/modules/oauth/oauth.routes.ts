import { Router , type Router as RouterType} from "express";
import { OAuthController } from "./oauth.controller";
import { optionalAuthenticate } from "../../shared/middleware/optional-authenticate.middleware";
import { authenticate } from "../../shared/middleware/authenticate.middleware";
import { validateRequest } from "../../shared/middleware/validate-request.middleware";
import { authorizeQuerySchema, consentBodySchema } from "./dtos";

const router: RouterType = Router();

// 1. OIDC Discovery endpoint
// According to spec, this is usually at /.well-known/openid-configuration
// We will mount this specific route in app.ts, but we expose the handler here
router.get("/.well-known/openid-configuration", OAuthController.getOpenIdConfiguration);

// 2. JWKS endpoint
router.get("/jwks.json", OAuthController.getJwks);

// 3. Authorization endpoint
// Uses optional authentication to redirect to login if the user is unauthenticated
router.get(
  "/authorize",
  validateRequest({ query: authorizeQuerySchema }),
  optionalAuthenticate,
  OAuthController.authorize,
);

// 4. Consent endpoint
// Frontend posts user's choice to this endpoint to record consent and obtain authorization code
router.post(
  "/consent",
  authenticate,
  validateRequest({ body: consentBodySchema }),
  OAuthController.consent,
);

// 5. Token endpoint
// Clients authenticate via Basic Auth or body parameters (handled in controller)
router.post("/token", OAuthController.token);

// 5. UserInfo endpoint
// Requires valid access token (handled by standard authenticate if we want to enforce, but optional auth + manual check is fine too)
router.get("/userinfo", authenticate, OAuthController.userinfo);

export { router as oauthRoutes };
