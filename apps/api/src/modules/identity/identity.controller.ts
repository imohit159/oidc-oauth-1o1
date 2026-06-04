import type { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../../shared/utils/api-response.util";
import { IdentityService } from "./identity.service";
import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from "./dtos";

export class IdentityController {
  static async registerWithEmailAndPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = req.body as RegisterDto;
      await IdentityService.registerWithEmailAndPassword(data);

      ApiResponse.success(
        res,
        null,
        "Registration successful, please check your email to verify your account.",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  static async loginWithEmailAndPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = req.body as LoginDto;
      const result = await IdentityService.loginWithEmailAndPassword(data);

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
        "Login successful",
      );
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = req.body as VerifyEmailDto;
      const result = await IdentityService.verifyEmail(token);

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
        "Email verified successfully. You are now logged in.",
      );
    } catch (error) {
      next(error);
    }
  }

  static async resendVerification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body as ResendVerificationDto;
      await IdentityService.resendVerificationEmail(email);

      ApiResponse.success(res, null, "Verification email sent if email exists");
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body as ForgotPasswordDto;
      await IdentityService.forgotPassword(email);

      ApiResponse.success(
        res,
        null,
        "Password reset email sent if email exists",
      );
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token, password } = req.body as ResetPasswordDto;
      await IdentityService.resetPassword(token, password);

      ApiResponse.success(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await IdentityService.getProfile(userId);

      ApiResponse.success(res, { user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body as UpdateProfileDto;
      const user = await IdentityService.updateProfile(userId, data);

      ApiResponse.success(res, { user }, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      await IdentityService.deleteAccount(userId);

      ApiResponse.success(res, null, "Account deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getSupportedAuthProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const providers = IdentityService.getSupportedAuthProviders();
      ApiResponse.success(res, providers, "Supported providers retrieved");
    } catch (error) {
      next(error);
    }
  }
}
