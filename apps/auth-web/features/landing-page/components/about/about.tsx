import { LANDING_ABOUT, LANDING_SECTION_IDS } from "@/constants/landing";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

export function About() {
  return (
    <section
      id={LANDING_SECTION_IDS.ABOUT}
      aria-labelledby="landing-about-title"
      className="scroll-mt-24 py-4"
    >
      <div className="grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-end md:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={LANDING_ABOUT.eyebrow}
            title={LANDING_ABOUT.title}
            titleId="landing-about-title"
            className="mb-8 md:mb-8"
          />
          <div className="space-y-5">
            {LANDING_ABOUT.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-xl text-base leading-[1.9] text-[#7a6a67] md:text-[1.05rem]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <aside className="border-primary/15 relative border-l pl-8 md:pl-10">
            <p className="font-serif text-2xl leading-snug tracking-[0.06em] text-[#6a5a57] italic md:text-3xl">
              {LANDING_ABOUT.aside}
            </p>
            <span
              aria-hidden
              className="text-primary/20 mt-6 block font-serif text-6xl leading-none"
            >
              禅
            </span>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
