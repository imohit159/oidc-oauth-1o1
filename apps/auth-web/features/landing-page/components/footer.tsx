"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-primary/10 mt-auto w-full border-t px-6 py-6 sm:px-4 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-4 text-center sm:flex-nowrap sm:justify-between sm:text-left">
        {/* Left Side: copyright info */}
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 font-serif text-xs tracking-wider sm:justify-start">
          <span className="text-primary text-lg opacity-80 select-none">⚘</span>
          <span>© 2026 Zen OIDC</span>
          <span className="text-xs tracking-widest opacity-70">
            — identity reimagined
          </span>
        </div>

        {/* Right Side: Links */}
        <div className="flex justify-center gap-7">
          <Link
            href="#"
            className="text-foreground/80 hover:text-primary text-sm no-underline transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-foreground/80 hover:text-primary text-sm no-underline transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
