import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import pickle
from pathlib import Path

class MajorityBaseline:
    """Predicts majority class (Home Win) and assigns empirical class priors as probabilities."""
    def __init__(self):
        self.classes_ = np.array(['H', 'D', 'A'])
        self.priors_ = None
        
    def fit(self, X, y):
        counts = pd.Series(y).value_counts(normalize=True)
        self.priors_ = np.array([counts.get('H', 0.45), counts.get('D', 0.27), counts.get('A', 0.28)])
        return self
        
    def predict(self, X):
        return np.array(['H'] * len(X))
        
    def predict_proba(self, X):
        return np.tile(self.priors_, (len(X), 1))

class MarketOddsBaseline:
    """Uses normalized bookmaker implied probabilities directly."""
    def __init__(self):
        self.classes_ = np.array(['H', 'D', 'A'])
        
    def fit(self, X, y=None):
        return self
        
    def predict_proba(self, X_odds: np.ndarray):
        # Expects columns [prob_b365_h, prob_b365_d, prob_b365_a]
        return X_odds
        
    def predict(self, X_odds: np.ndarray):
        idx = np.argmax(X_odds, axis=1)
        return self.classes_[idx]

def build_logistic_pipeline() -> Pipeline:
    return Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(
            solver='lbfgs',
            max_iter=1000,
            C=0.1,
            random_state=42
        ))
    ])

def build_gradient_boosting_pipeline() -> Pipeline:
    return Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('classifier', HistGradientBoostingClassifier(
            max_iter=100,
            learning_rate=0.05,
            max_leaf_nodes=15,
            random_state=42
        ))
    ])
