import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { HowItWorks } from "./components/how-it-works";
import { Security } from "./components/security";
import { About } from "./components/about";
import { DocsCta } from "./components/docs-cta";
import { FinalCta } from "./components/final-cta";
import { Footer } from "./components/footer";
import { LandingPageLayout } from "./components/layout";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <LandingPageLayout>
        <Header />
        <main className="flex flex-col pb-8 md:pb-16">
          <Hero />
          <div className="flex flex-col gap-24 pt-2 md:gap-32">
            <Features />
            <HowItWorks />
            <Security />
            <About />
            <DocsCta />
            <FinalCta />
          </div>
        </main>
      </LandingPageLayout>
      <Footer />
    </div>
  );
}
