import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from collections import defaultdict

def normalize_betting_odds(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes normalized implied probabilities from Bet365 odds by removing bookmaker margin.
    """
    df = df.copy()
    
    odds_cols = ['B365H', 'B365D', 'B365A']
    has_odds = df[odds_cols].notna().all(axis=1) & (df['B365H'] > 1.0) & (df['B365D'] > 1.0) & (df['B365A'] > 1.0)
    
    df['has_bet365'] = has_odds
    df['prob_b365_h'] = np.nan
    df['prob_b365_d'] = np.nan
    df['prob_b365_a'] = np.nan
    df['odds_market_pick'] = None

    if has_odds.any():
        raw_inv_h = 1.0 / df.loc[has_odds, 'B365H']
        raw_inv_d = 1.0 / df.loc[has_odds, 'B365D']
        raw_inv_a = 1.0 / df.loc[has_odds, 'B365A']
        
        overround = raw_inv_h + raw_inv_d + raw_inv_a
        
        df.loc[has_odds, 'prob_b365_h'] = raw_inv_h / overround
        df.loc[has_odds, 'prob_b365_d'] = raw_inv_d / overround
        df.loc[has_odds, 'prob_b365_a'] = raw_inv_a / overround
        
        # Determine market predicted class (highest implied probability)
        probs = df.loc[has_odds, ['prob_b365_h', 'prob_b365_d', 'prob_b365_a']].values
        classes = np.array(['H', 'D', 'A'])
        df.loc[has_odds, 'odds_market_pick'] = classes[np.argmax(probs, axis=1)]

    return df

def generate_chronological_features(df: pd.DataFrame, window_size: int = 5) -> pd.DataFrame:
    """
    Strictly chronological feature generation using rolling match history.
    Batch updates same-day fixtures after all features for that date are extracted,
    ensuring ZERO same-day or future data leakage.
    """
    df = df.sort_values(by=['date', 'id']).reset_index(drop=True)
    df = normalize_betting_odds(df)
    
    # State tracking per team
    # Each record in history: {"date": date, "is_home": bool, "goals_for": int, "goals_against": int, "points": int, "won": int}
    team_history = defaultdict(list)
    team_venue_history = defaultdict(lambda: {"home": [], "away": []})
    
    feature_rows = []
    
    # Group matches by date so all fixtures on day D are processed before state updates
    for match_date, day_matches in df.groupby('date', sort=True):
        day_updates = []
        
        for idx, row in day_matches.iterrows():
            h_team = row['home_team_name']
            a_team = row['away_team_name']
            
            # --- Extract historical features BEFORE current match ---
            h_hist = team_history[h_team]
            a_hist = team_history[a_team]
            
            h_venue_hist = team_venue_history[h_team]["home"]
            a_venue_hist = team_venue_history[a_team]["away"]
            
            # Helper for rolling metrics
            def calc_metrics(hist, n):
                recent = hist[-n:] if len(hist) >= n else hist
                if not recent:
                    return 0.0, 0.0, 0.0, 0.0, 0.0, 0
                pts = sum(m['points'] for m in recent)
                gf = sum(m['goals_for'] for m in recent)
                ga = sum(m['goals_against'] for m in recent)
                wins = sum(m['won'] for m in recent)
                cnt = len(recent)
                return pts / cnt, wins / cnt, gf / cnt, ga / cnt, (gf - ga) / cnt, len(hist)

            h_pts, h_win_rate, h_gf, h_ga, h_gd, h_total_games = calc_metrics(h_hist, window_size)
            a_pts, a_win_rate, a_gf, a_ga, a_gd, a_total_games = calc_metrics(a_hist, window_size)
            
            h_v_pts, _, h_v_gf, h_v_ga, h_v_gd, _ = calc_metrics(h_venue_hist, window_size)
            a_v_pts, _, a_v_gf, a_v_ga, a_v_gd, _ = calc_metrics(a_venue_hist, window_size)
            
            # Days of rest
            h_rest = (match_date - h_hist[-1]['date']).days if h_hist else 14
            a_rest = (match_date - a_hist[-1]['date']).days if a_hist else 14
            h_rest = min(max(h_rest, 1), 30) # clamp
            a_rest = min(max(a_rest, 1), 30)
            
            feat = {
                "id": row['id'],
                "home_recent_points": h_pts,
                "home_recent_win_rate": h_win_rate,
                "home_recent_goals_scored": h_gf,
                "home_recent_goals_conceded": h_ga,
                "home_recent_goal_diff": h_gd,
                "home_games_played": h_total_games,
                "home_venue_recent_points": h_v_pts,
                "home_venue_recent_goal_diff": h_v_gd,
                "home_rest_days": h_rest,
                
                "away_recent_points": a_pts,
                "away_recent_win_rate": a_win_rate,
                "away_recent_goals_scored": a_gf,
                "away_recent_goals_conceded": a_ga,
                "away_recent_goal_diff": a_gd,
                "away_games_played": a_total_games,
                "away_venue_recent_points": a_v_pts,
                "away_venue_recent_goal_diff": a_v_gd,
                "away_rest_days": a_rest,
                
                # Differentials
                "diff_recent_points": h_pts - a_pts,
                "diff_recent_goal_diff": h_gd - a_gd,
                "diff_recent_win_rate": h_win_rate - a_win_rate,
                "diff_venue_points": h_v_pts - a_v_pts,
                "diff_rest_days": h_rest - a_rest
            }
            feature_rows.append(feat)
            
            # Prepare state update to be applied AFTER this date is processed
            h_goals = row['home_team_goal']
            a_goals = row['away_team_goal']
            if h_goals > a_goals:
                h_p, a_p = 3, 0
                h_w, a_w = 1, 0
            elif h_goals == a_goals:
                h_p, a_p = 1, 1
                h_w, a_w = 0, 0
            else:
                h_p, a_p = 0, 3
                h_w, a_w = 0, 1
                
            day_updates.append((h_team, {
                "date": match_date, "is_home": True, "goals_for": h_goals, 
                "goals_against": a_goals, "points": h_p, "won": h_w
            }, "home"))
            
            day_updates.append((a_team, {
                "date": match_date, "is_home": False, "goals_for": a_goals, 
                "goals_against": h_goals, "points": a_p, "won": a_w
            }, "away"))
            
        # Apply day updates to state
        for team, rec, venue_type in day_updates:
            team_history[team].append(rec)
            team_venue_history[team][venue_type].append(rec)
            
    feat_df = pd.DataFrame(feature_rows)
    merged_df = pd.merge(df, feat_df, on='id', how='left')
    return merged_df

FORM_FEATURE_COLS = [
    "home_recent_points", "home_recent_win_rate", "home_recent_goals_scored",
    "home_recent_goals_conceded", "home_recent_goal_diff", "home_games_played",
    "home_venue_recent_points", "home_venue_recent_goal_diff", "home_rest_days",
    "away_recent_points", "away_recent_win_rate", "away_recent_goals_scored",
    "away_recent_goals_conceded", "away_recent_goal_diff", "away_games_played",
    "away_venue_recent_points", "away_venue_recent_goal_diff", "away_rest_days",
    "diff_recent_points", "diff_recent_goal_diff", "diff_recent_win_rate",
    "diff_venue_points", "diff_rest_days"
]

ODDS_FEATURE_COLS = [
    "prob_b365_h", "prob_b365_d", "prob_b365_a"
]
