import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-6 h-20 w-20 overflow-hidden rounded-3xl">
          <Image
            src="/mascot/bubble-mascot.webp"
            alt="ColorBestie mascot"
            width={80}
            height={80}
            className="object-cover"
          />
        </div>

        <h2 className="text-2xl font-black text-[var(--text)] md:text-3xl">
          Ready to start coloring?
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Designed for cozy sessions on your phone or tablet.
        </p>

        <Button asChild size="lg" className="mt-6">
          <Link href="/onboarding">Get Started Free</Link>
        </Button>

        <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text)]">ColorBestie</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-[var(--muted)]">
            <Link href="/tools/palette-generator" className="hover:text-[var(--text)]">
              Palette Generator
            </Link>
            <Link href="/tools/marker-comparison" className="hover:text-[var(--text)]">
              Marker Comparison
            </Link>
            <Link href="/tools/theme-preview" className="hover:text-[var(--text)]">
              Theme Preview
            </Link>
          </div>
          <p className="text-xs text-[var(--muted)]">&copy; {new Date().getFullYear()} ColorBestie</p>
        </div>
      </div>
    </footer>
  );
}

