"""
XGBoost glucose spike predictor.
Trains on synthetic CGM windows and predicts P(glucose > 180 mg/dL in 120 min).
"""
import numpy as np
import xgboost as xgb
from sklearn.ensemble import BaggingClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
import joblib, os, json, random
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent / "data" / "spike_model.joblib"
DATA_PATH  = Path(__file__).parent.parent.parent.parent / "backend" / "app" / "data"

def extract_features(readings: list[dict], ehr: dict) -> np.ndarray:
    """
    Feature vector from last 12 CGM readings (60 min window) + EHR static fields.
    Returns shape (N_features,).
    """
    glc = [r["glucose_mgdl"] for r in readings[-12:]]
    if len(glc) < 12:
        glc = [glc[0]] * (12 - len(glc)) + glc
    glc = np.array(glc, dtype=float)
    hrv    = np.mean([r.get("hrv_ms", 50) for r in readings[-6:]])
    steps  = sum(r.get("steps", 0) for r in readings[-12:])
    hour   = readings[-1].get("hour", 12) if "hour" in readings[-1] else 12

    features = [
        *glc,                            # 12 glucose readings
        glc[-1] - glc[0],               # trend over window
        float(np.std(glc)),             # variability
        float(np.max(glc)),             # peak
        float(np.min(glc)),             # trough
        hrv,                            # mean HRV
        steps,                          # step count in window
        float(hour),                    # time of day
        float(ehr.get("hba1c", 7.5)),   # HbA1c
        float(ehr.get("bmi", 27.0)),    # BMI
        float(ehr.get("age", 50)),      # age
    ]
    return np.array(features, dtype=float)

def generate_training_data(n_samples: int = 5000):
    """Generate synthetic labeled training data."""
    rng = random.Random(42)
    np.random.seed(42)
    X, y = [], []
    for _ in range(n_samples):
        base = rng.uniform(80, 200)
        trend = rng.uniform(-3, 8)  # rising trend → more likely spike
        readings = []
        g = base
        for i in range(12):
            g += trend + np.random.normal(0, 3)
            g = max(60, min(340, g))
            readings.append({
                "glucose_mgdl": g,
                "hrv_ms": rng.uniform(20, 80),
                "steps": rng.randint(0, 500),
            })
        ehr = {
            "hba1c": rng.uniform(6.5, 11.0),
            "bmi":   rng.uniform(24, 42),
            "age":   rng.randint(35, 75),
        }
        feat = extract_features(readings, ehr)
        # Label: spike if current glucose + 2h projected > 180
        projected = readings[-1]["glucose_mgdl"] + trend * 24 + np.random.normal(0, 15)
        label = 1 if projected > 180 else 0
        X.append(feat)
        y.append(label)
    return np.array(X), np.array(y)

def build_ensemble():
    """
    Ensemble: XGBoost base + BaggingClassifier wrapper for variance reduction.
    Uses both boosting (XGBoost) and bagging concepts as requested.
    """
    xgb_base = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,         # row bagging (exploration/exploitation balance)
        colsample_bytree=0.8,  # feature bagging
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
    )
    ensemble = BaggingClassifier(
        estimator=xgb_base,
        n_estimators=5,
        max_samples=0.8,
        bootstrap=True,
        random_state=42,
        n_jobs=-1,
    )
    return ensemble

def train_and_save():
    X, y = generate_training_data(6000)
    model = build_ensemble()
    scores = cross_val_score(model, X, y, cv=5, scoring="roc_auc")
    print(f"CV ROC-AUC: {scores.mean():.3f} ± {scores.std():.3f}")
    model.fit(X, y)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved → {MODEL_PATH}")
    return model

def load_or_train():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    print("No cached model found, training...")
    return train_and_save()

def predict_spike(readings: list[dict], ehr: dict) -> dict:
    """
    Returns prediction dict with probability, label, confidence flag.
    Probabilities below 0.70 are flagged for clinician review.
    """
    model = load_or_train()
    feat = extract_features(readings, ehr).reshape(1, -1)
    proba = model.predict_proba(feat)[0]
    spike_prob = float(proba[1])
    confidence = "HIGH" if spike_prob > 0.85 or spike_prob < 0.15 else (
        "MEDIUM" if spike_prob > 0.70 or spike_prob < 0.30 else "LOW"
    )
    return {
        "spike_probability": round(spike_prob, 4),
        "prediction": "SPIKE" if spike_prob >= 0.5 else "NORMAL",
        "confidence": confidence,
        "requires_review": spike_prob >= 0.30 and spike_prob <= 0.70,
        "risk_level": (
            "CRITICAL" if spike_prob >= 0.75 else
            "HIGH"     if spike_prob >= 0.5  else
            "MODERATE" if spike_prob >= 0.25 else
            "LOW"
        ),
        "message": _generate_message(spike_prob, readings[-1].get("glucose_mgdl", 120)),
    }

def _generate_message(prob: float, current_glucose: float) -> str:
    if prob >= 0.75:
        return f"High risk of glucose spike within 2 hours (current: {current_glucose:.0f} mg/dL). Consider immediate intervention."
    if prob >= 0.5:
        return f"Elevated spike probability detected (current: {current_glucose:.0f} mg/dL). Monitor closely."
    if prob >= 0.25:
        return f"Moderate risk. Current glucose {current_glucose:.0f} mg/dL is trending. Clinician review recommended."
    return f"Glucose levels appear stable (current: {current_glucose:.0f} mg/dL). Continue normal monitoring."
