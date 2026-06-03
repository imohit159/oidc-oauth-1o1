import { eq, and, isNull } from "drizzle-orm";

import { db } from "../../config/database";
import { ApiError } from "../../shared/utils/api-error.util";
import { logger } from "../../shared/logger/logger";
import { JwtService } from "../security/services/jwt.service";
import { TokenService } from "../security/services/token.service";
import { sessions } from "./models/sessions.model";
import { refreshTokens } from "./models/refresh-tokens.model";
import { users } from "../identity/models/users.model";
import { userIdentities } from "../identity/models/user-identities.model";
import type { SessionListItem } from "./sessions.types";

export class SessionsService {
  static async listSessions(userId: string, currentSessionId: string): Promise<SessionListItem[]> {
    logger.info("Listing sessions", { userId });

    const userSessions = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));

    return userSessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      isCurrent: session.id === currentSessionId,
      lastActiveAt: session.lastActiveAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
    }));
  }

  static async logout(sessionId: string): Promise<void> {
    logger.info("Logout attempt", { sessionId });

    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)))
      .limit(1);

    if (session.length === 0 || !session[0]) {
      throw ApiError.notFound("Session not found", "SESSION_NOT_FOUND");
    }

    const sessionRecord = session[0];

    await db
      .update(sessions)
      .set({
        revokedAt: new Date(),
        revokedReason: "User logout",
      })
      .where(eq(sessions.id, sessionId));

    if (sessionRecord.currentRefreshTokenId) {
      await db
        .update(refreshTokens)
        .set({
          revokedAt: new Date(),
          revokedReason: "User logout",
        })
        .where(eq(refreshTokens.id, sessionRecord.currentRefreshTokenId));
    }

    logger.info("Logout successful", { sessionId });
  }

  static async logoutAll(userId: string): Promise<void> {
    logger.info("Logout all sessions attempt", { userId });

    const userSessions = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));

    for (const session of userSessions) {
      await db
        .update(sessions)
        .set({
          revokedAt: new Date(),
          revokedReason: "User logout all devices",
        })
        .where(eq(sessions.id, session.id));

      if (session.currentRefreshTokenId) {
        await db
          .update(refreshTokens)
          .set({
            revokedAt: new Date(),
            revokedReason: "User logout all devices",
          })
          .where(eq(refreshTokens.id, session.currentRefreshTokenId));
      }
    }

    logger.info("Logout all sessions successful", { userId, sessionsRevoked: userSessions.length });
  }

  static async revokeSession(sessionId: string, userId: string): Promise<void> {
    logger.info("Revoke session attempt", { sessionId, userId });

    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId), isNull(sessions.revokedAt)))
      .limit(1);

    if (session.length === 0 || !session[0]) {
      throw ApiError.notFound("Session not found", "SESSION_NOT_FOUND");
    }

    const sessionRecord = session[0];

    await db
      .update(sessions)
      .set({
        revokedAt: new Date(),
        revokedReason: "User revoked session",
      })
      .where(eq(sessions.id, sessionId));

    if (sessionRecord.currentRefreshTokenId) {
      await db
        .update(refreshTokens)
        .set({
          revokedAt: new Date(),
          revokedReason: "User revoked session",
        })
        .where(eq(refreshTokens.id, sessionRecord.currentRefreshTokenId));
    }

    logger.info("Session revoked", { sessionId });
  }

  static async refreshAccessToken(refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
    logger.info("Refresh token attempt");

    const refreshTokenHash = TokenService.hashToken(refreshTokenValue);

    const token = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, refreshTokenHash), isNull(refreshTokens.revokedAt)))
      .limit(1);

    if (token.length === 0 || !token[0]) {
      throw ApiError.unauthorized("Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    const tokenRecord = token[0];

    if (tokenRecord.expiresAt < new Date()) {
      await db
        .update(refreshTokens)
        .set({
          revokedAt: new Date(),
          revokedReason: "Token expired",
        })
        .where(eq(refreshTokens.id, tokenRecord.id));

      throw ApiError.unauthorized("Refresh token expired", "REFRESH_TOKEN_EXPIRED");
    }

    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, tokenRecord.sessionId), isNull(sessions.revokedAt)))
      .limit(1);

    if (session.length === 0 || !session[0]) {
      throw ApiError.unauthorized("Session not found or revoked", "SESSION_INVALID");
    }

    const sessionRecord = session[0];

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionRecord.userId), isNull(users.deletedAt), isNull(users.suspendedAt)))
      .limit(1);

    if (user.length === 0 || !user[0]) {
      throw ApiError.unauthorized("User not found or suspended", "USER_UNAVAILABLE");
    }

    const userRecord = user[0];

    const identity = await db
      .select()
      .from(userIdentities)
      .where(and(eq(userIdentities.userId, userRecord.id), isNull(userIdentities.revokedAt)))
      .limit(1);

    if (identity.length === 0 || !identity[0]) {
      throw ApiError.unauthorized("Identity not found", "IDENTITY_NOT_FOUND");
    }

    const identityRecord = identity[0];

    const accessToken = await JwtService.signAccessToken({
      sub: userRecord.id,
      email: identityRecord.email,
      role: userRecord.role,
    });

    const newRefreshTokenValue = TokenService.generateRefreshToken();
    const newRefreshTokenHash = TokenService.hashToken(newRefreshTokenValue);
    const newTokenJti = TokenService.generateJti();

    const [newRefreshToken] = await db
      .insert(refreshTokens)
      .values({
        sessionId: sessionRecord.id,
        tokenJti: newTokenJti,
        tokenHash: newRefreshTokenHash,
        expiresAt: tokenRecord.expiresAt,
        parentRefreshTokenId: tokenRecord.id,
      })
      .returning();

    if (!newRefreshToken) {
      throw ApiError.internal("Failed to create new refresh token");
    }

    await db
      .update(refreshTokens)
      .set({
        rotatedAt: new Date(),
        replacedByRefreshTokenId: newRefreshToken.id,
      })
      .where(eq(refreshTokens.id, tokenRecord.id));

    await db
      .update(sessions)
      .set({
        currentRefreshTokenId: newRefreshToken.id,
        lastActiveAt: new Date(),
      })
      .where(eq(sessions.id, sessionRecord.id));

    logger.info("Token refresh successful", { userId: userRecord.id, sessionId: sessionRecord.id });

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}
