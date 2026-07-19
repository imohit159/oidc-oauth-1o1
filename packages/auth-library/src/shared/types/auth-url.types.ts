import type { ACCESS_TYPES } from "../constants.js";

export type AccessType =
  (typeof ACCESS_TYPES)[keyof typeof ACCESS_TYPES];

export interface GenerateAuthUrlOptions {
  scope?: string | string[];
  access_type?: AccessType;
  state?: string;
  nonce?: string;
  redirectUri?: string;
  prompt?: string;
  response_type?: string;
}

export interface AuthUrlResult {
  url: string;
  codeVerifier: string;
  state: string;
  nonce?: string;
}
