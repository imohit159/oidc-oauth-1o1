import * as React from "react";
import Link from "next/link";

interface LogoProps {
  showText?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ showText = true, className = "", iconOnly = false }: LogoProps) {
  const icon = (
    <div className="w-[42px] h-[42px] bg-[url('/logo-bg-removebg-preview.png')] bg-no-repeat bg-center bg-contain flex items-center justify-center shrink-0">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px] fill-background mb-[2px]">
        <path d="M 10 20 Q 50 25 90 20 L 88 28 Q 50 32 12 28 Z" />
        <rect x="18" y="38" width="64" height="6" />
        <path d="M 33 30 L 26 80 L 32 80 L 38 30 Z" />
        <path d="M 67 30 L 74 80 L 68 80 L 62 30 Z" />
        <rect x="47" y="30" width="6" height="8" />
      </svg>
    </div>
  );

  if (iconOnly) {
    return icon;
  }

  return (
    <Link href="/" className={`flex items-center gap-3 no-underline group ${className}`}>
      {icon}
      {showText && (
        <div className="font-serif font-bold text-xl tracking-[4px] text-primary transition-colors">
          Zen
        </div>
      )}
    </Link>
  );
}
