import os
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path

from server.ds.data_loader import prepare_match_dataset
from server.ds.eda import (
    compute_overall_summary,
    compute_league_breakdown,
    compute_season_trends,
    compute_goal_distributions,
    compute_team_home_advantage
)
from server.ds.features import (
    generate_chronological_features,
    FORM_FEATURE_COLS,
    ODDS_FEATURE_COLS
)
from server.ds.models import (
    MajorityBaseline,
    MarketOddsBaseline,
    build_logistic_pipeline,
    build_gradient_boosting_pipeline
)
from server.ds.evaluation import (
    evaluate_predictions,
    compute_date_clustered_bootstrap_ci
)

def run_full_pipeline(
    db_path: str = "data/database.sqlite",
    artifacts_dir: str = "artifacts"
):
    print("🚀 [1/6] Loading and validating database...")
    df_raw = prepare_match_dataset(db_path)
    print(f"Loaded {len(df_raw)} total valid matches across {df_raw['league_name'].nunique()} leagues.")

    artifacts_path = Path(artifacts_dir)
    artifacts_path.mkdir(parents=True, exist_ok=True)
    models_path = artifacts_path / "models"
    models_path.mkdir(parents=True, exist_ok=True)

    print("📊 [2/6] Computing Exploratory Data Analysis metrics...")
    eda_summary = {
        "overall": compute_overall_summary(df_raw),
        "leagues": compute_league_breakdown(df_raw),
        "seasons": compute_season_trends(df_raw),
        "goal_distributions": compute_goal_distributions(df_raw),
        "team_rankings": compute_team_home_advantage(df_raw)
    }
    with open(artifacts_path / "eda_summary.json", "w") as f:
        json.dump(eda_summary, f, indent=2)

    print("⏱️ [3/6] Generating chronological features (zero leakage)...")
    df_feat = generate_chronological_features(df_raw, window_size=5)

    print("🔒 [4/6] Applying strict temporal partitions...")
    train_mask = df_feat['season'].isin([
        '2008/2009', '2009/2010', '2010/2011', '2011/2012', '2012/2013', '2013/2014'
    ])
    val_mask = df_feat['season'] == '2014/2015'
    test_mask = df_feat['season'] == '2015/2016'

    df_train = df_feat[train_mask].copy()
    df_val = df_feat[val_mask].copy()
    df_test = df_feat[test_mask].copy()

    # Filter to matched Bet365 odds rows for clean apples-to-apples evaluation
    train_odds_mask = df_train['has_bet365']
    val_odds_mask = df_val['has_bet365']
    test_odds_mask = df_test['has_bet365']

    df_train_odds = df_train[train_odds_mask].copy()
    df_val_odds = df_val[val_odds_mask].copy()
    df_test_odds = df_test[test_odds_mask].copy()

    print(f"Train matches: {len(df_train)} (with odds: {len(df_train_odds)})")
    print(f"Validation matches: {len(df_val)} (with odds: {len(df_val_odds)})")
    print(f"Test matches: {len(df_test)} (with odds: {len(df_test_odds)})")

    print("🤖 [5/6] Training baseline and ML models...")
    X_train_form = df_train_odds[FORM_FEATURE_COLS].values
    X_train_combined = df_train_odds[FORM_FEATURE_COLS + ODDS_FEATURE_COLS].values
    y_train = df_train_odds['result'].values

    X_test_form = df_test_odds[FORM_FEATURE_COLS].values
    X_test_odds_only = df_test_odds[ODDS_FEATURE_COLS].values
    X_test_combined = df_test_odds[FORM_FEATURE_COLS + ODDS_FEATURE_COLS].values
    y_test = df_test_odds['result'].values

    # 1. Majority Baseline
    majority_model = MajorityBaseline().fit(X_train_form, y_train)
    
    # 2. Market Odds Baseline
    market_model = MarketOddsBaseline()
    
    # 3. Form-Only Logistic Regression
    lr_form = build_logistic_pipeline()
    lr_form.fit(X_train_form, y_train)
    
    # 4. Form-Only Gradient Boosting
    gb_form = build_gradient_boosting_pipeline()
    gb_form.fit(X_train_form, y_train)

    # 5. Odds-Enhanced Logistic Regression
    lr_odds_enhanced = build_logistic_pipeline()
    lr_odds_enhanced.fit(X_train_combined, y_train)

    # 6. Odds-Enhanced Gradient Boosting
    gb_odds_enhanced = build_gradient_boosting_pipeline()
    gb_odds_enhanced.fit(X_train_combined, y_train)

    # Save trained models
    with open(models_path / "majority_model.pkl", "wb") as f:
        pickle.dump(majority_model, f)
    with open(models_path / "lr_form.pkl", "wb") as f:
        pickle.dump(lr_form, f)
    with open(models_path / "lr_odds_enhanced.pkl", "wb") as f:
        pickle.dump(lr_odds_enhanced, f)
    with open(models_path / "gb_odds_enhanced.pkl", "wb") as f:
        pickle.dump(gb_odds_enhanced, f)

    print("📈 [6/6] Evaluating on untouched 2015/16 test set & running bootstrap CIs...")
    models_dict = {
        "Majority Baseline": {
            "pred": majority_model.predict(X_test_form),
            "prob": majority_model.predict_proba(X_test_form),
            "type": "baseline",
            "features": "None"
        },
        "Betting Market Baseline (Normalized Odds)": {
            "pred": market_model.predict(X_test_odds_only),
            "prob": market_model.predict_proba(X_test_odds_only),
            "type": "market",
            "features": "Bet365 Implied Probs"
        },
        "Form-Only Logistic Regression": {
            "pred": lr_form.predict(X_test_form),
            "prob": lr_form.predict_proba(X_test_form),
            "type": "form",
            "features": "Rolling 5-Match Form + Venue + Rest"
        },
        "Form-Only Gradient Boosting": {
            "pred": gb_form.predict(X_test_form),
            "prob": gb_form.predict_proba(X_test_form),
            "type": "form",
            "features": "Rolling 5-Match Form + Venue + Rest"
        },
        "Odds-Enhanced Logistic Regression (Selected)": {
            "pred": lr_odds_enhanced.predict(X_test_combined),
            "prob": lr_odds_enhanced.predict_proba(X_test_combined),
            "type": "odds_enhanced",
            "features": "Rolling Form + Normalized Bet365 Odds"
        },
        "Odds-Enhanced Gradient Boosting": {
            "pred": gb_odds_enhanced.predict(X_test_combined),
            "prob": gb_odds_enhanced.predict_proba(X_test_combined),
            "type": "odds_enhanced",
            "features": "Rolling Form + Normalized Bet365 Odds"
        }
    }

    eval_results = {}
    for name, data in models_dict.items():
        res = evaluate_predictions(y_test, data["pred"], data["prob"])
        res["model_type"] = data["type"]
        res["features_used"] = data["features"]
        eval_results[name] = res

    # Bootstrap CI for Macro-F1 comparison (Selected vs Market)
    bootstrap_ci = compute_date_clustered_bootstrap_ci(
        df_test_odds,
        models_dict["Odds-Enhanced Logistic Regression (Selected)"]["pred"],
        models_dict["Betting Market Baseline (Normalized Odds)"]["pred"],
        n_bootstraps=1000
    )

    # Extract logistic regression feature weights
    lr_clf = lr_odds_enhanced.named_steps['classifier']
    feat_names = FORM_FEATURE_COLS + ODDS_FEATURE_COLS
    feature_coefficients = {}
    for cls_idx, cls_name in enumerate(['H', 'D', 'A']):
        coefs = lr_clf.coef_[cls_idx]
        feature_coefficients[cls_name] = [
            {"feature": feat, "weight": round(float(w), 4)}
            for feat, w in sorted(zip(feat_names, coefs), key=lambda x: abs(x[1]), reverse=True)
        ]

    final_metrics_payload = {
        "test_sample_size": len(df_test_odds),
        "test_season": "2015/2016",
        "models": eval_results,
        "macro_f1_lift": {
            "selected_model": "Odds-Enhanced Logistic Regression (Selected)",
            "baseline_model": "Betting Market Baseline (Normalized Odds)",
            "macro_f1_selected": eval_results["Odds-Enhanced Logistic Regression (Selected)"]["macro_f1"],
            "macro_f1_market": eval_results["Betting Market Baseline (Normalized Odds)"]["macro_f1"],
            "lift": round(eval_results["Odds-Enhanced Logistic Regression (Selected)"]["macro_f1"] - eval_results["Betting Market Baseline (Normalized Odds)"]["macro_f1"], 4),
            "bootstrap_ci_95": bootstrap_ci
        },
        "feature_coefficients": feature_coefficients
    }

    with open(artifacts_path / "metrics.json", "w") as f:
        json.dump(final_metrics_payload, f, indent=2)

    # Save detailed 2015/16 fixtures with predictions
    fixtures_list = []
    sel_probs = models_dict["Odds-Enhanced Logistic Regression (Selected)"]["prob"]
    sel_preds = models_dict["Odds-Enhanced Logistic Regression (Selected)"]["pred"]
    
    for i, (_, row) in enumerate(df_test_odds.iterrows()):
        fixtures_list.append({
            "id": int(row['id']),
            "date": str(row['date'].date()),
            "league_name": row['league_name'],
            "country_name": row['country_name'],
            "home_team": row['home_team_name'],
            "away_team": row['away_team_name'],
            "home_goals": int(row['home_team_goal']),
            "away_goals": int(row['away_team_goal']),
            "actual_result": row['result'],
            "odds": {
                "b365_h": float(row['B365H']) if pd.notna(row['B365H']) else None,
                "b365_d": float(row['B365D']) if pd.notna(row['B365D']) else None,
                "b365_a": float(row['B365A']) if pd.notna(row['B365A']) else None,
                "implied_prob_h": round(float(row['prob_b365_h']), 3) if pd.notna(row['prob_b365_h']) else None,
                "implied_prob_d": round(float(row['prob_b365_d']), 3) if pd.notna(row['prob_b365_d']) else None,
                "implied_prob_a": round(float(row['prob_b365_a']), 3) if pd.notna(row['prob_b365_a']) else None
            },
            "form": {
                "home_recent_points": round(float(row['home_recent_points']), 2),
                "away_recent_points": round(float(row['away_recent_points']), 2),
                "home_recent_gd": round(float(row['home_recent_goal_diff']), 2),
                "away_recent_gd": round(float(row['away_recent_goal_diff']), 2),
                "home_rest_days": int(row['home_rest_days']),
                "away_rest_days": int(row['away_rest_days'])
            },
            "selected_model_prediction": {
                "predicted_result": sel_preds[i],
                "prob_h": round(float(sel_probs[i, 0]), 3),
                "prob_d": round(float(sel_probs[i, 1]), 3),
                "prob_a": round(float(sel_probs[i, 2]), 3),
                "is_correct": bool(sel_preds[i] == row['result'])
            }
        })

    with open(artifacts_path / "matches_test_2015_16.json", "w") as f:
        json.dump(fixtures_list, f, indent=2)

    print("✅ Pipeline execution complete! Artifacts saved to:", artifacts_dir)

if __name__ == "__main__":
    run_full_pipeline()
