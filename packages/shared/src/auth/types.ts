export type UserRole = "USER" | "ADMIN";

export interface JwtClaims {
  sub: string;
  email: string;
  role: UserRole;
  clientId?: string;
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  role: UserRole;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
}

