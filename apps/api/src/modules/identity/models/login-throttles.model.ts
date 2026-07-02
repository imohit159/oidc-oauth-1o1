import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export const loginThrottles = pgTable("login_throttles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  lastFailedAt: timestamp("last_failed_at"),
  lastSuccessAt: timestamp("last_success_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
