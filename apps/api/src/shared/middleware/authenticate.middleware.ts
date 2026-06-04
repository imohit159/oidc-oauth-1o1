import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/api-error.util";
import { JwtService } from "../../modules/security/services/jwt.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      sessionId?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token required", "MISSING_TOKEN");
    }

    const token = authHeader.substring(7);

    try {
      const payload = await JwtService.verifyAccessToken<{
        sub: string;
        email: string;
        role: string;
        sessionId?: string;
      }>(token);

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      req.sessionId = payload.sessionId;

      next();
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired token", "INVALID_TOKEN");
    }
  } catch (error) {
    next(error);
  }
}
