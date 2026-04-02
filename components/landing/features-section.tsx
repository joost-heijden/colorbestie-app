import Image from "next/image";
import { BookOpen, Palette, Sparkles, Sun } from "lucide-react";

const FEATURES = [
  {
    icon: Palette,
    title: "Made for Alcohol Markers",
    desc: "Palettes optimized for Ohuhu, Copic, Prismacolor, Winsor & Newton, Spectrum Noir, and Stylefile.",
  },
  {
    icon: Sparkles,
    title: "5 Theme Worlds",
    desc: "Customize your vibe with color palette, mood, style influence, lighting, and genre tags.",
  },
  {
    icon: BookOpen,
    title: "Learn as You Color",
    desc: "25 tips across 5 sections, daily streaks, XP system, and milestone badges to level up your skills.",
  },
  {
    icon: Sun,
    title: "Cozy & Joyful",
    desc: "Designed for relaxed coloring sessions. No pressure, just creative flow and marker inspiration.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Features</p>
            <h2 className="mt-2 text-3xl font-black text-[var(--text)] md:text-4xl">
              Everything you need for cozy coloring
            </h2>

            <div className="mt-8 space-y-6">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-weak)]">
                      <Icon className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text)]">{f.title}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-3xl md:block">
            <Image
              src="/mascot/wave-scene.jpg"
              alt="ColorBestie mascot waving"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
