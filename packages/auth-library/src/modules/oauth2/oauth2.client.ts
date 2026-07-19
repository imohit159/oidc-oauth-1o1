import { EventEmitter } from "node:events";
import { randomBytes } from "node:crypto";

import {
  ClientOptionsConfig,
  type ClientOptions,
  type ClientOptionsInput,
} from "../../config/client-options.js";
import {
  ACCESS_TYPES,
  DEFAULT_SCOPES,
  ERROR_CODES,
  GRANT_TYPES,
  OAUTH_SCOPES,
} from "../../shared/constants.js";
import { ZenAuthError } from "../../shared/errors/zen-auth-error.js";
import type {
  AuthUrlResult,
  GenerateAuthUrlOptions,
} from "../../shared/types/auth-url.types.js";
import type { AccessTokenClaims } from "../../shared/types/claims.types.js";
import type {
  Credentials,
  GetTokenResponse,
} from "../../shared/types/credentials.types.js";
import type {
  GetTokenOptions,
  VerifyIdTokenOptions,
} from "../../shared/types/token-request.types.js";
import { UrlUtil } from "../../shared/utils/url.util.js";
import { DiscoveryService } from "../discovery/discovery.service.js";
import {
  AuthRequestService,
  type AuthRequestOptions,
} from "../http/auth-request.service.js";
import { PkceService } from "../pkce/pkce.service.js";
import { TokenService } from "../token/token.service.js";
import { AccessTokenService } from "../verify/access-token.service.js";
import { IdTokenService } from "../verify/id-token.service.js";
import type { LoginTicket } from "../verify/login-ticket.js";

export interface OAuth2ClientEvents {
  tokens: (tokens: Credentials) => void;
}

export class OAuth2Client extends EventEmitter {
  readonly options: ClientOptions;
  credentials: Credentials = {};

  constructor(input: ClientOptionsInput) {
    super();
    this.options = ClientOptionsConfig.parse(input);
  }

  async generateAuthUrl(
    authOptions: GenerateAuthUrlOptions = {},
  ): Promise<AuthUrlResult> {
    const redirectUri = authOptions.redirectUri ?? this.options.redirectUri;
    if (!redirectUri) {
      throw ZenAuthError.invalidOptions(
        "redirectUri is required to generate an authorization URL",
        ERROR_CODES.MISSING_REDIRECT_URI,
      );
    }

    const discovery = await DiscoveryService.getConfiguration(
      this.options.issuer,
    );
    const pkce = PkceService.generate();
    const state =
      authOptions.state ??
      randomBytes(16).toString("base64url");
    const nonce = authOptions.nonce;

    const scopes = this._resolveScopes(authOptions);

    const query = UrlUtil.toQueryString({
      response_type: authOptions.response_type ?? "code",
      client_id: this.options.clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod,
      ...(nonce ? { nonce } : {}),
      ...(authOptions.prompt ? { prompt: authOptions.prompt } : {}),
    });

    return {
      url: `${discovery.authorization_endpoint}?${query}`,
      codeVerifier: pkce.codeVerifier,
      state,
      ...(nonce ? { nonce } : {}),
    };
  }

  async getToken(tokenOptions: GetTokenOptions = {}): Promise<GetTokenResponse> {
    const grantType =
      tokenOptions.grant_type ?? GRANT_TYPES.AUTHORIZATION_CODE;

    if (grantType === GRANT_TYPES.AUTHORIZATION_CODE) {
      return this._getAuthorizationCodeToken(tokenOptions);
    }

    if (grantType === GRANT_TYPES.REFRESH_TOKEN) {
      const refreshToken =
        tokenOptions.refresh_token ?? this.credentials.refresh_token;
      if (!refreshToken) {
        throw ZenAuthError.invalidOptions(
          "refresh_token is required for refresh_token grant",
          ERROR_CODES.MISSING_REFRESH_TOKEN,
        );
      }
      const tokens = await this._refresh(refreshToken, tokenOptions.scope);
      return { tokens };
    }

    if (grantType === GRANT_TYPES.CLIENT_CREDENTIALS) {
      throw ZenAuthError.unsupportedGrant(
        "client_credentials is not supported yet; use getToken when the Zen IdP implements this grant",
      );
    }

    throw ZenAuthError.unsupportedGrant(
      `Unsupported grant_type: ${grantType}`,
    );
  }

