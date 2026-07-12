const API_URL =
  typeof window !== "undefined"
    ? (window as any).env?.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
