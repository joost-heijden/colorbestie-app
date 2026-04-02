"use client";

import { useState } from "react";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { generatePalette, PALETTE_TYPES, type PaletteColor } from "@/lib/palette-colors";

export function PaletteGeneratorClient() {
  const [selectedType, setSelectedType] = useState(PALETTE_TYPES[0]);
  const [colors, setColors] = useState<PaletteColor[]>(() => generatePalette(PALETTE_TYPES[0]));

  const handleGenerate = () => {
    setColors(generatePalette(selectedType));
  };

  const handleCopyAll = async () => {
    const text = colors.map((c) => `${c.role}: ${c.hex}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast("Palette copied to clipboard!");
    } catch {
      toast("Could not copy. Try again.");
    }
  };

  const handleCopySingle = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast(`Copied ${hex}`);
    } catch {
      toast("Could not copy.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[var(--text)] md:text-4xl">Palette Generator</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Generate harmonious color palettes for your alcohol marker coloring. Pick a style and get 5 balanced colors.
        </p>
      </div>

      {/* Type selector */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Color type</p>
        <div className="flex flex-wrap gap-2">
          {PALETTE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedType === type
                  ? "border-[var(--accent)] bg-[var(--accent-weak)] text-[var(--text)]"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button onClick={handleGenerate} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate Palette
        </Button>
        <Button variant="ghost" onClick={() => void handleCopyAll()} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy All
        </Button>
      </div>

      {/* Color swatches */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        {colors.map((color) => (
          <button
            key={color.role}
            type="button"
            onClick={() => void handleCopySingle(color.hex)}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-soft transition-transform hover:scale-[1.02]"
          >
            <div
              className="h-20 w-full rounded-xl border border-black/5 sm:h-28"
              style={{ backgroundColor: color.hex }}
            />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">{color.hex}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{color.role}</p>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-soft">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--accent)]" />
        <h2 className="mt-3 text-lg font-bold text-[var(--text)]">Want AI-powered marker previews?</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Upload your sketch and get a full marker-style color preview with ColorBestie.
        </p>
        <Button asChild className="mt-4">
          <Link href="/onboarding">Try ColorBestie Free</Link>
        </Button>
      </div>
    </div>
  );
}
