import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       "rgb(var(--color-bg) / <alpha-value>)",
        card:     "rgb(var(--color-card) / <alpha-value>)",
        surface:  "rgb(var(--color-surface) / <alpha-value>)",
        inset:    "rgb(var(--color-inset) / <alpha-value>)",
        line:     "rgb(var(--color-line) / <alpha-value>)",
        text:     "rgb(var(--color-text) / <alpha-value>)",
        muted:    "rgb(var(--color-muted) / <alpha-value>)",
        cyan:     "rgb(var(--color-cyan) / <alpha-value>)",
        violet:   "rgb(var(--color-violet) / <alpha-value>)",
        amber:    "rgb(var(--color-amber) / <alpha-value>)",
        emerald:  "rgb(var(--color-emerald) / <alpha-value>)",
        rose:     "rgb(var(--color-rose) / <alpha-value>)",
        "on-accent": "rgb(var(--color-on-accent) / <alpha-value>)",
        white:    "rgb(var(--color-overlay) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(52,211,153,0.5)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(52,211,153,0)" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(244,63,94,0.4)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(244,63,94,0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseGreen: "pulseGreen 2s ease-in-out infinite",
        pulseRed:   "pulseRed 1.8s ease-in-out infinite",
        shimmer:    "shimmer 1.5s infinite",
        fadeUp:     "fadeUp 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
