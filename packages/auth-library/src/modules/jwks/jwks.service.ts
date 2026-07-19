import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose";

import { DiscoveryService } from "../discovery/discovery.service.js";
import { ZenAuthError } from "../../shared/errors/zen-auth-error.js";

export class JwksService {
  private static keySets = new Map<string, JWTVerifyGetKey>();

  static async getKeySet(issuer: string): Promise<JWTVerifyGetKey> {
    const cached = JwksService.keySets.get(issuer);
    if (cached) {
      return cached;
    }

    try {
      const discovery = await DiscoveryService.getConfiguration(issuer);
      const keySet = createRemoteJWKSet(new URL(discovery.jwks_uri));
      JwksService.keySets.set(issuer, keySet);
      return keySet;
    } catch (error) {
      if (error instanceof ZenAuthError) {
        throw error;
      }
      throw ZenAuthError.jwksFailed(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  static clearCache(issuer?: string): void {
    if (issuer) {
      JwksService.keySets.delete(issuer);
      return;
    }
    JwksService.keySets.clear();
  }
}
