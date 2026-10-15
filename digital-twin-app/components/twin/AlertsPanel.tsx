"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import Card, { CardHeader } from "@/components/ui/Card";
import RiskBadge from "@/components/ui/RiskBadge";
import { twinApi, type Patient, type PredictionResult } from "@/lib/api";

export default function AlertsPanel() {
  const [items, setItems] = useState<Array<{ patient: Patient; prediction: PredictionResult }>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const patients = await twinApi.patients();
      const highRisk = patients.filter(p => p.risk_label === "HIGH" || p.risk_label === "CRITICAL").slice(0, 8);
      const results = await Promise.allSettled(
        highRisk.map(async p => ({ patient: p, prediction: await twinApi.predict(p.id) }))
      );
      const resolved = results
        .filter((r): r is PromiseFulfilledResult<{ patient: Patient; prediction: PredictionResult }> => r.status === "fulfilled")
        .map(r => r.value);
      setItems(resolved);
    } catch { /* offline handled */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeSpikes = items.filter(i => i.prediction.prediction === "SPIKE").length;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title="Glycemic Spike Alerts"
        caption="High and critical risk patients with predicted spike within 120 minutes"
        right={
          <span className="font-mono text-xs font-black uppercase tracking-wider rounded-lg border border-rose/40 border-b-2 bg-rose/15 text-rose px-2.5 py-1 shadow-xs">
            {activeSpikes} active
          </span>
        }
      />

      <div className="table-scroll-area table-max-8 flex-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-4 py-3.5 border-b border-line/30 animate-pulse">
              <div className="shimmer-bg h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="shimmer-bg h-3.5 w-24 rounded" />
                <div className="shimmer-bg h-2.5 w-36 rounded" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <ShieldCheck className="h-9 w-9 text-emerald" strokeWidth={2.5} />
            <p className="text-sm font-extrabold text-emerald">No Active Glycemic Spike Alerts</p>
            <p className="text-xs text-muted font-medium">All monitored patient twins remain within the 80–180 mg/dL target range.</p>
          </div>
        ) : (
          items.map(({ patient, prediction }) => {
            const isSpike = prediction.prediction === "SPIKE";
            return (
              <div
                key={patient.id}
                className="flex items-start gap-3 px-4 py-3.5 border-b border-line/40 hover:bg-rose/5 transition-colors duration-150"
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-b-2 shadow-xs ${
                    isSpike
                      ? "border-rose/40 bg-rose/15 text-rose border-b-rose/60"
                      : "border-amber/40 bg-amber/15 text-amber border-b-amber/60"
                  }`}
                >
                  {isSpike ? <AlertTriangle className="h-4.5 w-4.5" strokeWidth={2.5} /> : <AlertCircle className="h-4.5 w-4.5" strokeWidth={2.5} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text truncate">{patient.name}</span>
                    <RiskBadge level={prediction.risk_level} size="sm" />
                  </div>
                  <p className="mt-1 text-xs text-text/70 leading-snug font-medium">{prediction.message}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-text/50">
                    <span className="flex items-center gap-1 font-bold text-text/70">
                      <Clock className="h-3 w-3 text-cyan" />
                      {(prediction.spike_probability * 100).toFixed(0)}% Spike Likelihood · 120-min
                    </span>
                    {prediction.requires_review && (
                      <span className="rounded-md border border-amber/40 bg-amber/15 px-1.5 py-0.5 font-bold text-amber">
                        Review Req
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
