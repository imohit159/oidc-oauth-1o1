import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api-client";

export interface UserConsent {
  id: string;
  clientId: string;
  scopes: string[];
  grantedAt: string;
  lastUsedAt: string | null;
  clientName: string;
  clientDescription: string | null;
}

export const consentService = {
  listConsents() {
    return apiClient.get<UserConsent[]>(API_ENDPOINTS.OAUTH.CONSENTS);
  },

  revokeConsent(consentId: string) {
    const url = API_ENDPOINTS.OAUTH.REVOKE_CONSENT.replace(":consentId", consentId);
    return apiClient.delete<null>(url);
  },
};
