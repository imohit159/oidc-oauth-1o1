import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api-client";

export interface OidcClient {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  clientType: "CONFIDENTIAL" | "PUBLIC" | "MACHINE";
  allowedGrantTypes: string[];
  clientSecretHash: string | null;
  clientSecretLastShownAt: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  updatedAt: string;
  redirectUris?: string[];
  allowedOrigins?: string[];
  clientSecret?: string | null; // Returned only once upon creation
  logoUrl?: string | null;
  websiteUrl?: string | null;
  publisherName?: string | null;
  privacyPolicyUrl?: string | null;
  termsOfServiceUrl?: string | null;
  verificationStatus?: "UNVERIFIED" | "VERIFIED" | "TRUSTED";
}

export interface CreateClientPayload {
  name: string;
  description?: string;
  clientType: "CONFIDENTIAL" | "PUBLIC" | "MACHINE";
  allowedGrantTypes: string[];
  redirectUris: string[];
  allowedOrigins?: string[];
  logoUrl?: string;
  websiteUrl?: string;
  publisherName?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export interface UpdateClientPayload {
  name?: string;
  description?: string;
  allowedGrantTypes?: string[];
  redirectUris?: string[];
  allowedOrigins?: string[];
  logoUrl?: string;
  websiteUrl?: string;
  publisherName?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export const clientService = {
  listClients() {
    return apiClient.get<OidcClient[]>(API_ENDPOINTS.CLIENTS.LIST);
  },

  getClient(clientId: string) {
    const url = API_ENDPOINTS.CLIENTS.DETAIL.replace(":clientId", clientId);
    return apiClient.get<OidcClient>(url);
  },

  createClient(payload: CreateClientPayload) {
    return apiClient.post<OidcClient>(API_ENDPOINTS.CLIENTS.CREATE, payload);
  },

  updateClient(clientId: string, payload: UpdateClientPayload) {
    const url = API_ENDPOINTS.CLIENTS.DETAIL.replace(":clientId", clientId);
    return apiClient.patch<OidcClient>(url, payload);
  },

  deleteClient(clientId: string) {
    const url = API_ENDPOINTS.CLIENTS.DETAIL.replace(":clientId", clientId);
    return apiClient.delete<null>(url);
  },

  rotateSecret(clientId: string) {
    const url = `${API_ENDPOINTS.CLIENTS.DETAIL.replace(":clientId", clientId)}/rotate-secret`;
    return apiClient.post<{
      clientId: string;
      clientSecret: string;
      name: string;
    }>(url);
  },
};
