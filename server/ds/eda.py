import pandas as pd
import numpy as np
from typing import Dict, Any, List

def compute_overall_summary(df: pd.DataFrame) -> Dict[str, Any]:
    total_matches = len(df)
    results = df['result'].value_counts()
    
    h_count = int(results.get('H', 0))
    d_count = int(results.get('D', 0))
    a_count = int(results.get('A', 0))
    
    h_pct = (h_count / total_matches) * 100 if total_matches > 0 else 0
    d_pct = (d_count / total_matches) * 100 if total_matches > 0 else 0
    a_pct = (a_count / total_matches) * 100 if total_matches > 0 else 0

    avg_home_goals = float(df['home_team_goal'].mean())
    avg_away_goals = float(df['away_team_goal'].mean())
    avg_total_goals = float(df['total_goals'].mean())
    home_goal_diff = avg_home_goals - avg_away_goals

    return {
        "total_matches": total_matches,
        "outcomes": {
            "home_wins": h_count,
            "home_win_pct": round(h_pct, 2),
            "draws": d_count,
            "draw_pct": round(d_pct, 2),
            "away_wins": a_count,
            "away_win_pct": round(a_pct, 2)
        },
        "goals": {
            "avg_home_goals": round(avg_home_goals, 3),
            "avg_away_goals": round(avg_away_goals, 3),
            "avg_total_goals": round(avg_total_goals, 3),
            "home_goal_advantage": round(home_goal_diff, 3)
        },
        "seasons_covered": sorted(df['season'].unique().tolist()),
        "leagues_covered": sorted(df['league_name'].unique().tolist())
    }

def compute_league_breakdown(df: pd.DataFrame) -> List[Dict[str, Any]]:
    league_stats = []
    
    for league, group in df.groupby('league_name'):
        n = len(group)
        counts = group['result'].value_counts()
        h_pct = (counts.get('H', 0) / n) * 100
        d_pct = (counts.get('D', 0) / n) * 100
        a_pct = (counts.get('A', 0) / n) * 100
        
        avg_h_goals = group['home_team_goal'].mean()
        avg_a_goals = group['away_team_goal'].mean()
        
        league_stats.append({
            "league_name": league,
            "country_name": group['country_name'].iloc[0] if 'country_name' in group else league,
            "total_matches": int(n),
            "home_win_pct": round(float(h_pct), 2),
            "draw_pct": round(float(d_pct), 2),
            "away_win_pct": round(float(a_pct), 2),
            "avg_home_goals": round(float(avg_h_goals), 2),
            "avg_away_goals": round(float(avg_a_goals), 2),
            "goal_advantage": round(float(avg_h_goals - avg_a_goals), 2)
        })

    # Sort descending by home win rate
    league_stats.sort(key=lambda x: x['home_win_pct'], reverse=True)
    return league_stats

def compute_season_trends(df: pd.DataFrame) -> List[Dict[str, Any]]:
    season_stats = []
    
    for season, group in df.groupby('season'):
        n = len(group)
        counts = group['result'].value_counts()
        h_pct = (counts.get('H', 0) / n) * 100
        d_pct = (counts.get('D', 0) / n) * 100
        a_pct = (counts.get('A', 0) / n) * 100
        
        avg_h_goals = group['home_team_goal'].mean()
        avg_a_goals = group['away_team_goal'].mean()
        
        season_stats.append({
            "season": season,
            "total_matches": int(n),
            "home_win_pct": round(float(h_pct), 2),
            "draw_pct": round(float(d_pct), 2),
            "away_win_pct": round(float(a_pct), 2),
            "avg_home_goals": round(float(avg_h_goals), 2),
            "avg_away_goals": round(float(avg_a_goals), 2),
            "goal_advantage": round(float(avg_h_goals - avg_a_goals), 2)
        })

    season_stats.sort(key=lambda x: x['season'])
    return season_stats

def compute_goal_distributions(df: pd.DataFrame) -> Dict[str, Any]:
    home_dist = df['home_team_goal'].value_counts().sort_index()
    away_dist = df['away_team_goal'].value_counts().sort_index()
    
    max_goals = max(int(df['home_team_goal'].max()), int(df['away_team_goal'].max()), 7)
    
    categories = list(range(0, min(max_goals + 1, 9)))
    
    chart_data = []
    for g in categories:
        h_count = int(home_dist.get(g, 0))
        a_count = int(away_dist.get(g, 0))
        chart_data.append({
            "goals": str(g) if g < 8 else "8+",
            "home_frequency": h_count,
            "away_frequency": a_count,
            "home_pct": round((h_count / len(df)) * 100, 2),
            "away_pct": round((a_count / len(df)) * 100, 2)
        })
        
    return {
        "distribution": chart_data
    }

def compute_team_home_advantage(df: pd.DataFrame, min_matches: int = 30) -> List[Dict[str, Any]]:
    team_records = {}
    
    for _, row in df.iterrows():
        h_team = row['home_team_name']
        a_team = row['away_team_name']
        res = row['result']
        
        if h_team not in team_records:
            team_records[h_team] = {"league": row['league_name'], "home_matches": 0, "home_wins": 0, "away_matches": 0, "away_wins": 0}
        if a_team not in team_records:
            team_records[a_team] = {"league": row['league_name'], "home_matches": 0, "home_wins": 0, "away_matches": 0, "away_wins": 0}
            
        team_records[h_team]["home_matches"] += 1
        if res == 'H':
            team_records[h_team]["home_wins"] += 1
            
        team_records[a_team]["away_matches"] += 1
        if res == 'A':
            team_records[a_team]["away_wins"] += 1

    team_stats = []
    for team, stats in team_records.items():
        if stats["home_matches"] >= min_matches and stats["away_matches"] >= min_matches:
            h_win_rate = (stats["home_wins"] / stats["home_matches"]) * 100
            a_win_rate = (stats["away_wins"] / stats["away_matches"]) * 100
            team_stats.append({
                "team_name": team,
                "league": stats["league"],
                "home_matches": stats["home_matches"],
                "home_win_pct": round(h_win_rate, 1),
                "away_matches": stats["away_matches"],
                "away_win_pct": round(a_win_rate, 1),
                "home_advantage_gap": round(h_win_rate - a_win_rate, 1)
            })
            
    team_stats.sort(key=lambda x: x['home_win_pct'], reverse=True)
    return team_stats
