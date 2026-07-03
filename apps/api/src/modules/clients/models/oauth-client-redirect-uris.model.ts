import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { oauthClients } from "./oauth-clients.model";

export const oauthClientRedirectUris = pgTable(
  "oauth_client_redirect_uris",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => oauthClients.id, { onDelete: "cascade" }),
    redirectUri: text("redirect_uri").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    clientRedirectUriIdx: uniqueIndex("client_redirect_uri_idx").on(
      table.clientId,
      table.redirectUri,
    ),
  }),
);
