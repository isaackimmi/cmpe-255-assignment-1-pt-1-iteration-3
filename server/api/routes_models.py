from fastapi import APIRouter, HTTPException
import json
from pathlib import Path

router = APIRouter(prefix="/api/models", tags=["Models"])

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent / "artifacts"

def load_metrics():
    metrics_file = ARTIFACTS_DIR / "metrics.json"
    if not metrics_file.exists():
        raise HTTPException(status_code=404, detail="Model metrics not found. Please run pipeline first.")
    with open(metrics_file, "r") as f:
        return json.load(f)

@router.get("/comparison")
def get_model_comparison():
    data = load_metrics()
    return {
        "test_sample_size": data["test_sample_size"],
        "test_season": data["test_season"],
        "models": data["models"],
        "macro_f1_lift": data["macro_f1_lift"]
    }

@router.get("/calibration")
def get_calibration():
    data = load_metrics()
    calibration_data = {}
    for model_name, info in data["models"].items():
        if "calibration" in info:
            calibration_data[model_name] = info["calibration"]
    return calibration_data

@router.get("/features")
def get_feature_coefficients():
    data = load_metrics()
    return data.get("feature_coefficients", {})
