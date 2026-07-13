import type { Request, Response, NextFunction } from "express";
import { eq, and, isNull } from "drizzle-orm";

import { db } from "../../config/database";
import { userIdentities } from "../../modules/identity/models/user-identities.model";
import { users } from "../../modules/identity/models/users.model";
import { JwtService } from "../../modules/security/services/jwt.service";
import { TokenService } from "../../modules/security/services/token.service";
import { refreshTokens } from "../../modules/sessions/models/refresh-tokens.model";
import { sessions } from "../../modules/sessions/models/sessions.model";

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

    // 2. Alternatively, try to restore session from refreshToken cookie for browser GET navigations
    if (!token && req.cookies && req.cookies.refreshToken) {
      const refreshTokenValue = req.cookies.refreshToken;
      const refreshTokenHash = TokenService.hashToken(refreshTokenValue);

      const [tokenRecord] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.tokenHash, refreshTokenHash),
            isNull(refreshTokens.revokedAt),
          ),
        )
        .limit(1);

      if (tokenRecord && tokenRecord.expiresAt > new Date()) {
        const [sessionRecord] = await db
          .select()
          .from(sessions)
          .where(
            and(
              eq(sessions.id, tokenRecord.sessionId),
              isNull(sessions.revokedAt),
            ),
          )
          .limit(1);

        if (sessionRecord) {
          const [userRecord] = await db
            .select()
            .from(users)
            .where(
              and(
                eq(users.id, sessionRecord.userId),
                isNull(users.deletedAt),
                isNull(users.suspendedAt),
              ),
            )
            .limit(1);

          if (userRecord) {
            const [identityRecord] = await db
              .select()
              .from(userIdentities)
              .where(
                and(
                  eq(userIdentities.userId, userRecord.id),
                  isNull(userIdentities.revokedAt),
                ),
              )
              .limit(1);

            if (identityRecord) {
              req.user = {
                id: userRecord.id,
                email: identityRecord.email,
                role: userRecord.role,
              };
              req.sessionId = sessionRecord.id;
              return next();
            }
          }
        }
      }
    }

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
