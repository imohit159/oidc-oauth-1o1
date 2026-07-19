import { LANDING_SECURITY, LANDING_SECTION_IDS } from "@/constants/landing";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

export function Security() {
  return (
    <section
      id={LANDING_SECTION_IDS.SECURITY}
      aria-labelledby="landing-security-title"
      className="scroll-mt-24 py-4"
    >
      <Reveal>
        <SectionHeading
          eyebrow={LANDING_SECURITY.eyebrow}
          title={LANDING_SECURITY.title}
          titleId="landing-security-title"
          description={LANDING_SECURITY.description}
        />
      </Reveal>

      <ul className="grid gap-12 md:grid-cols-3 md:gap-10">
        {LANDING_SECURITY.pillars.map((pillar, index) => (
          <Reveal key={pillar.label} delayMs={index * 100}>
            <li className="flex flex-col">
              <span
                aria-hidden
                className="text-primary/25 mb-4 font-serif text-5xl leading-none tracking-[0.2em]"
              >
                {pillar.kanji}
              </span>
              <p className="text-primary mb-3 font-sans text-[0.7rem] font-semibold tracking-[0.28em] uppercase opacity-80">
                {pillar.label}
              </p>
              <h3 className="text-foreground mb-3 font-serif text-xl tracking-[0.03em]">
                {pillar.title}
              </h3>
              <p className="text-[0.95rem] leading-[1.8] text-[#7a6a67]">
                {pillar.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
