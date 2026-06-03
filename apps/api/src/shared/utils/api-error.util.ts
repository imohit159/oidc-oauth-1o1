export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new ApiError(400, code, message);
  }

  static unauthorized(message: string, code = "UNAUTHORIZED") {
    return new ApiError(401, code, message);
  }

  static forbidden(message: string, code = "FORBIDDEN") {
    return new ApiError(403, code, message);
  }

  static notFound(message: string, code = "NOT_FOUND") {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code = "CONFLICT") {
    return new ApiError(409, code, message);
  }

  static tooManyRequests(message: string, code = "TOO_MANY_REQUESTS") {
    return new ApiError(429, code, message);
  }

  static internal(message: string, code = "INTERNAL_ERROR") {
    return new ApiError(500, code, message);
  }
}
