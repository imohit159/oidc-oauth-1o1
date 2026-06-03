import { Router, type Router as RouterType } from "express";

import { authenticate } from "../../shared/middleware/authenticate.middleware";
import { SessionsController } from "./sessions.controller";

const router: RouterType = Router();

router.get("/", authenticate, SessionsController.listSessions);
router.post("/logout", authenticate, SessionsController.logout);
router.post("/logout-all", authenticate, SessionsController.logoutAll);
router.delete("/:sessionId", authenticate, SessionsController.revokeSession);
router.post("/refresh", SessionsController.refreshAccessToken);

export { router as sessionsRoutes };
