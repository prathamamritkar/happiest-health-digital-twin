import { Patient, CGMReading, PredictionResult, DashboardMetrics } from "./api";

export interface OrganStatus {
  id: "pancreas" | "sensor" | "liver" | "heart" | "muscle" | "brain";
  name: string;
  system: string;
  status: "NORMAL" | "STRESSED" | "CRITICAL" | "OPTIMAL";
  value: string;
  metric: string;
  description: string;
  position3D: [number, number, number];
  color: string;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "PT-0001",
    name: "Marcus Vance",
    age: 58,
    sex: "M",
    bmi: 31.4,
    hba1c: 8.8,
    fasting_glucose: 215,
    medications: ["Metformin 1000mg", "Insulin Glargine 20U", "Empagliflozin 10mg"],
    conditions: ["Type 2 Diabetes", "Hypertension", "Dyslipidemia"],
    risk_score: 0.84,
    risk_label: "CRITICAL",
    last_seen: "2026-10-14",
  },
  {
    id: "PT-0002",
    name: "Elena Rostova",
    age: 46,
    sex: "F",
    bmi: 27.2,
    hba1c: 7.4,
    fasting_glucose: 162,
    medications: ["Metformin 500mg", "Sitagliptin 100mg"],
    conditions: ["Type 2 Diabetes", "Pre-hypertension"],
    risk_score: 0.62,
    risk_label: "HIGH",
    last_seen: "2026-10-12",
  },
  {
    id: "PT-0003",
    name: "David K. Chen",
    age: 63,
    sex: "M",
    bmi: 25.8,
    hba1c: 6.9,
    fasting_glucose: 138,
    medications: ["Metformin 500mg"],
    conditions: ["Type 2 Diabetes"],
    risk_score: 0.44,
    risk_label: "MODERATE",
    last_seen: "2026-10-11",
  },
  {
    id: "PT-0004",
    name: "Amina Al-Mansoor",
    age: 39,
    sex: "F",
    bmi: 23.5,
    hba1c: 6.1,
    fasting_glucose: 104,
    medications: ["Dietary Lifestyle Protocol"],
    conditions: ["Prediabetes Remission"],
    risk_score: 0.18,
    risk_label: "LOW",
    last_seen: "2026-10-14",
  },
  {
    id: "PT-0005",
    name: "Robert MacIntyre",
    age: 67,
    sex: "M",
    bmi: 33.8,
    hba1c: 9.2,
    fasting_glucose: 240,
    medications: ["Insulin Degludec 30U", "Glipizide 10mg", "Metformin 1000mg"],
    conditions: ["Type 2 Diabetes", "Diabetic Nephropathy Stage 2", "Hypertension"],
    risk_score: 0.91,
    risk_label: "CRITICAL",
    last_seen: "2026-10-14",
  },
  {
    id: "PT-0006",
    name: "Sarah Jenkins",
    age: 52,
    sex: "F",
    bmi: 28.9,
    hba1c: 7.8,
    fasting_glucose: 178,
    medications: ["Empagliflozin 25mg", "Metformin 850mg"],
    conditions: ["Type 2 Diabetes", "Dyslipidemia"],
    risk_score: 0.68,
    risk_label: "HIGH",
    last_seen: "2026-10-13",
  },
  {
    id: "PT-0007",
    name: "Tariq Washington",
    age: 44,
    sex: "M",
    bmi: 26.1,
    hba1c: 6.7,
    fasting_glucose: 128,
    medications: ["Metformin 500mg"],
    conditions: ["Type 2 Diabetes"],
    risk_score: 0.38,
    risk_label: "MODERATE",
    last_seen: "2026-10-09",
  },
  {
    id: "PT-0008",
    name: "Hannah Lindqvist",
    age: 34,
    sex: "F",
    bmi: 22.4,
    hba1c: 5.8,
    fasting_glucose: 96,
    medications: ["None"],
    conditions: ["Gestational Diabetes History"],
    risk_score: 0.12,
    risk_label: "LOW",
    last_seen: "2026-10-14",
  },
];

export function generateMockCGM(patientId: string, hours = 24): CGMReading[] {
  const patient = MOCK_PATIENTS.find(p => p.id === patientId) ?? MOCK_PATIENTS[0];
  const count = hours * 12; // 5-minute points
  const readings: CGMReading[] = [];
  const now = new Date();
  const baseGlucose = 90 + (patient.hba1c - 6.0) * 18 + (patient.bmi - 24) * 1.5;

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000);
    const hour = time.getHours() + time.getMinutes() / 60;

    let mealSpike = 0;
    // Meal spikes around 8:00, 13:00, 19:30
    for (const mealHour of [8, 13, 19.5]) {
      const diff = hour - mealHour;
      if (diff >= 0 && diff <= 2.5) {
        const intensity = (patient.risk_score > 0.6 ? 55 : 32) * Math.exp(-Math.pow(diff - 0.75, 2) / 0.5);
        mealSpike += intensity;
      }
    }

    const noise = Math.sin(i * 0.3) * 3 + Math.cos(i * 0.7) * 2;
    const glucose = Math.max(55, Math.min(360, Math.round(baseGlucose + mealSpike + noise)));
    const hrv = Math.max(18, Math.round(58 - (glucose > 180 ? 15 : 0) + Math.sin(i * 0.2) * 8));
    const steps = (hour >= 7 && hour <= 21) ? Math.max(0, Math.round(180 + Math.sin(i * 0.1) * 140)) : 0;
    const sleepStage = (hour >= 23 || hour < 6) ? (hour >= 1 && hour <= 4 ? "N3" : "N2") : "WAKE";

    readings.push({
      patient_id: patientId,
      timestamp: time.toISOString(),
      glucose_mgdl: glucose,
      hrv_ms: hrv,
      steps,
      sleep_stage: sleepStage,
    });
  }
  return readings;
}

