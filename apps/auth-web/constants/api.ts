// constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:    "/api/v1/identity/login",
    REGISTER: "/api/v1/identity/register",
    GET_ME:   "/api/v1/identity/users/me",
    LOGOUT:   "/api/v1/sessions/logout",
    REFRESH:  "/api/v1/sessions/refresh",
  },
  SESSIONS: {
    LIST:    "/api/v1/sessions",
    REVOKE:  "/api/v1/sessions/:id",
  },
  // ... admin, oauth etc.
} as const;
