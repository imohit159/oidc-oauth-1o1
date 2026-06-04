import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

import { env } from "./env";
import { logger } from "../shared/logger/logger";

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client);

export async function checkDbConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to connect to the database", { error });
    throw new Error("Database connection failed");
  }
}

export { client };
