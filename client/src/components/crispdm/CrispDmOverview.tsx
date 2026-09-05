import React, { useState } from 'react';
import { 
  Layers, 
  Target, 
  Database, 
  Wrench, 
  Cpu, 
  ShieldCheck, 
  Rocket, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ArrowUpRight,
  FileCode2,
  BarChart3,
  BrainCircuit,
  PlayCircle
} from 'lucide-react';

interface CrispDmOverviewProps {
  onNavigateTab?: (tab: string) => void;
}

export const CrispDmOverview: React.FC<CrispDmOverviewProps> = ({ onNavigateTab }) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(0);

  const phases = [
    {
      id: 'business',
      number: '01',
      title: 'Business Understanding',
      icon: Target,
      tagline: 'Formulate the 3-way match outcome prediction & define evaluation criteria',
      color: 'emerald',
      problemStatement:
        'Quantify the magnitude and league-level variance of home advantage in European soccer, and evaluate whether pre-kickoff team form adds predictive signal beyond efficient betting market odds.',
      keyTasks: [
        'Define 3-way target: Home Win (H), Draw (D), Away Win (A)',
        'Identify business metric: Macro-F1 chosen over raw accuracy because equal recognition across Home, Draw, and Away is critical',
        'Establish baseline targets: Majority class baseline (~45.9% H) and Bet365 implied market probabilities',
        'Set strict temporal boundaries: 2008/09–2013/14 (Train), 2014/15 (Validation), 2015/16 (Untouched Test)'
      ],
      output: 'Problem formulation, metric definitions, and temporal evaluation framework.',
      actionTab: 'overview',
      actionLabel: 'View Executive KPIs'
    },
    {
      id: 'data-understanding',
      number: '02',
      title: 'Data Understanding',
      icon: Database,
      tagline: 'Exploratory data analysis across 25,979 matches and 11 European leagues',
      color: 'teal',
      problemStatement:
        'Ingest the Kaggle European Soccer SQLite database, validate schema integrity, inspect missing odds values, and evaluate home scoring advantages across countries and time.',
      keyTasks: [
        'Schema validation: Match (25,979 rows), Team (299 rows), League (11 rows), Country (11 rows)',
        'Data cleaning: Filter incomplete scores, parse timestamps, normalize team codes',
        'Analyze outcome balance: Home Wins (45.87%), Draws (25.39%), Away Wins (28.74%)',
        'Goal distribution: Fit empirical goal counts (Home λ=1.54 vs Away λ=1.16, +0.381 net advantage)',
        'Examine odds missingness: 13.17% development matches lack full Bet365 odds'
      ],
      output: 'Comprehensive EDA metrics, distribution statistics, and data cleaning pipelines.',
      actionTab: 'eda',
      actionLabel: 'Explore Home Advantage EDA'
    },
    {
      id: 'data-prep',
      number: '03',
      title: 'Data Preparation & Feature Engineering',
      icon: Wrench,
      tagline: '100% leakage-free chronological feature extraction & odds normalization',
      color: 'cyan',
      problemStatement:
        'Extract historical form, venue-specific momentum, rest days, and market odds chronologically without looking ahead into future match outcomes.',
      keyTasks: [
        'Strict temporal order: Sort matches by date and process in chronological sequence',
        'Same-day batching safeguard: Extract features for all matches on date T before updating team records from date T results',
        'Rolling form features (5 matches): Points/match, goals scored/conceded, goal differential, win rates',
        'Venue-specific form: Home team records at home vs Away team records on the road',
        'Rest days calculation: Clamped between 1 and 30 days between fixtures',
        'Normalized Bet365 odds: Invert decimal odds and remove bookmaker overround (vigorish)'
      ],
      output: 'Leakage-free feature matrix with 23 engineered signals and normalized implied odds.',
      actionTab: 'models',
      actionLabel: 'View Feature Weights'
    },
    {
      id: 'modeling',
      number: '04',
      title: 'Modeling',
      icon: Cpu,
      tagline: 'Multinomial logistic regression, gradient boosting, and calibrated pipelines',
      color: 'blue',
      problemStatement:
        'Train and compare candidate architectures on the 2008/09–2013/14 development partition, using class reweighting to prevent the minority Draw class from collapsing.',
      keyTasks: [
        'Baseline 1: Majority Class (always predict Home Win)',
        'Baseline 2: Implied Betting Odds (argmax of normalized Bet365 probabilities)',
        'Model Family A: Historical Form Only (Multinomial Logistic Regression & HistGradientBoosting)',
        'Model Family B: Odds-Enhanced Models (Combining rolling form differentials, venue form, and market odds)',
        'Probabilistic calibration: Ensure output probability distributions represent well-calibrated confidence'
      ],
      output: 'Fitted model artifacts (pickle files), feature coefficient rankings, and hyperparameter logs.',
      actionTab: 'models',
      actionLabel: 'Compare Model Matrix'
    },
    {
      id: 'evaluation',
      number: '05',
      title: 'Evaluation',
      icon: ShieldCheck,
      tagline: 'Untouched 2015/16 test evaluation, bootstrap confidence intervals, & calibration error',
      color: 'purple',
      problemStatement:
        'Evaluate all frozen models on 2,905 untouched 2015/16 test season matches to assess generalizability, calibration, and draw detection.',
      keyTasks: [
        'Primary selection metric: Selected model achieves 0.4770 Macro-F1 (+0.0963 lift over Odds Baseline)',
        'Date-clustered bootstrap: 1,000 resamples establish 95% CI of [0.0792, 0.1135] for Macro-F1 lift (statistically significant)',
        'The Draw Dilemma: Boost draw recall from 0.41% (Market) to 24.62% (Selected Model)',
        'Calibration analysis: Measure Expected Calibration Error (ECE = 0.0278) and reliability diagrams per class',
        'Slice evaluations: Compute accuracy, F1, and log loss across individual European leagues'
      ],
      output: 'Evaluation reports, confusion matrices, reliability curves, and statistical significance proofs.',
      actionTab: 'models',
      actionLabel: 'Inspect Confusion Matrix'
    },
    {
      id: 'deployment',
      number: '06',
      title: 'Deployment & Presentation',
      icon: Rocket,
      tagline: 'Production fullstack dashboard, live simulator, Medium draft, and video script',
      color: 'amber',
      problemStatement:
        'Package the data science workflows into an interactive, reusable platform allowing stakeholders to simulate matches and inspect model reasoning.',
      keyTasks: [
        'FastAPI REST server with automated precomputed artifact caching and live prediction endpoint',
        'Interactive React + Vite + Tailwind frontend with real-time match simulation sandbox',
        'One-click launcher (run_demo.sh) for instant environment startup and browser launch',
        'Publication-ready deliverables: Comprehensive README.md, EXPLANATION.md, MEDIUM_ARTICLE.md, and VIDEO_SCRIPT.md'
      ],
      output: 'Full-stack application, GitHub repository, and presentation assets.',
      actionTab: 'simulator',
      actionLabel: 'Launch Match Simulator'
    }
  ];

  const current = phases[selectedPhase];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>CRISP-DM Standard Lifecycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Cross-Industry Standard Process for Data Mining
          </h2>
          <p className="text-sm text-slate-300">
            Explore how each of the 6 CRISP-DM lifecycle phases was rigorously engineered and evaluated on the European Soccer dataset.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl flex-shrink-0">
          <span className="text-emerald-400 font-bold">6 Phases</span>
          <span>•</span>
          <span>25,979 Matches</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">Zero Leakage</span>
        </div>
      </div>

      {/* Interactive 6-Phase Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {phases.map((phase, idx) => {
          const PhaseIcon = phase.icon;
          const isSelected = selectedPhase === idx;

          return (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(idx)}
              className={`p-4 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between h-32 ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  PHASE {phase.number}
                </span>
                <PhaseIcon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {phase.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-1">
                  {phase.tagline.split(' ')[0]} {phase.tagline.split(' ')[1]}...
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Phase Detail View */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Phase Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-emerald-400">PHASE {current.number}</span>
                <span className="text-slate-600">•</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{current.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{current.tagline}</p>
            </div>
          </div>

          {onNavigateTab && current.actionTab && (
            <button
              onClick={() => onNavigateTab(current.actionTab)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <span>{current.actionLabel}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Objective Box */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Phase Objective & Scope:
          </span>
          <p className="text-sm text-slate-200 leading-relaxed">
            {current.problemStatement}
          </p>
        </div>

        {/* Tasks Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Key Methodologies & Implementation Steps</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {current.keyTasks.map((task, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 hover:border-slate-700 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5 border border-emerald-500/20">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Footer Navigation */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="font-semibold text-white">Artifacts Produced:</span>
            <span className="text-slate-300">{current.output}</span>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => setSelectedPhase((selectedPhase - 1 + phases.length) % phases.length)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setSelectedPhase((selectedPhase + 1) % phases.length)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
            >
              <span>Next Phase</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
