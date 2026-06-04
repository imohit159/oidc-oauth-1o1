import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "../../identity/models/users.model";
import { oauthClients } from "./oauth-clients.model";
import { sessions } from "../../sessions/models/sessions.model";

export const oauthAuthorizationCodes = pgTable("oauth_authorization_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  codeHash: text("code_hash").notNull().unique(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => oauthClients.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => sessions.id, {
    onDelete: "cascade",
  }),
  redirectUri: text("redirect_uri").notNull(),
  codeChallenge: text("code_challenge").notNull(),
  codeChallengeMethod: text("code_challenge_method").notNull(),
  scopes: text("scopes").array().notNull(),
  nonce: text("nonce"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
