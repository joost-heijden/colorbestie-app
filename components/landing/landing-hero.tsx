import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative flex h-full flex-col overflow-hidden md:min-h-[70vh] md:h-auto">
      <div className="absolute inset-0">
        <Image src="/mascot/jump-scene.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))] md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-5xl md:flex md:items-end md:justify-between md:gap-12">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-sm font-semibold text-white/90">Cozy coloring bestie</span>
            </div>

            <h1 className="text-5xl font-black leading-[0.95] text-white md:text-6xl lg:text-7xl">
              Your Cozy Coloring Bestie
            </h1>
            <p className="mt-4 text-lg font-medium text-white/75 md:text-xl">
              Upload your sketch, pick a mood, get marker-style inspiration in seconds.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/onboarding">Get Started Free</Link>
              </Button>
              <p className="text-center text-xs text-white/50 sm:text-left">
                Works with Ohuhu, Copic, Prismacolor & more
              </p>
            </div>
            <p className="mt-3 text-center text-xs text-white/65 sm:text-left">
              <Link href="/login?callbackUrl=%2Fapp" className="underline underline-offset-2 hover:text-white">
                Account login
              </Link>
            </p>
          </div>

          <div className="mt-8 hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md md:block">
            <p className="text-xs font-semibold text-white/70">Best on mobile</p>
            <p className="mt-1 text-sm text-white/90">Open on your phone or tablet for the full cozy experience.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
