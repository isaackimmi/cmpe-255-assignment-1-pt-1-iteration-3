from fastapi import APIRouter, HTTPException, Query
import json
from pathlib import Path
from typing import Optional

router = APIRouter(prefix="/api/matches", tags=["Matches"])

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent / "artifacts"

def load_fixtures():
    fixtures_file = ARTIFACTS_DIR / "matches_test_2015_16.json"
    if not fixtures_file.exists():
        raise HTTPException(status_code=404, detail="Fixtures not found. Please run pipeline first.")
    with open(fixtures_file, "r") as f:
        return json.load(f)

@router.get("")
def get_matches(
    league: Optional[str] = None,
    team: Optional[str] = None,
    result: Optional[str] = None,
    correct_only: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    matches = load_fixtures()
    
    if league and league != "All":
        matches = [m for m in matches if m["league_name"] == league]
    if team:
        t_lower = team.lower()
        matches = [m for m in matches if t_lower in m["home_team"].lower() or t_lower in m["away_team"].lower()]
    if result and result != "All":
        matches = [m for m in matches if m["actual_result"] == result]
    if correct_only is not None:
        matches = [m for m in matches if m["selected_model_prediction"]["is_correct"] == correct_only]

    total_count = len(matches)
    paginated = matches[offset:offset+limit]

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "matches": paginated
    }
