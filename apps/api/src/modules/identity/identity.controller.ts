import type { Request, Response, NextFunction } from "express";
import { UAParser } from "ua-parser-js";

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
import type { RequestMeta } from "../sessions/sessions.service";

/**
 * Extracts IP address, raw User-Agent, and a human-readable device name from the request.
 */
function extractRequestMeta(req: Request): RequestMeta {
  const rawIp =
    (req.headers["x-forwarded-for"] as string | undefined) || req.ip || "";
  // x-forwarded-for may be a comma-separated list; take the first (client) IP.
  const ipAddress = rawIp.split(",")[0]?.trim() || undefined;

  const userAgent = req.headers["user-agent"] || undefined;

  let deviceName: string | undefined;
  if (userAgent) {
    const parser = new UAParser(userAgent);
    const { browser, os, device } = parser.getResult();
    if (device.vendor && device.model) {
      deviceName = `${device.vendor} ${device.model}`;
    } else {
      const osPart = os.name ?? "Unknown OS";
      const browserPart = browser.name ?? "Unknown Browser";
      deviceName = `${osPart} (${browserPart})`;
    }
  }

  return { ipAddress, userAgent, deviceName };
}

export class IdentityController {
  static async registerWithEmailAndPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
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
  ) {
    try {
      const data = req.body as LoginDto;
      const meta = extractRequestMeta(req);
      const result = await IdentityService.loginWithEmailAndPassword(
        data,
        meta,
      );
      const { accessToken, refreshToken, sessionId, ...user } = result;

      if (refreshToken) {
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.COOKIE_SECURE === "true",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }

      ApiResponse.success(
        res,
        {
          user,
          accessToken,
          sessionId,
        },
        "Login successful",
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body as VerifyEmailDto;
      const meta = extractRequestMeta(req);
      const result = await IdentityService.verifyEmail(token, meta);
      const { accessToken, refreshToken, sessionId, ...user } = result;

      if (refreshToken) {
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.COOKIE_SECURE === "true",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }

      ApiResponse.success(
        res,
        {
          user,
          accessToken,
          sessionId,
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
  ) {
    try {
      const { email } = req.body as ResendVerificationDto;
      await IdentityService.resendVerificationEmail(email);

      ApiResponse.success(
        res,
        null,
        "Verification email resent if email exists",
      );
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
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

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body as ResetPasswordDto;
      await IdentityService.resetPassword(token, password);

      ApiResponse.success(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await IdentityService.getProfile(userId);

      ApiResponse.success(res, { user }, "User profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = req.body as UpdateProfileDto;
      const user = await IdentityService.updateProfile(userId, data);

      ApiResponse.success(res, { user }, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await IdentityService.deleteAccount(userId);

      ApiResponse.success(res, null, "Account deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get supported auth providers
   */
  static async getSupportedAuthProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const providers = IdentityService.getSupportedAuthProviders();
      ApiResponse.success(res, providers, "Supported providers retrieved");
    } catch (error) {
      next(error);
    }
  }
}
