import pytest
from server.ds.data_loader import prepare_match_dataset

def test_temporal_split_integrity():
    db_path = "data/database.sqlite"
    df = prepare_match_dataset(db_path)
    
    train_seasons = ['2008/2009', '2009/2010', '2010/2011', '2011/2012', '2012/2013', '2013/2014']
    val_season = '2014/2015'
    test_season = '2015/2016'
    
    train_df = df[df['season'].isin(train_seasons)]
    val_df = df[df['season'] == val_season]
    test_df = df[df['season'] == test_season]
    
    max_train_date = train_df['date'].max()
    min_val_date = val_df['date'].min()
    max_val_date = val_df['date'].max()
    min_test_date = test_df['date'].min()
    
    # Strict temporal monotonicity
    assert max_train_date <= min_val_date
    assert max_val_date <= min_test_date
    
    assert len(test_df) == 3326
