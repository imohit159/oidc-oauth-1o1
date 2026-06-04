import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

import { ApiError } from "../utils/api-error.util";

type Schemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error: any) {
      const errorMessages = error.errors.map((e: any) => e.message).join(", ");
      throw ApiError.badRequest(errorMessages, "VALIDATION_ERROR");
    }
  };
}
