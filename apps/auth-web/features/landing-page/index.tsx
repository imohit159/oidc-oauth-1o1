import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { Footer } from "./components/footer"
import { LandingPageLayout } from "./components/layout"

export function LandingPage() {
  return (
    <LandingPageLayout>
      <Header />
      <Hero />
      <Footer />
    </LandingPageLayout>
  )
}
