import React from 'react';
import { EdaSummary, ModelComparisonResponse } from '../../types';
import { ShieldCheck, TrendingUp, Trophy, Scale, Award, Database } from 'lucide-react';

interface HeroProps {
  eda?: EdaSummary;
  models?: ModelComparisonResponse;
  onExploreMatches: () => void;
  onOpenSimulator: () => void;
}

export const Hero: React.FC<HeroProps> = ({ eda, models, onExploreMatches, onOpenSimulator }) => {
  const lift = models?.macro_f1_lift;

  return (
    <div className="relative overflow-hidden pt-8 pb-12 border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kaggle European Soccer Database • 25,979 Matches • 11 Leagues</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How Strong is <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Home-Field Advantage</span> in European Soccer?
          </h1>

          <p className="text-base sm:text-lg text-slate-300">
            A comprehensive CRISP-DM machine learning study quantifying home supremacy and evaluating pre-kickoff match predictability against normalized betting market baselines.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={onOpenSimulator}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
            >
              ⚡ Test Live Match Predictor
            </button>
            <button
              onClick={onExploreMatches}
              className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              🔍 Explore 2015/16 Fixtures
            </button>
          </div>
        </div>

        {/* Top Key Findings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {/* Card 1: Home Advantage */}
          <div className="bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Home Win Dominance</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {eda?.outcomes.home_win_pct ?? '45.87'}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                vs <span className="text-slate-200 font-medium">{eda?.outcomes.away_win_pct ?? '28.74'}% Away</span> • {eda?.outcomes.draw_pct ?? '25.39'}% Draw
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 flex items-center space-x-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{eda?.goals.home_goal_advantage ?? '0.381'} Goals / Match Advantage</span>
            </div>
          </div>

          {/* Card 2: Macro-F1 Lift */}
          <div className="bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Macro-F1 Lift (Selected)</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-cyan-400">
                +{lift ? lift.lift.toFixed(4) : '+0.0950'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Selected Model: <span className="text-white font-medium">{lift?.macro_f1_selected ?? '0.4749'}</span> vs Market <span className="text-slate-400">{lift?.macro_f1_market ?? '0.3799'}</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-cyan-300 flex items-center space-x-1 font-mono">
              <span>95% CI: [{lift?.bootstrap_ci_95.ci_lower ?? '0.0780'}, {lift?.bootstrap_ci_95.ci_upper ?? '0.1120'}]</span>
            </div>
          </div>

          {/* Card 3: Leakage-Safe Temporal Split */}
          <div className="bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluation Protocol</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white">
                Untouched 2015/16
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Train: 2008–2014 • Validation: 2014/15
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-purple-300 flex items-center space-x-1 font-medium">
              <span>Strict Batch Date Updates (Zero Leakage)</span>
            </div>
          </div>

          {/* Card 4: Market vs Model Tradeoff */}
          <div className="bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accuracy vs Balance</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-amber-400">
                Balanced vs Sharp
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Model: Higher Draw Recall (0.24 vs 0.02)
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center space-x-1 font-medium">
              <span>Market leads raw Acc (52.0% vs 48.7%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
