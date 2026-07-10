"use client"

import * as React from "react"
import { FadeSun } from "./fade-sun"
import { ToriiOrnament } from "./torii-ornament"
import { StampSeal } from "./stamp-seal"
import { HeroContent } from "./hero-content"

export function Hero() {
  return (
    <main className="relative text-center flex flex-col items-center w-full flex-1 justify-center">
      {/* Hero Sun (Separate SVG with bottom fade) */}
      <div className="absolute left-1/2 -top-14 -translate-x-1/2 w-36 h-36 pointer-events-none z-10 select-none">
        <FadeSun />
      </div>

      {/* Decorative ornament - Japanese vibe */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none z-2 select-none opacity-55 flex justify-center items-center">
        <ToriiOrnament />
      </div>

      {/* Watermark Background (Detailed Ryobu Torii Gate Image) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-325 md:w-250 sm:w-175 opacity-20 pointer-events-none -z-10 select-none">
        <img
          src="/torigate-removebg-preview.png"
          alt="Zen Torii Gate"
          className="w-full h-auto max-h-full object-contain pointer-events-none"
        />
      </div>

      {/* Japanese Stamp Seal (安全 / 信頼) */}
      <div className="absolute right-20 bottom-8 w-14 h-14 opacity-60 pointer-events-none select-none z-10 hidden md:block">
        <StampSeal />
      </div>

      {/* Hero Content (Tagline, Title, Subtitle, CTA Button) */}
      <HeroContent />

      {/* Background Watercolor Brush Stroke */}
      <img
        src="/brush_stroke.png"
        className="absolute right-0 bottom-14 w-120 h-auto opacity-15 pointer-events-none z-0 select-none md:w-72 md:-bottom-10 sm:w-52"
        alt=""
      />
    </main>
  )
}
