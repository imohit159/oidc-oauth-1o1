import type { Credentials } from "../../shared/types/credentials.types.js";
import { TOKEN_TYPES } from "../../shared/constants.js";
import { ZenAuthError } from "../../shared/errors/zen-auth-error.js";

export interface AuthRequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
}

export interface AuthRequestDependencies {
  getCredentials: () => Credentials;
  refreshAccessToken: () => Promise<Credentials>;
}

export class AuthRequestService {
  static async request(
    deps: AuthRequestDependencies,
    options: AuthRequestOptions,
  ): Promise<Response> {
    const credentials = deps.getCredentials();
    if (!credentials.access_token) {
      throw ZenAuthError.missingToken("No access_token set on client");
    }

    const shouldRefreshFirst = AuthRequestService._isExpired(credentials);
    if (shouldRefreshFirst) {
      await deps.refreshAccessToken();
    }

    const first = await AuthRequestService._fetchWithBearer(
      deps.getCredentials(),
      options,
    );

    if (first.status !== 401 || shouldRefreshFirst) {
      return first;
    }

    await deps.refreshAccessToken();
    return AuthRequestService._fetchWithBearer(deps.getCredentials(), options);
  }

  // Internal method
  private static async _fetchWithBearer(
    credentials: Credentials,
    options: AuthRequestOptions,
  ): Promise<Response> {
    if (!credentials.access_token) {
      throw ZenAuthError.missingToken("No access_token available for request");
    }

    const headers = new Headers(options.headers);
    headers.set(
      "Authorization",
      `${credentials.token_type ?? TOKEN_TYPES.BEARER} ${credentials.access_token}`,
    );

    try {
      return await fetch(options.url, {
        method: options.method ?? "GET",
        headers,
        body: options.body ?? undefined,
      });
    } catch (error) {
      throw ZenAuthError.requestFailed(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Helper function
  private static _isExpired(credentials: Credentials): boolean {
    if (!credentials.expiry_date) {
      return false;
    }
    // Refresh 30s early
    return Date.now() >= credentials.expiry_date - 30_000;
  }
}
