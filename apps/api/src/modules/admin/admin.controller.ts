import type { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../../shared/utils/api-response.util";
import { AuditService } from "../audit";
import { AdminService } from "./services";
import type { GetAuditLogsQueryDto } from "./dtos";

export class AdminController {
  static async getAuditLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query = req.query as unknown as GetAuditLogsQueryDto;
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

  static async suspendUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const actorUserId = req.user!.id;
      await AdminService.suspendUser(actorUserId, userId as string);
      ApiResponse.success(res, null, "User suspended successfully");
    } catch (error) {
      next(error);
    }
  }

  static async unsuspendUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const actorUserId = req.user!.id;
      await AdminService.unsuspendUser(actorUserId, userId as string);
      ApiResponse.success(res, null, "User unsuspended successfully");
    } catch (error) {
      next(error);
    }
  }

  static async softDeleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const actorUserId = req.user!.id;
      await AdminService.softDeleteUser(actorUserId, userId as string);
      ApiResponse.success(res, null, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

