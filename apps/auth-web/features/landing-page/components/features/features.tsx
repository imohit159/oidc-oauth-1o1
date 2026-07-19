import { LANDING_FEATURES, LANDING_SECTION_IDS } from "@/constants/landing";
import { Reveal } from "../reveal";
import { SectionHeading } from "../section-heading";

export function Features() {
  return (
    <section
      id={LANDING_SECTION_IDS.FEATURES}
      aria-labelledby="landing-features-title"
      className="scroll-mt-24 py-4"
    >
      <Reveal>
        <SectionHeading
          eyebrow={LANDING_FEATURES.eyebrow}
          title={LANDING_FEATURES.title}
          titleId="landing-features-title"
          description={LANDING_FEATURES.description}
        />
      </Reveal>

      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_FEATURES.items.map((item, index) => (
          <Reveal key={item.number} delayMs={index * 60}>
            <li className="group border-primary/10 border-t pt-6">
              <span className="text-primary/50 mb-4 block font-serif text-2xl tracking-[0.12em] transition-colors duration-300 group-hover:text-primary">
                {item.number}
              </span>
              <h3 className="text-foreground mb-3 font-serif text-xl tracking-[0.03em] md:text-[1.35rem]">
                {item.title}
              </h3>
              <p className="text-[0.95rem] leading-[1.8] text-[#7a6a67]">
                {item.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
