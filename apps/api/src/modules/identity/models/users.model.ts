import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  role: text("role", { enum: ["USER", "ADMIN"] })
    .notNull()
    .default("USER"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
});
