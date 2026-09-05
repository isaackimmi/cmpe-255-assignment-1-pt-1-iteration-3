import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, log_loss, confusion_matrix

CLASSES = ['H', 'D', 'A']

def compute_brier_score(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    """Computes multi-class Brier score."""
    y_one_hot = np.zeros_like(y_prob)
    for i, label in enumerate(y_true):
        idx = CLASSES.index(label)
        y_one_hot[i, idx] = 1.0
    return float(np.mean(np.sum((y_prob - y_one_hot) ** 2, axis=1)))

def compute_calibration_data(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> Dict[str, Any]:
    """Computes reliability curves and Expected Calibration Error (ECE) per class."""
    calibration_by_class = {}
    total_ece = 0.0
    
    for class_idx, class_name in enumerate(CLASSES):
        y_binary = (y_true == class_name).astype(int)
        probs = y_prob[:, class_idx]
        
        bins = np.linspace(0.0, 1.0, n_bins + 1)
        bin_indices = np.digitize(probs, bins) - 1
        bin_indices = np.clip(bin_indices, 0, n_bins - 1)
        
        bin_data = []
        class_ece = 0.0
        n_samples = len(y_true)
        
        for b in range(n_bins):
            mask = (bin_indices == b)
            bin_count = int(np.sum(mask))
            if bin_count > 0:
                avg_prob = float(np.mean(probs[mask]))
                true_freq = float(np.mean(y_binary[mask]))
                weight = bin_count / n_samples
                class_ece += weight * abs(avg_prob - true_freq)
                bin_data.append({
                    "bin_center": round((bins[b] + bins[b+1]) / 2, 3),
                    "avg_predicted_prob": round(avg_prob, 3),
                    "true_positive_rate": round(true_freq, 3),
                    "count": bin_count
                })
        calibration_by_class[class_name] = {
            "bins": bin_data,
            "ece": round(class_ece, 4)
        }
        total_ece += class_ece
        
    avg_ece = total_ece / len(CLASSES)
    return {
        "classes": calibration_by_class,
        "mean_ece": round(avg_ece, 4)
    }

def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> Dict[str, Any]:
    acc = accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, labels=CLASSES, average='macro', zero_division=0)
    
    per_class_p = precision_score(y_true, y_pred, labels=CLASSES, average=None, zero_division=0)
    per_class_r = recall_score(y_true, y_pred, labels=CLASSES, average=None, zero_division=0)
    per_class_f1 = f1_score(y_true, y_pred, labels=CLASSES, average=None, zero_division=0)
    
    # Log loss clipping
    eps = 1e-15
    y_prob_clipped = np.clip(y_prob, eps, 1 - eps)
    y_prob_clipped = y_prob_clipped / y_prob_clipped.sum(axis=1, keepdims=True)
    
    try:
        loss = log_loss(y_true, y_prob_clipped, labels=CLASSES)
    except Exception:
        loss = 999.0
        
    brier = compute_brier_score(y_true, y_prob_clipped)
    calib = compute_calibration_data(y_true, y_prob_clipped)
    cm = confusion_matrix(y_true, y_pred, labels=CLASSES)
    
    # Format confusion matrix
    cm_dict = {
        "labels": CLASSES,
        "matrix": cm.tolist(),
        "normalized": (cm / cm.sum(axis=1, keepdims=True)).round(3).tolist()
    }
    
    return {
        "accuracy": round(float(acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "log_loss": round(float(loss), 4),
        "brier_score": round(float(brier), 4),
        "ece": calib["mean_ece"],
        "calibration": calib,
        "per_class": {
            cls: {
                "precision": round(float(per_class_p[i]), 4),
                "recall": round(float(per_class_r[i]), 4),
                "f1": round(float(per_class_f1[i]), 4)
            } for i, cls in enumerate(CLASSES)
        },
        "confusion_matrix": cm_dict
    }

def compute_date_clustered_bootstrap_ci(
    df: pd.DataFrame,
    y_pred_a: np.ndarray,
    y_pred_b: np.ndarray,
    n_bootstraps: int = 1000,
    alpha: float = 0.05
) -> Dict[str, Any]:
    """
    Computes date-clustered bootstrap confidence interval for Macro-F1 difference (Model A - Model B).
    Clustering by date respects intra-matchday correlation.
    """
    unique_dates = df['date'].unique()
    n_dates = len(unique_dates)
    diffs = []
    
    y_true_all = df['result'].values
    
    # Group indices by date
    date_to_idx = {d: np.where(df['date'].values == d)[0] for d in unique_dates}
    
    np.random.seed(42)
    for _ in range(n_bootstraps):
        sampled_dates = np.random.choice(unique_dates, size=n_dates, replace=True)
        sampled_idx = np.concatenate([date_to_idx[d] for d in sampled_dates])
        
        y_t = y_true_all[sampled_idx]
        f1_a = f1_score(y_t, y_pred_a[sampled_idx], labels=CLASSES, average='macro', zero_division=0)
        f1_b = f1_score(y_t, y_pred_b[sampled_idx], labels=CLASSES, average='macro', zero_division=0)
        diffs.append(f1_a - f1_b)
        
    diffs = np.array(diffs)
    lower = np.percentile(diffs, (alpha / 2) * 100)
    upper = np.percentile(diffs, (1 - alpha / 2) * 100)
    mean_diff = np.mean(diffs)
    
    return {
        "mean_diff": round(float(mean_diff), 4),
        "ci_lower": round(float(lower), 4),
        "ci_upper": round(float(upper), 4),
        "is_significant": bool(lower > 0 or upper < 0)
    }
