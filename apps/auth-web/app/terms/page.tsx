import type { Metadata } from "next";
import { TermsContent } from "@/features/landing-page/components/terms";
import { StaticPageShell } from "@/features/landing-page/components/static-page-shell";
import { SITE } from "@/constants/site";

export const metadata: Metadata = {
  title: "Terms of Service | Zen OIDC",
  description: `Review the terms and conditions for using ${SITE.NAME}'s OAuth 2.1 and OpenID Connect identity platform.`,
};

export default function TermsPage() {
  return (
    <StaticPageShell>
      <TermsContent />
    </StaticPageShell>
  );
}
