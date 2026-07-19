import { DISCOVERY_PATH } from "../../shared/constants.js";
import { ZenAuthError } from "../../shared/errors/zen-auth-error.js";
import { UrlUtil } from "../../shared/utils/url.util.js";
import type { OpenIdConfiguration } from "./discovery.types.js";

export class DiscoveryService {
  private static cache = new Map<string, OpenIdConfiguration>();

  static async getConfiguration(issuer: string): Promise<OpenIdConfiguration> {
    const cached = DiscoveryService.cache.get(issuer);
    if (cached) {
      return cached;
    }

    const url = UrlUtil.joinUrl(issuer, DISCOVERY_PATH);

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      throw ZenAuthError.discoveryFailed(
        `Failed to fetch OpenID discovery document from ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (!response.ok) {
      throw ZenAuthError.discoveryFailed(
        `Discovery request failed with status ${response.status}`,
      );
    }

    const config = (await response.json()) as OpenIdConfiguration;

    if (
      !config.authorization_endpoint ||
      !config.token_endpoint ||
      !config.jwks_uri
    ) {
      throw ZenAuthError.discoveryFailed(
        "Discovery document missing required endpoints",
      );
    }

    DiscoveryService.cache.set(issuer, config);
    return config;
  }

  static clearCache(issuer?: string): void {
    if (issuer) {
      DiscoveryService.cache.delete(issuer);
      return;
    }
    DiscoveryService.cache.clear();
  }
}
