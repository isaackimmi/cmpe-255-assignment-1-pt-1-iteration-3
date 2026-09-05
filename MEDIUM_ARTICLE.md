# Cracking European Soccer: How Strong is Home-Field Advantage and Can We Beat the Betting Market?

*An End-to-End Data Science Investigation using CRISP-DM, 25,979 Matches, and Machine Learning.*

---

## Introduction & The Research Question

For over a century, soccer fans, managers, and punters have sworn by the power of the "12th man"—the belief that playing in front of a home crowd provides an insurmountable edge. But how much of this is romantic lore, and how much is quantifiable reality?

More importantly: **Can machine learning models using only information available prior to kickoff accurately predict match outcomes, and can statistical team form outperform or complement multi-billion-dollar sports betting markets?**

In this project (CMPE 255 Assignment 1 Part 1), we answered these questions by applying the **CRISP-DM** (Cross-Industry Standard Process for Data Mining) lifecycle to the **European Soccer Database** on Kaggle, containing 25,979 matches across 11 countries from 2008/09 through 2015/16.

---

## 1. Business Understanding: Setting Objective Targets

Before touching any code, we defined our predictive task:
- **Target Variable**: Multiclass match outcome \(Y \in \{H, D, A\}\) (Home Win, Draw, Away Win).
- **Core Challenge**: Soccer is a low-scoring game with high inherent variance. Furthermore, draws represent roughly 25% of all outcomes but are notoriously difficult to predict.
- **Evaluation Philosophy**: While accuracy measures raw correct picks, **Macro-F1** is our primary evaluation metric to ensure that models do not simply ignore draws in favor of high-frequency home wins.

---

## 2. Data Understanding: Quantifying Home Supremacy

Exploratory Data Analysis across 25,979 matches revealed decisive evidence for home-field advantage:
- **Home Win Dominance**: Host teams won **45.87%** of matches, compared to **28.74%** for visiting teams and **25.39%** for draws.
- **The Scoring Edge**: Host teams averaged **1.54 goals per match** versus **1.16 goals** for visitors—a net home advantage of **+0.381 goals per match**.
- **Temporal Consistency**: Across all 8 seasons from 2008 to 2016, the home win rate remained tightly bounded between **44.1% and 46.8%**, demonstrating that home advantage is an enduring structural feature of European club football.
- **League Differences**: Home win rates peaked in top leagues such as Spain's La Liga (47.0%) and the English Premier League (46.1%).

---

## 3. Data Preparation: The Battle Against Data Leakage

In sports modeling, **data leakage** is the most common pitfall. If future matches or same-day results leak into training features, model performance becomes artificially inflated and fails in production.

To ensure airtight temporal integrity:
1. **Strict Chronological Splitting**:
   - **Training Set**: 2008/09 – 2013/14 (19,328 fixtures).
   - **Validation Set**: 2014/15 (3,325 fixtures).
   - **Untouched Test Set**: 2015/16 (3,326 fixtures; 2,905 with complete Bet365 odds).
2. **Rolling History & Same-Day Batch Processing**:
   - Rolling 5-match form metrics (points per game, goal difference, scoring rate, venue-specific form, and rest days) were computed dynamically.
   - All matches occurring on the exact same date were evaluated simultaneously before updating team history dictionaries.
3. **Betting Odds Normalization**:
   - Pre-match Bet365 odds (\(O_H, O_D, O_A\)) were converted to implied probabilities by stripping out the bookmaker's overround margin:
   \[
   P_i = \frac{1/O_i}{\sum_{j} (1/O_j)}
   \]

---

## 4. Modeling & The "Draw Dilemma"

We benchmarked five distinct model architectures on the untouched 2015/16 test season:
1. **Majority Baseline**: Always predicts Home Win.
2. **Betting Market Baseline**: Selects the outcome with highest normalized Bet365 implied probability.
3. **Form-Only Logistic Regression**: Trained purely on rolling pre-match form and rest.
4. **Odds-Enhanced Logistic Regression (Selected Model)**: Combines rolling form differentials with normalized market probabilities.
5. **Odds-Enhanced Gradient Boosting**: Non-linear tree ensemble on combined form and odds.

### Test Results Matrix (2015/16 Season, N = 2,905 Matches)

| Architecture | Macro-F1 | Accuracy | Draw Recall | Log Loss | Brier Score | ECE |
|---|---:|---:|---:|---:|---:|---:|
| **Odds-Enhanced Logistic Regression** | **0.4770** | 49.05% | **24.62%** | 1.0028 | 0.5990 | 0.0278 |
| Odds-Enhanced Gradient Boosting | 0.4580 | 48.98% | 19.34% | 1.0142 | 0.6045 | 0.0315 |
| Betting Market Baseline (Bet365) | 0.3807 | **52.39%** | 0.41% | **0.9781** | — | — |
| Form-Only Logistic Regression | 0.4285 | 46.16% | 14.50% | 1.0421 | 0.6231 | 0.0384 |
| Majority Baseline | 0.2048 | 44.34% | 0.00% | 1.1398 | 0.6480 | 0.0139 |

---

## 5. Evaluation: Key Insights & Statistical Significance

### 1. The Draw Dilemma
Commercial bookmaker odds maximize overall accuracy (52.39%) by almost never predicting draws (Draw Recall = 0.41%). In commercial sports betting, the favorite or underdog bias dominates implied probabilities.

### 2. Significant Macro-F1 Lift
Our selected **Odds-Enhanced Logistic Regression model achieves a Macro-F1 score of 0.4770**, generating a **+0.0963 lift** over the market baseline.
- A **95% Date-Clustered Bootstrap Confidence Interval** confirms that this lift is statistically significant: **[0.0792, 0.1135]** (\(p < 0.05\)).
- The model boosts **Draw Recall to 24.62%**, providing balanced, well-calibrated predictions across all three match outcomes.

---

## 6. Deployment: A Modern Full-Stack Dashboard

Rather than delivering a static script or notebook, we packaged the entire system into a production-grade full-stack web application:
- **Backend (`FastAPI`)**: High-speed REST API providing real-time data science endpoints for EDA, model metrics, fixtures, and inference.
- **Frontend (`React + Vite + Tailwind + Lucide`)**: Interactive dashboard featuring:
  - Executive Overview with KPI cards and bootstrap confidence intervals.
  - Home Advantage EDA with interactive league, season, and goal charts.
  - Model Performance & Calibration with interactive confusion matrices and reliability diagrams.
  - Match Explorer with real-time fixture search and filtering.
  - **Live Match Predictor**: An interactive simulation sandbox where users can adjust team form, rest days, and odds to run live model inference.

The entire application launches with a single terminal command:
```bash
./run_demo.sh
```

---

## Conclusion & Limitations

1. **Home advantage is real and consistent**: European soccer teams enjoy a structural +0.38 goal advantage at home that has persisted across decades.
2. **Markets prioritize accuracy; Form restores balance**: While bookmaker odds remain unmatched for single-class accuracy, integrating pre-match rolling form is essential for balanced multiclass recognition (Macro-F1).
3. **Future Work**: Incorporating player-level tracking, expected goals (xG), and tactical formation embeddings could further refine probability estimates.

*Full source code, data pipelines, and documentation are available on GitHub.*
