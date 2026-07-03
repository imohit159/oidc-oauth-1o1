import { eq, and, isNull, desc } from "drizzle-orm";

import { db } from "../../config/database";
import { oauthClients } from "./models/oauth-clients.model";
import { oauthClientRedirectUris } from "./models/oauth-client-redirect-uris.model";
import { oauthClientAllowedOrigins } from "./models/oauth-client-allowed-origins.model";
import type { CreateOAuthClientDto, UpdateOAuthClientDto } from "./dtos";
import { TokenService } from "../security/services/token.service";
import { PasswordService } from "../security/services/password.service";
import { ApiError } from "../../shared/utils/api-error.util";

export class ClientsService {
  /**
   * Create a new OAuth client application.
   */
  static async createClient(ownerUserId: string, data: CreateOAuthClientDto) {
    const clientId = TokenService.generateClientId();

    // Generate secret if client is confidential or machine-to-machine
    let clientSecret = null;
    let clientSecretHash = null;

    if (data.clientType === "CONFIDENTIAL" || data.clientType === "MACHINE") {
      clientSecret = TokenService.generateClientSecret();
      clientSecretHash = await PasswordService.hash(clientSecret);
    }

    const { client, redirectUris, allowedOrigins } = await db.transaction(async (tx) => {
      // 1. Insert client record
      const [newClient] = await tx
        .insert(oauthClients)
        .values({
          clientId,
          ownerUserId,
          name: data.name,
          description: data.description,
          clientType: data.clientType,
          allowedGrantTypes: data.allowedGrantTypes,
          clientSecretHash,
          clientSecretLastShownAt: clientSecret ? new Date() : null,
        })
        .returning();

      if (!newClient) throw new Error("Failed to create client.");

      // 2. Insert redirect URIs
      let insertedUris: string[] = [];
      if (data.redirectUris && data.redirectUris.length > 0) {
        const uriValues = data.redirectUris.map((uri) => ({
          clientId: newClient.id,
          redirectUri: uri,
        }));

        const result = await tx.insert(oauthClientRedirectUris).values(uriValues).returning();
        insertedUris = result.map((r) => r.redirectUri);
      }

      // 3. Insert allowed origins
      let insertedOrigins: string[] = [];
      if (data.allowedOrigins && data.allowedOrigins.length > 0) {
        const originValues = data.allowedOrigins.map((origin) => ({
          clientId: newClient.id,
          origin,
        }));

        const result = await tx.insert(oauthClientAllowedOrigins).values(originValues).returning();
        insertedOrigins = result.map((r) => r.origin);
      }

      return { client: newClient, redirectUris: insertedUris, allowedOrigins: insertedOrigins };
    });

    // Return the client along with the unhashed secret (ONLY SHOWN ONCE!)
    return {
      ...client,
      redirectUris,
      allowedOrigins,
      clientSecret, // This must be displayed to the user immediately, then never again
    };
  }

  /**
   * Get an active OAuth client by its client_id.
   */
  static async getClientByClientId(clientId: string) {
    const [client] = await db
      .select()
      .from(oauthClients)
      .where(
        and(
          eq(oauthClients.clientId, clientId),
          eq(oauthClients.status, "ACTIVE"),
          isNull(oauthClients.deletedAt),
        ),
      )
      .limit(1);

    return client || null;
  }

  /**
   * List all active OAuth clients owned by a user.
   */
  static async listClientsByOwner(ownerUserId: string) {
    return db
      .select()
      .from(oauthClients)
      .where(
        and(
          eq(oauthClients.ownerUserId, ownerUserId),
          eq(oauthClients.status, "ACTIVE"),
          isNull(oauthClients.deletedAt),
        ),
      )
      .orderBy(desc(oauthClients.createdAt));
  }

  /**
   * Get a single active client by its public client_id, enforcing owner check.
   */
  static async getClientByIdForOwner(clientId: string, ownerUserId: string) {
    const [client] = await db
      .select()
      .from(oauthClients)
      .where(
        and(
          eq(oauthClients.clientId, clientId),
          eq(oauthClients.ownerUserId, ownerUserId),
          eq(oauthClients.status, "ACTIVE"),
          isNull(oauthClients.deletedAt),
        ),
      )
      .limit(1);

    if (!client) {
      throw ApiError.notFound("OAuth client not found", "CLIENT_NOT_FOUND");
    }

    const redirectUris = await db
      .select()
      .from(oauthClientRedirectUris)
      .where(eq(oauthClientRedirectUris.clientId, client.id));

    const allowedOrigins = await db
      .select()
      .from(oauthClientAllowedOrigins)
      .where(eq(oauthClientAllowedOrigins.clientId, client.id));

    return {
      ...client,
      redirectUris: redirectUris.map((r) => r.redirectUri),
      allowedOrigins: allowedOrigins.map((o) => o.origin),
    };
  }

