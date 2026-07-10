"use client";

import * as React from "react";
import { FadeSun } from "./fade-sun";
import { ToriiOrnament } from "./torii-ornament";
import { StampSeal } from "./stamp-seal";
import { HeroContent } from "./hero-content";
import Image from "next/image";

export function Hero() {
  return (
    <main className="relative flex w-full flex-1 flex-col items-center justify-center text-center">
      {/* Hero Sun (Separate SVG with bottom fade) */}
      <div className="pointer-events-none absolute -top-4 left-1/2 z-10 h-36 w-36 -translate-x-1/2 select-none">
        <FadeSun />
      </div>

      {/* Decorative ornament - Japanese vibe */}
      <div className="pointer-events-none absolute top-30 left-1/2 z-2 flex h-8 w-8 -translate-x-1/2 items-center justify-center opacity-55 select-none">
        <ToriiOrnament />
      </div>

      {/* Watermark Background (Detailed Ryobu Torii Gate Image) */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 w-325 -translate-x-1/2 -translate-y-1/2 opacity-20 select-none sm:w-175 md:w-250">
        <Image
          src="/torigate-removebg-preview.png"
          alt="Zen Torii Gate"
          className="pointer-events-none h-auto max-h-full w-full object-contain"
        />
      </div>

      {/* Japanese Stamp Seal (安全 / 信頼) */}
      <div className="pointer-events-none absolute right-20 bottom-20 z-10 hidden h-14 w-14 opacity-60 select-none md:block">
        <StampSeal />
      </div>

      {/* Hero Content (Tagline, Title, Subtitle, CTA Button) */}
      <HeroContent />

      {/* Background Watercolor Brush Stroke */}
      <Image
        src="/brush_stroke.png"
        alt=""
        className="pointer-events-none absolute right-0 bottom-14 z-0 h-auto w-120 opacity-15 select-none sm:w-52 md:bottom-2 md:w-72"
      />
    </main>
  );
}
