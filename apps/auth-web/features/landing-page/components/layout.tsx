import * as React from "react";

export function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 sm:px-4 md:gap-12 md:px-8">
      {children}
    </div>
  );
}
