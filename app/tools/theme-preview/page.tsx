import type { Metadata } from "next";

import { ThemePreviewClient } from "@/components/tools/theme-preview";

export const metadata: Metadata = {
  title: "Theme Preview Builder for Alcohol Marker Coloring",
  description:
    "Build and preview color themes for your coloring pages. Choose palettes, moods, styles, and lighting to see your theme come alive.",
};

export default function ThemePreviewPage() {
  return <ThemePreviewClient />;
}
