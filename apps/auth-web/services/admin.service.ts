import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api-client";

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string | null;
  metadata: any | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuditLogsResponse {
  items: AuditLog[];
  pagination: PaginationMeta;
}

export const adminService = {
  listAuditLogs(params?: { page?: number; limit?: number }) {
    let url = API_ENDPOINTS.ADMIN.AUDIT;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.set("page", String(params.page));
      if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return apiClient.get<AuditLogsResponse>(url);
  },

  suspendUser(userId: string) {
    const url = API_ENDPOINTS.ADMIN.SUSPEND_USER.replace(":userId", userId);
    return apiClient.post<null>(url);
  },

  unsuspendUser(userId: string) {
    const url = API_ENDPOINTS.ADMIN.UNSUSPEND_USER.replace(":userId", userId);
    return apiClient.post<null>(url);
  },

  deleteUser(userId: string) {
    const url = API_ENDPOINTS.ADMIN.DELETE_USER.replace(":userId", userId);
    return apiClient.delete<null>(url);
  },
};
