// scripts/seed.ts
import { eq } from "drizzle-orm";
import { db, client } from "../src/config/database";
import { env } from "../src/config/env";
import { users, userIdentities } from "../src/modules/identity/models";
import { PasswordService } from "../src/modules/security/services/password.service";
import { logger } from "../src/shared/logger/logger";

async function seed() {
  logger.info("Running seed script...");

  const {
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
    SEED_ADMIN_GIVEN_NAME,
    SEED_ADMIN_FAMILY_NAME,
  } = env;

  if (
    !SEED_ADMIN_EMAIL ||
    !SEED_ADMIN_PASSWORD ||
    !SEED_ADMIN_GIVEN_NAME ||
    !SEED_ADMIN_FAMILY_NAME
  ) {
    logger.error("Missing required seed environment variables. Exiting.");
    process.exit(1);
  }

  const normalizedEmail = SEED_ADMIN_EMAIL.toLowerCase().trim();

  // Check if admin user already exists
  const existingAdmin = await db
    .select()
    .from(userIdentities)
    .where(eq(userIdentities.emailNormalized, normalizedEmail));

  if (existingAdmin.length > 0) {
    logger.warn(
      `Admin user with email ${SEED_ADMIN_EMAIL} already exists. Skipping.`,
    );
    return;
  }

  // Create admin user
  logger.info(`Creating admin user: ${SEED_ADMIN_EMAIL}`);

  const passwordHash = await PasswordService.hash(SEED_ADMIN_PASSWORD);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        givenName: SEED_ADMIN_GIVEN_NAME,
        familyName: SEED_ADMIN_FAMILY_NAME,
        role: "ADMIN",
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create admin user record.");
    }

    await tx.insert(userIdentities).values({
      userId: user.id,
      provider: "PASSWORD",
      email: SEED_ADMIN_EMAIL,
      emailNormalized: normalizedEmail,
      emailVerified: true, // Admin email is verified by default
      passwordHash,
    });
  });

  logger.info("Admin user created successfully!");
}

seed()
  .catch((error) => {
    logger.error("Seed script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    logger.info("Seed script finished. Closing database connection.");
    await client.end();
  });
