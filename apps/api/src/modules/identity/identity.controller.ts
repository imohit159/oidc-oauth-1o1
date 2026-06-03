import type { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../../shared/utils/api-response.util";
import { IdentityService } from "./identity.service";
import type { RegisterDto, LoginDto, VerifyEmailDto, ResendVerificationDto, ForgotPasswordDto, ResetPasswordDto } from "./identity.dto";

export class IdentityController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RegisterDto;
      const result = await IdentityService.register(data);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          sessionId: result.sessionId,
        },
        "Registration successful",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as LoginDto;
      const result = await IdentityService.login(data);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          sessionId: result.sessionId,
        },
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body as VerifyEmailDto;
      await IdentityService.verifyEmail(token);

      ApiResponse.success(res, null, "Email verified successfully");
    } catch (error) {
      next(error);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as ResendVerificationDto;
      await IdentityService.resendVerificationEmail(email);

      ApiResponse.success(res, null, "Verification email sent if email exists");
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as ForgotPasswordDto;
      await IdentityService.forgotPassword(email);

      ApiResponse.success(res, null, "Password reset email sent if email exists");
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body as ResetPasswordDto;
      await IdentityService.resetPassword(token, password);

      ApiResponse.success(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }
}
