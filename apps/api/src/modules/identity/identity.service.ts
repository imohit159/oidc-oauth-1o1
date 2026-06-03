import { eq, and, isNull } from "drizzle-orm";

import { db } from "../../config/database";
import { env } from "../../config/env";
import { ApiError } from "../../shared/utils/api-error.util";
import { logger } from "../../shared/logger/logger";
import { PasswordService } from "../security/services/password.service";
import { JwtService } from "../security/services/jwt.service";
import { TokenService } from "../security/services/token.service";
import { EmailService } from "../notifications/services/email.service";
import { users } from "./models/users.model";
import { userIdentities } from "./models/user-identities.model";
import { sessions } from "../sessions/models/sessions.model";
import { refreshTokens } from "../sessions/models/refresh-tokens.model";
import { loginThrottles } from "./models/login-throttles.model";
import { authActionTokens } from "./models/auth-action-tokens.model";
import type { IdentityRegistrationData, IdentityLoginData, AuthenticatedUser } from "./identity.types";

export class IdentityService {
  private static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static async register(data: IdentityRegistrationData): Promise<AuthenticatedUser> {
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

    const [user] = await db
      .insert(users)
      .values({
        givenName: data.givenName,
        familyName: data.familyName,
      })
      .returning();

    if (!user) {
      throw ApiError.internal("Failed to create user");
    }

    const [identity] = await db
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
      throw ApiError.internal("Failed to create identity");
    }

    const authResponse = await IdentityService.createSessionAndTokens(user, identity);

    logger.info("Registration successful", { userId: user.id, email: normalizedEmail });

    return authResponse;
  }

  static async login(data: IdentityLoginData): Promise<AuthenticatedUser> {
    const normalizedEmail = IdentityService.normalizeEmail(data.email);

    logger.info("Login attempt", { email: normalizedEmail });

    await IdentityService.checkLoginThrottle(normalizedEmail);

    const identity = await db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.emailNormalized, normalizedEmail),
          eq(userIdentities.provider, "PASSWORD"),
          isNull(userIdentities.revokedAt)
        )
      )
      .limit(1);

    if (identity.length === 0) {
      await IdentityService.recordFailedLogin(normalizedEmail);
      throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const identityRecord = identity[0]!;

    if (!identityRecord.passwordHash) {
      throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const passwordValid = await PasswordService.verify(identityRecord.passwordHash, data.password);

    if (!passwordValid) {
      await IdentityService.recordFailedLogin(normalizedEmail);
      throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, identityRecord.userId), isNull(users.deletedAt), isNull(users.suspendedAt)))
      .limit(1);

    if (user.length === 0) {
      throw ApiError.unauthorized("Account not found or suspended", "ACCOUNT_UNAVAILABLE");
    }

    const userRecord = user[0]!;

    await db
      .update(userIdentities)
      .set({ lastUsedAt: new Date() })
      .where(eq(userIdentities.id, identityRecord.id));

    await IdentityService.resetLoginThrottle(normalizedEmail);

    const authResponse = await IdentityService.createSessionAndTokens(userRecord, identityRecord);

    logger.info("Login successful", { userId: userRecord.id, email: normalizedEmail });

    return authResponse;
  }

  private static async createSessionAndTokens(user: any, identity: any): Promise<AuthenticatedUser> {
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

  private static async checkLoginThrottle(emailNormalized: string): Promise<void> {
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
      const minutesLeft = Math.ceil((record.lockedUntil.getTime() - Date.now()) / 60000);
      throw ApiError.tooManyRequests(
        `Account temporarily locked. Try again in ${minutesLeft} minutes`,
        "ACCOUNT_LOCKED"
      );
    }

    if (record.failedAttempts >= 5) {
      throw ApiError.tooManyRequests(
        "Too many failed login attempts. Account temporarily locked",
        "ACCOUNT_LOCKED"
      );
    }
  }

  private static async recordFailedLogin(emailNormalized: string): Promise<void> {
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
    const lockedUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

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

  private static async resetLoginThrottle(emailNormalized: string): Promise<void> {
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

  static async verifyEmail(token: string): Promise<void> {
    const tokenHash = TokenService.hashToken(token);

    const tokenRecord = await db
      .select()
      .from(authActionTokens)
      .where(
        and(
          eq(authActionTokens.tokenHash, tokenHash),
          eq(authActionTokens.type, "EMAIL_VERIFICATION"),
          isNull(authActionTokens.consumedAt)
        )
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      throw ApiError.badRequest("Invalid or expired verification token", "INVALID_TOKEN");
    }

    const record = tokenRecord[0]!;

    if (record.expiresAt < new Date()) {
      throw ApiError.badRequest("Verification token has expired", "TOKEN_EXPIRED");
    }

    if (!record.identityId) {
      throw ApiError.internal("Token record missing identity ID");
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

    logger.info("Email verified successfully", { identityId: record.identityId });
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
          isNull(userIdentities.revokedAt)
        )
      )
      .limit(1);

    if (identity.length === 0) {
      logger.info("Resend verification requested for non-existent email", { email: normalizedEmail });
      return;
    }

    const identityRecord = identity[0]!;

    if (identityRecord.emailVerified) {
      logger.info("Resend verification requested for already verified email", { email: normalizedEmail });
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
          isNull(userIdentities.revokedAt)
        )
      )
      .limit(1);

    if (identity.length === 0) {
      logger.info("Password reset requested for non-existent email", { email: normalizedEmail });
      return;
    }

    const identityRecord = identity[0]!;

    if (!identityRecord.emailVerified) {
      logger.warn("Password reset requested for unverified email", { identityId: identityRecord.id });
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

    logger.info("Password reset email sent", { identityId: identityRecord.id });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = TokenService.hashToken(token);

    const tokenRecord = await db
      .select()
      .from(authActionTokens)
      .where(
        and(
          eq(authActionTokens.tokenHash, tokenHash),
          eq(authActionTokens.type, "PASSWORD_RESET"),
          isNull(authActionTokens.consumedAt)
        )
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      throw ApiError.badRequest("Invalid or expired reset token", "INVALID_TOKEN");
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

    logger.info("Password reset successfully", { identityId: record.identityId });
  }

  private static async sendVerificationEmail(identity: typeof userIdentities.$inferSelect): Promise<void> {
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
}
