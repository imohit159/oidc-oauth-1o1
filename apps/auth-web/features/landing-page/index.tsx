import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { Footer } from "./components/footer";
import { LandingPageLayout } from "./components/layout";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <LandingPageLayout>
        <Header />
        <Hero />
      </LandingPageLayout>
      <Footer />
    </div>
  );
}
