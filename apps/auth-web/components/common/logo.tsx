import * as React from "react";
import Link from "next/link";

interface LogoProps {
  showText?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function Logo({
  showText = true,
  className = "",
  iconOnly = false,
}: LogoProps) {
  const icon = (
    <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-[url('/logo-bg-removebg-preview.png')] bg-contain bg-center bg-no-repeat">
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-background mb-[2px] h-[22px] w-[22px]"
      >
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
    <Link
      href="/"
      className={`group flex items-center gap-3 no-underline ${className}`}
    >
      {icon}
      {showText && (
        <div className="text-primary font-serif text-xl font-bold tracking-[4px] transition-colors">
          Zen
        </div>
      )}
    </Link>
  );
}
