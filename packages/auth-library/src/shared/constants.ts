export const OAUTH_SCOPES = {
  OPENID: "openid",
  PROFILE: "profile",
  EMAIL: "email",
  OFFLINE_ACCESS: "offline_access",
} as const;

export const GRANT_TYPES = {
  AUTHORIZATION_CODE: "authorization_code",
  REFRESH_TOKEN: "refresh_token",
  CLIENT_CREDENTIALS: "client_credentials",
} as const;

export const CODE_CHALLENGE_METHODS = {
  S256: "S256",
  PLAIN: "plain",
} as const;

export const TOKEN_TYPES = {
  BEARER: "Bearer",
} as const;

export const ACCESS_TYPES = {
  ONLINE: "online",
  OFFLINE: "offline",
} as const;

export const ERROR_CODES = {
  INVALID_OPTIONS: "INVALID_OPTIONS",
  DISCOVERY_FAILED: "DISCOVERY_FAILED",
  TOKEN_REQUEST_FAILED: "TOKEN_REQUEST_FAILED",
  INVALID_TOKEN: "INVALID_TOKEN",
  MISSING_TOKEN: "MISSING_TOKEN",
  MISSING_CODE_VERIFIER: "MISSING_CODE_VERIFIER",
  MISSING_REDIRECT_URI: "MISSING_REDIRECT_URI",
  MISSING_REFRESH_TOKEN: "MISSING_REFRESH_TOKEN",
  UNSUPPORTED_GRANT: "UNSUPPORTED_GRANT",
  REQUEST_FAILED: "REQUEST_FAILED",
  JWKS_FAILED: "JWKS_FAILED",
} as const;

export const DEFAULT_SCOPES = [
  OAUTH_SCOPES.OPENID,
  OAUTH_SCOPES.PROFILE,
  OAUTH_SCOPES.EMAIL,
] as const;

export const DISCOVERY_PATH = "/.well-known/openid-configuration";
