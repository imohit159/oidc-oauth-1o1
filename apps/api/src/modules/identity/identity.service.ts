import { eq, and, isNull } from "drizzle-orm";

import { db } from "../../config/database";
import { env } from "../../config/env";
import { ApiError } from "../../shared/utils/api-error.util";
import { logger } from "../../shared/logger/logger";
import { PasswordService } from "../security/services/password.service";
import { TokenService } from "../security/services/token.service";
import { EmailService } from "../notifications/services/email.service";
import { AuditService } from "../audit";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, AUDIT_STATUSES } from "../../shared/constants";
import { ERROR_CODES, ERROR_MESSAGES } from "../../shared/messages";
import { users } from "./models/users.model";
import { userIdentities } from "./models/user-identities.model";
import { loginThrottles } from "./models/login-throttles.model";
import { authActionTokens } from "./models/auth-action-tokens.model";
import { SessionsService } from "../sessions/sessions.service";
import { sessions } from "../sessions/models/sessions.model";
import type { RegisterDto, LoginDto, UpdateProfileDto } from "./dtos";
import type { User, UserRole } from "@repo/shared";

export class IdentityService {
  /**
   * @desc Normalize the email
   * @param email 
   */
  private static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * @desc Register a new user with an email and password identity.
   */
  static async registerWithEmailAndPassword(
    data: RegisterDto,
  ): Promise<User> {
    // 1. Normalize the incoming email address
    const normalizedEmail = IdentityService.normalizeEmail(data.email);

    logger.info("Registration attempt", { email: normalizedEmail });

    // 2. Check if a user identity with this email already exists
    const existingIdentity = await db
      .select()
      .from(userIdentities)
      .where(eq(userIdentities.email, normalizedEmail))
      .limit(1);

    if (existingIdentity.length > 0) {
      throw ApiError.conflict(ERROR_MESSAGES.EMAIL_EXISTS, ERROR_CODES.EMAIL_EXISTS);
    }

    // 3. Securely hash the password using Argon2
    const passwordHash = await PasswordService.hash(data.password);

    // 4. Perform database inserts for both user and identity tables within a transaction
    const identity = await db.transaction(async (tx) => {
      // Insert core profile row
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

      // Insert identity credentials row
      const [identity] = await tx
        .insert(userIdentities)
        .values({
          userId: user.id,
          provider: "PASSWORD",
          email: data.email,
          emailVerified: false,
          passwordHash,
        })
        .returning();

      if (!identity) {
        tx.rollback();
        throw new Error("Failed to create identity.");
      }

      return { user, identity };
    });

    // console.log("Identity", identity)
    if (!identity) {
      throw ApiError.internal("Failed to create user and identity.");
    }

    // 5. Write the audit log outside the transaction (prevents lock contention)
    await AuditService.log({
      actorUserId: null,
      action: AUDIT_ACTIONS.USER_REGISTER,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: identity.user.id,
      status: AUDIT_STATUSES.SUCCESS,
    });
    
    // 6. Asynchronously trigger the email verification sequence in the background
    IdentityService.sendVerificationEmail(identity.identity).catch((error) => {
      logger.error("Failed to send verification email in background", { error });
    });

    // 7. Return the created user matching the @repo/shared User type
    return {
      id: identity.user.id,
      email: identity.identity.email,
      given_name: identity.user.givenName,
      family_name: identity.user.familyName,
      role: identity.user.role as any,
      email_verified: identity.identity.emailVerified,
      created_at: identity.user.createdAt.toISOString(),
      updated_at: identity.user.updatedAt.toISOString(),
    };
  }

