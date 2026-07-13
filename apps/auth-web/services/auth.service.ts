import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  role: "USER" | "ADMIN";
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  givenName: string;
  familyName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  sessionId: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export const authService = {
  login(payload: LoginPayload) {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
  },

  register(payload: RegisterPayload) {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.REGISTER, payload);
  },

  getMe() {
    return apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.GET_ME);
  },

  updateProfile(payload: { givenName: string; familyName: string }) {
    return apiClient.patch<{ user: User }>(API_ENDPOINTS.AUTH.GET_ME, payload);
  },

  refresh() {
    return apiClient.post<RefreshResponse>(API_ENDPOINTS.AUTH.REFRESH);
  },

  logout() {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  forgotPassword(email: string) {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword(payload: { token: string; password?: string }) {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  },

  verifyEmail(token: string) {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  resendVerification(email: string) {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
  },

  deleteAccount() {
    return apiClient.delete<null>(API_ENDPOINTS.AUTH.GET_ME);
  },

  getSupportedProviders() {
    return apiClient.get<AuthProvider[]>(API_ENDPOINTS.AUTH.SUPPORTED_PROVIDERS);
  },
};

export interface AuthProvider {
  provider: string;
  displayName: string;
  authUrl?: string;
}
