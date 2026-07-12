import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

type PolicySection = {
  title: string;
  paragraphs: readonly string[];
  list?: readonly string[];
};

const POLICY_SECTIONS: readonly PolicySection[] = [
  {
    title: "1. Overview",
    paragraphs: [
      `${SITE.NAME} ("we", "our", or "us") operates an OAuth 2.1 and OpenID Connect identity platform. This Privacy Policy explains what information we collect, how we use it, and the choices you have when you use our website, developer dashboard, and authentication services.`,
      "By creating an account, authorizing an application, or using our platform, you agree to the practices described in this policy.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: [
      "We collect information in three primary contexts: account registration, authentication activity, and developer platform usage.",
    ],
    list: [
      "Account details such as your name, email address, and profile information you choose to provide.",
      "Authentication records including login timestamps, session identifiers, IP addresses, and device metadata used for security monitoring.",
      "OAuth and OIDC authorization data such as client IDs, granted scopes, consent decisions, redirect URIs, and token metadata required to operate federated sign-in.",
      "Developer platform data including registered OAuth clients, application names, and configuration settings you manage in the dashboard.",
      "Support communications when you contact us directly.",
    ],
  },
  {
    title: "3. How We Use Information",
    paragraphs: [
      "We use collected information to operate, secure, and improve the identity platform. Specifically, we use data to:",
    ],
    list: [
      "Authenticate users and maintain secure sessions.",
      "Issue, validate, and revoke OAuth 2.1 / OpenID Connect tokens.",
      "Display consent screens and honor authorization decisions.",
      "Detect abuse, prevent fraud, and investigate security incidents.",
      "Provide customer support and respond to legal or compliance requests.",
      "Improve reliability, performance, and developer experience.",
    ],
  },
  {
    title: "4. OAuth, OIDC, and Third-Party Applications",
    paragraphs: [
      "When you authorize a third-party application through Zen OIDC, we share only the information required by the scopes you approve. Third-party applications are independently responsible for their own privacy practices once they receive your data.",
      "Developers registering OAuth clients must provide accurate redirect URIs and are responsible for handling end-user data in compliance with applicable laws.",
    ],
  },
  {
    title: "5. Cookies and Session Storage",
    paragraphs: [
      "We use cookies and similar technologies to maintain authenticated sessions, protect against cross-site request forgery, and remember essential security preferences.",
      "Session cookies are typically short-lived. You can revoke active sessions from your account dashboard or by signing out.",
    ],
  },
  {
    title: "6. Data Retention",
    paragraphs: [
      "We retain account and authorization records for as long as your account remains active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce agreements.",
      "Security logs and audit events may be retained for a longer period to support incident response and compliance requirements.",
    ],
  },
  {
    title: "7. Your Rights and Choices",
    paragraphs: [
      "Depending on your jurisdiction, you may have the right to access, correct, delete, or export personal data we hold about you. You may also withdraw OAuth consents for connected applications at any time from the Authorized Apps section of your dashboard.",
      "To exercise privacy rights, contact us using the details below. We may need to verify your identity before fulfilling a request.",
    ],
  },
  {
    title: "8. Security",
    paragraphs: [
      "We apply industry-standard safeguards including encrypted transport (TLS), hashed credentials, scoped access tokens, refresh token rotation, and session revocation controls.",
      "No method of transmission or storage is completely secure. If you believe your account has been compromised, revoke sessions immediately and contact us.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. Material changes will be reflected on this page with an updated effective date. Continued use of the platform after changes become effective constitutes acceptance of the revised policy.",
    ],
  },
  {
    title: "10. Contact Us",
    paragraphs: [
      `If you have questions about this Privacy Policy or our data practices, contact us at ${SITE.SUPPORT_EMAIL} or through our contact page.`,
    ],
  },
];

export function PrivacyContent() {
  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-10 space-y-4 text-center md:text-left">
        <p className="text-primary text-xs font-semibold tracking-[4px] uppercase">
          Legal
        </p>
        <h1 className="text-foreground font-serif text-4xl leading-tight font-bold tracking-[2px] md:text-5xl">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed italic">
          Effective date: July 12, 2026
        </p>
        <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-[1.9] md:mx-0">
          Your trust is the foundation of every identity handshake. This policy
          describes how {SITE.NAME} collects, uses, and protects personal
          information across our authentication platform.
        </p>
      </div>

      <div className="border-primary/10 bg-card/60 space-y-10 rounded-2xl border p-6 md:p-10">
        {POLICY_SECTIONS.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-foreground font-serif text-xl font-semibold tracking-wide">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-muted-foreground text-sm leading-[1.9]"
              >
                {paragraph}
              </p>
            ))}
            {section.list ? (
              <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-[1.9]">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <p className="text-muted-foreground mt-8 text-center text-sm md:text-left">
        Questions?{" "}
        <Link
          href={APP_ROUTES.CONTACT}
          className="text-primary hover:underline"
        >
          Contact our team
        </Link>
        .
      </p>
    </article>
  );
}
