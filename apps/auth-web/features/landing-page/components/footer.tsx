"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 py-6 pb-7 mt-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 w-full sm:flex-col sm:text-center">
        {/* Left Side: copyright info */}
        <div className="flex items-center gap-2 text-[0.78rem] text-[#7a6a67] font-serif tracking-[1px] sm:justify-center">
          <span className="text-[1.1rem] text-primary opacity-80 select-none">⚘</span>
          <span>© 2026 Zen OIDC</span>
          <span className="text-[0.65rem] text-[#9a8a87] tracking-[2px]">— identity reimagined</span>
        </div>

        {/* Right Side: Links */}
        <div className="flex gap-7 sm:justify-center sm:flex-wrap">
          <Link href="#" className="no-underline text-[#4f3f3c] text-[0.82rem] hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="#" className="no-underline text-[#4f3f3c] text-[0.82rem] hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
