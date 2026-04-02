import Link from "next/link";
import { ArrowRight, Palette, GitCompareArrows, Eye } from "lucide-react";

const TOOLS = [
  {
    icon: Palette,
    title: "Palette Generator",
    desc: "Generate harmonious color palettes for your marker coloring sessions.",
    href: "/tools/palette-generator",
  },
  {
    icon: GitCompareArrows,
    title: "Marker Comparison",
    desc: "Compare Ohuhu, Copic, Prismacolor, and more side-by-side.",
    href: "/tools/marker-comparison",
  },
  {
    icon: Eye,
    title: "Theme Preview",
    desc: "Build and preview color themes before you start coloring.",
    href: "/tools/theme-preview",
  },
] as const;

export function ToolsPreview() {
  return (
    <section className="px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Free tools
        </p>
        <h2 className="mt-2 text-center text-3xl font-black text-[var(--text)] md:text-4xl">
          Try our free coloring tools
        </h2>
        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          No account needed. Explore colors, compare markers, and build themes.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col rounded-3xl border border-[var(--border)] bg-white p-6 shadow-soft transition-all hover:border-[var(--accent)]/30 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-weak)]">
                  <Icon className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[var(--text)]">{tool.title}</h3>
                <p className="mt-1 flex-1 text-sm text-[var(--muted)]">{tool.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-transform group-hover:translate-x-1">
                  Try it free <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
