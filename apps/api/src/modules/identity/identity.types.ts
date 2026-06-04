import type { User, UserRole } from "@repo/shared";

export interface IdentityRegistrationData {
  givenName: string;
  familyName: string;
  email: string;
  password: string;
}

export interface IdentityLoginData {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface LoginThrottleState {
  failedAttempts: number;
  lockedUntil: Date | null;
}

export interface UpdateProfileData {
  givenName?: string;
  familyName?: string;
}
