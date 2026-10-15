/** API base URL — set NEXT_PUBLIC_DT_API_URL in .env.local */
const BASE = process.env.NEXT_PUBLIC_DT_API_URL ?? "http://localhost:8000";

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  bmi: number;
  hba1c: number;
  fasting_glucose: number;
  medications: string[];
  conditions: string[];
  risk_score: number;
  risk_label: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  last_seen: string;
}

export interface CGMReading {
  patient_id: string;
  timestamp: string;
  glucose_mgdl: number;
  hrv_ms: number;
  steps: number;
  sleep_stage: string;
}

export interface PredictionResult {
  patient_id: string;
  spike_probability: number;
  prediction: "SPIKE" | "NORMAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  requires_review: boolean;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  message: string;
}

export interface DashboardMetrics {
  total_patients: number;
  pending_alerts: number;
  spikes_predicted_today: number;
  high_risk_count: number;
  model_version: string;
  data_sources: string[];
}

export interface SimulateRequest {
  patient_id: string;
  meal_carbs_g: number;
  exercise_minutes: number;
  medication_dose_factor: number;
}

export interface SimulateResult {
  patient_id: string;
  baseline_probability: number;
  adjusted_probability: number;
  delta: number;
  forecast_points: Array<{ time: string; glucose_mgdl: number; is_forecast: boolean }>;
  intervention_summary: string;
}

import {
  MOCK_PATIENTS,
  generateMockCGM,
  getMockPrediction,
  getMockDashboardMetrics,
} from "./mockData";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...init,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`${res.status}: ${msg}`);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export const twinApi = {
  readiness: async () => {
    try {
      return await apiFetch<{ status: string; patient_count: number; model: string }>("/api/v1/readiness");
    } catch {
      return { status: "simulated_edge", patient_count: MOCK_PATIENTS.length, model: "XGBoost-Ensemble-Edge v0.1" };
    }
  },
  dashboard: async () => {
    try {
      return await apiFetch<DashboardMetrics>("/api/v1/dashboard");
    } catch {
      return getMockDashboardMetrics();
    }
  },
  patients: async () => {
    try {
      return await apiFetch<Patient[]>("/api/v1/patients");
    } catch {
      return MOCK_PATIENTS;
    }
  },
  patient: async (id: string) => {
    try {
      return await apiFetch<Patient>(`/api/v1/patients/${id}`);
    } catch {
      const found = MOCK_PATIENTS.find(p => p.id === id);
      if (!found) throw new Error("Patient not found");
      return found;
    }
  },
  cgm: async (id: string, hours = 24) => {
    try {
      return await apiFetch<CGMReading[]>(`/api/v1/patients/${id}/cgm?hours=${hours}`);
    } catch {
      return generateMockCGM(id, hours);
    }
  },
  predict: async (id: string) => {
    try {
      return await apiFetch<PredictionResult>(`/api/v1/patients/${id}/predict`);
    } catch {
      return getMockPrediction(id);
    }
  },
  simulate: async (body: SimulateRequest) => {
    try {
      return await apiFetch<SimulateResult>(`/api/v1/patients/${body.patient_id}/simulate`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch {
      const baseline = getMockPrediction(body.patient_id);
      const carbImpact = (body.meal_carbs_g / 100) * 0.28;
      const exerciseImpact = (body.exercise_minutes / 60) * 0.22;
      const medImpact = (body.medication_dose_factor - 1.0) * 0.15;
      const adjusted = Math.max(0.05, Math.min(0.98, baseline.spike_probability + carbImpact - exerciseImpact - medImpact));

      const now = new Date();
      const points: Array<{ time: string; glucose_mgdl: number; is_forecast: boolean }> = [];
      const baseGlucose = 135;
      for (let i = 0; i <= 48; i++) {
        const t = new Date(now.getTime() + i * 5 * 60 * 1000);
        const curve = 50 * Math.sin((i / 48) * Math.PI) * (adjusted / 0.5);
        points.push({
          time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          glucose_mgdl: Math.round(baseGlucose + curve),
          is_forecast: true,
        });
      }

      return {
        patient_id: body.patient_id,
        baseline_probability: baseline.spike_probability,
        adjusted_probability: adjusted,
        delta: adjusted - baseline.spike_probability,
        forecast_points: points,
        intervention_summary: `Adjusted intervention simulation: ${body.meal_carbs_g}g carbs, ${body.exercise_minutes}min exercise, ${body.medication_dose_factor}x dosage factor. Resulting spike risk: ${Math.round(adjusted * 100)}%.`,
      };
    }
  },
};

