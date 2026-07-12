import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

type TermsSection = {
  title: string;
  paragraphs: readonly string[];
  list?: readonly string[];
  paragraphs_after?: readonly string[];
};

const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    title: "1. Acceptance of Terms",
    paragraphs: [
      `These Terms of Service ("Terms") govern your access to and use of ${SITE.NAME}'s OAuth 2.1 and OpenID Connect identity platform, including our website, APIs, developer dashboard, and authentication services (collectively, the "Service").`,
      "By creating an account, registering an OAuth client, or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service.",
    ],
  },
  {
    title: "2. Account Registration and Eligibility",
    paragraphs: ["To use the Service, you must:"],
    list: [
      "Be at least 18 years old or the age of majority in your jurisdiction.",
      "Provide accurate, complete, and current registration information.",
      "Maintain the security of your account credentials.",
      "Accept responsibility for all activities that occur under your account.",
      "Notify us immediately of any unauthorized use of your account.",
    ],
  },
  {
    title: "3. OAuth Client Registration",
    paragraphs: ["When registering OAuth clients, you agree to:"],
    list: [
      "Provide accurate client metadata, including valid redirect URIs.",
      "Use client credentials securely and not share them publicly.",
      "Comply with OAuth 2.1 and OpenID Connect specifications.",
      "Respect user consent decisions and only request necessary scopes.",
      "Implement proper security measures to protect user data.",
      "Promptly update or revoke compromised client credentials.",
    ],
  },
  {
    title: "4. Acceptable Use Policy",
    paragraphs: ["You agree not to use the Service to:"],
    list: [
      "Violate any applicable laws, regulations, or third-party rights.",
      "Engage in fraudulent, deceptive, or misleading practices.",
      "Attempt to gain unauthorized access to systems or user accounts.",
      "Interfere with or disrupt the Service or servers.",
      "Distribute malware, viruses, or harmful code.",
      "Harvest or collect user information without consent.",
      "Circumvent rate limits, security measures, or access controls.",
      "Impersonate another person or entity.",
    ],
  },
  {
    title: "5. User Data and Privacy",
    paragraphs: [
      "Your use of the Service is also governed by our Privacy Policy. When you use OAuth/OIDC flows, you control what data you share with third-party applications through consent screens.",
      `${SITE.NAME} acts as an identity provider and processes authentication data as described in our Privacy Policy. Third-party applications that receive your data are independently responsible for their own data practices.`,
    ],
  },
  {
    title: "6. Service Availability and Modifications",
    paragraphs: [
      `${SITE.NAME} strives to provide reliable service but does not guarantee uninterrupted or error-free operation. We reserve the right to:`,
    ],
    list: [
      "Modify, suspend, or discontinue any aspect of the Service at any time.",
      "Impose or modify rate limits, quotas, and usage restrictions.",
      "Update these Terms with notice to registered users.",
      "Perform scheduled maintenance that may temporarily affect availability.",
    ],
  },
  {
    title: "7. Intellectual Property",
    paragraphs: [
      `The Service, including its software, APIs, documentation, and branding, is owned by ${SITE.NAME} and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service in accordance with these Terms.`,
      "You retain ownership of any applications or content you create using the Service.",
    ],
  },
  {
    title: "8. Termination",
    paragraphs: [
      "You may terminate your account at any time through the dashboard. We may suspend or terminate your access to the Service if you:",
    ],
    list: [
      "Violate these Terms or our Acceptable Use Policy.",
      "Engage in fraudulent, harmful, or illegal activity.",
      "Fail to respond to security or compliance inquiries.",
      "Create risk or legal exposure for us or other users.",
    ],
    paragraphs_after: [
      "Upon termination, your access to the Service will cease, and we may delete your data in accordance with our retention policies.",
    ],
  },
  {
    title: "9. Disclaimers and Limitation of Liability",
    paragraphs: [
      `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.`,
      `${SITE.NAME} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.`,
      "Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so the above limitations may not apply to you.",
    ],
  },
  {
    title: "10. Indemnification",
    paragraphs: [
      `You agree to indemnify and hold harmless ${SITE.NAME}, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.`,
    ],
  },
  {
    title: "11. Governing Law and Dispute Resolution",
    paragraphs: [
      "These Terms are governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to conflict of law principles.",
      "Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration, except where prohibited by law.",
    ],
  },
  {
    title: "12. Contact and Changes to Terms",
    paragraphs: [
      "We may update these Terms from time to time. Material changes will be communicated to registered users via email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.",
      `For questions about these Terms, contact us at ${SITE.SUPPORT_EMAIL}.`,
    ],
  },
];

export function TermsContent() {
  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-10 space-y-4 text-center md:text-left">
        <p className="text-primary text-xs font-semibold tracking-[4px] uppercase">
          Legal
        </p>
        <h1 className="text-foreground font-serif text-4xl leading-tight font-bold tracking-[2px] md:text-5xl">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed italic">
          Effective date: July 12, 2026
        </p>
        <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-[1.9] md:mx-0">
          These terms establish the rules and guidelines for using {SITE.NAME}
          &apos;s authentication platform and services. Please read them
          carefully.
        </p>
      </div>

      <div className="border-primary/10 bg-card/60 space-y-10 rounded-2xl border p-6 md:p-10">
        {TERMS_SECTIONS.map((section) => (
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
            {"paragraphs_after" in section && section.paragraphs_after ? (
              <>
                {section.paragraphs_after.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-muted-foreground text-sm leading-[1.9]"
                  >
                    {paragraph}
                  </p>
                ))}
              </>
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
