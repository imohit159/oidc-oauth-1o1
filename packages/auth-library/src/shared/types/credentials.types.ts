export interface Credentials {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expiry_date?: number;
  scope?: string;
}

export interface TokenResponse {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

export interface GetTokenResponse {
  tokens: Credentials;
}
