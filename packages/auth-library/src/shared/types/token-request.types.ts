import type { GRANT_TYPES } from "../constants.js";

export type GrantType = (typeof GRANT_TYPES)[keyof typeof GRANT_TYPES];

export interface GetTokenOptions {
  grant_type?: GrantType;
  code?: string;
  codeVerifier?: string;
  redirectUri?: string;
  scope?: string | string[];
  refresh_token?: string;
}

export interface VerifyIdTokenOptions {
  idToken: string;
  audience?: string | string[];
  nonce?: string;
}
