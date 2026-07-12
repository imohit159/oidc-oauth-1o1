import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";
import { APP_ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { ContactForm } from "@/features/landing-page/components/contact";
import { StaticPageShell } from "@/features/landing-page/components/static-page-shell";

export const metadata: Metadata = {
  title: "Contact | Zen OIDC",
  description: `Contact the ${SITE.NAME} team for support, security questions, and OIDC integration help.`,
};

export default function ContactPage() {
  return (
    <StaticPageShell>
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <div className="bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5">
            <Mail className="text-primary size-3.5" />
            <span className="text-primary text-xs font-semibold tracking-[3px] uppercase">
              Get in Touch
            </span>
          </div>
          <h1 className="text-foreground mb-4 font-serif text-5xl leading-tight font-bold tracking-tight md:text-6xl">
            Contact Us
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed italic md:mx-0">
            Have questions about OIDC integration, security concerns, or need
            technical support? We&apos;re here to help you secure your
            authentication flow.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          {/* Left Sidebar - Contact Info */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <div className="border-primary/10 bg-card/60 rounded-2xl border p-6">
              <h2 className="mb-6 font-serif text-xl font-semibold tracking-wide">
                Contact Information
              </h2>

              <div className="space-y-5">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <Mail className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-foreground text-sm font-semibold">
                      Email
                    </h3>
                    <a
                      href={`mailto:${SITE.SUPPORT_EMAIL}`}
                      className="text-primary text-sm hover:underline"
                    >
                      {SITE.SUPPORT_EMAIL}
                    </a>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Best for account, security, and compliance questions
                    </p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <Clock className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-foreground text-sm font-semibold">
                      Response Time
                    </h3>
                    <p className="text-foreground text-sm">
                      Within 24-48 hours
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      We typically respond within 1-2 business days
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-foreground text-sm font-semibold">
                      Location
                    </h3>
                    <p className="text-foreground text-sm">Remote-first team</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Available globally across multiple time zones
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="border-primary/10 bg-card/60 rounded-2xl border p-6">
              <h3 className="mb-4 font-serif text-lg font-semibold tracking-wide">
                Quick Links
              </h3>
              <div className="space-y-3">
                <Link
                  href={APP_ROUTES.PRIVACY}
                  className="text-muted-foreground hover:text-primary flex items-center text-sm transition-colors"
                >
                  <span className="mr-2">→</span>
                  Privacy Policy
                </Link>
                <Link
                  href={SITE.GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center text-sm transition-colors"
                >
                  <span className="mr-2">→</span>
                  GitHub Repository
                </Link>
                <Link
                  href={APP_ROUTES.DASHBOARD}
                  className="text-muted-foreground hover:text-primary flex items-center text-sm transition-colors"
                >
                  <span className="mr-2">→</span>
                  Developer Dashboard
                </Link>
              </div>
            </div>

            {/* Support Note */}
            <div className="border-primary/15 bg-primary/5 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs leading-relaxed">
                <span className="text-foreground font-semibold">
                  Security concerns?
                </span>{" "}
                For security vulnerabilities or sensitive matters, please email
                us directly at{" "}
                <a
                  href={`mailto:${SITE.SUPPORT_EMAIL}`}
                  className="text-primary hover:underline"
                >
                  {SITE.SUPPORT_EMAIL}
                </a>{" "}
                with &quot;SECURITY&quot; in the subject line.
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <ContactForm />
        </div>
      </div>
    </StaticPageShell>
  );
}
