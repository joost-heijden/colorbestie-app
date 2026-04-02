"use client";

import { useRouter } from "next/navigation";

import { PricingCard } from "@/components/pricing/pricing-card";

export function LandingPricing() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/onboarding");
  };

  return (
    <section className="bg-white px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Pricing
        </p>
        <h2 className="mt-2 text-center text-3xl font-black text-[var(--text)] md:text-4xl">
          Start for free, upgrade when ready
        </h2>
        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          Try ColorBestie free. Upgrade for unlimited previews and premium features.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            plan="monthly"
            name="Monthly"
            price="$4.99"
            period="/mo"
            lang="en"
            onContinue={handleContinue}
          />
          <PricingCard
            plan="yearly"
            name="Yearly"
            price="$29.99"
            period="/yr"
            badge="Most Popular"
            highlight
            lang="en"
            onContinue={handleContinue}
          />
          <PricingCard
            plan="lifetime"
            name="Lifetime"
            price="$49.99"
            badge="Best Value"
            lang="en"
            onContinue={handleContinue}
          />
        </div>
      </div>
    </section>
  );
}
