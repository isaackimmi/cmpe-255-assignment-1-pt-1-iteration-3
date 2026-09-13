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
| **1:45 - 3:00** | 3. Modeling, Evaluation & The Scikit Argmax Dilemma | Models & Calibration Tab (Comparison matrix, Confusion Matrix, ECE curve) | Explain leakage-safe temporal protocol, examine the Scikit-Learn Argmax Dilemma, and contrast discrete labels with calibrated probabilities. |
| **3:00 - 4:00** | 4. Interactive Match Explorer | Match Explorer Tab (2015/16 fixtures with filters) | Filter England / Premier League, inspect high-profile fixtures, compare predicted vs actual scores. |
| **4:00 - 5:00** | 5. Live Match Simulator | Live Predictor Tab (Arsenal vs Chelsea matchup simulation) | Adjust form sliders and odds live, click Simulate, explain real-time probability gauge and tactical insight. |
| **5:00 - 5:30** | 6. Summary, Limitations & Conclusion | Summary KPIs & GitHub Repo Screen | Wrap up key findings, mention limitations, invite viewers to clone repo via `./run_demo.sh`. |

---

## 🎙️ Spoken Script with Visual Cues

### [0:00 - 0:45] Section 1: Introduction, Research Question & CRISP-DM Lifecycle
*(Visual Cue: Show full-screen browser at `http://localhost:5173` with the Hero section & CRISP-DM Lifecycle cards).*

> **Speaker:**  
> "Hello everyone! Today, I’m presenting an end-to-end data science study addressing a classic question in sports analytics:  
> **'How strong is home-field advantage in European soccer, and how accurately can match results be predicted using only information available before kickoff?'**  
>  
> To structure this project like a production-grade data science initiative, we applied the industry-standard **CRISP-DM** lifecycle—**Cross-Industry Standard Process for Data Mining**—across all 6 stages:  
> 1. **Business Understanding:** We defined our 3-way prediction target ($H, D, A$) and chose **Macro-F1** as our key metric to ensure draws are never ignored.  
> 2. **Data Understanding:** We analyzed nearly 26,000 matches from 11 European leagues across 8 full seasons.  
> 3. **Data Preparation:** We engineered rolling 5-game form and rest features under a strict zero-leakage, same-day batching protocol.  
> 4. **Modeling:** We trained a clear hierarchy from naive baselines to commercial market odds and combined odds-enhanced models.  
> 5. **Evaluation:** We evaluated all models on an untouched 2015/16 test season with date-clustered bootstrap confidence intervals.  
> 6. **Deployment:** We packaged the entire pipeline into a production FastAPI backend and an interactive React web dashboard."

---

### [0:45 - 1:45] Section 2: Home-Field Advantage EDA
*(Visual Cue: Click on the 'Home Advantage EDA' tab).*

> **Speaker:**  
> "Let’s start with Exploratory Data Analysis—or EDA. EDA is where data scientists visually examine the raw dataset to uncover underlying patterns before jumping into modeling.  
>  
> This tab specifically answers our first research question on home advantage across 26,000 matches:  
> - **Home teams win 45.87% of matches**, while away teams win only **28.74%**, and **25.39%** end in draws.  
> - Host teams score an average of **1.54 goals per match** compared to **1.16 goals** for visitors, representing a home advantage of **+0.38 goals per fixture**.  
>  
> Looking at the league breakdown chart, home advantage is strongest in leagues like Spain's La Liga and the English Premier League, where home win rates exceed 46%.  
>  
> Furthermore, the season trend line reveals that this advantage is remarkably stable year after year, proving that home supremacy is a persistent structural factor in European football."

---

### [1:45 - 3:00] Section 3: Modeling & The Scikit-Learn Argmax Dilemma
*(Visual Cue: Switch to the 'Models & Calibration' tab, showing the Benchmark Matrix and Confusion Matrix).*

> **Speaker:**  
> "Now let’s look at predictive modeling. In sports forecasting, **data leakage** is a massive pitfall. Data leakage happens when a model accidentally trains on future information it wouldn't have before kickoff—like giving a student the answer key before an exam.  
>  
> To prevent this, we implemented a strict **temporal split**: training on 2008 to 2014, validating on 2014/15, and locking the untouched **2015/16 test season** in a digital vault. We also used **same-day batching** so matches played simultaneously on Saturday don't leak into each other.  
>  
> Here in the comparison matrix and confusion matrix, we uncover a classic sports analytics phenomenon: **The Scikit-Learn Argmax Dilemma**.  
>  
> In soccer, draws happen ~25% of the time, so draw probabilities typically hover between 24% and 30%. When standard machine learning classifiers like Scikit-Learn make a discrete choice using `argmax`, they choose whichever outcome has the single highest probability. Because either the Home win (say 45%) or Away win (say 32%) almost always beats the Draw probability, **the model virtually never picks Draw as its #1 choice**—which is why the confusion matrix shows only 2 draws selected in raw label classification.  
>  
> Commercial betting markets do the exact same thing—achieving 52.0% raw accuracy by ignoring draws.  
>  
> This critical discovery proves why in real-world sports data science, **continuous calibrated probabilities** (like estimating a 30% draw likelihood) provide far more genuine tactical insight than forcing a model into a discrete label guess!"

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
