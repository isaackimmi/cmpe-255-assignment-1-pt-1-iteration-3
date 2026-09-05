import sqlite3
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, Any

def load_raw_data(db_path: str | Path) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Connects to the European Soccer database and extracts Match, Team, League, and Country tables.
    """
    db_path = Path(db_path)
    if not db_path.exists():
        raise FileNotFoundError(f"Database file not found at: {db_path}")

    conn = sqlite3.connect(db_path)
    try:
        match_df = pd.read_sql_query("SELECT * FROM Match", conn)
        team_df = pd.read_sql_query("SELECT * FROM Team", conn)
        league_df = pd.read_sql_query("SELECT * FROM League", conn)
        country_df = pd.read_sql_query("SELECT * FROM Country", conn)
    finally:
        conn.close()

    return match_df, team_df, league_df, country_df

def prepare_match_dataset(db_path: str | Path) -> pd.DataFrame:
    """
    Loads and cleans the matches, joining human-readable league and team names,
    deriving targets, and filtering invalid records.
    """
    match_df, team_df, league_df, country_df = load_raw_data(db_path)

    # Clean dates
    match_df['date'] = pd.to_datetime(match_df['date'])
    
    # Map country and league names
    league_map = dict(zip(league_df['id'], league_df['name']))
    country_map = dict(zip(country_df['id'], country_df['name']))
    match_df['league_name'] = match_df['league_id'].map(league_map)
    match_df['country_name'] = match_df['country_id'].map(country_map)

    # Map team names
    team_api_to_name = dict(zip(team_df['team_api_id'], team_df['team_long_name']))
    match_df['home_team_name'] = match_df['home_team_api_id'].map(team_api_to_name)
    match_df['away_team_name'] = match_df['away_team_api_id'].map(team_api_to_name)

    # Filter matches with missing critical values
    valid_mask = (
        match_df['home_team_goal'].notna() &
        match_df['away_team_goal'].notna() &
        match_df['home_team_name'].notna() &
        match_df['away_team_name'].notna()
    )
    df = match_df[valid_mask].copy()

    # Determine match result target (H, D, A)
    def determine_result(row):
        if row['home_team_goal'] > row['away_team_goal']:
            return 'H'
        elif row['home_team_goal'] == row['away_team_goal']:
            return 'D'
        else:
            return 'A'

    df['result'] = df.apply(determine_result, axis=1)
    df['goal_diff'] = df['home_team_goal'] - df['away_team_goal']
    df['total_goals'] = df['home_team_goal'] + df['away_team_goal']

    # Sort strictly chronologically for temporal validity
    df = df.sort_values(by=['date', 'id']).reset_index(drop=True)
    return df
