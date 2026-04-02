import type { Metadata } from "next";

import { PaletteGeneratorClient } from "@/components/tools/palette-generator";

export const metadata: Metadata = {
  title: "Free Alcohol Marker Palette Generator",
  description:
    "Generate color palettes matched to your marker set. Works with Ohuhu, Copic, Prismacolor, and more alcohol markers.",
};

export default function PaletteGeneratorPage() {
  return <PaletteGeneratorClient />;
}
