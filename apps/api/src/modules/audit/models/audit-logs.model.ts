import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

import { users } from "../../identity/models/users.model";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});


export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type SelectAuditLog = typeof auditLogs.$inferSelect;