# 4–6 Minute YouTube Demo Video Script

**Project Title:** European Soccer Home Advantage Analytics & Pre-Kickoff Prediction System  
**Course:** CMPE 255 Data Mining (Assignment 1 Part 1, Iteration 3)  
**Presenter:** Data Science Engineer  
**Target Duration:** 4:30 – 5:30 minutes

---

## ⏱️ Video Breakdown

| Timestamp | Section | Visual on Screen | Key Talking Points |
|---|---|---|---|
| **0:00 - 0:45** | 1. Introduction & Research Question | Dashboard Hero Section + Title Screen | Introduce research question, dataset (25,979 matches), and CRISP-DM methodology. |
| **0:45 - 1:45** | 2. Home-Field Advantage EDA | EDA Tab (League bars, Season trends, Goal distributions) | Present 45.87% home win rate, +0.38 goal advantage, league differences, and season stability. |
| **1:45 - 3:00** | 3. Modeling, Evaluation & The Draw Dilemma | Models & Calibration Tab (Comparison matrix, Confusion Matrix, ECE curve) | Explain leakage-safe temporal protocol, show +0.0963 Macro-F1 lift, and contrast Draw Recall (24.6% vs 0.4%). |
| **3:00 - 4:00** | 4. Interactive Match Explorer | Match Explorer Tab (2015/16 fixtures with filters) | Filter England / Premier League, inspect high-profile fixtures, compare predicted vs actual scores. |
| **4:00 - 5:00** | 5. Live Match Simulator | Live Predictor Tab (Arsenal vs Chelsea matchup simulation) | Adjust form sliders and odds live, click Simulate, explain real-time probability gauge and tactical insight. |
| **5:00 - 5:30** | 6. Summary, Limitations & Conclusion | Summary KPIs & GitHub Repo Screen | Wrap up key findings, mention limitations, invite viewers to clone repo via `./run_demo.sh`. |

---

## 🎙️ Spoken Script with Visual Cues

### [0:00 - 0:45] Section 1: Introduction & Research Question
*(Visual Cue: Show full-screen browser at `http://localhost:5173` with the Hero section).*

> **Speaker:**  
> "Hello everyone! Today, I’m presenting an end-to-end data science study addressing a classic question in sports analytics:  
> **'How strong is home-field advantage in European soccer, and how accurately can match results be predicted using only information available before kickoff?'**  
>  
> Using the Kaggle European Soccer Database—comprising nearly 26,000 matches across 11 top European leagues from 2008 to 2016—we structured our entire investigation around the **CRISP-DM** data mining lifecycle.  
>  
> Our goal was not just to train a model, but to build a robust, leakage-safe prediction system deployed through a modern full-stack web application."

---

### [0:45 - 1:45] Section 2: Home-Field Advantage EDA
*(Visual Cue: Click on the 'Home Advantage EDA' tab).*

> **Speaker:**  
> "Let’s start with Exploratory Data Analysis. Across the entire 8-season dataset:  
> - **Home teams win 45.87% of matches**, while away teams win only **28.74%**, and **25.39%** end in draws.  
> - Host teams score an average of **1.54 goals per match** compared to **1.16 goals** for visitors, representing an average home advantage of **+0.38 goals per fixture**.  
>  
> Looking at the league breakdown chart, we see that home advantage is strongest in leagues like Spain's La Liga and the English Premier League, where home win rates exceed 46%.  
>  
> Furthermore, the season trend line reveals that this advantage is remarkably stable year after year, proving that home supremacy is a persistent structural factor in European football."

---

### [1:45 - 3:00] Section 3: Modeling & The Draw Dilemma
*(Visual Cue: Switch to the 'Models & Calibration' tab).*

> **Speaker:**  
> "Now let’s look at predictive modeling. In sports forecasting, data leakage is a massive risk. We implemented a strict **temporal split**: training on 2008 to 2014, validating on 2014/15, and evaluating on the untouched **2015/16 test season** of 2,905 matches.  
>  
> Crucially, our feature engineering computes rolling 5-match form and rest days using strict same-day batch processing to prevent future leakage.  
>  
> Here in the comparison matrix, we observe a fascinating dynamic:  
> - The **Commercial Betting Market (Bet365 odds)** achieves the highest raw accuracy at **52.39%**, but it almost never predicts draws—its draw recall is a dismal **0.41%**.  
> - Our **Selected Odds-Enhanced Logistic Model**, which combines rolling form differentials with market odds, unlocks a **Draw Recall of 24.62%** and achieves a **Macro-F1 of 0.4770**.  
> - This represents a statistically significant **Macro-F1 lift of +0.0963**, backed by a 95% date-clustered bootstrap confidence interval of `[0.0792, 0.1135]`.  
>  
> The confusion matrix clearly illustrates this balance, and our reliability curve shows strong calibration across all three outcomes."

---

### [3:00 - 4:00] Section 4: Interactive Match Explorer
*(Visual Cue: Click on the 'Match Explorer' tab).*

> **Speaker:**  
> "Next, let’s explore the **Match Explorer**. This view connects our aggregate benchmarks to individual matches in the 2015/16 test season.  
>  
> We can filter by league—for instance, selecting England’s Premier League—or filter by outcome and prediction correctness.  
>  
> Each card displays the actual score, the pre-match bookmaker odds, the rolling points form, and our model’s predicted probability distribution bar. We can easily identify underdog upsets and see exactly how the model calibrated its probabilities prior to kickoff."

---

### [4:00 - 5:00] Section 5: Live Match Predictor
*(Visual Cue: Navigate to the 'Live Predictor' tab).*

> **Speaker:**  
> "Finally, let’s test the **Live Match Predictor**. This simulator allows us to test any hypothetical match scenario in real time using our trained inference engine.  
>  
> Let’s simulate **Arsenal (Home)** vs **Chelsea (Away)**.  
> - We can increase Arsenal’s rolling points to 2.4 per game and set their rest to 7 days.  
> - We’ll give Chelsea 1.5 points per game on 4 days rest.  
> - We enter the pre-match odds and click **⚡ Simulate Kickoff Prediction**.  
>  
> Instantly, the FastAPI backend calculates the feature differentials, runs inference, and renders the probability gauge showing a 58% probability for an Arsenal Home Win, along with an automated data science tactical insight!"

---

### [5:00 - 5:30] Section 6: Conclusion & Wrap-Up
*(Visual Cue: Return to Overview Tab or show GitHub repo).*

> **Speaker:**  
> "In summary: Home-field advantage in European soccer is both statistically robust (+0.38 goals/game) and temporally stable. While commercial betting odds maximize raw accuracy, incorporating leakage-safe chronological form provides a superior, balanced model across all three match outcomes.  
>  
> The entire project is available on GitHub and can be launched locally with a single `./run_demo.sh` command.  
>  
> Thank you for watching!"
