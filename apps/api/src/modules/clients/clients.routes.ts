import { Router, type Router as RouterType } from "express";

import { authenticate } from "../../shared/middleware/authenticate.middleware";
import { validateRequest } from "../../shared/middleware/validate-request.middleware";
import { createOAuthClientSchema, updateOAuthClientSchema } from "./dtos";
import { ClientsController } from "./clients.controller";

const router: RouterType = Router();

// All client management routes require an authenticated user
router.use(authenticate);

// POST /api/v1/clients — Register a new OAuth client application
router.post(
  "/",
  validateRequest({ body: createOAuthClientSchema }),
  ClientsController.createClient,
);

// GET /api/v1/clients — List all clients owned by the current user
router.get("/", ClientsController.listClients);

// GET /api/v1/clients/:clientId — Get a specific client
router.get("/:clientId", ClientsController.getClient);

// PATCH /api/v1/clients/:clientId — Update a client
router.patch(
  "/:clientId",
  validateRequest({ body: updateOAuthClientSchema }),
  ClientsController.updateClient,
);

// DELETE /api/v1/clients/:clientId — Soft-delete a client
router.delete("/:clientId", ClientsController.deleteClient);

export { router as clientsRoutes };
