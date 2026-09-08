from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import pickle
import numpy as np
from pathlib import Path
from server.ds.features import FORM_FEATURE_COLS, ODDS_FEATURE_COLS

router = APIRouter(prefix="/api/predict", tags=["Predict"])

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent / "artifacts" / "models"

class MatchPredictionRequest(BaseModel):
    home_team: str = Field(..., example="Arsenal")
    away_team: str = Field(..., example="Chelsea")
    home_recent_points: float = Field(2.0, ge=0.0, le=3.0)
    away_recent_points: float = Field(1.6, ge=0.0, le=3.0)
    home_recent_win_rate: float = Field(0.6, ge=0.0, le=1.0)
    away_recent_win_rate: float = Field(0.4, ge=0.0, le=1.0)
    home_recent_goals_scored: float = Field(2.2, ge=0.0, le=6.0)
    away_recent_goals_scored: float = Field(1.4, ge=0.0, le=6.0)
    home_recent_goals_conceded: float = Field(0.8, ge=0.0, le=6.0)
    away_recent_goals_conceded: float = Field(1.2, ge=0.0, le=6.0)
    home_recent_goal_diff: float = Field(1.4, ge=-5.0, le=5.0)
    away_recent_goal_diff: float = Field(0.2, ge=-5.0, le=5.0)
    home_venue_recent_points: float = Field(2.4, ge=0.0, le=5.0)
    away_venue_recent_points: float = Field(1.2, ge=0.0, le=5.0)
    home_rest_days: int = Field(7, ge=1, le=30)
    away_rest_days: int = Field(4, ge=1, le=30)
    b365_h: Optional[float] = Field(2.10, ge=1.01)
    b365_d: Optional[float] = Field(3.40, ge=1.01)
    b365_a: Optional[float] = Field(3.60, ge=1.01)

def load_model(name: str):
    p = ARTIFACTS_DIR / f"{name}.pkl"
    if not p.exists():
        raise HTTPException(status_code=500, detail=f"Model {name} not found. Ensure pipeline has executed.")
    with open(p, "rb") as f:
        return pickle.load(f)

@router.post("")
def predict_match(req: MatchPredictionRequest):
    # Calculate differentials
    diff_pts = req.home_recent_points - req.away_recent_points
    diff_gd = req.home_recent_goal_diff - req.away_recent_goal_diff
    diff_wr = req.home_recent_win_rate - req.away_recent_win_rate
    diff_venue_pts = req.home_venue_recent_points - req.away_venue_recent_points
    diff_rest = req.home_rest_days - req.away_rest_days
    
    # Form feature vector
    form_values = [
        req.home_recent_points, req.home_recent_win_rate, req.home_recent_goals_scored,
        req.home_recent_goals_conceded, req.home_recent_goal_diff, 10, # default games played
        req.home_venue_recent_points, req.home_recent_goal_diff, req.home_rest_days,
        req.away_recent_points, req.away_recent_win_rate, req.away_recent_goals_scored,
        req.away_recent_goals_conceded, req.away_recent_goal_diff, 10,
        req.away_venue_recent_points, req.away_recent_goal_diff, req.away_rest_days,
        diff_pts, diff_gd, diff_wr, diff_venue_pts, diff_rest
    ]
    
    # Check if betting odds supplied
    if req.b365_h and req.b365_d and req.b365_a:
        inv_h = 1.0 / req.b365_h
        inv_d = 1.0 / req.b365_d
        inv_a = 1.0 / req.b365_a
        overround = inv_h + inv_d + inv_a
        
        prob_h = inv_h / overround
        prob_d = inv_d / overround
        prob_a = inv_a / overround
        
        combined_values = form_values + [prob_h, prob_d, prob_a]
        model = load_model("lr_odds_enhanced")
        probs = model.predict_proba([combined_values])[0]
        classes = model.classes_
    else:
        model = load_model("lr_form")
        probs = model.predict_proba([form_values])[0]
        classes = model.classes_
        
    prob_dict = {
        "H": round(float(probs[list(classes).index('H')]), 3),
        "D": round(float(probs[list(classes).index('D')]), 3),
        "A": round(float(probs[list(classes).index('A')]), 3)
    }
    
    predicted_result = max(prob_dict, key=prob_dict.get)
    
    label_map = {"H": "Home Win", "D": "Draw", "A": "Away Win"}
    
    return {
        "home_team": req.home_team,
        "away_team": req.away_team,
        "predicted_outcome": predicted_result,
        "predicted_label": label_map[predicted_result],
        "probabilities": prob_dict,
        "confidence": prob_dict[predicted_result]
    }
