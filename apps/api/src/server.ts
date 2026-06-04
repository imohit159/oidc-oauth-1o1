import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger/logger";
import { checkDbConnection } from "./config/database";

async function init() {
  try {
    await checkDbConnection();

    const app = createApp();
    const PORT = env.PORT;

    app.listen(PORT, () => {
      logger.info(`Server running at ${env.APP_URL}`, { env: env.NODE_ENV });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

init();
