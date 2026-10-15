"""
Synthetic data generator for the Digital Twin PoC.
Produces 50 patients with Synthea-style EHR + 7-day CGM time series.
Run: python scripts/generate_demo_data.py
"""
import json, csv, random, math, os
from datetime import datetime, timedelta

random.seed(42)

PATIENTS_FILE = os.path.join(os.path.dirname(__file__), "../backend/app/data/patients.json")
CGM_FILE      = os.path.join(os.path.dirname(__file__), "../backend/app/data/cgm_series.json")

MEDICATIONS = [
    "Metformin 500mg", "Metformin 1000mg", "Glipizide 5mg",
    "Sitagliptin 100mg", "Empagliflozin 10mg", "Insulin Glargine"
]
CONDITIONS = ["Type 2 Diabetes", "Hypertension", "Dyslipidemia", "Obesity"]

def random_patient(pid: int):
    age  = random.randint(35, 75)
    bmi  = round(random.uniform(24.0, 42.0), 1)
    hba1c = round(random.uniform(6.5, 11.0), 1)
    fasting_glucose = round(random.uniform(100, 280), 1)
    risk_score = round(
        0.3 * (hba1c - 6.5) / 4.5 +
        0.2 * (bmi - 24.0) / 18.0 +
        0.25 * (fasting_glucose - 100) / 180 +
        0.1 * (age - 35) / 40 +
        random.uniform(-0.1, 0.2),
        3
    )
    risk_score = max(0.0, min(1.0, risk_score))
    return {
        "id": f"PT-{pid:04d}",
        "name": f"Patient {pid:04d}",
        "age": age,
        "sex": random.choice(["M", "F"]),
        "bmi": bmi,
        "hba1c": hba1c,
        "fasting_glucose": fasting_glucose,
        "medications": random.sample(MEDICATIONS, k=random.randint(1, 3)),
        "conditions": random.sample(CONDITIONS, k=random.randint(1, 3)),
        "risk_score": risk_score,
        "risk_label": _risk_label(risk_score),
        "last_seen": (datetime.now() - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d"),
    }

def _risk_label(score: float) -> str:
    if score < 0.25: return "LOW"
    if score < 0.5:  return "MODERATE"
    if score < 0.75: return "HIGH"
    return "CRITICAL"

def cgm_trace(patient_id: str, hba1c: float, bmi: float):
    """Generate 7 days of 5-min CGM readings with realistic spikes."""
    readings = []
    base = 90 + (hba1c - 6.5) * 12 + (bmi - 24) * 0.8
    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    start = now - timedelta(days=7)
    t = start
    glucose = base
    while t <= now:
        hour = t.hour
        # Meal spikes: 7-8h, 12-13h, 18-19h
        spike = 0.0
        for meal_hour in [7, 12, 18]:
            delta = hour - meal_hour
            if 0 <= delta <= 2:
                spike += 40 * math.exp(-((delta - 0.75) ** 2) / 0.3) * random.uniform(0.7, 1.3)
        # Random walk
        glucose += random.gauss(0, 2.5) + spike * 0.25
        glucose = max(60, min(350, glucose + (base - glucose) * 0.04))
        hrv   = round(max(15, random.gauss(52, 10)), 1)
        steps = max(0, int(random.gauss(300, 120) if 6 <= hour <= 22 else 0))
        sleep_stage = "N2" if 0 <= hour <= 5 else ("N3" if hour == 3 else "WAKE")
        readings.append({
            "patient_id": patient_id,
            "timestamp": t.isoformat(),
            "glucose_mgdl": round(glucose, 1),
            "hrv_ms": hrv,
            "steps": steps,
            "sleep_stage": sleep_stage,
        })
        t += timedelta(minutes=5)
    return readings

def main():
    os.makedirs(os.path.dirname(PATIENTS_FILE), exist_ok=True)
    patients = [random_patient(i) for i in range(1, 51)]
    with open(PATIENTS_FILE, "w") as f:
        json.dump(patients, f, indent=2)
    print(f"Wrote {len(patients)} patients → {PATIENTS_FILE}")

    all_cgm = []
    for p in patients[:10]:
        trace = cgm_trace(p["id"], p["hba1c"], p["bmi"])
        all_cgm.append({"patient_id": p["id"], "readings": trace})
        print(f"  {p['id']}: {len(trace)} CGM points")
    with open(CGM_FILE, "w") as f:
        json.dump(all_cgm, f)
    print(f"Wrote CGM traces → {CGM_FILE}")

if __name__ == "__main__":
    main()