  /**
   * Update mutable fields of an OAuth client.
   */
  static async updateClient(
    clientId: string,
    ownerUserId: string,
    data: UpdateOAuthClientDto,
  ) {
    // Ensure the client exists and is owned by the caller
    const existing = await ClientsService.getClientByIdForOwner(clientId, ownerUserId);

    await db.transaction(async (tx) => {
      await tx
        .update(oauthClients)
        .set({
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.allowedGrantTypes !== undefined && { allowedGrantTypes: data.allowedGrantTypes }),
          updatedAt: new Date(),
        })
        .where(eq(oauthClients.id, existing.id));

      // Sync redirect URIs if provided
      if (data.redirectUris !== undefined) {
        await tx
          .delete(oauthClientRedirectUris)
          .where(eq(oauthClientRedirectUris.clientId, existing.id));

        if (data.redirectUris.length > 0) {
          await tx.insert(oauthClientRedirectUris).values(
            data.redirectUris.map((uri) => ({
              clientId: existing.id,
              redirectUri: uri,
            })),
          );
        }
      }

      // Sync allowed origins if provided
      if (data.allowedOrigins !== undefined) {
        await tx
          .delete(oauthClientAllowedOrigins)
          .where(eq(oauthClientAllowedOrigins.clientId, existing.id));

        if (data.allowedOrigins.length > 0) {
          await tx.insert(oauthClientAllowedOrigins).values(
            data.allowedOrigins.map((origin) => ({
              clientId: existing.id,
              origin,
            })),
          );
        }
      }
    });

    return ClientsService.getClientByIdForOwner(clientId, ownerUserId);
  }

  /**
   * Soft-delete an OAuth client owned by the caller.
   */
  static async deleteClient(clientId: string, ownerUserId: string) {
    const existing = await ClientsService.getClientByIdForOwner(clientId, ownerUserId);

    await db
      .update(oauthClients)
      .set({ status: "DELETED", deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(oauthClients.id, existing.id));
  }

  /**
   * Validate that the requested redirect URI is registered for the client.
   */
  static async validateRedirectUri(clientId: string, redirectUri: string) {
    const client = await ClientsService.getClientByClientId(clientId);
    if (!client) {
      throw ApiError.badRequest("Invalid client_id", "INVALID_CLIENT");
    }

    const [uriRecord] = await db
      .select()
      .from(oauthClientRedirectUris)
      .where(
        and(
          eq(oauthClientRedirectUris.clientId, client.id),
          eq(oauthClientRedirectUris.redirectUri, redirectUri),
        ),
      )
      .limit(1);

    if (!uriRecord) {
      throw ApiError.badRequest("Invalid redirect_uri", "INVALID_REDIRECT_URI");
    }
  }

  /**
   * Validate that the requested origin is registered for the client.
   */
  static async validateOrigin(clientId: string, origin: string) {
    const client = await ClientsService.getClientByClientId(clientId);
    if (!client) {
      throw ApiError.badRequest("Invalid client_id", "INVALID_CLIENT");
    }

    const [originRecord] = await db
      .select()
      .from(oauthClientAllowedOrigins)
      .where(
        and(
          eq(oauthClientAllowedOrigins.clientId, client.id),
          eq(oauthClientAllowedOrigins.origin, origin),
        ),
      )
      .limit(1);

    if (!originRecord) {
      throw ApiError.badRequest("Origin not allowed", "ORIGIN_NOT_ALLOWED");
    }
  }

  /**
   * Validate a client's credentials (used for /token endpoint Basic Auth or body params).
   */
  static async validateClientCredentials(
    clientId: string,
    clientSecret?: string,
  ) {
    const client = await ClientsService.getClientByClientId(clientId);
    if (!client) {
      throw ApiError.unauthorized("Invalid client_id", "INVALID_CLIENT");
    }

    if (client.clientType === "CONFIDENTIAL" || client.clientType === "MACHINE") {
      if (!clientSecret) {
        throw ApiError.unauthorized("client_secret is required for this client type", "MISSING_SECRET");
      }

      if (!client.clientSecretHash) {
        throw ApiError.internal("Client misconfigured: Missing secret hash");
      }

      const isValid = await PasswordService.verify(client.clientSecretHash, clientSecret);
      if (!isValid) {
        throw ApiError.unauthorized("Invalid client_secret", "INVALID_CLIENT");
      }
    } else {
      // PUBLIC clients don't use secrets. If one is provided, it's an error.
      if (clientSecret) {
        throw ApiError.badRequest("client_secret must not be provided for public clients", "INVALID_REQUEST");
      }
    }

    return client;
  }
}
