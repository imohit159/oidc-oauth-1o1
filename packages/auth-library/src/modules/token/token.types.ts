import type { ClientOptions } from "../../config/client-options.js";
import type { Credentials } from "../../shared/types/credentials.types.js";

export interface ExchangeAuthorizationCodeParams {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  options: ClientOptions;
  tokenEndpoint: string;
}

export interface RefreshTokenParams {
  refreshToken: string;
  options: ClientOptions;
  tokenEndpoint: string;
  scope?: string;
}

export interface NormalizedTokenResult {
  tokens: Credentials;
}
