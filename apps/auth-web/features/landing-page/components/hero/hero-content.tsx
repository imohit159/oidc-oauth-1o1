import * as React from "react"
import { Button } from "@/components/ui/button"

export function HeroContent() {
  return (
    <div className="flex flex-col items-center z-2">

      {/* Simple · Secure · Traditional */}
      <div className="font-sans font-semibold text-[0.8rem] tracking-[4px] indent-[4px] uppercase text-primary mb-5 opacity-80">
        <span>Simple</span><span className="text-primary font-bold mx-[2px]">·</span>
        <span>Secure</span><span className="text-primary font-bold mx-[2px]">·</span>
        <span>Traditional</span>
      </div>

      {/* The Art of Secure Identity */}
      <h1 className="font-serif font-bold text-[4.2rem] leading-[1.1] tracking-[3px] indent-[3px] text-foreground mb-2 md:text-[3rem] sm:text-[2.2rem]">
        <span className="font-light text-[0.7em] block text-[#6a5a57] tracking-[8px] uppercase mb-[2px] md:tracking-[6px] sm:tracking-[4px]">
          The Art of
        </span>
        <span className="text-primary relative inline-block after:absolute after:left-0 after:bottom-1 after:w-full after:h-2 after:bg-primary/10 after:rounded after:z-[-1]">
          Secure
        </span>{" "}
        <span className="font-normal tracking-[6px] md:tracking-[4px]">
          Identity
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base text-[#7a6a67] font-normal leading-[1.9] tracking-[0.5px] max-w-[580px] mx-auto mt-3 mb-8 italic md:text-[0.95rem] md:max-w-full">
        A sanctuary for digital trust.{" "}
        <span className="text-primary font-medium">From simple logins</span> to complex OIDC flows —{" "}
        <span className="italic text-[#7a6a67] text-[0.95rem] block mt-[2px]">
          every handshake tells a story of security.
        </span>
      </p>

      {/* CTA */}
      <div className="flex justify-center">
        <Button
          className="bg-primary text-primary-foreground font-semibold text-base py-[14px] px-[52px] hover:bg-accent transition-all duration-200 shadow-[0_6px_20px_rgba(167,29,49,0.25)] hover:shadow-[0_8px_28px_rgba(167,29,49,0.30)] hover:-translate-y-0.5 tracking-[2px] uppercase font-sans border-none cursor-pointer h-auto group"
          onClick={() => {
            // Enter Zen action
          }}
        >
          Enter Zen
          <span className="text-lg transition-transform duration-200 group-hover:translate-x-1.5 ml-2.5">
            →
          </span>
        </Button>
      </div>
    </div>
  )
}
