import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/api-error.util";

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== "ADMIN") {
    return next(
      ApiError.forbidden("You do not have permission to perform this action."),
    );
  }
  next();
}
