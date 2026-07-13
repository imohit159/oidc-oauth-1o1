import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api-client";

export interface ClientPublicInfo {
  name: string;
  description: string | null;
  clientType: "PUBLIC" | "CONFIDENTIAL" | "M2M";
  logoUrl?: string | null;
  websiteUrl?: string | null;
  publisherName?: string | null;
  privacyPolicyUrl?: string | null;
  termsOfServiceUrl?: string | null;
  verificationStatus?: "UNVERIFIED" | "VERIFIED" | "TRUSTED";
}

export interface ConsentSubmission {
  client_id: string;
  approved: boolean;
  scope?: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: "plain" | "S256";
  state?: string;
  nonce?: string;
}

export interface ConsentResponse {
  redirectUrl: string;
}

export const oauthService = {
  getClientInfo(clientId: string) {
    return apiClient.get<ClientPublicInfo>(
      `${API_ENDPOINTS.OAUTH.CLIENT_INFO}?client_id=${clientId}`,
    );
  },

  submitConsent(payload: ConsentSubmission) {
    return apiClient.post<ConsentResponse>(
      API_ENDPOINTS.OAUTH.CONSENT,
      payload,
    );
  },
};
