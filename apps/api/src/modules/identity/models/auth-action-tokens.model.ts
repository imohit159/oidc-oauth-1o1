import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

import { users } from "./users.model";
import { userIdentities } from "./user-identities.model";

export const authActionTokens = pgTable("auth_action_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  identityId: uuid("identity_id").references(() => userIdentities.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"] }).notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb("metadata"),
});
