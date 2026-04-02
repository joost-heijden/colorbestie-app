export const THEME_TAGS = {
  ColorPalette: [
    "Pastel",
    "Earthy",
    "Warm",
    "Cool",
    "Aqua",
    "Vibrant",
    "Colorful",
    "Rainbow",
    "Pink aesthetic",
    "Muted",
    "Monochrome",
    "Two colors",
    "Three colors",
    "Neon",
    "Dark",
    "Light",
  ],
  Mood: [
    "Cozy",
    "Cute",
    "Girly",
    "Soft",
    "Elegant",
    "Luxury",
    "Playful",
    "Romantic",
    "Girls night",
    "Whimsical",
    "Minimal",
    "Blossom",
    "Bold",
    "Dreamy",
    "Fluffy",
  ],
  StyleInfluence: ["Retro", "Vintage", "Y2K", "90s", "70s", "Grunge", "Modern", "Classic"],
  Lighting: ["Day", "Night", "Golden Hour", "Sunset", "Midnight", "Rainy"],
  Genre: [
    "Kawaii",
    "Cottagecore",
    "Fantasy",
    "Fairytale",
    "Eastern",
    "Underwater world",
    "Spooky",
    "Christmas",
    "Easter",
    "Witchy",
    "Dark Academia",
    "Cyberpunk",
    "Galaxy",
    "Gothic",
    "Horror",
    "Zombie",
    "Snow",
    "Winter",
    "Spring",
    "Summer",
    "Autumn",
    "Flowers",
    "Leopard print",
    "Patterns",
    "Wildwest",
    "Stars",
  ],
  SpecialEffects: ["None", "White liners", "Glitters", "Sparkles", "Glow", "Glowy", "Bubbles"],
  KeepMyDrawing: ["Stay true to my drawing"],
} as const;

export type ThemeCategory = keyof typeof THEME_TAGS;

export type ThemeTagSelection = {
  [K in ThemeCategory]: (typeof THEME_TAGS)[K][number];
};

const LIGHT_GENRES: ThemeTagSelection["Genre"][] = [
  "Kawaii",
  "Cottagecore",
  "Fantasy",
  "Fairytale",
  "Underwater world",
  "Christmas",
  "Easter",
  "Snow",
  "Winter",
  "Spring",
  "Summer",
  "Autumn",
  "Flowers",
  "Patterns",
];
const DARK_GENRES: ThemeTagSelection["Genre"][] = ["Horror", "Spooky", "Zombie", "Gothic", "Dark Academia", "Cyberpunk", "Witchy"];

export const DEFAULT_THEME_TAG_SELECTION: ThemeTagSelection = {
  ColorPalette: "Pastel",
  Mood: "Cozy",
  StyleInfluence: "Modern",
  Lighting: "Day",
  Genre: "Cottagecore",
  SpecialEffects: "None",
  KeepMyDrawing: "Stay true to my drawing",
};

export function getGenreOptions(
  selection: Pick<ThemeTagSelection, "ColorPalette" | "Mood" | "StyleInfluence" | "Lighting">
): ThemeTagSelection["Genre"][] {
  const isSoftMood = ["Cozy", "Cute", "Girly", "Soft", "Romantic", "Whimsical", "Dreamy", "Fluffy"].includes(selection.Mood);
  const isLightPalette = ["Pastel", "Light", "Rainbow", "Colorful", "Aqua"].includes(selection.ColorPalette);
  const isDarkPalette = ["Dark", "Monochrome", "Neon"].includes(selection.ColorPalette);

  const full = [...THEME_TAGS.Genre] as ThemeTagSelection["Genre"][];

  if (selection.ColorPalette === "Aqua") {
    const prioritized: ThemeTagSelection["Genre"][] = ["Underwater world", "Fantasy", "Kawaii"];
    return [...new Set([...prioritized, ...full])] as ThemeTagSelection["Genre"][];
  }

  if (isSoftMood || isLightPalette) {
    const prioritized = [...LIGHT_GENRES] as ThemeTagSelection["Genre"][];
    return [...new Set([...prioritized, ...full])] as ThemeTagSelection["Genre"][];
  }

  if (isDarkPalette || selection.Lighting === "Night" || selection.Lighting === "Midnight") {
    const prioritized = [...DARK_GENRES, "Fantasy"] as ThemeTagSelection["Genre"][];
    return [...new Set([...prioritized, ...full])] as ThemeTagSelection["Genre"][];
  }

  return full;
}

export function toThemePrompt(selection: ThemeTagSelection) {
  const parts: string[] = [selection.ColorPalette, selection.Mood, selection.StyleInfluence, selection.Lighting, selection.Genre];

  if (selection.SpecialEffects !== "None") {
    parts.push(`${selection.SpecialEffects} (special effects)`);
  }

  return parts.join(" · ");
}

export type MultiThemeTagSelection = {
  [K in ThemeCategory]: Array<(typeof THEME_TAGS)[K][number]>;
};

export const DEFAULT_MULTI_THEME_TAG_SELECTION: MultiThemeTagSelection = {
  ColorPalette: [],
  Mood: [],
  StyleInfluence: [],
  Lighting: [],
  Genre: [],
  SpecialEffects: [],
  KeepMyDrawing: [],
};

export function toThemePromptMulti(selection: MultiThemeTagSelection) {
  const pushMany = (items: string[]) => items.filter(Boolean).join(", ");
  const parts: string[] = [
    `Palette: ${pushMany(selection.ColorPalette)}`,
    `Mood: ${pushMany(selection.Mood)}`,
    `Style: ${pushMany(selection.StyleInfluence)}`,
    `Lighting: ${pushMany(selection.Lighting)}`,
    `World: ${pushMany(selection.Genre)}`,
  ];

  const effects = selection.SpecialEffects.filter((e) => e !== "None");
  if (effects.length) {
    parts.push(`Special effects: ${effects.join(", ")}`);
  }

  if (selection.KeepMyDrawing.length) {
    parts.push(`Drawing fidelity: ${selection.KeepMyDrawing.join(", ")}`);
  }

  return parts.join(" · ");
}
