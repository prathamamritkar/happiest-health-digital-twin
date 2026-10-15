"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, Users, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Tooltip from "@/components/ui/Tooltip";
import { twinApi, type DashboardMetrics } from "@/lib/api";
import { COLORS } from "@/lib/constants";

const SKELETON: DashboardMetrics = {
  total_patients: 0,
  pending_alerts: 0,
  spikes_predicted_today: 0,
  high_risk_count: 0,
  model_version: "...",
  data_sources: [],
};

export default function DashboardSummaryRow() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(() => {
    setLoading(true);
    twinApi.dashboard()
      .then(m => { setMetrics(m); setLoading(false); })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const m = metrics ?? SKELETON;

  const cards = [
    {
      label: "Monitored Patient Twins",
      value: m.total_patients,
      color: COLORS.cyan,
      Icon: Users,
      help: "Total synthetic patient digital twins actively monitored through EHR and wearable data streams.",
    },
    {
      label: "Active Spike Alerts",
      value: m.pending_alerts,
      color: COLORS.rose,
      Icon: AlertTriangle,
      help: "Patients with forecasted glucose spikes (≥ 180 mg/dL) within the next 120 minutes.",
    },
    {
      label: "Predicted Spikes (Today)",
      value: m.spikes_predicted_today,
      color: COLORS.amber,
      Icon: TrendingUp,
      help: "Cumulative count of validated glycemic spike forecasts generated during the current 24-hour cycle.",
    },
    {
      label: "High & Critical Risk Patients",
      value: m.high_risk_count,
      color: COLORS.violet,
      Icon: Activity,
      help: "Patient twins stratified into high or critical clinical risk categories requiring clinician review.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
      {cards.map(card => (
        <Card
          key={card.label}
          accent={card.color}
          className="p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Tooltip text={card.help}>
                  <span className="ui-label text-text/60 hover:text-text transition-colors truncate">
                    {card.label}
                  </span>
                </Tooltip>
              </div>
              <div
                className="mt-3 font-mono text-3xl sm:text-4xl font-extrabold tabular-nums"
                style={{ color: card.color }}
              >
                {loading ? "…" : card.value}
              </div>
            </div>
            <card.Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: card.color }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
