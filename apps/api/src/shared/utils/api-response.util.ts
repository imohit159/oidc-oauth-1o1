import type { Response } from "express";

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = "Operation completed successfully",
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }
}
