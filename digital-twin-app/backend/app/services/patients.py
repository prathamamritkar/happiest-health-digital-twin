"""Patient data service — loads synthetic EHR + CGM data."""
import json, os
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent / "data"

_patients_cache: Optional[list] = None
_cgm_cache: Optional[dict] = None

def _load_patients():
    global _patients_cache
    if _patients_cache is None:
        p = DATA_DIR / "patients.json"
        if p.exists():
            with open(p) as f:
                _patients_cache = json.load(f)
        else:
            _patients_cache = []
    return _patients_cache

def _load_cgm():
    global _cgm_cache
    if _cgm_cache is None:
        p = DATA_DIR / "cgm_series.json"
        if p.exists():
            with open(p) as f:
                raw = json.load(f)
            _cgm_cache = {item["patient_id"]: item["readings"] for item in raw}
        else:
            _cgm_cache = {}
    return _cgm_cache

def get_all_patients():
    return _load_patients()

def get_patient(patient_id: str):
    for p in _load_patients():
        if p["id"] == patient_id:
            return p
    return None

def get_cgm_readings(patient_id: str, last_n: int = 288):
    """Return last N CGM readings (default 24h = 288 × 5min)."""
    cgm = _load_cgm()
    readings = cgm.get(patient_id, [])
    return readings[-last_n:] if len(readings) >= last_n else readings

def get_latest_cgm(patient_id: str, n: int = 12):
    """Last n readings (60-min window) for the predictor."""
    return get_cgm_readings(patient_id, last_n=n)

def invalidate_cache():
    global _patients_cache, _cgm_cache
    _patients_cache = None
    _cgm_cache = None
