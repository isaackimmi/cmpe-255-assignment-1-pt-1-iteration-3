from fastapi import APIRouter, HTTPException
import json
from pathlib import Path

router = APIRouter(prefix="/api/eda", tags=["EDA"])

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent / "artifacts"

def load_eda():
    eda_file = ARTIFACTS_DIR / "eda_summary.json"
    if not eda_file.exists():
        raise HTTPException(status_code=404, detail="EDA artifacts not found. Please run pipeline first.")
    with open(eda_file, "r") as f:
        return json.load(f)

@router.get("/summary")
def get_summary():
    data = load_eda()
    return data["overall"]

@router.get("/leagues")
def get_leagues():
    data = load_eda()
    return data["leagues"]

@router.get("/seasons")
def get_seasons():
    data = load_eda()
    return data["seasons"]

@router.get("/goal-distributions")
def get_goal_distributions():
    data = load_eda()
    return data["goal_distributions"]

@router.get("/teams")
def get_teams():
    data = load_eda()
    return data["team_rankings"]
