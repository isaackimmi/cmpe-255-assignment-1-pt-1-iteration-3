import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_eda_summary():
    res = client.get("/api/eda/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_matches"] == 25979
    assert data["outcomes"]["home_win_pct"] > 40.0

def test_model_comparison():
    res = client.get("/api/models/comparison")
    assert res.status_code == 200
    data = res.json()
    assert "Odds-Enhanced Logistic Regression (Selected)" in data["models"]
    assert data["macro_f1_lift"]["lift"] > 0

def test_matches_endpoint():
    res = client.get("/api/matches?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) == 10
    assert data["total"] == 2905

def test_predict_endpoint():
    payload = {
        "home_team": "Arsenal",
        "away_team": "Chelsea",
        "home_recent_points": 2.2,
        "away_recent_points": 1.4,
        "home_recent_win_rate": 0.7,
        "away_recent_win_rate": 0.4,
        "home_recent_goals_scored": 2.5,
        "away_recent_goals_scored": 1.2,
        "home_recent_goals_conceded": 0.8,
        "away_recent_goals_conceded": 1.5,
        "home_recent_goal_diff": 1.7,
        "away_recent_goal_diff": -0.3,
        "home_venue_recent_points": 2.5,
        "away_venue_recent_points": 1.0,
        "home_rest_days": 7,
        "away_rest_days": 3,
        "b365_h": 1.95,
        "b365_d": 3.50,
        "b365_a": 4.00
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_outcome"] in ["H", "D", "A"]
    assert "probabilities" in data
    assert abs(sum(data["probabilities"].values()) - 1.0) < 0.05
