import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ColorBestie",
    short_name: "ColorBestie",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFD",
    theme_color: "#eab6c1",
    icons: [
      {
        src: "/icons/blushy-app-icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/icons/blushy-app-icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/icons/blushy-app-icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
