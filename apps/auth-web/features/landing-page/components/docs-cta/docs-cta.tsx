"use client";

import Link from "next/link";
import { LANDING_DOCS, LANDING_SECTION_IDS } from "@/constants/landing";
import { SITE } from "@/constants/site";
import { APP_ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

export function DocsCta() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dashboardHref = isAuthenticated
    ? APP_ROUTES.DASHBOARD
    : APP_ROUTES.LOGIN;

  return (
    <section
      id={LANDING_SECTION_IDS.DOCS}
      aria-labelledby="landing-docs-title"
      className="scroll-mt-24 py-4"
    >
      <Reveal>
        <div className="border-primary/10 bg-primary/[0.03] relative overflow-hidden px-6 py-14 md:px-12 md:py-16">
          <span
            aria-hidden
            className="text-primary/10 pointer-events-none absolute -right-4 -bottom-6 font-serif text-[8rem] leading-none select-none md:text-[11rem]"
          >
            文
          </span>

          <SectionHeading
            eyebrow={LANDING_DOCS.eyebrow}
            title={LANDING_DOCS.title}
            titleId="landing-docs-title"
            description={LANDING_DOCS.description}
            className="mb-8 md:mb-10"
          />

          <div className="relative z-10 flex flex-wrap items-center gap-4">
            <Button
              variant="default"
              size="default"
              nativeButton={false}
              className="rounded-md tracking-wide"
              render={
                <Link
                  href={SITE.GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {LANDING_DOCS.primaryLabel}
            </Button>
            <Button
              variant="outline"
              size="default"
              nativeButton={false}
              className="rounded-md tracking-wide"
              render={<Link href={dashboardHref} />}
            >
              {LANDING_DOCS.secondaryLabel}
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
