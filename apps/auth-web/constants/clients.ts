// ─── Client Type Options ──────────────────────────────────────────────────────

export const CLIENT_TYPES = [
  {
    value: "PUBLIC" as const,
    label: "Public",
    description: "SPA & Mobile",
    defaultGrants: ["authorization_code"] as string[],
  },
  {
    value: "CONFIDENTIAL" as const,
    label: "Confidential",
    description: "Server-side applications",
    defaultGrants: ["authorization_code", "refresh_token"] as string[],
  },
  {
    value: "MACHINE" as const,
    label: "Machine",
    description: "Machine-to-machine",
    defaultGrants: ["client_credentials"] as string[],
  },
] as const;

export type ClientTypeValue = (typeof CLIENT_TYPES)[number]["value"];

// ─── Grant Type Options ───────────────────────────────────────────────────────

export const GRANT_TYPES = [
  {
    value: "authorization_code",
    label: "Authorization Code",
    description: "Standard flow for web apps (PKCE recommended for Public).",
  },
  {
    value: "refresh_token",
    label: "Refresh Token",
    description: "Offline tokens for persistent user sessions.",
  },
  {
    value: "client_credentials",
    label: "Client Credentials",
    description: "Server-to-server machine integrations.",
  },
] as const;

export type GrantTypeValue = (typeof GRANT_TYPES)[number]["value"];

// ─── Grant Types by Client Type ───────────────────────────────────────────────

export const GRANT_TYPES_BY_CLIENT: Record<
  ClientTypeValue,
  { value: string; label: string; description: string }[]
> = {
  PUBLIC: [
    {
      value: "authorization_code",
      label: "Authorization Code",
      description: "PKCE recommended for public clients.",
    },
    {
      value: "refresh_token",
      label: "Refresh Token",
      description: "Offline access for persistent sessions.",
    },
  ],
  CONFIDENTIAL: [
    {
      value: "authorization_code",
      label: "Authorization Code",
      description: "Standard web app flow.",
    },
    {
      value: "refresh_token",
      label: "Refresh Token",
      description: "Offline access for persistent sessions.",
    },
  ],
  MACHINE: [
    {
      value: "client_credentials",
      label: "Client Credentials",
      description: "Server-to-server integrations.",
    },
  ],
};
