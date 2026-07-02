import { eq, and, isNull } from "drizzle-orm";

import { db } from "../../config/database";
import { oauthClients } from "./models/oauth-clients.model";
import { oauthClientRedirectUris } from "./models/oauth-client-redirect-uris.model";
import type { CreateOAuthClientDto, UpdateOAuthClientDto } from "./dtos";
import { TokenService } from "../security/services/token.service";
import { PasswordService } from "../security/services/password.service";
import { ApiError } from "../../shared/utils/api-error.util";

export class OAuthClientsService {
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

    const client = await db.transaction(async (tx) => {
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
      if (data.redirectUris && data.redirectUris.length > 0) {
        const uriValues = data.redirectUris.map((uri) => ({
          clientId: newClient.id,
          redirectUri: uri,
        }));
        
        await tx.insert(oauthClientRedirectUris).values(uriValues);
      }

      return newClient;
    });

    // Return the client along with the unhashed secret (ONLY SHOWN ONCE!)
    return {
      ...client,
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
   * Validate a client's credentials (used for /token endpoint Basic Auth or body params).
   */
  static async validateClientCredentials(
    clientId: string,
    clientSecret?: string,
  ) {
    const client = await OAuthClientsService.getClientByClientId(clientId);
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