export function getMockPrediction(patientId: string): PredictionResult {
  const patient = MOCK_PATIENTS.find(p => p.id === patientId) ?? MOCK_PATIENTS[0];
  const prob = patient.risk_score;
  const isSpike = prob >= 0.55;

  return {
    patient_id: patientId,
    spike_probability: prob,
    prediction: isSpike ? "SPIKE" : "NORMAL",
    confidence: prob > 0.8 || prob < 0.3 ? "HIGH" : "MEDIUM",
    requires_review: prob >= 0.75,
    risk_level: patient.risk_label,
    message: isSpike
      ? `Predicted glucose elevation exceeding 180 mg/dL within 120 minutes (confidence: ${Math.round(prob * 100)}%). Recommend pre-prandial insulin verification or hydration.`
      : `Glycemic trajectory stable within target band (80–180 mg/dL). No acute excursion forecast.`,
  };
}

export function getMockDashboardMetrics(): DashboardMetrics {
  const highRisk = MOCK_PATIENTS.filter(p => p.risk_label === "HIGH" || p.risk_label === "CRITICAL");
  return {
    total_patients: MOCK_PATIENTS.length,
    pending_alerts: highRisk.length,
    spikes_predicted_today: highRisk.length + 1,
    high_risk_count: highRisk.length,
    model_version: "XGBoost + Bagging Ensemble v0.1.0",
    data_sources: ["Synthea EHR Dual-Stream", "Simulated Wearable Dexcom G7 Stream"],
  };
}

export function getMockOrganStatuses(patientId: string): OrganStatus[] {
  const patient = MOCK_PATIENTS.find(p => p.id === patientId) ?? MOCK_PATIENTS[0];
  const isCritical = patient.risk_label === "CRITICAL";
  const isHigh = patient.risk_label === "HIGH";

  return [
    {
      id: "pancreas",
      name: "Pancreatic Islets",
      system: "Endocrine Regulation",
      status: isCritical ? "CRITICAL" : isHigh ? "STRESSED" : "NORMAL",
      value: `${isCritical ? "38%" : isHigh ? "62%" : "89%"} β-Cell Capacity`,
      metric: "Insulin Secretion Load",
      description: "Basal insulin reserve and post-prandial first-phase response velocity.",
      position3D: [0.1, 0.45, 0.2],
      color: isCritical ? "#fb7185" : isHigh ? "#fbbf24" : "#22d3ee",
    },
    {
      id: "sensor",
      name: "CGM ISF Sensor Site",
      system: "Wearable Interstitial Interface",
      status: "OPTIMAL",
      value: "5.2 min ISF Lag",
      metric: "Telemetry Fidelity: 99.4%",
      description: "Subcutaneous micro-filament sensor on posterior triceps measuring interstitial glucose diffusion.",
      position3D: [-0.95, 0.75, 0.05],
      color: "#22d3ee",
    },
    {
      id: "liver",
      name: "Hepatic System",
      system: "Glucose Output & Storage",
      status: isCritical ? "STRESSED" : "NORMAL",
      value: `${isCritical ? "+34%" : "+12%"} Gluconeogenesis`,
      metric: "Hepatic Insulin Resistance",
      description: "Endogenous glucose production rates and nocturnal dawn-phenomenon counter-regulation.",
      position3D: [-0.35, 0.55, 0.25],
      color: isCritical ? "#fbbf24" : "#34d399",
    },
    {
      id: "heart",
      name: "Cardiovascular System",
      system: "Vascular & Autonomic Tone",
      status: patient.fasting_glucose > 200 ? "STRESSED" : "NORMAL",
      value: `${isCritical ? "34" : "56"} ms rMSSD`,
      metric: "Vagal Autonomic Modulation",
      description: "Heart rate variability indicator of systemic autonomic stress and microvascular risk.",
      position3D: [0.15, 0.85, 0.28],
      color: patient.fasting_glucose > 200 ? "#fb7185" : "#34d399",
    },
    {
      id: "muscle",
      name: "Peripheral Muscle Bed",
      system: "Skeletal GLUT4 Kinetics",
      status: "NORMAL",
      value: "1.8x Glucose Sink",
      metric: "Insulin-Independent Clearance",
      description: "Activity-dependent muscle glucose disposal via contractile GLUT4 translocation.",
      position3D: [0.4, -0.6, 0.15],
      color: "#34d399",
    },
    {
      id: "brain",
      name: "Hypothalamus / Sleep",
      system: "Circadian Metabolic Master",
      status: "NORMAL",
      value: "Circadian Sync Active",
      metric: "Nocturnal Hypo Protection",
      description: "Central autonomic control mediating cortisol awakening surge and nocturnal sympathovagal balance.",
      position3D: [0, 1.6, 0.1],
      color: "#a78bfa",
    },
  ];
}
