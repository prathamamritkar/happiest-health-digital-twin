"use client";

import { CheckCircle2, XCircle, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import Card, { CardHeader } from "@/components/ui/Card";
import type { PredictionResult } from "@/lib/api";
import { MODEL_INFO } from "@/lib/constants";

interface Props { prediction: PredictionResult | null; loading?: boolean; }

function GateItem({
  ok,
  warn,
  title,
  subtitle,
  badgeText,
}: {
  ok: boolean;
  warn?: boolean;
  title: string;
  subtitle: string;
  badgeText: string;
}) {
  const Icon = ok ? CheckCircle2 : warn ? AlertCircle : XCircle;
  const color = ok ? "text-emerald" : warn ? "text-amber" : "text-rose";
  const borderColor = ok ? "border-emerald/40 border-b-emerald/60" : warn ? "border-amber/40 border-b-amber/60" : "border-rose/40 border-b-rose/60";
  const bg = ok ? "bg-emerald/10" : warn ? "bg-amber/10" : "bg-rose/10";
  const badgeBg = ok ? "bg-emerald/20 text-emerald border-emerald/40" : warn ? "bg-amber/20 text-amber border-amber/40" : "bg-rose/20 text-rose border-rose/40";

  return (
    <div
      className={`rounded-xl border border-b-[3px] p-3.5 transition-all hover:scale-[1.01] tactile-card ${bg} ${borderColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${color}`} strokeWidth={2.5} />
          <div>
            <p className="text-xs font-extrabold text-text tracking-tight">{title}</p>
            <p className="mt-1 text-xs text-text/70 leading-relaxed font-medium">{subtitle}</p>
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider border border-b-2 shadow-xs ${badgeBg}`}
        >
          {badgeText}
        </span>
      </div>
    </div>
  );
}

export default function PatrolChecks({ prediction, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Clinical Safety Gates" caption="Verifying model confidence and safety thresholds…" />
        <div className="space-y-3 p-4 sm:p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer-bg h-16 rounded-xl border border-line" />
          ))}
        </div>
      </Card>
    );
  }

  if (!prediction) return null;

  const { spike_probability: prob, confidence, requires_review, risk_level } = prediction;
  const probPct = (prob * 100).toFixed(0);

  return (
    <Card>
      <CardHeader
        title="Clinical Safety Gates"
        caption={`XGBoost + Bagging Ensemble · ${MODEL_INFO.horizon} horizon · Confidence threshold: ${MODEL_INFO.confidence_gate * 100}%`}
        right={
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line border-b-2 bg-surface px-2.5 py-1 text-xs font-mono font-extrabold text-cyan shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            {MODEL_INFO.version}
          </span>
        }
      />
      <div className="space-y-3 p-4 sm:p-5">
        <GateItem
          ok={prob < 0.5}
          warn={prob >= 0.3 && prob < 0.5}
          title={`Gate 1: Glycemic Spike Risk (${probPct}%)`}
          subtitle={prob >= 0.5 ? "Predicted glucose excursion exceeds 180 mg/dL threshold within 120 minutes." : "Predicted glucose remains within safe glycemic bounds (80–180 mg/dL)."}
          badgeText={prob >= 0.5 ? "SPIKE RISK" : "NORMAL"}
        />
        <GateItem
          ok={confidence === "HIGH"}
          warn={confidence === "MEDIUM"}
          title={`Gate 2: Model Confidence Threshold (${confidence})`}
          subtitle={
            confidence === "HIGH"
              ? "Ensemble variance is within acceptable statistical confidence bounds (≥0.70)."
              : confidence === "MEDIUM"
              ? "Moderate confidence — cross-referencing against rolling HRV and step cadence."
              : "Low confidence — clinician human-in-the-loop review mandated."
          }
          badgeText={confidence}
        />
        <GateItem
          ok={!requires_review}
          warn={requires_review}
          title={requires_review ? "Gate 3: Clinical Review Required" : "Gate 3: Clinical Safety Cleared"}
          subtitle={
            requires_review
              ? `Spike probability (${probPct}%) exceeds safety gate. Clinical intervention validation required.`
              : "Telemetry integrity verified. All statistical safety thresholds met."
          }
          badgeText={requires_review ? "REVIEW REQ" : "CLEARED"}
        />
        <GateItem
          ok={risk_level === "LOW" || risk_level === "MODERATE"}
          warn={risk_level === "HIGH"}
          title={`Gate 4: Stratified Clinical Risk Tier (${risk_level})`}
          subtitle={
            risk_level === "CRITICAL"
              ? "Immediate clinical triage protocol recommended."
              : risk_level === "HIGH"
              ? "Elevated glycemic risk profile. Consider pre-prandial bolus adjustment or activity."
              : "Stable glycemic control. Patient remains within target metabolic parameters."
          }
          badgeText={risk_level}
        />
      </div>
      <div className="flex items-center gap-2 border-t-2 border-line/50 px-5 py-3 text-[11px] text-muted font-mono bg-surface/30">
        <Clock className="h-3.5 w-3.5 text-cyan" />
        <span>Ensemble Model: {MODEL_INFO.name} · Dual-Stream EHR + Wearables</span>
      </div>
    </Card>
  );
}
