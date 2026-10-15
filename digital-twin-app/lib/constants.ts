export const COLORS = {
  bg:      "rgb(var(--color-bg))",
  card:    "rgb(var(--color-card))",
  surface: "rgb(var(--color-surface))",
  inset:   "rgb(var(--color-inset))",
  line:    "rgb(var(--color-line))",
  text:    "rgb(var(--color-text))",
  muted:   "rgb(var(--color-muted))",
  cyan:    "rgb(var(--color-cyan))",
  emerald: "rgb(var(--color-emerald))",
  violet:  "rgb(var(--color-violet))",
  amber:   "rgb(var(--color-amber))",
  rose:    "rgb(var(--color-rose))",
} as const;

export const RISK_COLORS = {
  LOW:      { hex: "#22d3ee", tailwind: "cyan",    glow: "glow-cyan",    fill: "duo-fill-cyan",    colorVar: "--color-cyan"    },
  MODERATE: { hex: "#fbbf24", tailwind: "amber",   glow: "glow-amber",   fill: "duo-fill-amber",   colorVar: "--color-amber"   },
  HIGH:     { hex: "#fb7185", tailwind: "rose",    glow: "glow-rose",    fill: "duo-fill-rose",    colorVar: "--color-rose"    },
  CRITICAL: { hex: "#a78bfa", tailwind: "violet",  glow: "glow-violet",  fill: "duo-fill-violet",  colorVar: "--color-violet"  },
  NORMAL:   { hex: "#34d399", tailwind: "emerald", glow: "glow-emerald", fill: "duo-fill-emerald", colorVar: "--color-emerald" },
} as const;

export const CGM_THRESHOLDS = {
  CRITICAL_LOW:  55,
  LOW:           70,
  TARGET_LOW:    80,
  TARGET_HIGH:  180,
  HIGH:         250,
  CRITICAL_HIGH: 350,
} as const;

export const MODEL_INFO = {
  name:             "XGBoost + Bagging Ensemble",
  version:          "v0.1.0",
  horizon:          "120 minutes",
  features:         "12 × 5-min CGM lags, HRV (rMSSD), step cadence, time-of-day, HbA1c, BMI, age",
  dataset:          "Synthetic (Synthea EHR + Simulated Dexcom G7 CGM)",
  confidence_gate:  0.70,
  biophysical_base: "Bergman Minimal Model & UVA/Padova Metabolic Simulator",
} as const;

export const SCIENTIFIC_CITATIONS = [
  {
    category: "Physiological Digital Twin Foundation",
    citation: "Bergman RN, Ider YZ, Bowden CR, Cobelli C. Quantitative estimation of insulin sensitivity. American Journal of Physiology. 1979;236(6):E667-E677.",
    application: "Mathematical formulation of two-compartment glucose-insulin kinetics and tissue insulin sensitivity index.",
  },
  {
    category: "In-Silico Simulation Standard",
    citation: "Dalla Man C, Raimondo DM, Rizza RA, Cobelli C. GIM, the glucose insulin model: an in silico simulator of the dual-tracer meal test. IEEE Transactions on Biomedical Engineering. 2007;54(10):1740-1749.",
    application: "FDA-accepted benchmark for in-silico meal absorption, subcutaneous interstitial diffusion, and counterfactual simulation.",
  },
  {
    category: "Epidemiological T2D Reference (India)",
    citation: "Anjana RM, et al. Metabolic non-communicable disease health report in India: the ICMR-INDIAB national cross-sectional study. The Lancet Diabetes & Endocrinology. 2023;11(7):474-489.",
    application: "Clinical baseline establishing 101 million diagnosed T2D and 136 million prediabetes prevalence in India.",
  },
  {
    category: "Machine Learning Classifier",
    citation: "Chen T, Guestrin C. XGBoost: A scalable tree boosting system. Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining. 2016;785-794.",
    application: "Gradient-boosted decision trees for binary prediction of 120-minute post-prandial glycemic excursions.",
  },
  {
    category: "Ensemble Variance Reduction",
    citation: "Breiman L. Bagging predictors. Machine Learning. 1996;24(2):123-140.",
    application: "Bootstrap aggregation to reduce variance and compute empirical confidence bounds on spike likelihood.",
  },
  {
    category: "Synthetic EHR Generation",
    citation: "Walonoski J, et al. Synthea: an open-source patient population simulator. Journal of the American Medical Informatics Association (JAMIA). 2018;25(3):230-238.",
    application: "Anonymized, synthetic patient generation for strict DPDP Act 2023 and HIPAA sandbox compliance.",
  },
] as const;

export const GLOSSARY: Record<string, string> = {
  HbA1c: "Glycated hemoglobin measuring average blood glucose over 2 to 3 months. Clinical target: < 7.0%.",
  "Fasting Glucose": "Plasma glucose concentration measured after an overnight fast (≥ 8 hours). Normal range: 70–99 mg/dL.",
  CGM: "Continuous Glucose Monitor measuring subcutaneous interstitial fluid glucose at 5-minute intervals.",
  "ISF Lag": "Physiological delay (5 to 15 minutes) for glucose to diffuse from blood plasma to interstitial fluid.",
  "Time in Range": "Percentage of readings within the target glycemic band (80–180 mg/dL). Clinical target: > 70%.",
  HRV: "Heart Rate Variability (rMSSD in milliseconds) quantifying autonomic parasympathetic nervous system tone.",
  "XGBoost Ensemble": "Supervised machine learning ensemble predicting blood glucose spikes (≥ 180 mg/dL) 120 minutes in advance.",
  "Clinical Safety Gate": "Rule-based safety check verifying forecast confidence, threshold breach, and clinician review requirements.",
  GLUT4: "Glucose transporter protein translocating to skeletal muscle cell membranes during physical exertion.",
  "Monitored Patient Twins": "Total synthetic patient digital twins actively monitored through EHR and wearable data streams.",
  "Active Spike Alerts": "Number of patients with forecasted glucose spikes (≥ 180 mg/dL) within the next 120 minutes.",
  "Predicted Spikes (Today)": "Cumulative count of validated glycemic spike forecasts generated during the current 24-hour cycle.",
  "High & Critical Risk Patients": "Patient twins stratified into high or critical clinical risk categories requiring clinician review.",
};
