import {
  LANDING_HOW_IT_WORKS,
  LANDING_SECTION_IDS,
} from "@/constants/landing";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

export function HowItWorks() {
  return (
    <section
      id={LANDING_SECTION_IDS.HOW_IT_WORKS}
      aria-labelledby="landing-how-title"
      className="scroll-mt-24 py-4"
    >
      <Reveal>
        <SectionHeading
          eyebrow={LANDING_HOW_IT_WORKS.eyebrow}
          title={LANDING_HOW_IT_WORKS.title}
          titleId="landing-how-title"
          description={LANDING_HOW_IT_WORKS.description}
        />
      </Reveal>

      <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
        {LANDING_HOW_IT_WORKS.steps.map((step, index) => (
          <Reveal key={step.number} delayMs={index * 90}>
            <li className="relative flex flex-col">
              {index < LANDING_HOW_IT_WORKS.steps.length - 1 ? (
                <span
                  aria-hidden
                  className="bg-primary/15 absolute top-5 left-[calc(100%+0.5rem)] hidden h-px w-[calc(100%-1rem)] md:block"
                />
              ) : null}
              <span className="text-primary mb-5 font-serif text-4xl tracking-[0.08em] opacity-70">
                {step.number}
              </span>
              <h3 className="text-foreground mb-3 font-serif text-xl tracking-[0.03em]">
                {step.title}
              </h3>
              <p className="text-[0.95rem] leading-[1.8] text-[#7a6a67]">
                {step.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
