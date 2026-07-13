import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { users } from "../../identity/models/users.model";

export const oauthClients = pgTable("oauth_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: text("client_id").notNull().unique(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  publisherName: text("publisher_name"),
  privacyPolicyUrl: text("privacy_policy_url"),
  termsOfServiceUrl: text("terms_of_service_url"),
  verificationStatus: text("verification_status", {
    enum: ["UNVERIFIED", "VERIFIED", "TRUSTED"],
  })
    .notNull()
    .default("UNVERIFIED"),
  clientType: text("client_type", {
    enum: ["CONFIDENTIAL", "PUBLIC", "MACHINE"],
  }).notNull(),
  allowedGrantTypes: text("allowed_grant_types").array().notNull(),
  clientSecretHash: text("client_secret_hash"),
  clientSecretLastShownAt: timestamp("client_secret_last_shown_at", {
    withTimezone: true,
  }),
  clientSecretRotatedAt: timestamp("client_secret_rotated_at", {
    withTimezone: true,
  }),
  status: text("status", { enum: ["ACTIVE", "SUSPENDED", "DELETED"] })
    .notNull()
    .default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
