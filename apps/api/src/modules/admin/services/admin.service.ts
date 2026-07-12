import { eq } from "drizzle-orm";
import { db } from "../../../config/database";
import { users } from "../../identity/models/users.model";
import { userIdentities } from "../../identity/models/user-identities.model";
import { sessions } from "../../sessions/models/sessions.model";
import { refreshTokens } from "../../sessions/models/refresh-tokens.model";
import { ApiError } from "../../../shared/utils/api-error.util";
import { AuditService } from "../../audit";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  AUDIT_STATUSES,
} from "../../../shared/constants";

export class AdminService {
  static async suspendUser(actorUserId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set({ suspendedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

      await tx
        .update(sessions)
        .set({ revokedAt: new Date(), revokedReason: "User suspended" })
        .where(eq(sessions.userId, userId));

      // Revoke all refresh tokens for the user's sessions
      const userSessions = await tx
        .select({ id: sessions.id })
        .from(sessions)
        .where(eq(sessions.userId, userId));

      for (const session of userSessions) {
        await tx
          .update(refreshTokens)
          .set({ revokedAt: new Date(), revokedReason: "User suspended" })
          .where(eq(refreshTokens.sessionId, session.id));
      }
    });

    await AuditService.log({
      actorUserId,
      action: AUDIT_ACTIONS.ADMIN_SUSPEND_USER,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.SUCCESS,
    });
  }

  static async unsuspendUser(
    actorUserId: string,
    userId: string,
  ): Promise<void> {
    const [user] = await db
      .update(users)
      .set({ suspendedAt: null, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

    await AuditService.log({
      actorUserId,
      action: AUDIT_ACTIONS.ADMIN_UNSUSPEND_USER,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.SUCCESS,
    });
  }

  static async softDeleteUser(
    actorUserId: string,
    userId: string,
  ): Promise<void> {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

      await tx
        .update(userIdentities)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(userIdentities.userId, userId));

      await tx
        .update(sessions)
        .set({ revokedAt: new Date(), revokedReason: "User deleted" })
        .where(eq(sessions.userId, userId));
    });

    await AuditService.log({
      actorUserId,
      action: AUDIT_ACTIONS.ADMIN_DELETE_USER,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.SUCCESS,
    });
  }
}
