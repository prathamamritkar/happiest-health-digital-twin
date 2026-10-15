"""
Digital Twin FastAPI backend — main entry point.
Run: uvicorn backend.main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, math, random
from datetime import datetime, timedelta

from backend.app.models.schemas import (
    PatientSummary, CGMReading, PredictionResult,
    SimulateRequest, SimulateResult, DashboardMetrics,
)
from backend.app.services import patients as patient_svc
from backend.app.services import predictor as pred_svc

ALLOWED_ORIGINS = os.getenv(
    "DT_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app = FastAPI(
    title="Happiest Health Digital Twin API",
    description="Dual-stream (EHR + Wearable) glucose spike prediction service.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/readiness")
def readiness():
    pts = patient_svc.get_all_patients()
    return {"status": "ok", "patient_count": len(pts), "model": "XGBoost-Bagging-Ensemble v0.1"}

@app.get("/api/v1/dashboard", response_model=DashboardMetrics)
def dashboard():
    pts = patient_svc.get_all_patients()
    high_risk = [p for p in pts if p["risk_label"] in ("HIGH", "CRITICAL")]
    spikes = sum(1 for p in pts[:10] if p["risk_score"] > 0.55)
    return DashboardMetrics(
        total_patients=len(pts),
        pending_alerts=len(high_risk),
        spikes_predicted_today=spikes,
        high_risk_count=len(high_risk),
        model_version="XGBoost-Bagging-Ensemble v0.1",
        data_sources=["Synthea EHR (synthetic)", "Simulated CGM wearable stream"],
    )

@app.get("/api/v1/patients", response_model=list[PatientSummary])
def list_patients():
    return patient_svc.get_all_patients()

@app.get("/api/v1/patients/{patient_id}", response_model=PatientSummary)
def get_patient(patient_id: str):
    p = patient_svc.get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p

@app.get("/api/v1/patients/{patient_id}/cgm", response_model=list[CGMReading])
def get_cgm(patient_id: str, hours: int = 24):
    p = patient_svc.get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    n = hours * 12  # 5-min intervals
    readings = patient_svc.get_cgm_readings(patient_id, last_n=n)
    if not readings:
        raise HTTPException(status_code=404, detail="No CGM data for this patient")
    return [CGMReading(**r) for r in readings]

@app.get("/api/v1/patients/{patient_id}/predict", response_model=PredictionResult)
def predict(patient_id: str):
    p = patient_svc.get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    readings = patient_svc.get_latest_cgm(patient_id, n=12)
    if not readings:
        readings = _synthetic_window(p)
    result = pred_svc.predict_spike(readings, p)
    return PredictionResult(patient_id=patient_id, **result)

@app.post("/api/v1/patients/{patient_id}/simulate", response_model=SimulateResult)
def simulate(patient_id: str, req: SimulateRequest):
    p = patient_svc.get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    readings = patient_svc.get_latest_cgm(patient_id, n=12) or _synthetic_window(p)

    baseline = pred_svc.predict_spike(readings, p)
    base_prob = baseline["spike_probability"]

    # Intervention adjustments (heuristic model)
    carb_effect  = req.meal_carbs_g * 0.003
    exer_effect  = -req.exercise_minutes * 0.004
    med_effect   = -(req.medication_dose_factor - 1.0) * 0.15
    adj_prob = max(0.0, min(1.0, base_prob + carb_effect + exer_effect + med_effect))

    forecast = _build_forecast(readings[-1]["glucose_mgdl"] if readings else 120,
                               adj_prob, req)
    parts = []
    if req.meal_carbs_g > 0:
        parts.append(f"{req.meal_carbs_g:.0f}g carb meal")
    if req.exercise_minutes > 0:
        parts.append(f"{req.exercise_minutes:.0f} min exercise")
    if req.medication_dose_factor != 1.0:
        parts.append(f"{req.medication_dose_factor:.1f}× medication dose")
    summary = "Interventions: " + (", ".join(parts) if parts else "none")

    return SimulateResult(
        patient_id=patient_id,
        baseline_probability=round(base_prob, 4),
        adjusted_probability=round(adj_prob, 4),
        delta=round(adj_prob - base_prob, 4),
        forecast_points=forecast,
        intervention_summary=summary,
    )

def _synthetic_window(p: dict) -> list[dict]:
    """Fallback CGM window for patients without trace data."""
    rng = random.Random(hash(p["id"]))
    base = p.get("fasting_glucose", 120)
    readings = []
    g = base
    for i in range(12):
        g += rng.gauss(0, 3)
        g = max(70, min(300, g))
        readings.append({"glucose_mgdl": round(g, 1), "hrv_ms": rng.uniform(30, 70), "steps": rng.randint(0, 200)})
    return readings

def _build_forecast(current_glucose: float, spike_prob: float, req: SimulateRequest) -> list[dict]:
    """Build 24 forecast points (10-min intervals = 4h ahead)."""
    points = []
    g = current_glucose
    trend = spike_prob * 4.5 - (req.exercise_minutes * 0.08) + (req.meal_carbs_g * 0.06)
    now = datetime.now()
    for i in range(25):
        t = now + timedelta(minutes=i * 10)
        decay = math.exp(-i * 0.08)
        g += trend * decay + random.gauss(0, 1.5)
        g = max(55, min(350, g))
        points.append({"time": t.isoformat(), "glucose_mgdl": round(g, 1), "is_forecast": True})
    return points
