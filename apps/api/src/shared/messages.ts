export const ERROR_CODES = {
  EMAIL_EXISTS: "EMAIL_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  ACCOUNT_UNAVAILABLE: "ACCOUNT_UNAVAILABLE",
  EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
  EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
} as const;

export const ERROR_MESSAGES = {
  EMAIL_EXISTS: "Email already registered",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_VERIFIED: "Please verify your email address before logging in.",
  ACCOUNT_UNAVAILABLE: "Account not found or suspended",
  EMAIL_NOT_FOUND: "Email address is not registered.",
  EMAIL_ALREADY_VERIFIED: "Email address is already verified.",
  VERIFICATION_TOKEN_INVALID: "Invalid or expired verification token",
  VERIFICATION_TOKEN_EXPIRED: "Verification token has expired",
  RESET_TOKEN_INVALID: "Invalid or expired reset token",
  RESET_TOKEN_EXPIRED: "Reset token has expired",
  USER_NOT_FOUND: "User not found",
} as const;
