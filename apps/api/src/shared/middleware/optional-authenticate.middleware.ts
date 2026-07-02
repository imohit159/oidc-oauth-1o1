import type { Request, Response, NextFunction } from "express";

import { JwtService } from "../../modules/security/services/jwt.service";

export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    let token = "";

    // 1. Try to get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    
    // 2. Alternatively, try to get token from cookies (if you implement cookie-based access tokens)
    // if (!token && req.cookies && req.cookies.accessToken) {
    //   token = req.cookies.accessToken;
    // }

    if (!token) {
      return next(); // No token, proceed without req.user
    }

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
    // If token is invalid or expired, proceed without req.user instead of failing
    next();
  }
}
