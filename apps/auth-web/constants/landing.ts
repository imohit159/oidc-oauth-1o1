import { SITE } from "./site";

export const LANDING_SECTION_IDS = Object.freeze({
  FEATURES: "features",
  HOW_IT_WORKS: "how-it-works",
  SECURITY: "security",
  ABOUT: "about",
  DOCS: "docs",
  CTA: "get-started",
});

export const LANDING_NAV = Object.freeze([
  { label: "Features", href: `#${LANDING_SECTION_IDS.FEATURES}` },
  { label: "Docs", href: `#${LANDING_SECTION_IDS.DOCS}` },
  { label: "About", href: `#${LANDING_SECTION_IDS.ABOUT}` },
] as const);

export const LANDING_FEATURES = Object.freeze({
  eyebrow: "Capabilities",
  title: "Protocol craft, not bolt-ons",
  description:
    "Every surface maps to a real OAuth 2.1 or OpenID Connect concern — so your integrations stay honest under load.",
  items: [
    {
      number: "01",
      title: "OAuth 2.1 with PKCE",
      description:
        "Authorization Code flows hardened by default. Public clients never touch a shared secret.",
    },
    {
      number: "02",
      title: "OpenID Connect 1.0",
      description:
        "ID tokens, userinfo, and standard claims layered cleanly on top of your authorization server.",
    },
    {
      number: "03",
      title: "Client registry",
      description:
        "Register apps, rotate credentials, and scope access without hand-editing opaque config dumps.",
    },
    {
      number: "04",
      title: "Consent & sessions",
      description:
        "Explicit user consent, revocable grants, and session hygiene you can actually audit.",
    },
    {
      number: "05",
      title: "Discovery & JWKS",
      description:
        "Well-known metadata and signing keys published the way libraries already expect.",
    },
    {
      number: "06",
      title: "Admin visibility",
      description:
        "Clients, consents, and audit trails in one place — less SSH, more signal.",
    },
  ],
});

export const LANDING_HOW_IT_WORKS = Object.freeze({
  eyebrow: "Flow",
  title: "Three steps to a handshake",
  description:
    "From client registration to token exchange — the path your apps already speak.",
  steps: [
    {
      number: "01",
      title: "Register a client",
      description:
        "Create an OAuth client, set redirect URIs, and choose the grant shape that fits the app.",
    },
    {
      number: "02",
      title: "Authorize with consent",
      description:
        "Users sign in, review scopes, and grant access. No silent over-permissioning.",
    },
    {
      number: "03",
      title: "Exchange for tokens",
      description:
        "Trade the authorization code for access and ID tokens. Refresh when the session needs to live on.",
    },
  ],
});

export const LANDING_SECURITY = Object.freeze({
  eyebrow: "Trust",
  title: "Security as ritual, not theater",
  description:
    "Standards first. Explicit consent. Sessions you can revoke. The seal on the hero is not decoration — it is the contract.",
  pillars: [
    {
      kanji: "規",
      label: "Standards",
      title: "Spec-aligned identity",
      description:
        "OAuth 2.1 and OIDC 1.0 as the source of truth — not a custom dialect that breaks libraries.",
    },
    {
      kanji: "諾",
      label: "Consent",
      title: "Explicit grants",
      description:
        "Users see what they authorize. Apps get only the scopes they earn. Revocation is first-class.",
    },
    {
      kanji: "守",
      label: "Hygiene",
      title: "Session discipline",
      description:
        "Active sessions, audit trails, and admin controls so trust does not rot quietly in the background.",
    },
  ],
});

export const LANDING_ABOUT = Object.freeze({
  eyebrow: "About",
  title: "A sanctuary for digital trust",
  paragraphs: [
    `${SITE.NAME} is an identity provider built for teams who treat authentication as infrastructure — not a weekend plugin.`,
    "From simple logins to full OpenID Connect handshakes, every flow is meant to be readable, operable, and hard to misuse. Tradition here means discipline: clear protocols, calm UX, and no accidental complexity.",
  ],
  aside: SITE.TAGLINE,
});

export const LANDING_DOCS = Object.freeze({
  eyebrow: "Docs",
  title: "Read the source of truth",
  description:
    "Protocols reward precision. Start with the repository, discovery metadata, and the client registration path in the dashboard.",
  primaryLabel: "View on GitHub",
  secondaryLabel: "Open dashboard",
});

export const LANDING_CTA = Object.freeze({
  eyebrow: "Begin",
  title: "Enter the sanctuary",
  description:
    "Stand up clients, run consent, and ship identity the way the specs intended.",
  primaryLabel: "Get Started",
  secondaryLabel: "Star on GitHub",
});
