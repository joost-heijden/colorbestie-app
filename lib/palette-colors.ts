type PaletteType = "Pastel" | "Earthy" | "Warm" | "Cool" | "Vibrant" | "Muted" | "Monochrome" | "Neon" | "Dark" | "Light";

type PaletteRole = "Highlight" | "Midtone" | "Shadow" | "Accent 1" | "Accent 2";

export type PaletteColor = {
  hex: string;
  role: PaletteRole;
};

type HslRange = {
  hueRange: [number, number];
  satRange: [number, number];
  lightRange: [number, number];
};

const PALETTE_RANGES: Record<PaletteType, HslRange> = {
  Pastel:     { hueRange: [0, 360],   satRange: [30, 55],  lightRange: [78, 92] },
  Earthy:     { hueRange: [15, 55],   satRange: [25, 55],  lightRange: [30, 70] },
  Warm:       { hueRange: [0, 50],    satRange: [50, 80],  lightRange: [45, 80] },
  Cool:       { hueRange: [180, 270], satRange: [35, 65],  lightRange: [45, 80] },
  Vibrant:    { hueRange: [0, 360],   satRange: [70, 100], lightRange: [45, 65] },
  Muted:      { hueRange: [0, 360],   satRange: [10, 30],  lightRange: [50, 75] },
  Monochrome: { hueRange: [0, 0],     satRange: [0, 5],    lightRange: [15, 90] },
  Neon:       { hueRange: [0, 360],   satRange: [90, 100], lightRange: [50, 65] },
  Dark:       { hueRange: [0, 360],   satRange: [30, 60],  lightRange: [10, 40] },
  Light:      { hueRange: [0, 360],   satRange: [20, 50],  lightRange: [85, 96] },
};

const ROLES: PaletteRole[] = ["Highlight", "Midtone", "Shadow", "Accent 1", "Accent 2"];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generatePalette(type: PaletteType): PaletteColor[] {
  const range = PALETTE_RANGES[type];
  const baseHue = rand(range.hueRange[0], range.hueRange[1]);

  const lightSteps = [
    rand(Math.max(range.lightRange[0], 75), range.lightRange[1]),
    rand(
      Math.floor((range.lightRange[0] + range.lightRange[1]) / 2),
      Math.ceil((range.lightRange[0] + range.lightRange[1]) / 2) + 10
    ),
    rand(range.lightRange[0], Math.min(range.lightRange[1], 40)),
    rand(range.lightRange[0], range.lightRange[1]),
    rand(range.lightRange[0], range.lightRange[1]),
  ];

  const colors: PaletteColor[] = ROLES.map((role, i) => {
    let hue: number;
    if (type === "Monochrome") {
      hue = 0;
    } else if (i < 3) {
      hue = (baseHue + rand(-15, 15) + 360) % 360;
    } else {
      hue = (baseHue + rand(30, 180) + 360) % 360;
    }

    const sat = rand(range.satRange[0], range.satRange[1]);
    const light = lightSteps[i];

    return {
      hex: hslToHex(hue, sat, light),
      role,
    };
  });

  return colors;
}

export const PALETTE_TYPES: PaletteType[] = [
  "Pastel", "Earthy", "Warm", "Cool", "Vibrant",
  "Muted", "Monochrome", "Neon", "Dark", "Light",
];
