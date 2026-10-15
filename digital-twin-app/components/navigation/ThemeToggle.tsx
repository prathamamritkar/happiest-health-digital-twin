"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const STORAGE_KEY = "dt-theme";

function getCurrentTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const ds = document.documentElement.dataset.theme as Theme | undefined;
  if (ds === "dark" || ds === "light") return ds;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getCurrentTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const next = media.matches ? "dark" : "light";
        document.documentElement.dataset.theme = next;
        setTheme(next);
      }
    };
    const onCustom = () => setTheme(getCurrentTheme());
    media.addEventListener("change", onMedia);
    window.addEventListener("dt-theme-change", onCustom);
    return () => {
      media.removeEventListener("change", onMedia);
      window.removeEventListener("dt-theme-change", onCustom);
    };
  }, []);

  function choose(next: Theme) {
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event("dt-theme-change"));
    setTheme(next);
  }

  const t = mounted ? theme : "dark";

  return (
    <div
      suppressHydrationWarning
      className={`flex items-center rounded-xl border border-line bg-surface p-1 shadow-xs ${compact ? "inline-flex" : "w-full"}`}
      role="group"
      aria-label="Color theme"
    >
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => choose("light")}
        aria-pressed={t === "light"}
        className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-bold tactile-press transition-all ${compact ? "" : "flex-1"} ${t === "light" ? "bg-card text-text ring-1 ring-line shadow-xs" : "text-text/60 hover:text-text"}`}
      >
        <Sun className="h-3.5 w-3.5" />
        <span className={compact ? "sr-only" : ""}>Light</span>
      </button>
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => choose("dark")}
        aria-pressed={t === "dark"}
        className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-bold tactile-press transition-all ${compact ? "" : "flex-1"} ${t === "dark" ? "bg-card text-text ring-1 ring-line shadow-xs" : "text-text/60 hover:text-text"}`}
      >
        <Moon className="h-3.5 w-3.5" />
        <span className={compact ? "sr-only" : ""}>Dark</span>
      </button>
    </div>
  );
}
