export interface AccessTokenClaims {
  sub: string;
  client_id?: string;
  scope?: string;
  sid?: string;
  iss?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export interface IdTokenClaims {
  sub: string;
  iss?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
  nonce?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: unknown;
}
