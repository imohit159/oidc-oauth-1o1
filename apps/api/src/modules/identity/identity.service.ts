import { eq, and, isNull } from "drizzle-orm";

import { db } from "../../config/database";
import { env } from "../../config/env";
import { ApiError } from "../../shared/utils/api-error.util";
import { logger } from "../../shared/logger/logger";
import { PasswordService } from "../security/services/password.service";
import { JwtService } from "../security/services/jwt.service";
import { TokenService } from "../security/services/token.service";
import { EmailService } from "../notifications/services/email.service";
import { AuditService } from "../audit";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, AUDIT_STATUSES } from "../../shared/constants";
import { users } from "./models/users.model";
import { userIdentities } from "./models/user-identities.model";
import { sessions } from "../sessions/models/sessions.model";
import { refreshTokens } from "../sessions/models/refresh-tokens.model";
import { loginThrottles } from "./models/login-throttles.model";
import { authActionTokens } from "./models/auth-action-tokens.model";
import type {
  IdentityRegistrationData,
  IdentityLoginData,
  AuthenticatedUser,
  UpdateProfileData,
} from "./identity.types";
import type { User } from "@repo/shared";

export class IdentityService {
  private static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static async registerWithEmailAndPassword(
    data: IdentityRegistrationData,
  ): Promise<void> {
    const normalizedEmail = IdentityService.normalizeEmail(data.email);

    logger.info("Registration attempt", { email: normalizedEmail });

    const existingIdentity = await db
      .select()
      .from(userIdentities)
      .where(eq(userIdentities.emailNormalized, normalizedEmail))
      .limit(1);

    if (existingIdentity.length > 0) {
      throw ApiError.conflict("Email already registered", "EMAIL_EXISTS");
    }

    const passwordHash = await PasswordService.hash(data.password);

    const identity = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          givenName: data.givenName,
          familyName: data.familyName,
        })
        .returning();

      if (!user) {
        tx.rollback();
        throw new Error("Failed to create user.");
      }

      const [identity] = await tx
        .insert(userIdentities)
        .values({
          userId: user.id,
          provider: "PASSWORD",
          email: data.email,
          emailNormalized: normalizedEmail,
          emailVerified: false,
          passwordHash,
        })
        .returning();

      if (!identity) {
        tx.rollback();
        throw new Error("Failed to create identity.");
      }

      await AuditService.log({
        actorUserId: user.id,
        action: AUDIT_ACTIONS.USER_REGISTER,
        entityType: AUDIT_ENTITY_TYPES.USER,
        entityId: user.id,
        status: AUDIT_STATUSES.SUCCESS,
      });

      return identity;
    });

    if (!identity) {
      throw ApiError.internal("Failed to create user and identity.");
    }

    await IdentityService.sendVerificationEmail(identity);

    logger.info("Registration successful, verification email sent", {
      userId: identity.userId,
      email: normalizedEmail,
    });
  }

  static async loginWithEmailAndPassword(
    data: IdentityLoginData,
  ): Promise<AuthenticatedUser> {
    const normalizedEmail = IdentityService.normalizeEmail(data.email);

    logger.info("Login attempt", { email: normalizedEmail });

    await IdentityService.checkLoginThrottle(normalizedEmail);

    const identityResult = await db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.emailNormalized, normalizedEmail),
          eq(userIdentities.provider, "PASSWORD"),
          isNull(userIdentities.revokedAt),
        ),
      )
      .limit(1);

    if (identityResult.length === 0) {
      await IdentityService.recordFailedLogin(normalizedEmail);
      throw ApiError.unauthorized(
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    const identityRecord = identityResult[0]!;

    if (!identityRecord.passwordHash) {
      await IdentityService.recordFailedLogin(
        normalizedEmail,
        identityRecord.userId,
      );
      throw ApiError.unauthorized(
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    const passwordValid = await PasswordService.verify(
      identityRecord.passwordHash,
      data.password,
    );

    if (!passwordValid) {
      await IdentityService.recordFailedLogin(
        normalizedEmail,
        identityRecord.userId,
      );
      throw ApiError.unauthorized(
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    const userResult = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, identityRecord.userId),
          isNull(users.deletedAt),
          isNull(users.suspendedAt),
        ),
      )
      .limit(1);

    if (userResult.length === 0) {
      await AuditService.log({
        actorUserId: identityRecord.userId,
        action: AUDIT_ACTIONS.USER_LOGIN,
        entityType: AUDIT_ENTITY_TYPES.USER,
        entityId: identityRecord.userId,
        status: AUDIT_STATUSES.FAILURE,
        metadata: { reason: "Account not found or suspended" },
      });
      throw ApiError.unauthorized(
        "Account not found or suspended",
        "ACCOUNT_UNAVAILABLE",
      );
    }

    const userRecord = userResult[0]!;

    await db
      .update(userIdentities)
      .set({ lastUsedAt: new Date() })
      .where(eq(userIdentities.id, identityRecord.id));

    await IdentityService.resetLoginThrottle(normalizedEmail);

    const authResponse = await IdentityService.createSessionAndTokens(
      userRecord,
      identityRecord,
    );

    await AuditService.log({
      actorUserId: userRecord.id,
      action: AUDIT_ACTIONS.USER_LOGIN,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userRecord.id,
      status: AUDIT_STATUSES.SUCCESS,
    });

    logger.info("Login successful", {
      userId: userRecord.id,
      email: normalizedEmail,
    });

    return authResponse;
  }

  private static async createSessionAndTokens(
    user: any,
    identity: any,
  ): Promise<AuthenticatedUser> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt,
      })
      .returning();

    if (!session) {
      throw ApiError.internal("Failed to create session");
    }

    const accessToken = await JwtService.signAccessToken({
      sub: user.id,
      email: identity.email,
      role: user.role,
    });

    const refreshTokenValue = TokenService.generateRefreshToken();
    const refreshTokenHash = TokenService.hashToken(refreshTokenValue);
    const tokenJti = TokenService.generateJti();

    const [refreshToken] = await db
      .insert(refreshTokens)
      .values({
        sessionId: session.id,
        tokenJti,
        tokenHash: refreshTokenHash,
        expiresAt,
      })
      .returning();

    if (!refreshToken) {
      throw ApiError.internal("Failed to create refresh token");
    }

    await db
      .update(sessions)
      .set({ currentRefreshTokenId: refreshToken.id })
      .where(eq(sessions.id, session.id));

    return {
      user: {
        id: user.id,
        email: identity.email,
        given_name: user.givenName,
        family_name: user.familyName,
        role: user.role,
        email_verified: identity.emailVerified,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      },
      accessToken,
      refreshToken: refreshTokenValue,
      sessionId: session.id,
    };
  }

  private static async checkLoginThrottle(
    emailNormalized: string,
  ): Promise<void> {
    const throttle = await db
      .select()
      .from(loginThrottles)
      .where(eq(loginThrottles.emailNormalized, emailNormalized))
      .limit(1);

    if (throttle.length === 0) {
      return;
    }

    const record = throttle[0]!;

    if (record.lockedUntil && record.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (record.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw ApiError.tooManyRequests(
        `Account temporarily locked. Try again in ${minutesLeft} minutes`,
        "ACCOUNT_LOCKED",
      );
    }

    if (record.failedAttempts >= 5) {
      throw ApiError.tooManyRequests(
        "Too many failed login attempts. Account temporarily locked",
        "ACCOUNT_LOCKED",
      );
    }
  }

  private static async recordFailedLogin(
    emailNormalized: string,
    userId?: string,
  ): Promise<void> {
    await AuditService.log({
      actorUserId: userId,
      action: AUDIT_ACTIONS.USER_LOGIN,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.FAILURE,
      metadata: { email: emailNormalized, reason: "Invalid credentials" },
    });

    const throttle = await db
      .select()
      .from(loginThrottles)
      .where(eq(loginThrottles.emailNormalized, emailNormalized))
      .limit(1);

    if (throttle.length === 0) {
      await db.insert(loginThrottles).values({
        emailNormalized,
        failedAttempts: 1,
        lastFailedAt: new Date(),
      });
      return;
    }

    const record = throttle[0]!;
    const newFailedAttempts = record.failedAttempts + 1;
    const lockedUntil =
      newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await db
      .update(loginThrottles)
      .set({
        failedAttempts: newFailedAttempts,
        lockedUntil,
        lastFailedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(loginThrottles.id, record.id));

    logger.warn("Failed login attempt recorded", {
      email: emailNormalized,
      failedAttempts: newFailedAttempts,
      locked: lockedUntil !== null,
    });
  }

  private static async resetLoginThrottle(
    emailNormalized: string,
  ): Promise<void> {
    await db
      .update(loginThrottles)
      .set({
        failedAttempts: 0,
        lockedUntil: null,
        lastSuccessAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(loginThrottles.emailNormalized, emailNormalized));
  }

  static async verifyEmail(token: string): Promise<AuthenticatedUser> {
    const tokenHash = TokenService.hashToken(token);

    const tokenRecord = await db
      .select()
      .from(authActionTokens)
      .where(
        and(
          eq(authActionTokens.tokenHash, tokenHash),
          eq(authActionTokens.type, "EMAIL_VERIFICATION"),
          isNull(authActionTokens.consumedAt),
        ),
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      throw ApiError.badRequest(
        "Invalid or expired verification token",
        "INVALID_TOKEN",
      );
    }

    const record = tokenRecord[0]!;

    if (record.expiresAt < new Date()) {
      throw ApiError.badRequest(
        "Verification token has expired",
        "TOKEN_EXPIRED",
      );
    }

    if (!record.identityId || !record.userId) {
      throw ApiError.internal("Token record missing identity or user ID");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(userIdentities)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(userIdentities.id, record.identityId!));

      await tx
        .update(authActionTokens)
        .set({ consumedAt: new Date() })
        .where(eq(authActionTokens.id, record.id));
    });

    logger.info("Email verified successfully", {
      identityId: record.identityId,
    });

    await AuditService.log({
      actorUserId: record.userId,
      action: AUDIT_ACTIONS.USER_VERIFY_EMAIL,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: record.userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    const [verifiedIdentity] = await db
      .select()
      .from(userIdentities)
      .where(eq(userIdentities.id, record.identityId));

    const [verifiedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, record.userId));

    if (!verifiedIdentity || !verifiedUser) {
      throw ApiError.internal(
        "Failed to retrieve user details after verification.",
      );
    }

    const authResponse = await IdentityService.createSessionAndTokens(
      verifiedUser,
      verifiedIdentity,
    );

    logger.info("Session created automatically after email verification", {
      userId: verifiedUser.id,
    });

    return authResponse;
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    const normalizedEmail = IdentityService.normalizeEmail(email);

    const identity = await db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.emailNormalized, normalizedEmail),
          eq(userIdentities.provider, "PASSWORD"),
          isNull(userIdentities.revokedAt),
        ),
      )
      .limit(1);

    if (identity.length === 0) {
      logger.info("Resend verification requested for non-existent email", {
        email: normalizedEmail,
      });
      return;
    }

    const identityRecord = identity[0]!;

    if (identityRecord.emailVerified) {
      logger.info("Resend verification requested for already verified email", {
        email: normalizedEmail,
      });
      return;
    }

    await IdentityService.sendVerificationEmail(identityRecord);

    logger.info("Verification email resent", { identityId: identityRecord.id });
  }

  static async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = IdentityService.normalizeEmail(email);

    const identity = await db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.emailNormalized, normalizedEmail),
          eq(userIdentities.provider, "PASSWORD"),
          isNull(userIdentities.revokedAt),
        ),
      )
      .limit(1);

    if (identity.length === 0) {
      logger.info("Password reset requested for non-existent email", {
        email: normalizedEmail,
      });
      return;
    }

    const identityRecord = identity[0]!;

    if (!identityRecord.emailVerified) {
      logger.warn("Password reset requested for unverified email", {
        identityId: identityRecord.id,
      });
      return;
    }

    const resetToken = TokenService.generateResetToken();
    const resetTokenHash = TokenService.hashToken(resetToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.insert(authActionTokens).values({
      userId: identityRecord.userId,
      identityId: identityRecord.id,
      type: "PASSWORD_RESET",
      tokenHash: resetTokenHash,
      expiresAt,
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${resetToken}`;
    await EmailService.sendPasswordResetEmail(identityRecord.email, resetUrl);

    await AuditService.log({
      actorUserId: identityRecord.userId,
      action: AUDIT_ACTIONS.USER_FORGOT_PASSWORD,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: identityRecord.userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    logger.info("Password reset email sent", { identityId: identityRecord.id });
  }

  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const tokenHash = TokenService.hashToken(token);

    const tokenRecord = await db
      .select()
      .from(authActionTokens)
      .where(
        and(
          eq(authActionTokens.tokenHash, tokenHash),
          eq(authActionTokens.type, "PASSWORD_RESET"),
          isNull(authActionTokens.consumedAt),
        ),
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      throw ApiError.badRequest(
        "Invalid or expired reset token",
        "INVALID_TOKEN",
      );
    }

    const record = tokenRecord[0]!;

    if (record.expiresAt < new Date()) {
      throw ApiError.badRequest("Reset token has expired", "TOKEN_EXPIRED");
    }

    if (!record.identityId) {
      throw ApiError.internal("Token record missing identity ID");
    }

    const passwordHash = await PasswordService.hash(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(userIdentities)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(userIdentities.id, record.identityId!));

      await tx
        .update(authActionTokens)
        .set({ consumedAt: new Date() })
        .where(eq(authActionTokens.id, record.id));

      await tx
        .update(sessions)
        .set({ revokedAt: new Date(), revokedReason: "Password reset" })
        .where(eq(sessions.userId, record.userId));
    });

    await AuditService.log({
      actorUserId: record.userId,
      action: AUDIT_ACTIONS.USER_RESET_PASSWORD,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: record.userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    logger.info("Password reset successfully", {
      identityId: record.identityId,
    });
  }

  private static async sendVerificationEmail(
    identity: typeof userIdentities.$inferSelect,
  ): Promise<void> {
    const verificationToken = TokenService.generateVerificationToken();
    const verificationTokenHash = TokenService.hashToken(verificationToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(authActionTokens).values({
      userId: identity.userId,
      identityId: identity.id,
      type: "EMAIL_VERIFICATION",
      tokenHash: verificationTokenHash,
      expiresAt,
    });

    const verificationUrl = `${env.APP_URL}/verify-email?token=${verificationToken}`;
    await EmailService.sendVerificationEmail(identity.email, verificationUrl);
  }

  static async getProfile(userId: string): Promise<User> {
    const [userRecord] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!userRecord) {
      throw ApiError.notFound("User not found", "USER_NOT_FOUND");
    }

    const [identityRecord] = await db
      .select()
      .from(userIdentities)
      .where(
        and(eq(userIdentities.userId, userId), isNull(userIdentities.revokedAt)),
      )
      .limit(1);

    if (!identityRecord) {
      throw ApiError.internal("User identity not found");
    }

    return {
      id: userRecord.id,
      email: identityRecord.email,
      given_name: userRecord.givenName,
      family_name: userRecord.familyName,
      role: userRecord.role as any,
      email_verified: identityRecord.emailVerified,
      created_at: userRecord.createdAt.toISOString(),
      updated_at: userRecord.updatedAt.toISOString(),
    };
  }

  static async updateProfile(
    userId: string,
    data: UpdateProfileData,
  ): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw ApiError.notFound("User not found", "USER_NOT_FOUND");
    }

    const [identityRecord] = await db
      .select()
      .from(userIdentities)
      .where(
        and(eq(userIdentities.userId, userId), isNull(userIdentities.revokedAt)),
      )
      .limit(1);

    if (!identityRecord) {
      throw ApiError.internal("User identity not found");
    }

    await AuditService.log({
      actorUserId: userId,
      action: AUDIT_ACTIONS.USER_UPDATE_PROFILE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    return {
      id: updatedUser.id,
      email: identityRecord.email,
      given_name: updatedUser.givenName,
      family_name: updatedUser.familyName,
      role: updatedUser.role as any,
      email_verified: identityRecord.emailVerified,
      created_at: updatedUser.createdAt.toISOString(),
      updated_at: updatedUser.updatedAt.toISOString(),
    };
  }

  static async deleteAccount(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId));

      await tx
        .update(sessions)
        .set({ revokedAt: new Date(), revokedReason: "Account deleted" })
        .where(eq(sessions.userId, userId));
    });

    await AuditService.log({
      actorUserId: userId,
      action: AUDIT_ACTIONS.USER_DELETE_ACCOUNT,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    logger.info("Account soft-deleted", { userId });
  }

  static getSupportedAuthProviders(): {
    provider: string;
    displayName: string;
    authUrl?: string;
  }[] {
    const providers = [];

    // Always add Email and Password
    providers.push({
      provider: "EMAIL_AND_PASSWORD",
      displayName: "Email & Password",
    });

    if (env.GOOGLE_CLIENT_ID) {
      providers.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        authUrl: "/api/v1/identity/google", // This should match your routes
      });
    }

    if (env.GITHUB_CLIENT_ID) {
      providers.push({
        provider: "GITHUB_OAUTH",
        displayName: "GitHub",
        authUrl: "/api/v1/identity/github", // This should match your routes
      });
    }

    return providers;
  }
}
