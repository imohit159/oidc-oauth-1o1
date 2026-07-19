"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LANDING_CTA, LANDING_SECTION_IDS } from "@/constants/landing";
import { SITE } from "@/constants/site";
import { APP_ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Reveal } from "../reveal";

export function FinalCta() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleEnter = () => {
    router.push(
      isAuthenticated ? APP_ROUTES.DASHBOARD : APP_ROUTES.LOGIN,
    );
  };

  return (
    <section
      id={LANDING_SECTION_IDS.CTA}
      aria-labelledby="landing-cta-title"
      className="scroll-mt-24 py-8 md:py-12"
    >
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <p className="text-primary mb-4 font-sans text-[0.75rem] font-semibold tracking-[0.28em] uppercase opacity-80">
            {LANDING_CTA.eyebrow}
          </p>
          <h2
            id="landing-cta-title"
            className="text-foreground mb-4 font-serif text-3xl leading-tight font-bold tracking-[0.04em] md:text-5xl"
          >
            {LANDING_CTA.title}
          </h2>
          <p className="mb-10 max-w-lg text-base leading-[1.85] text-[#7a6a67] md:text-[1.05rem]">
            {LANDING_CTA.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              className="bg-primary text-primary-foreground hover:bg-accent group h-auto cursor-pointer border-none px-13 py-3.5 font-sans text-base font-semibold tracking-[2px] uppercase shadow-[0_6px_20px_rgba(167,29,49,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(167,29,49,0.30)]"
              onClick={handleEnter}
            >
              {LANDING_CTA.primaryLabel}
              <span className="ml-2.5 text-lg transition-transform duration-200 group-hover:translate-x-1.5">
                →
              </span>
            </Button>
            <Button
              variant="outline"
              size="default"
              nativeButton={false}
              className="h-auto rounded-md px-8 py-3.5 tracking-wide"
              render={
                <Link
                  href={SITE.GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {LANDING_CTA.secondaryLabel}
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
