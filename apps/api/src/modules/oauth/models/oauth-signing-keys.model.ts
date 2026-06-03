import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const oauthSigningKeys = pgTable("oauth_signing_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  kid: text("kid").notNull().unique(),
  algorithm: text("algorithm").notNull(),
  publicKeyPem: text("public_key_pem").notNull(),
  status: text("status").notNull(),
  activatedAt: timestamp("activated_at").notNull(),
  retiredAt: timestamp("retired_at"),
  expiresAt: timestamp("expires_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
