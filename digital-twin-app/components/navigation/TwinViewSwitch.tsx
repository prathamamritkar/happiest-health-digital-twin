"use client";

import { useDigitalTwin } from "@/context/DigitalTwinContext";
import { Box, LayoutDashboard } from "lucide-react";

export default function TwinViewSwitch({ compact = false }: { compact?: boolean }) {
  const { viewMode, setViewMode } = useDigitalTwin();

  return (
    <div
      suppressHydrationWarning
      className={`flex items-center rounded-xl border border-line bg-surface p-1 shadow-xs ${
        compact ? "inline-flex" : "w-full"
      }`}
      role="group"
      aria-label="Presentation view switch"
    >
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setViewMode("dashboard")}
        aria-pressed={viewMode === "dashboard"}
        className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-bold tactile-press transition-all ${
          compact ? "" : "flex-1"
        } ${
          viewMode === "dashboard"
            ? "bg-card text-text ring-1 ring-line shadow-xs font-extrabold"
            : "text-text/60 hover:text-text"
        }`}
        title="Clinical Dashboard (V)"
      >
        <LayoutDashboard className="h-4 w-4" strokeWidth={2.2} />
        <span className={compact ? "sr-only" : ""}>Clinical Dashboard</span>
      </button>
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setViewMode("3d-twin")}
        aria-pressed={viewMode === "3d-twin"}
        className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-bold tactile-press transition-all ${
          compact ? "" : "flex-1"
        } ${
          viewMode === "3d-twin"
            ? "bg-card text-cyan ring-1 ring-line shadow-xs font-extrabold"
            : "text-text/60 hover:text-text"
        }`}
        title="3D Digital Twin (V)"
      >
        <Box className="h-4 w-4" strokeWidth={2.2} />
        <span className={compact ? "sr-only" : ""}>3D Digital Twin</span>
      </button>
    </div>
  );
}

