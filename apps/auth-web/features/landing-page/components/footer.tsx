"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 py-6 pb-7 mt-auto">
      <div className="flex flex-wrap justify-center sm:justify-between items-center gap-4 w-full text-center sm:text-left sm:flex-nowrap">
        {/* Left Side: copyright info */}
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs text-muted-foreground font-serif tracking-wider">
          <span className="text-lg text-primary opacity-80 select-none">⚘</span>
          <span>© 2026 Zen OIDC</span>
          <span className="text-xs opacity-70 tracking-widest">— identity reimagined</span>
        </div>

        {/* Right Side: Links */}
        <div className="flex gap-7 justify-center">
          <Link href="#" className="no-underline text-sm text-foreground/80 hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="#" className="no-underline text-sm text-foreground/80 hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
