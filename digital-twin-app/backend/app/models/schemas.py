"""Pydantic schemas for Digital Twin API."""
from pydantic import BaseModel
from typing import Optional

class PatientSummary(BaseModel):
    id: str
    name: str
    age: int
    sex: str
    bmi: float
    hba1c: float
    fasting_glucose: float
    medications: list[str]
    conditions: list[str]
    risk_score: float
    risk_label: str
    last_seen: str

class CGMReading(BaseModel):
    patient_id: str
    timestamp: str
    glucose_mgdl: float
    hrv_ms: float
    steps: int
    sleep_stage: str

class PredictionResult(BaseModel):
    patient_id: str
    spike_probability: float
    prediction: str
    confidence: str
    requires_review: bool
    risk_level: str
    message: str

class SimulateRequest(BaseModel):
    patient_id: str
    meal_carbs_g: float = 0.0
    exercise_minutes: float = 0.0
    medication_dose_factor: float = 1.0

class SimulateResult(BaseModel):
    patient_id: str
    baseline_probability: float
    adjusted_probability: float
    delta: float
    forecast_points: list[dict]
    intervention_summary: str

class DashboardMetrics(BaseModel):
    total_patients: int
    pending_alerts: int
    spikes_predicted_today: int
    high_risk_count: int
    model_version: str
    data_sources: list[str]
