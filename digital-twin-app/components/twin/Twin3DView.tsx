"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDigitalTwin } from "@/context/DigitalTwinContext";
import Card from "@/components/ui/Card";
import { FlaskConical, Activity, ArrowUpRight } from "lucide-react";

// Dynamic import with SSR disabled for Three.js canvas
const Twin3DCanvas = dynamic(() => import("@/components/twin/Twin3DCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[580px] lg:h-[720px] w-full items-center justify-center rounded-3xl border border-line bg-[#080e1a] text-cyan animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <Activity className="h-8 w-8 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest">Initializing 3D Spatial Twin Engine…</p>
      </div>
    </div>
  ),
});

import TwinSelectDropdown from "@/components/twin/TwinSelectDropdown";

export default function Twin3DView() {
  const {
    patient,
    patients,
    activePatientId,
    setActivePatientId,
    readings,
    prediction,
    organStatuses,
    activeOrgan,
    setActiveOrgan,
    setCameraPreset,
  } = useDigitalTwin();

  const latestReading = readings[readings.length - 1];
  const currentGlucose = latestReading ? latestReading.glucose_mgdl : (patient?.fasting_glucose ?? 120);

  // Calculate Time-In-Range (80-180 mg/dL) from current readings
  const inRangeCount = readings.filter(r => r.glucose_mgdl >= 80 && r.glucose_mgdl <= 180).length;
  const tirPercent = readings.length > 0 ? Math.round((inRangeCount / readings.length) * 100) : 74;

  return (
    <div className="space-y-4 animate-fadeUp">
      {/* Patient Twin Cohort Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/50 p-2 sm:p-2.5 rounded-2xl border border-line border-b-2 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="ui-label text-text/60 pl-1">Active Patient Twin:</span>
          <TwinSelectDropdown />
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted pr-2">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan animate-pulse" />
          <span>Biometric Telemetry Stream · Live</span>
        </div>
      </div>

      {/* Main 3D Twin Spatial Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left 3 Cols: The 3D Anatomical Twin Canvas */}
        <div className="lg:col-span-3">
          <Twin3DCanvas />
        </div>

        {/* Right 1 Col: Spatial Telemetry & In-Silico Action Panel */}
        <div className="space-y-4">
          {/* What-If Intervention Simulator Launcher */}
          {patient && (
            <Link
              href={`/patients/${patient.id}/simulate`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-cyan/40 bg-gradient-to-r from-cyan/20 to-surface p-4 hover:border-cyan hover:shadow-md transition tactile-press group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan text-on-accent shadow-xs group-hover:scale-105 transition">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-text">What-If Intervention Simulator</p>
                  <p className="text-[11px] text-muted font-medium">Simulate meal and exercise effects</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </Link>
          )}

          {/* Vitals Telemetry Card */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="ui-label text-text/60">Live Physiological Telemetry</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                Dexcom G7 Continuous ISF
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-line bg-surface/50 p-2.5">
                <p className="text-[10px] text-muted font-medium">Interstitial Glucose</p>
                <p className="text-base font-mono font-extrabold text-cyan">{currentGlucose} mg/dL</p>
                <p className="text-[10px] text-text/50 mt-0.5 font-mono">5-min interval</p>
              </div>

              <div className="rounded-xl border border-line bg-surface/50 p-2.5">
                <p className="text-[10px] text-muted font-medium">Time in Range</p>
                <p className="text-base font-mono font-extrabold text-emerald">{tirPercent}%</p>
                <p className="text-[10px] text-text/50 mt-0.5 font-mono">80–180 mg/dL target</p>
              </div>

              <div className="rounded-xl border border-line bg-surface/50 p-2.5">
                <p className="text-[10px] text-muted font-medium">Autonomic Tone (HRV)</p>
                <p className="text-base font-mono font-extrabold text-text">
                  {latestReading ? latestReading.hrv_ms : 45} ms
                </p>
                <p className="text-[10px] text-text/50 mt-0.5 font-mono">rMSSD vagal tone</p>
              </div>

              <div className="rounded-xl border border-line bg-surface/50 p-2.5">
                <p className="text-[10px] text-muted font-medium">120-Min Spike Risk</p>
                <p
                  className={`text-base font-mono font-extrabold ${
                    prediction && prediction.spike_probability > 0.6 ? "text-rose" : "text-emerald"
                  }`}
                >
                  {prediction ? `${Math.round(prediction.spike_probability * 100)}%` : "—"}
                </p>
                <p className="text-[10px] text-text/50 mt-0.5 font-mono">XGBoost Ensemble</p>
              </div>
            </div>
          </Card>

          {/* Organ Systems Topology Quick-Nav */}
          <Card className="p-4 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="ui-label text-text/60">Multi-Compartment Metabolic Probe</span>
              <span className="text-[10px] font-mono text-muted">{organStatuses.length} loci</span>
            </div>

            <div className="space-y-1.5">
              {organStatuses.map(organ => {
                const isActive = activeOrgan?.id === organ.id;
                return (
                  <button
                    key={organ.id}
                    onClick={() => {
                      setActiveOrgan(organ);
                      if (organ.id === "pancreas") setCameraPreset("pancreas");
                      else if (organ.id === "sensor") setCameraPreset("sensor");
                      else if (organ.id === "liver") setCameraPreset("liver");
                      else if (organ.id === "heart") setCameraPreset("heart");
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition tactile-press border ${
                      isActive
                        ? "border-cyan bg-cyan/15 text-cyan font-bold"
                        : "border-line/60 bg-surface/40 text-text/70 hover:border-line hover:text-text"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: organ.color }} />
                      <span className="text-left font-medium">{organ.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted">{organ.value}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
