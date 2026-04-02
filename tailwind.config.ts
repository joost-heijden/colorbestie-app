import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
      },
      boxShadow: {
        soft: "0 10px 30px -14px var(--shadow)",
        glow: "0 12px 24px -12px var(--accent-strong)",
      },
      borderRadius: {
        xl3: "1.5rem",
      },
      maxWidth: {
        hero: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
