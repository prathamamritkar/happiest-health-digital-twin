import { RISK_COLORS } from "@/lib/constants";
import { Check, AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";

type RiskKey = keyof typeof RISK_COLORS;

const ICONS = {
  LOW: Check,
  NORMAL: Check,
  MODERATE: AlertTriangle,
  HIGH: AlertCircle,
  CRITICAL: ShieldAlert,
};

export default function RiskBadge({
  level,
  size = "md",
}: {
  level: RiskKey | string;
  size?: "sm" | "md";
}) {
  const normKey = (level?.toUpperCase() in RISK_COLORS ? level.toUpperCase() : "LOW") as RiskKey;
  const c = RISK_COLORS[normKey] ?? RISK_COLORS.LOW;
  const Icon = ICONS[normKey] ?? Check;

  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-mono font-black uppercase tracking-[0.08em] shadow-xs transition-all select-none ${pad}`}
      style={{
        color: `rgb(var(${c.colorVar}))`,
        backgroundColor: `rgba(var(${c.colorVar}), 0.15)`,
        border: `1.5px solid rgba(var(${c.colorVar}), 0.45)`,
        borderBottom: `2.5px solid rgba(var(${c.colorVar}), 0.75)`,
      }}
    >
      <Icon className={iconSize} strokeWidth={3} />
      <span>{normKey}</span>
    </span>
  );
}

export function StatusDot({ active = true }: { active?: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        active ? "bg-emerald animate-pulseGreen" : "bg-muted"
      }`}
    />
  );
}
