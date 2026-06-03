import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  tokenJti: text("token_jti").notNull().unique(),
  parentRefreshTokenId: uuid("parent_refresh_token_id"),
  expiresAt: timestamp("expires_at").notNull(),
  rotatedAt: timestamp("rotated_at"),
  replacedByRefreshTokenId: uuid("replaced_by_refresh_token_id"),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
