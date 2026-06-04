import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";

import { ApiError } from "../utils/api-error.util";
import { logger } from "../logger/logger";

type Schemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.query) {
      logger.info(
        "[TEMP DEBUG] `req.query` BEFORE validation:",
        req.query,
      );
    }
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
        logger.info(
          "[TEMP DEBUG] `req.query` AFTER validation:",
          req.query,
        );
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((issue) => `${issue.path.join(".") || "error"}: ${issue.message}`)
          .join(", ");
        return next(ApiError.badRequest(errorMessages, "VALIDATION_ERROR"));
      }
      next(error);
    }
  };
}
