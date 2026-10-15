"use client";

import Card, { CardHeader } from "@/components/ui/Card";
import { MODEL_INFO, SCIENTIFIC_CITATIONS } from "@/lib/constants";
import { Database, GitBranch, FlaskConical, ShieldCheck, BookOpen, Cpu } from "lucide-react";

const DATA_SOURCES = [
  {
    icon: Database,
    color: "#22d3ee",
    title: "Static EHR Data — Synthea (Synthetic)",
    desc: "50 de-identified synthetic patient records with demographics, diagnoses, HbA1c lab tests, fasting glucose, and medications. Generated through Synthea simulation to eliminate real personal health data.",
    tags: ["DPDP Act 2023", "HIPAA Compliant", "Synthetic Cohort"],
  },
  {
    icon: FlaskConical,
    color: "#34d399",
    title: "Dynamic Sensor Telemetry — Continuous CGM",
    desc: "7-day continuous interstitial glucose monitor time series at 5-minute intervals with heart rate variability and step cadence. Formatted to match Apple Health and Google Fit export schemas.",
    tags: ["5-Minute Intervals", "Dexcom G7 Schema", "7-Day History"],
  },
  {
    icon: GitBranch,
    color: "#a78bfa",
    title: "Predictive ML Classifier — XGBoost Ensemble",
    desc: `Supervised gradient-boosted decision trees wrapped in 10-fold bootstrap aggregation. Predicts blood glucose spikes (≥ 180 mg/dL) 120 minutes in advance with a ${MODEL_INFO.confidence_gate * 100}% confidence gate.`,
    tags: ["XGBoost", "10-Fold Bagging", "120-Min Horizon", "Confidence Gate"],
  },
  {
    icon: Cpu,
    color: "#00a8e8",
    title: "Biophysical Modeling — Multi-Compartment Flux",
    desc: "Multi-compartment differential equations modeling gastric absorption, hepatic glucose production, peripheral GLUT4 disposal, and subcutaneous interstitial fluid diffusion lag.",
    tags: ["Bergman Minimal Model", "UVA/Padova Simulator", "Mass Balance ODEs"],
  },
  {
    icon: ShieldCheck,
    color: "#fbbf24",
    title: "Data Privacy & Governance",
    desc: "All patient profiles and telemetry time series are completely synthetic. Zero Protected Health Information (PHI) is stored or transmitted, satisfying DPDP Act 2023 and HIPAA sandbox specifications.",
    tags: ["DPDP Act 2023", "Zero PHI Storage", "Local Execution"],
  },
];

export default function DataPage() {
  return (
    <div className="space-y-5 animate-fadeUp">
      <div>
        <p className="page-eyebrow">Data Provenance & Scientific Methodology</p>
        <h1 className="mt-1 text-2xl lg:text-3xl font-extrabold tracking-tight text-text">Data & Model</h1>
        <p className="mt-1 text-xs font-medium text-text/50">
          Full technical disclosure of data sources, biophysical simulation models, and machine learning pipelines.
        </p>
      </div>

      {/* Data & Model Architecture Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DATA_SOURCES.map(src => (
          <Card key={src.title} accent={src.color} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-b-2 shadow-xs"
                  style={{ borderColor: `${src.color}60`, background: `${src.color}15`, color: src.color }}
                >
                  <src.icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold tracking-tight text-text">{src.title}</h3>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text/70 font-medium">{src.desc}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-line/40">
              {src.tags.map(tag => (
                <span key={tag} className="inline-block rounded-lg bg-surface border border-line px-2 py-0.5 text-[10px] font-bold font-mono text-text/60">
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Scientific Citations & Literature Foundations */}
      <Card>
        <CardHeader
          title="Scientific Citations & Literature Foundations"
          caption="Peer-reviewed foundations governing physiological modeling and machine learning architecture"
          right={
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line border-b-2 bg-surface px-2.5 py-1 text-xs font-mono font-bold text-cyan shadow-xs">
              <BookOpen className="h-3.5 w-3.5" />
              {SCIENTIFIC_CITATIONS.length} References
            </span>
          }
        />
        <div className="divide-y divide-line/40">
          {SCIENTIFIC_CITATIONS.map((ref, idx) => (
            <div key={idx} className="p-4 sm:p-5 hover:bg-cyan/5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <span className="ui-label text-cyan">{ref.category}</span>
                <span className="text-[10px] font-mono text-muted">Citation #{idx + 1}</span>
              </div>
              <p className="mt-1 text-xs font-bold text-text leading-snug">{ref.citation}</p>
              <p className="mt-1 text-xs text-text/60 font-medium">{ref.application}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* System Architecture Diagram */}
      <Card>
        <CardHeader title="System Architecture Data Flow" caption="Data ingestion from wearable sensor to clinician interface" />
        <div className="p-5 font-mono text-xs text-muted overflow-x-auto">
          <pre className="leading-relaxed">{`
┌─────────────────────────────────────────────────────────────┐
│                 HAPPIEST HEALTH DIGITAL TWIN                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Static EHR Data Stream         Wearable Sensor Data Stream │
│  ┌─────────────────────────┐    ┌─────────────────────────┐ │
│  │ Synthea Patient JSON    │    │ Simulated CGM 5-Min ISF │ │
│  │ - Demographics, Lab HbA1c│    │ - Interstitial Glucose  │ │
│  │ - Medications, BMI      │    │ - Autonomic HRV, Steps  │ │
│  └────────────┬────────────┘    └────────────┬────────────┘ │
│               │                              │              │
│               └──────────────┬───────────────┘              │
│                              ▼                              │
│                 ┌──────────────────────────┐                │
│                 │ Feature Engineering Core │                │
│                 │ (12 Lags + Velocity +    │                │
│                 │  Circadian + EHR Baselines)               │
│                 └────────────┬─────────────┘                │
│                              ▼                              │
│                 ┌──────────────────────────┐                │
│                 │ XGBoost Ensemble Model   │                │
│                 │ (10-Fold Bagging Trees)  │                │
│                 │ P(Glucose ≥ 180 in 120m) │                │
│                 └────────────┬─────────────┘                │
│                              ▼                              │
│                 ┌──────────────────────────┐                │
│                 │ Clinical Safety Gate     │                │
│                 │ (Threshold: Conf ≥ 0.70) │                │
│                 └────────────┬─────────────┘                │
│                              ▼                              │
│                 ┌──────────────────────────┐                │
│                 │ REST API Service Gateway │                │
│                 └────────────┬─────────────┘                │
│                              ▼                              │
│        ┌─────────────────────────────────────────┐          │
│        │   Next.js 14 Presentation Layer Switch  │          │
│        ├────────────────────┬────────────────────┤          │
│        │  3D Digital Twin   │ Clinical Dashboard │          │
│        │  (Three.js WebGL)  │ (Analytical HUD)   │          │
│        └────────────────────┴────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          `.trim()}</pre>
        </div>
      </Card>
    </div>
  );
}
