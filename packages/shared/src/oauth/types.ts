export type ClientType = "CONFIDENTIAL" | "PUBLIC" | "MACHINE";

export type GrantType =
  "authorization_code" | "refresh_token" | "client_credentials";

export type OAuthScope = "openid" | "profile" | "email" | "offline_access";

export interface OAuthClient {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  client_type: ClientType;
  allowed_grant_types: GrantType[];
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  created_at: string;
  updated_at: string;
}

export interface OAuthConsent {
  id: string;
  user_id: string;
  client_id: string;
  scopes: OAuthScope[];
  granted_at: string;
  revoked_at?: string;
  last_used_at?: string;
}
