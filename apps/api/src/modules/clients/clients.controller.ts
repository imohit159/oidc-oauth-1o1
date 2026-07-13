import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../../shared/utils/api-error.util";
import { ApiResponse } from "../../shared/utils/api-response.util";
import { ClientsService } from "./clients.service";
import type { CreateOAuthClientDto, UpdateOAuthClientDto } from "./dtos";

export class ClientsController {
  /**
   * POST /api/v1/clients
   * Register a new OAuth client application for the authenticated user.
   */
  static async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerUserId = req.user!.id;
      const data = req.body as CreateOAuthClientDto;

      const client = await ClientsService.createClient(ownerUserId, data);

      ApiResponse.success(
        res,
        client,
        "OAuth client created successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/clients
   * List all OAuth clients owned by the authenticated user.
   */
  static async listClients(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerUserId = req.user!.id;

      const clients = await ClientsService.listClientsByOwner(ownerUserId);

      ApiResponse.success(res, clients, "OAuth clients retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/clients/:clientId
   * Get a single OAuth client by its public client_id (must be owned by the authenticated user).
   */
  static async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerUserId = req.user!.id;
      const { clientId } = req.params as { clientId: string };

      const client = await ClientsService.getClientByIdForOwner(
        clientId,
        ownerUserId,
      );

      ApiResponse.success(res, client, "OAuth client retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/clients/:clientId
   * Update an OAuth client owned by the authenticated user.
   */
  static async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerUserId = req.user!.id;
      const { clientId } = req.params as { clientId: string };
      const data = req.body as UpdateOAuthClientDto;

      const updated = await ClientsService.updateClient(
        clientId,
        ownerUserId,
        data,
      );

      ApiResponse.success(res, updated, "OAuth client updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/clients/:clientId/rotate-secret
   * Rotate client secret for an OAuth client owned by the authenticated user.
   */
  static async rotateSecret(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerUserId = req.user!.id;
      const { clientId } = req.params as { clientId: string };

      const credentials = await ClientsService.rotateSecret(
        clientId,
        ownerUserId,
      );

      ApiResponse.success(
        res,
        credentials,
        "OAuth client secret rotated successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/clients/:clientId
   * Soft-delete an OAuth client owned by the authenticated user.
   */
  static async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerUserId = req.user!.id;
      const { clientId } = req.params as { clientId: string };

      await ClientsService.deleteClient(clientId, ownerUserId);

      ApiResponse.success(res, null, "OAuth client deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
