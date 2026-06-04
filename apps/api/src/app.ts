import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env";

import { errorHandler } from "./shared/middleware/error-handler.middleware";
import { identityRoutes } from "./modules/identity";
import { sessionsRoutes } from "./modules/sessions";
import { adminRoutes } from "./modules/admin";

function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));

  app.get("/", (_req, res) => {
    res.json({ message: "Welcome to OIDC OAuth 1o1 API" });
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
      version: "1.0.0",
      uptime: process.uptime(),
    });
  });

  app.use("/api/v1/identity", identityRoutes);
  app.use("/api/v1/sessions", sessionsRoutes);
  app.use("/api/v1/admin", adminRoutes);

  app.use(errorHandler);

  return app;
}

export { createApp };