  setCredentials(credentials: Credentials): void {
    this.credentials = { ...credentials };
    this.emit("tokens", { ...this.credentials });
  }

  async refreshAccessToken(): Promise<GetTokenResponse> {
    if (!this.credentials.refresh_token) {
      throw ZenAuthError.invalidOptions(
        "No refresh_token available on client credentials",
        ERROR_CODES.MISSING_REFRESH_TOKEN,
      );
    }

    const tokens = await this._refresh(this.credentials.refresh_token);
    return { tokens };
  }

  async request(options: AuthRequestOptions): Promise<Response> {
    return AuthRequestService.request(
      {
        getCredentials: () => this.credentials,
        refreshAccessToken: async () => {
          const { tokens } = await this.refreshAccessToken();
          return tokens;
        },
      },
      options,
    );
  }

  async verifyIdToken(options: VerifyIdTokenOptions): Promise<LoginTicket> {
    return IdTokenService.verify(
      this.options.issuer,
      options,
      this.options.clientId,
    );
  }

  async verifyAccessToken(accessToken: string): Promise<AccessTokenClaims> {
    return AccessTokenService.verify(this.options.issuer, accessToken);
  }

  // Internal method
  private async _getAuthorizationCodeToken(
    tokenOptions: GetTokenOptions,
  ): Promise<GetTokenResponse> {
    if (!tokenOptions.code) {
      throw ZenAuthError.invalidOptions("code is required for authorization_code grant");
    }
    if (!tokenOptions.codeVerifier) {
      throw ZenAuthError.invalidOptions(
        "codeVerifier is required for authorization_code grant",
        ERROR_CODES.MISSING_CODE_VERIFIER,
      );
    }

    const redirectUri = tokenOptions.redirectUri ?? this.options.redirectUri;
    if (!redirectUri) {
      throw ZenAuthError.invalidOptions(
        "redirectUri is required for authorization_code grant",
        ERROR_CODES.MISSING_REDIRECT_URI,
      );
    }

    const discovery = await DiscoveryService.getConfiguration(
      this.options.issuer,
    );

    const { tokens } = await TokenService.exchangeAuthorizationCode({
      code: tokenOptions.code,
      codeVerifier: tokenOptions.codeVerifier,
      redirectUri,
      options: this.options,
      tokenEndpoint: discovery.token_endpoint,
    });

    this.setCredentials(tokens);
    return { tokens };
  }

  // Internal method
  private async _refresh(
    refreshToken: string,
    scope?: string | string[],
  ): Promise<Credentials> {
    const discovery = await DiscoveryService.getConfiguration(
      this.options.issuer,
    );

    const { tokens } = await TokenService.refreshToken({
      refreshToken,
      options: this.options,
      tokenEndpoint: discovery.token_endpoint,
      ...(scope ? { scope: UrlUtil.normalizeScopes(scope) } : {}),
    });

    // Keep prior refresh if rotation omitted it (TokenService already does this)
    this.credentials = {
      ...this.credentials,
      ...tokens,
    };
    this.emit("tokens", { ...this.credentials });
    return this.credentials;
  }

  // Helper function
  private _resolveScopes(authOptions: GenerateAuthUrlOptions): string {
    let scopes = UrlUtil.normalizeScopes(
      authOptions.scope ?? [...DEFAULT_SCOPES],
    );

    if (
      authOptions.access_type === ACCESS_TYPES.OFFLINE &&
      !scopes.split(" ").includes(OAUTH_SCOPES.OFFLINE_ACCESS)
    ) {
      scopes = scopes
        ? `${scopes} ${OAUTH_SCOPES.OFFLINE_ACCESS}`
        : OAUTH_SCOPES.OFFLINE_ACCESS;
    }

    return scopes;
  }
}
