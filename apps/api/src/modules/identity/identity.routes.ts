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

router.post("/register", validateRequest(registerSchema), IdentityController.register);
router.post("/login", validateRequest(loginSchema), IdentityController.login);
router.post("/verify-email", validateRequest(verifyEmailSchema), IdentityController.verifyEmail);
router.post("/resend-verification", validateRequest(resendVerificationSchema), IdentityController.resendVerification);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), IdentityController.forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), IdentityController.resetPassword);

export { router as identityRoutes };
