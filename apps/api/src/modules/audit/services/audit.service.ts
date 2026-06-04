import { db } from "../../../config/database";
import { auditLogs } from "../models";
import type { InsertAuditLog, SelectAuditLog } from "../models";
import { count,desc } from "drizzle-orm";

export type AuditLogData = Omit<InsertAuditLog, "id" | "createdAt">;

export class AuditService {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await db.insert(auditLogs).values(data);
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  static async getLogs(options: {
    page: number;
    limit: number;
  }): Promise<{
    logs: SelectAuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const [totalRecords] = await db.select({ value: count() }).from(auditLogs);
    const total = totalRecords?.value ?? 0;
    const totalPages = Math.ceil(total / limit);

    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
