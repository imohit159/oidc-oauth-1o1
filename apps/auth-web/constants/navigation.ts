import { config } from "@/lib/config";

const API_URL = config.API_URL;

export const SIDEBAR_NAV = [
  {
    title: "DEVELOPER",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
      },
      {
        title: "Clients",
        url: "/dashboard/clients",
      },
      {
        title: "Authorized Apps",
        url: "/dashboard/authorized-apps",
      },
    ],
  },
  {
    title: "ADMINISTRATOR",
    isAdmin: true,
    items: [
      {
        title: "Audit Logs",
        url: "/dashboard/admin/audit",
      },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      {
        title: "OIDC Setup Guide",
        url: "#",
      },
      {
        title: "OpenID Configuration",
        url: `${API_URL}/.well-known/openid-configuration`,
      },
      {
        title: "API Reference",
        url: "#",
      },
    ],
  },
];
