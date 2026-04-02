"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TagPillSelector } from "@/components/app/tag-pill-selector";
import {
  DEFAULT_THEME_TAG_SELECTION,
  THEME_TAGS,
  getGenreOptions,
  toThemePrompt,
  type ThemeCategory,
  type ThemeTagSelection,
} from "@/lib/theme-tags";
import { getThemeStyle } from "@/lib/theme-visuals";

export function ThemePreviewClient() {
  const [tagSelection, setTagSelection] = useState<ThemeTagSelection>(DEFAULT_THEME_TAG_SELECTION);

  const genreOptions = useMemo(
    () =>
      getGenreOptions({
        ColorPalette: tagSelection.ColorPalette,
        Mood: tagSelection.Mood,
        StyleInfluence: tagSelection.StyleInfluence,
        Lighting: tagSelection.Lighting,
      }),
    [tagSelection.ColorPalette, tagSelection.Mood, tagSelection.StyleInfluence, tagSelection.Lighting]
  );

  const updateTag = (category: ThemeCategory, value: string) => {
    setTagSelection((prev) => {
      const next = { ...prev, [category]: value };
      if (category !== "Genre" && !getGenreOptions({
        ColorPalette: next.ColorPalette,
        Mood: next.Mood,
        StyleInfluence: next.StyleInfluence,
        Lighting: next.Lighting,
      }).includes(next.Genre)) {
        next.Genre = getGenreOptions({
          ColorPalette: next.ColorPalette,
          Mood: next.Mood,
          StyleInfluence: next.StyleInfluence,
          Lighting: next.Lighting,
        })[0];
      }
      return next as ThemeTagSelection;
    });
  };

  const prompt = toThemePrompt(tagSelection);
  const previewStyle = getThemeStyle(tagSelection.ColorPalette, tagSelection.Mood, tagSelection.Lighting);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[var(--text)] md:text-4xl">Theme Preview</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Build a color theme for your next coloring session. Pick tags and see your mood board come alive.
        </p>
      </div>

      {/* Tag selectors */}
      <div className="mb-6 space-y-3 rounded-2xl border border-[var(--border)] bg-white p-4">
        {(Object.keys(THEME_TAGS) as ThemeCategory[]).map((category) => (
          <TagPillSelector
            key={category}
            label={category === "Genre" ? "Theme world" : category}
            options={[...(category === "Genre" ? genreOptions : THEME_TAGS[category])]}
            value={tagSelection[category]}
            onChange={(value) => updateTag(category, value)}
          />
        ))}
      </div>

      {/* Preview */}
      <div className="mb-6 overflow-hidden rounded-3xl border border-[var(--border)] shadow-soft">
        <div
          className="flex min-h-[240px] flex-col items-center justify-center p-8 md:min-h-[320px]"
          style={previewStyle}
        >
          <p className="text-center text-lg font-bold text-white drop-shadow-md md:text-2xl">
            {tagSelection.Genre}
          </p>
          <p className="mt-2 text-center text-sm text-white/80 drop-shadow-sm">
            {tagSelection.Mood} &middot; {tagSelection.StyleInfluence} &middot; {tagSelection.Lighting}
          </p>
        </div>
      </div>

      {/* Prompt output */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Theme prompt</p>
        <p className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm font-medium text-[var(--text)]">
          {prompt}
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-soft">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--accent)]" />
        <h2 className="mt-3 text-lg font-bold text-[var(--text)]">Use this theme in ColorBestie</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Upload your sketch and apply this theme to get a full marker-style preview.
        </p>
        <Button asChild className="mt-4">
          <Link href="/onboarding">Try ColorBestie Free</Link>
        </Button>
      </div>
    </div>
  );
}
