"use client";

import { useMemo } from "react";

type ThemeChipsProps = {
  themes: string[];
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
};

const THEME_GROUPS: Array<{ label: string; items: string[] }> = [
  {
    label: "Core styles",
    items: ["Smooth blend", "High contrast", "Pastel soft", "Realistic light", "Vintage print"],
  },
  {
    label: "Cute & fantasy",
    items: ["Kawaii", "Fantasy", "Fairytale", "Dreamy", "Fluffy", "Glitter", "Witchy"],
  },
  {
    label: "Color moods",
    items: ["Colorful", "Rainbow", "Two colors", "Three colors", "White liners (special effects)"],
  },
  {
    label: "Seasonal & atmosphere",
    items: ["Spooky", "Christmas", "Easter", "Rainy"],
  },
];

export function ThemeChips({ themes, selectedTheme, onSelectTheme }: ThemeChipsProps) {
  const groupedThemes = useMemo(() => {
    const available = new Set(themes);
    const used = new Set<string>();

    const groups = THEME_GROUPS.map((group) => {
      const items = group.items.filter((item) => available.has(item));
      items.forEach((item) => used.add(item));
      return { ...group, items };
    }).filter((group) => group.items.length > 0);

    const ungrouped = themes.filter((theme) => !used.has(theme));
    if (ungrouped.length > 0) {
      groups.push({ label: "More themes", items: ungrouped });
    }

    return groups;
  }, [themes]);

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_30px_-14px_var(--shadow)] sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-[var(--text)]">Theme</h2>

      <div className="space-y-4">
        {groupedThemes.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((theme) => {
                const isSelected = selectedTheme === theme;
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => onSelectTheme(theme)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "border-[var(--accent)]/40 bg-[var(--accent-weak)] text-[var(--text)]"
                        : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--accent)]/30"
                    }`}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
