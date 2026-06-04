// scripts/cleanup-audit-logs.ts
import { sql } from "drizzle-orm";
import { db, client } from "../src/config/database";
import { auditLogs } from "../src/modules/audit/models";
import { logger } from "../src/shared/logger/logger";

async function cleanup() {
  logger.info("Running audit log cleanup job...");

  try {
    const result = await db.delete(auditLogs).where(sql`created_at < now() - interval '30 days'`);
    // Note: Drizzle's `delete` doesn't always return the count easily with all drivers.
    // Assuming a successful query means success.
    logger.info("Audit log cleanup completed.");
  } catch (error) {
    logger.error("Failed to run audit log cleanup:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanup();
