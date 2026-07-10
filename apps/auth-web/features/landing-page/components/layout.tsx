import * as React from "react"

export function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-8 sm:px-4 flex flex-col flex-1 relative gap-16 md:gap-12">
      {children}
    </div>
  )
}
