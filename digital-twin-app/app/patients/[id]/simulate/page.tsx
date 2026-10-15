"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";
import Card, { CardHeader } from "@/components/ui/Card";
import CGMChart from "@/components/twin/CGMChart";
import { twinApi, type Patient, type SimulateResult } from "@/lib/api";

function Slider({ label, min, max, step, value, unit, onChange }: {
  label: string; min: number; max: number; step: number; value: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-text/70">{label}</span>
        <span className="font-mono font-bold text-cyan">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 appearance-none bg-surface rounded-full cursor-pointer accent-cyan"
      />
      <div className="flex justify-between text-[10px] text-muted font-mono">
        <span>{min} {unit}</span><span>{max} {unit}</span>
      </div>
    </div>
  );
}

export default function SimulatePage() {
  const params = useParams();
  const id = params.id as string;

  const [patient, setPatient]   = useState<Patient | null>(null);
  const [result,  setResult  ]  = useState<SimulateResult | null>(null);
  const [loading, setLoading ]  = useState(false);
  const [carbs,   setCarbs   ]  = useState(0);
  const [exercise,setExercise]  = useState(0);
  const [medFactor, setMedFactor] = useState(1.0);

  useEffect(() => {
    twinApi.patient(id).then(setPatient).catch(() => null);
  }, [id]);

  const simulate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await twinApi.simulate({
        patient_id: id,
        meal_carbs_g: carbs,
        exercise_minutes: exercise,
        medication_dose_factor: medFactor,
      });
      setResult(res);
    } catch { /* offline */ } finally {
      setLoading(false);
    }
  }, [id, carbs, exercise, medFactor]);

  const deltaColor = result
    ? result.delta < -0.05 ? "text-emerald" : result.delta > 0.05 ? "text-rose" : "text-amber"
    : "";

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="flex items-center gap-3">
        <Link
          href={`/patients/${id}`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line border-b-2 bg-surface text-text/70 hover:border-cyan/40 hover:text-cyan tactile-press transition-all shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="page-eyebrow">{patient?.id ?? id} · What-If Intervention Simulator</p>
          <h1 className="mt-0.5 text-xl lg:text-2xl font-extrabold tracking-tight text-text">
            {patient?.name ?? "Loading…"} — What-If Intervention Simulator
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Controls */}
        <Card className="flex flex-col gap-5 p-5 lg:col-span-1">
          <div>
            <p className="page-eyebrow mb-3">Intervention Parameters</p>
            <div className="space-y-5">
              <Slider label="Meal Carbohydrates" min={0} max={120} step={5} value={carbs} unit="g" onChange={setCarbs} />
              <Slider label="Exercise Duration" min={0} max={60} step={5} value={exercise} unit="min" onChange={setExercise} />
              <Slider label="Medication Dose Factor" min={0.5} max={2.0} step={0.1} value={medFactor} unit="×" onChange={setMedFactor} />
            </div>
          </div>

          <button
            onClick={simulate}
            disabled={loading}
            id="run-simulation-btn"
            className="btn-tactile-primary inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold disabled:opacity-60 tactile-press shadow-xs"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? "Simulating…" : "Run Simulation"}
          </button>

          {result && (
            <div className="space-y-2 border-t border-line/40 pt-4">
              <p className="ui-label text-text/50">Simulation Results</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[10px] font-mono text-muted">Baseline Risk</p>
                  <p className="font-mono text-lg font-bold text-text">{(result.baseline_probability * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[10px] font-mono text-muted">Adjusted Risk</p>
                  <p className="font-mono text-lg font-bold text-cyan">{(result.adjusted_probability * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line bg-card px-3 py-2">
                <span className="text-xs text-muted">Risk Delta</span>
                <span className={`font-mono text-sm font-bold ${deltaColor}`}>
                  {result.delta >= 0 ? "+" : ""}{(result.delta * 100).toFixed(0)}pp
                </span>
              </div>
              <p className="text-[11px] text-muted leading-snug">{result.intervention_summary}</p>
            </div>
          )}
        </Card>

        {/* Forecast chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="4-Hour Forward Glucose Trajectory"
            caption="Projected glycemic response under simulated interventions"
          />
          <div className="p-4 sm:p-6">
            {result ? (
              <CGMChart readings={[]} forecastPoints={result.forecast_points} />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                <Play className="h-8 w-8 text-cyan/40" />
                <p className="text-sm text-muted">Adjust sliders and click Run Simulation to see the forecast</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
