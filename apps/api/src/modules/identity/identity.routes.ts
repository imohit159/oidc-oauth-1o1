import { Router, type Router as RouterType } from "express";

import { validateRequest } from "../../shared/middleware/validate-request.middleware";
import { IdentityController } from "./identity.controller";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./identity.dto";

const router: RouterType = Router();

router.get("/providers", IdentityController.getSupportedAuthProviders);

router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  IdentityController.registerWithEmailAndPassword,
);
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  IdentityController.loginWithEmailAndPassword,
);
router.post(
  "/verify-email",
  validateRequest({ body: verifyEmailSchema }),
  IdentityController.verifyEmail,
);
router.post(
  "/resend-verification",
  validateRequest({ body: resendVerificationSchema }),
  IdentityController.resendVerification,
);
router.post(
  "/forgot-password",
  validateRequest({ body: forgotPasswordSchema }),
  IdentityController.forgotPassword,
);
router.post(
  "/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  IdentityController.resetPassword,
);

export { router as identityRoutes };
