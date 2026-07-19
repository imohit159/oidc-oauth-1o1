import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  titleId?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-2xl md:mb-14",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="text-primary mb-4 font-sans text-[0.75rem] font-semibold tracking-[0.28em] uppercase opacity-80">
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className="text-foreground font-serif text-3xl leading-tight font-bold tracking-[0.04em] md:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-[#7a6a67] md:text-[1.05rem] md:leading-[1.85]",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
