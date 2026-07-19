import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { LandingPageLayout } from "./layout";

export function StaticPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <LandingPageLayout>
        <Header />
        <main className="pt-8 pb-16">{children}</main>
      </LandingPageLayout>
      <Footer />
    </div>
  );
}
