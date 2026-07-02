import crypto from "node:crypto";

export class TokenService {
  static generateRandomToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  static generateAuthorizationCode(): string {
    return TokenService.generateRandomToken(48);
  }

  static generateRefreshToken(): string {
    return TokenService.generateRandomToken(64);
  }

  static generateVerificationToken(): string {
    return TokenService.generateRandomToken(32);
  }

  static generateResetToken(): string {
    return TokenService.generateRandomToken(32);
  }

  static generateClientId(): string {
    return `client_${TokenService.generateRandomToken(16)}`;
  }

  static generateClientSecret(): string {
    return `secret_${TokenService.generateRandomToken(32)}`;
  }

  static generateJti(): string {
    return crypto.randomUUID();
  }
}
