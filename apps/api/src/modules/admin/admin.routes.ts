import { Router, type Router as RouterType } from "express";

import { authenticate } from "../../shared/middleware/authenticate.middleware";
import { requireAdmin } from "../../shared/middleware/require-admin.middleware";
import { validateRequest } from "../../shared/middleware/validate-request.middleware";
import { getAuditLogsQuerySchema } from "./dtos";
import { AdminController } from "./admin.controller";

const router: RouterType = Router();

router.get(
  "/audit",
  authenticate,
  requireAdmin,
  validateRequest({ query: getAuditLogsQuerySchema }),
  AdminController.getAuditLogs,
);

export { router as adminRoutes };
