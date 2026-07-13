import { type OidcClient } from "@/services/client.service";

// ─── Client type badge config ───────────────────────────────────────────────

export const CLIENT_TYPE_BADGE: Record<
  OidcClient["clientType"],
  { label: string; dot: string; className: string }
> = {
  CONFIDENTIAL: {
    label: "Confidential",
    dot: "bg-purple-500",
    className:
      "gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/10",
  },
  PUBLIC: {
    label: "Public",
    dot: "bg-green-500",
    className:
      "gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10",
  },
  MACHINE: {
    label: "Machine",
    dot: "bg-amber-500",
    className:
      "gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10",
  },
};

// ─── Grant type badge config ─────────────────────────────────────────────────

export const GRANT_TYPE_BADGE: Record<
  string,
  { label: string; variant: "secondary" | "outline"; className: string }
> = {
  authorization_code: {
    label: "Auth Code",
    variant: "secondary",
    className:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-none",
  },
  refresh_token: {
    label: "Refresh",
    variant: "secondary",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-none",
  },
  client_credentials: {
    label: "Credentials",
    variant: "secondary",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-none",
  },
};
