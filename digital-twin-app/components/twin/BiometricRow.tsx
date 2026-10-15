"use client";

import { Heart, Footprints, Moon, Thermometer } from "lucide-react";
import Card from "@/components/ui/Card";
import type { CGMReading } from "@/lib/api";

interface Props { readings: CGMReading[]; }

export default function BiometricRow({ readings }: Props) {
  if (!readings.length) return null;

  const last6   = readings.slice(-6);
  const avgHRV  = +(last6.reduce((s, r) => s + r.hrv_ms, 0) / last6.length).toFixed(1);
  const steps   = last6.reduce((s, r) => s + r.steps, 0);
  const latestGlc = readings[readings.length - 1]?.glucose_mgdl ?? 0;
  const sleepStage = readings[readings.length - 1]?.sleep_stage ?? "WAKE";

  const hrvStatus = avgHRV > 50 ? "emerald" : avgHRV > 30 ? "amber" : "rose";
  const glcStatus = latestGlc > 180 ? "rose" : latestGlc < 70 ? "amber" : "emerald";

  const metrics = [
    {
      label:   "HRV",
      value:   `${avgHRV} ms`,
      sub:     "30-min mean",
      Icon:    Heart,
      color:   `var(--color-${hrvStatus})`,
    },
    {
      label:   "Steps",
      value:   steps.toLocaleString(),
      sub:     "30-min window",
      Icon:    Footprints,
      color:   "var(--color-cyan)",
    },
    {
      label:   "Glucose Now",
      value:   `${latestGlc.toFixed(0)} mg/dL`,
      sub:     "Latest CGM reading",
      Icon:    Thermometer,
      color:   `var(--color-${glcStatus})`,
    },
    {
      label:   "Sleep Stage",
      value:   sleepStage,
      sub:     "Current",
      Icon:    Moon,
      color:   "var(--color-violet)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map(m => (
        <Card key={m.label} className="p-4">
          <div className="flex items-start gap-2">
            <m.Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: `rgb(${m.color})` }} />
            <div className="min-w-0">
              <p className="ui-label text-text/50">{m.label}</p>
              <p className="mt-1 font-mono font-extrabold text-xl leading-none" style={{ color: `rgb(${m.color})` }}>{m.value}</p>
              <p className="mt-0.5 text-[10px] text-muted">{m.sub}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
