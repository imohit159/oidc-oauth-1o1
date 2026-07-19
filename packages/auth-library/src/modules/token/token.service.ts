import {
  GRANT_TYPES,
  TOKEN_TYPES,
} from "../../shared/constants.js";
import { ZenAuthError } from "../../shared/errors/zen-auth-error.js";
import type {
  Credentials,
  TokenResponse,
} from "../../shared/types/credentials.types.js";
import type {
  ExchangeAuthorizationCodeParams,
  NormalizedTokenResult,
  RefreshTokenParams,
} from "./token.types.js";

export class TokenService {
  static async exchangeAuthorizationCode(
    params: ExchangeAuthorizationCodeParams,
  ): Promise<NormalizedTokenResult> {
    const body = new URLSearchParams({
      grant_type: GRANT_TYPES.AUTHORIZATION_CODE,
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
      client_id: params.options.clientId,
    });

    if (params.options.clientSecret) {
      body.set("client_secret", params.options.clientSecret);
    }

    const raw = await TokenService._postToken(params.tokenEndpoint, body);
    return { tokens: TokenService._normalize(raw) };
  }

  static async refreshToken(
    params: RefreshTokenParams,
  ): Promise<NormalizedTokenResult> {
    const body = new URLSearchParams({
      grant_type: GRANT_TYPES.REFRESH_TOKEN,
      refresh_token: params.refreshToken,
      client_id: params.options.clientId,
    });

    if (params.options.clientSecret) {
      body.set("client_secret", params.options.clientSecret);
    }

    if (params.scope) {
      body.set("scope", params.scope);
    }

    const raw = await TokenService._postToken(params.tokenEndpoint, body);
    const tokens = TokenService._normalize(raw);

    // Preserve prior refresh_token if IdP omits it on refresh
    if (!tokens.refresh_token) {
      tokens.refresh_token = params.refreshToken;
    }

    return { tokens };
  }

  // Internal method
  private static async _postToken(
    tokenEndpoint: string,
    body: URLSearchParams,
  ): Promise<TokenResponse> {
    let response: Response;
    try {
      response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body,
      });
    } catch (error) {
      throw ZenAuthError.tokenRequestFailed(
        error instanceof Error ? error.message : String(error),
      );
    }

    const payload = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!response.ok) {
      const message =
        typeof payload.error_description === "string"
          ? payload.error_description
          : typeof payload.error === "string"
            ? payload.error
            : typeof payload.message === "string"
              ? payload.message
              : `Token request failed with status ${response.status}`;

      throw ZenAuthError.tokenRequestFailed(message, response.status);
    }

    if (typeof payload.access_token !== "string") {
      throw ZenAuthError.tokenRequestFailed(
        "Token response missing access_token",
        response.status,
      );
    }

    return payload as unknown as TokenResponse;
  }

  // Helper function
  private static _normalize(raw: TokenResponse): Credentials {
    const expiry_date =
      typeof raw.expires_in === "number"
        ? Date.now() + raw.expires_in * 1000
        : undefined;

    return {
      access_token: raw.access_token,
      ...(raw.id_token ? { id_token: raw.id_token } : {}),
      ...(raw.refresh_token ? { refresh_token: raw.refresh_token } : {}),
      token_type: raw.token_type ?? TOKEN_TYPES.BEARER,
      ...(expiry_date !== undefined ? { expiry_date } : {}),
      ...(raw.scope ? { scope: raw.scope } : {}),
    };
  }
}
