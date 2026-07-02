import type { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../../shared/utils/api-response.util";
import { SessionsService } from "./sessions.service";
import type { SessionListItem } from "./sessions.types";

export class SessionsController {
  static async listSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const sessionId = req.sessionId!;

      const sessions = await SessionsService.listSessions(userId, sessionId);

      ApiResponse.success<SessionListItem[]>(
        res,
        sessions,
        "Sessions retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const sessionId = req.sessionId!;

      await SessionsService.logout(sessionId);

      res.clearCookie("refreshToken");

      ApiResponse.success(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;

      await SessionsService.logoutAll(userId);

      res.clearCookie("refreshToken");

      ApiResponse.success(res, null, "Logout from all devices successful");
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId as string;

      await SessionsService.revokeSession(sessionId, userId);

      ApiResponse.success(res, null, "Session revoked successfully");
    } catch (error) {
      next(error);
    }
  }

  static async refreshAccessToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new Error("Refresh token not found");
      }

      const result = await SessionsService.refreshAccessToken(refreshToken);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          accessToken: result.accessToken,
        },
        "Access token refreshed successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}
