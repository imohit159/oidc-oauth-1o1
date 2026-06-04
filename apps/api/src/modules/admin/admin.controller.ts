import type { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../../shared/utils/api-response.util";
import { AuditService } from "../audit";
import type { GetAuditLogsQueryDto } from "./dtos";

export class AdminController {
  static async getAuditLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query = req.query as unknown as GetAuditLogsQueryDto;
      console.log(`query: ${JSON.stringify(query)}`);
      console.log(`Type of query: ${typeof query.page} ${typeof query.limit}`);
      const result = await AuditService.getLogs(query);

      ApiResponse.success(
        res,
        {
          items: result.logs,
          pagination: result.pagination,
        },
        "Audit logs retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}
