import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | ColorBestie Tools",
    default: "Free Coloring Tools | ColorBestie",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text)]">ColorBestie</span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
          >
            Back to Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
