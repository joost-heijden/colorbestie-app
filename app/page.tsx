import { redirect } from "next/navigation";

import { NativeRedirect } from "@/components/landing/native-redirect";
import { getCurrentUser } from "@/lib/current-user";
import { LandingHero } from "@/components/landing/landing-hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { MarkerBrands } from "@/components/landing/marker-brands";
import { ToolsPreview } from "@/components/landing/tools-preview";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  if (currentUser?.id) {
    redirect("/app");
  }

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: `html, body { background: #000 !important; } @media (min-width: 768px) { html, body { background: var(--bg) !important; } }` }} />
    <main className="fixed inset-0 overflow-hidden md:relative md:h-auto md:overflow-visible">
      {/* Redirect native app users to onboarding instead of showing landing page */}
      <NativeRedirect />
      <LandingHero />

      {/* Mobile: keep homepage as a single non-scroll start screen */}
      <div className="hidden md:block">
        <HowItWorks />
        <FeaturesSection />
        <MarkerBrands />
        <ToolsPreview />
        <LandingPricing />
        <LandingFooter />
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ColorBestie",
            applicationCategory: "DesignApplication",
            operatingSystem: "Web",
            description:
              "AI-powered alcohol marker color inspiration for cozy coloring sessions. Upload your sketch, choose a mood, and get marker-style previews in seconds.",
            offers: {
              "@type": "AggregateOffer",
              lowPrice: "0",
              highPrice: "49.99",
              priceCurrency: "USD",
            },
            featureList: [
              "AI marker preview generation",
              "Ohuhu, Copic, Prismacolor support",
              "5 theme categories",
              "25 coloring tips with XP system",
              "Daily streaks and milestone badges",
              "Gallery with download support",
            ],
          }),
        }}
      />
    </main>
    </>
  );
}
