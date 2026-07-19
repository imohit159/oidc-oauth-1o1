export class ZenAuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ZenAuthError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static invalidOptions(message: string, code = "INVALID_OPTIONS") {
    return new ZenAuthError(code, message);
  }

  static discoveryFailed(message: string) {
    return new ZenAuthError("DISCOVERY_FAILED", message);
  }

  static tokenRequestFailed(message: string, statusCode?: number) {
    return new ZenAuthError("TOKEN_REQUEST_FAILED", message, statusCode);
  }

  static invalidToken(message: string, code = "INVALID_TOKEN") {
    return new ZenAuthError(code, message, 401);
  }

  static missingToken(message: string) {
    return new ZenAuthError("MISSING_TOKEN", message, 401);
  }

  static unsupportedGrant(message: string) {
    return new ZenAuthError("UNSUPPORTED_GRANT", message, 400);
  }

  static requestFailed(message: string, statusCode?: number) {
    return new ZenAuthError("REQUEST_FAILED", message, statusCode);
  }

  static jwksFailed(message: string) {
    return new ZenAuthError("JWKS_FAILED", message);
  }
}
