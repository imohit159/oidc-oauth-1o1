import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api-client";

export interface UserSession {
  id: string;
  userId: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean; // Can be computed on frontend or added
}

export const sessionService = {
  listSessions() {
    return apiClient.get<UserSession[]>(API_ENDPOINTS.SESSIONS.LIST);
  },

  revokeSession(sessionId: string) {
    const url = API_ENDPOINTS.SESSIONS.REVOKE.replace(":id", sessionId);
    return apiClient.delete<null>(url);
  },
};
