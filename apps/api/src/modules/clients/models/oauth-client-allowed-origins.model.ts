import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { oauthClients } from "./oauth-clients.model";

export const oauthClientAllowedOrigins = pgTable(
  "oauth_client_allowed_origins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => oauthClients.id, { onDelete: "cascade" }),
    origin: text("origin").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    clientAllowedOriginIdx: uniqueIndex("client_allowed_origin_idx").on(
      table.clientId,
      table.origin,
    ),
  }),
);
