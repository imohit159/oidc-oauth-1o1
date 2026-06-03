import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/api-error.util";
import { ApiResponse } from "../utils/api-response.util";
import { logger } from "../logger/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error("Unhandled error", { error: err.message, stack: err.stack, path: req.path });

  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.statusCode, err.code, err.message);
  }

  return ApiResponse.error(res, 500, "INTERNAL_ERROR", "An unexpected error occurred");
}
