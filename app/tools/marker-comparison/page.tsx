import type { Metadata } from "next";

import { MarkerComparisonClient } from "@/components/tools/marker-comparison";

export const metadata: Metadata = {
  title: "Marker Brand Comparison Tool — Ohuhu vs Copic vs Prismacolor",
  description:
    "Compare alcohol marker brands side-by-side. See series, set sizes, and color counts for Ohuhu, Copic, Winsor & Newton, Spectrum Noir, Prismacolor, and Stylefile.",
};

export default function MarkerComparisonPage() {
  return <MarkerComparisonClient />;
}
