import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

import { ApiError } from "../utils/api-error.util";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((e) => e.message).join(", ");
      throw ApiError.badRequest(errorMessages, "VALIDATION_ERROR");
    }

    req.body = result.data;
    next();
  };
}
