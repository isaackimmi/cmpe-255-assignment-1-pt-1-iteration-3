import pytest
import pandas as pd
import numpy as np
from server.ds.data_loader import prepare_match_dataset
from server.ds.features import generate_chronological_features

def test_no_future_leakage():
    db_path = "data/database.sqlite"
    df = prepare_match_dataset(db_path)
    
    # Take a subset of earliest 200 matches
    subset = df.head(200).copy()
    feat_df = generate_chronological_features(subset, window_size=5)
    
    # Check the very first match in the entire dataset
    first_match = feat_df.iloc[0]
    assert first_match['home_games_played'] == 0
    assert first_match['away_games_played'] == 0
    assert first_match['home_recent_points'] == 0.0
    assert first_match['away_recent_points'] == 0.0

def test_same_day_batch_leakage_safety():
    db_path = "data/database.sqlite"
    df = prepare_match_dataset(db_path)
    
    # Find a date with multiple fixtures
    date_counts = df['date'].value_counts()
    multi_dates = date_counts[date_counts >= 4].index[0]
    
    day_df = df[df['date'] == multi_dates]
    assert len(day_df) >= 4
