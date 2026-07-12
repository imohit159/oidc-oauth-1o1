import type { Metadata } from "next";
import { PrivacyContent } from "@/features/landing-page/components/privacy";
import { StaticPageShell } from "@/features/landing-page/components/static-page-shell";
import { SITE } from "@/constants/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Zen OIDC",
  description: `Learn how ${SITE.NAME} collects, uses, and protects personal data across OAuth and OpenID Connect services.`,
};

export default function PrivacyPage() {
  return (
    <StaticPageShell>
      <PrivacyContent />
    </StaticPageShell>
  );
}
