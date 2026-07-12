// constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/identity/login",
    REGISTER: "/api/v1/identity/register",
    GET_ME: "/api/v1/identity/users/me",
    LOGOUT: "/api/v1/sessions/logout",
    REFRESH: "/api/v1/sessions/refresh",
  },
  SESSIONS: {
    LIST: "/api/v1/sessions",
    REVOKE: "/api/v1/sessions/:id",
  },
  CLIENTS: {
    LIST: "/api/v1/clients",
    CREATE: "/api/v1/clients",
    DETAIL: "/api/v1/clients/:clientId",
  },
  OAUTH: {
    AUTHORIZE: "/api/v1/oauth/authorize",
    CONSENT: "/api/v1/oauth/consent",
    CONSENTS: "/api/v1/oauth/consents",
    REVOKE_CONSENT: "/api/v1/oauth/consents/:consentId",
    TOKEN: "/api/v1/oauth/token",
    USERINFO: "/api/v1/oauth/userinfo",
  },
} as const;
