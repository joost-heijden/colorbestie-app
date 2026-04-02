import { Download, ImagePlus, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: ImagePlus,
    title: "Upload your sketch",
    desc: "Take a photo or choose from your gallery. PNG or JPG, up to 10MB.",
  },
  {
    icon: Sparkles,
    title: "Choose a mood & palette",
    desc: "Pick from 5 theme categories: palette, mood, style, lighting, and genre.",
  },
  {
    icon: Download,
    title: "Get your marker preview",
    desc: "See your sketch in full marker-style color. Download and start coloring!",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-white px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          How it works
        </p>
        <h2 className="mt-2 text-center text-3xl font-black text-[var(--text)] md:text-4xl">
          Three steps to color bliss
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-soft"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-weak)]">
                  <Icon className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <p className="mt-1 text-xs font-bold text-[var(--accent)]">Step {i + 1}</p>
                <h3 className="mt-3 text-lg font-bold text-[var(--text)]">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
