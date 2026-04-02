const PALETTE_GRADIENTS: Record<string, [string, string, string]> = {
  Pastel:     ["#fce4ec", "#e8eaf6", "#e0f7fa"],
  Earthy:     ["#8d6e63", "#bcaaa4", "#d7ccc8"],
  Warm:       ["#ff8a65", "#ffab91", "#ffccbc"],
  Cool:       ["#80cbc4", "#b2dfdb", "#b3e5fc"],
  Vibrant:    ["#f44336", "#ff9800", "#4caf50"],
  Muted:      ["#b0bec5", "#cfd8dc", "#eceff1"],
  Monochrome: ["#424242", "#9e9e9e", "#e0e0e0"],
  Neon:       ["#e040fb", "#00e676", "#ffea00"],
  Dark:       ["#1a1a2e", "#16213e", "#0f3460"],
  Light:      ["#fafafa", "#f5f5f5", "#eeeeee"],
};

const MOOD_SATURATION: Record<string, number> = {
  Cozy: 0.8,
  Cute: 1.0,
  Soft: 0.6,
  Elegant: 0.7,
  Luxury: 0.9,
  Playful: 1.1,
  Romantic: 0.85,
  Whimsical: 1.0,
  Minimal: 0.5,
  Bold: 1.2,
  Dreamy: 0.65,
};

const LIGHTING_OPACITY: Record<string, number> = {
  Day: 1.0,
  Night: 0.6,
  "Golden Hour": 0.85,
  Sunset: 0.75,
  Midnight: 0.45,
};

export function getThemeGradient(palette: string): string {
  const colors = PALETTE_GRADIENTS[palette] ?? PALETTE_GRADIENTS["Pastel"];
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
}

export function getMoodSaturation(mood: string): number {
  return MOOD_SATURATION[mood] ?? 1.0;
}

export function getLightingOpacity(lighting: string): number {
  return LIGHTING_OPACITY[lighting] ?? 1.0;
}

export function getThemeStyle(palette: string, mood: string, lighting: string): React.CSSProperties {
  return {
    background: getThemeGradient(palette),
    filter: `saturate(${getMoodSaturation(mood)})`,
    opacity: getLightingOpacity(lighting),
  };
}
