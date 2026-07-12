import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";

export function HeroContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleEnter = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="z-2 flex flex-col items-center">
      {/* Simple · Secure · Traditional */}
      <div className="text-primary mb-5 indent-1 font-sans text-[0.8rem] font-semibold tracking-[4px] uppercase opacity-80">
        <span>Simple</span>
        <span className="text-primary mx-0.5 font-bold">·</span>
        <span>Secure</span>
        <span className="text-primary mx-0.5 font-bold">·</span>
        <span>Traditional</span>
      </div>

      {/* The Art of Secure Identity */}
      <h1 className="text-foreground mb-2 indent-0.75 font-serif text-[4.2rem] leading-[1.1] font-bold tracking-[3px] sm:text-[2.2rem] md:text-[3rem]">
        <span className="mb-0.5 block text-[0.7em] font-light tracking-[8px] text-[#6a5a57] uppercase sm:tracking-[4px] md:tracking-[6px]">
          The Art of
        </span>
        <span className="text-primary after:bg-primary/10 relative inline-block after:absolute after:bottom-1 after:left-0 after:z-[-1] after:h-2 after:w-full after:rounded">
          Secure
        </span>{" "}
        <span className="font-normal tracking-[6px] md:tracking-[4px]">
          Identity
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mt-3 mb-8 max-w-145 text-base leading-[1.9] font-normal tracking-[0.5px] text-[#7a6a67] italic md:max-w-full md:text-[0.95rem]">
        A sanctuary for digital trust.{" "}
        <span className="text-primary font-medium">From simple logins</span> to
        complex OIDC flows —{" "}
        <span className="mt-0.5 block text-[0.95rem] text-[#7a6a67] italic">
          every handshake tells a story of security.
        </span>
      </p>

      {/* CTA */}
      <div className="flex justify-center">
        <Button
          className="bg-primary text-primary-foreground hover:bg-accent group h-auto cursor-pointer border-none px-13 py-3.5 font-sans text-base font-semibold tracking-[2px] uppercase shadow-[0_6px_20px_rgba(167,29,49,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(167,29,49,0.30)]"
          onClick={handleEnter}
        >
          Get Started
          <span className="ml-2.5 text-lg transition-transform duration-200 group-hover:translate-x-1.5">
            →
          </span>
        </Button>
      </div>
    </div>
  );
}