  /**
   * @desc Generate a verification token and trigger email dispatch.
   */
  private static async sendVerificationEmail(
    identity: typeof userIdentities.$inferSelect,
  ) {
    // 1. Generate new verification token & hash
    const verificationToken = TokenService.generateVerificationToken();
    const verificationTokenHash = TokenService.hashToken(verificationToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 2. Persist the action token in the DB
    await db.insert(authActionTokens).values({
      userId: identity.userId,
      identityId: identity.id,
      type: "EMAIL_VERIFICATION",
      tokenHash: verificationTokenHash,
      expiresAt,
    });

    // 3. Dispatch email using notifications/EmailService
    const verificationUrl = `${env.FRONTEND_APP_URL}/verify-email?token=${verificationToken}`;
    await EmailService.sendVerificationEmail(identity.email, verificationUrl);
  }

  /**
   * @desc Log in a user using email and password.
   * Performs throttle checks, verifies credentials, and issues session tokens.
   */
  static async loginWithEmailAndPassword(
    data: LoginDto,
  ): Promise<User> {
    // 1. Normalize the email address
    const normalizedEmail = IdentityService.normalizeEmail(data.email);

    logger.info("Login attempt", { email: normalizedEmail });

    // 2. Enforce check for active lockout throttle status
    await IdentityService.checkLoginThrottle(normalizedEmail);

    // 3. Retrieve matching local credential identity
    const identityResult = await db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.email, normalizedEmail),
          eq(userIdentities.provider, "PASSWORD"),
          isNull(userIdentities.revokedAt),
        ),
      )
      .limit(1);

    // If no identity exists, log failure to throttle counter and reject
    if (identityResult.length === 0) {
      await IdentityService.recordFailedLogin(normalizedEmail);
      throw ApiError.unauthorized(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    const identityRecord = identityResult[0]!;

    // 4. Ensure a password hash is stored (OAuth accounts won't have this)
    if (!identityRecord.passwordHash) {
      await IdentityService.recordFailedLogin(
        normalizedEmail,
        identityRecord.userId,
      );
      throw ApiError.unauthorized(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    // 5. Verify the password matches using Argon2id
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
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    // 6. Ensure the user's email address is verified
    if (!identityRecord.emailVerified) {
      throw ApiError.forbidden(
        ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
        ERROR_CODES.EMAIL_NOT_VERIFIED,
      );
    }

    // 7. Fetch the user's core profile record
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

    // Check if account has been soft-deleted or suspended
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
        ERROR_MESSAGES.ACCOUNT_UNAVAILABLE,
        ERROR_CODES.ACCOUNT_UNAVAILABLE,
      );
    }

    const userRecord = userResult[0]!;

    // 8. Update last used timestamp for this login provider method
    await db
      .update(userIdentities)
      .set({ lastUsedAt: new Date() })
      .where(eq(userIdentities.id, identityRecord.id));

    // 9. Wipe any existing failed throttling attempts on successful login
    await IdentityService.resetLoginThrottle(normalizedEmail);

    // 10. Issue new active session and token payload using the SessionsService
    const authResponse = await SessionsService.createSession(userRecord.id, {
      email: identityRecord.email,
      role: userRecord.role,
      emailVerified: identityRecord.emailVerified,
      givenName: userRecord.givenName,
      familyName: userRecord.familyName,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    });

    // 11. Record successful login to audit logs
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


  /**
   * @desc Check if the login attempts for this email are throttled/locked.
   * Throws a TooManyRequests (429) error if the account is currently locked.
   */
  private static async checkLoginThrottle(
    email: string,
  ) {
    // 1. Fetch current throttle record from database
    const throttle = await db
      .select()
      .from(loginThrottles)
      .where(eq(loginThrottles.email, email))
      .limit(1);

    // If no failed attempts yet, allow the request to proceed
    if (throttle.length === 0) {
      return;
    }

    const record = throttle[0]!;

    // 2. Check if a lockout timestamp is active and in the future
    if (record.lockedUntil && record.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (record.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw ApiError.tooManyRequests(
        `Account temporarily locked. Try again in ${minutesLeft} minutes`,
        ERROR_CODES.ACCOUNT_LOCKED,
      );
    }

    // 3. Double-check absolute limit threshold
    if (record.failedAttempts >= 5) {
      throw ApiError.tooManyRequests(
        "Too many failed login attempts. Account temporarily locked",
        ERROR_CODES.ACCOUNT_LOCKED,
      );
    }
  }

  /**
   * @desc Log a failed attempt and lock the account for 15 minutes if it hits 5 failures.
   */
  private static async recordFailedLogin(
    email: string,
    userId?: string,
  ) {
    // 1. Log the failed login audit event
    await AuditService.log({
      actorUserId: userId,
      action: AUDIT_ACTIONS.USER_LOGIN,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.FAILURE,
      metadata: { email: email, reason: "Invalid credentials" },
    });

    // 2. Fetch current throttle state
    const throttle = await db
      .select()
      .from(loginThrottles)
      .where(eq(loginThrottles.email, email))
      .limit(1);

    // If this is the first failure, create the record with 1 attempt
    if (throttle.length === 0) {
      await db.insert(loginThrottles).values({
        email,
        failedAttempts: 1,
        lastFailedAt: new Date(),
      });
      return;
    }

    const record = throttle[0]!;
    const newFailedAttempts = record.failedAttempts + 1;
    
    // 3. Set lockout to 15 minutes from now if threshold of 5 is met
    const lockedUntil =
      newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    // 4. Update the attempts and lockout timestamp
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
      email: email,
      failedAttempts: newFailedAttempts,
      locked: lockedUntil !== null,
    });
  }

  /**
   * @desc Reset the login throttle state (clears attempts and releases lock) on successful login.
   */
  private static async resetLoginThrottle(
    email: string,
  ) {
    await db
      .update(loginThrottles)
      .set({
        failedAttempts: 0,
        lockedUntil: null,
        lastSuccessAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(loginThrottles.email, email));
  }

  /**
   * @desc Verify a user's email address using a one-time verification token.
   * On success, sets emailVerified to true and returns an authenticated session.
   */
  static async verifyEmail(token: string): Promise<User> {
    // 1. Generate the hash of the token to query the DB
    const tokenHash = TokenService.hashToken(token);

    // 2. Fetch the corresponding unconsumed email verification token
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
        ERROR_MESSAGES.VERIFICATION_TOKEN_INVALID,
        ERROR_CODES.INVALID_TOKEN,
      );
    }

    const record = tokenRecord[0]!;

    // 3. Ensure token has not expired
    if (record.expiresAt < new Date()) {
      throw ApiError.badRequest(
        ERROR_MESSAGES.VERIFICATION_TOKEN_EXPIRED,
        ERROR_CODES.TOKEN_EXPIRED,
      );
    }

    if (!record.identityId || !record.userId) {
      throw ApiError.internal("Token record missing identity or user ID");
    }

    // 4. Mark email as verified and consume the token in a transaction
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

    // 5. Log verification audit success
    await AuditService.log({
      actorUserId: record.userId,
      action: AUDIT_ACTIONS.USER_VERIFY_EMAIL,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: record.userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    // 6. Fetch verified user and identity details
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

    // 7. Auto-login the user immediately after successful verification
    const authResponse = await SessionsService.createSession(verifiedUser.id, {
      email: verifiedIdentity.email,
      role: verifiedUser.role,
      emailVerified: verifiedIdentity.emailVerified,
      givenName: verifiedUser.givenName,
      familyName: verifiedUser.familyName,
      createdAt: verifiedUser.createdAt,
      updatedAt: verifiedUser.updatedAt,
    });

    logger.info("Session created automatically after email verification", {
      userId: verifiedUser.id,
    });

    return authResponse;
  }

  /**
   * @desc Resend an email verification token if the email exists and is not yet verified.
   */
  static async resendVerificationEmail(email: string) {
    const normalizedEmail = IdentityService.normalizeEmail(email);

    // 1. Fetch matching identity record
    const identity = await db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.email, normalizedEmail),
          eq(userIdentities.provider, "PASSWORD"),
          isNull(userIdentities.revokedAt),
        ),
      )
      .limit(1);

    if (identity.length === 0) {
      throw ApiError.notFound(ERROR_MESSAGES.EMAIL_NOT_FOUND, ERROR_CODES.EMAIL_NOT_FOUND);
    }

    const identityRecord = identity[0]!;

    // 2. Prevent resending if the account is already verified
    if (identityRecord.emailVerified) {
      throw ApiError.badRequest(
        ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED,
        ERROR_CODES.EMAIL_ALREADY_VERIFIED,
      );
    }

    // 3. Dispatch new verification token in the background (fire-and-forget) to keep response fast
    IdentityService.sendVerificationEmail(identityRecord).catch((error) => {
      logger.error("Failed to send verification email in background", { error });
    });

    logger.info("Verification email resent", { identityId: identityRecord.id });

    return {
      email: identityRecord.email,
    };
  }

  /**
   * @desc Generate a forgot password recovery token and send a recovery email.
   */
  static async forgotPassword(email: string) {
    const normalizedEmail = IdentityService.normalizeEmail(email);

    // 1. Fetch matching identity record
    const identity = await db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.email, normalizedEmail),
          eq(userIdentities.provider, "PASSWORD"),
          isNull(userIdentities.revokedAt),
        ),
      )
      .limit(1);

    if (identity.length === 0) {
      throw ApiError.notFound(ERROR_MESSAGES.EMAIL_NOT_FOUND, ERROR_CODES.EMAIL_NOT_FOUND);
    }

    const identityRecord = identity[0]!;

    // 2. Reject reset if user has not verified their email address
    if (!identityRecord.emailVerified) {
      throw ApiError.forbidden(
        ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
        ERROR_CODES.EMAIL_NOT_VERIFIED,
      );
    }

    // 3. Create a reset token (expires in 1 hour) and save its hash to the database
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

    // 4. Send reset link to user's email in the background to keep the response fast
    const resetUrl = `${env.APP_URL}/reset-password?token=${resetToken}`;
    EmailService.sendPasswordResetEmail(identityRecord.email, resetUrl).catch((error) => {
      logger.error("Failed to send password reset email in background", { error });
    });

    // 5. Log audit trail record
    await AuditService.log({
      actorUserId: identityRecord.userId,
      action: AUDIT_ACTIONS.USER_FORGOT_PASSWORD,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: identityRecord.userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    logger.info("Password reset email sent", { identityId: identityRecord.id });
  }

  /**
   * @desc Reset the user's password using a valid reset token and revoke all active sessions.
   */
  static async resetPassword(
    token: string,
    newPassword: string,
  ) {
    const tokenHash = TokenService.hashToken(token);

    // 1. Fetch matching unconsumed password reset token
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
        ERROR_MESSAGES.RESET_TOKEN_INVALID,
        ERROR_CODES.INVALID_TOKEN,
      );
    }

    const record = tokenRecord[0]!;

    // 2. Ensure reset token hasn't expired
    if (record.expiresAt < new Date()) {
      throw ApiError.badRequest(ERROR_MESSAGES.RESET_TOKEN_EXPIRED, ERROR_CODES.TOKEN_EXPIRED);
    }

    if (!record.identityId) {
      throw ApiError.internal("Token record missing identity ID");
    }

    // 3. Hash the new password using Argon2id
    const passwordHash = await PasswordService.hash(newPassword);

    // 4. Update password, consume token, and revoke active sessions in a transaction
    await db.transaction(async (tx) => {
      // Update credentials
      await tx
        .update(userIdentities)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(userIdentities.id, record.identityId!));

      // Mark token as consumed
      await tx
        .update(authActionTokens)
        .set({ consumedAt: new Date() })
        .where(eq(authActionTokens.id, record.id));

      // Force sign-out of all devices
      await tx
        .update(sessions)
        .set({ revokedAt: new Date(), revokedReason: "Password reset" })
        .where(eq(sessions.userId, record.userId));
    });

    // 5. Log audit trail entry
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

  /**
   * @desc Fetch the user profile by their ID (combines core user and identity detail).
   */
  static async getProfile(userId: string): Promise<User> {
    // 1. Fetch user core record
    const [userRecord] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!userRecord) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND);
    }

    // 2. Fetch active identity details
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

    // 3. Compose and return standard profile payload
    return {
      id: userRecord.id,
      email: identityRecord.email,
      given_name: userRecord.givenName,
      family_name: userRecord.familyName,
      role: userRecord.role as UserRole,
      email_verified: identityRecord.emailVerified,
      created_at: userRecord.createdAt.toISOString(),
      updated_at: userRecord.updatedAt.toISOString(),
    };
  }

  /**
   * @desc Update profile metadata for a specific user.
   */
  static async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<User> {
    // 1. Update the user core profile fields
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND);
    }

    // 2. Fetch the corresponding active identity
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

    // 3. Log metadata update audit entry
    await AuditService.log({
      actorUserId: userId,
      action: AUDIT_ACTIONS.USER_UPDATE_PROFILE,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    // 4. Return standard profile payload
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

  /**
   * @desc Soft-delete a user's account and revoke all their active login sessions.
   */
  static async deleteAccount(userId: string) {
    // 1. Soft-delete user and revoke sessions in a transaction
    await db.transaction(async (tx) => {
      // Soft delete by setting deletedAt timestamp
      await tx
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId));

      // Revoke all active login sessions
      await tx
        .update(sessions)
        .set({ revokedAt: new Date(), revokedReason: "Account deleted" })
        .where(eq(sessions.userId, userId));
    });

    // 2. Log account deletion audit entry
    await AuditService.log({
      actorUserId: userId,
      action: AUDIT_ACTIONS.USER_DELETE_ACCOUNT,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      status: AUDIT_STATUSES.SUCCESS,
    });

    logger.info("Account soft-deleted", { userId });
  }

  /**
   * @desc Get supported auth providers
   */
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
