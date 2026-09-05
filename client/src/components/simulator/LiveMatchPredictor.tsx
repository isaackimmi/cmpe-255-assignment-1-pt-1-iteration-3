import React, { useState } from 'react';
import { api } from '../../services/api';
import { PredictResponse, PredictRequest } from '../../types';
import { PlayCircle, Zap, Shield, Flame, Activity, Sparkles, Scale } from 'lucide-react';

interface LiveMatchPredictorProps {
  topTeams: string[];
}

export const LiveMatchPredictor: React.FC<LiveMatchPredictorProps> = ({ topTeams }) => {
  const [homeTeam, setHomeTeam] = useState<string>('Arsenal');
  const [awayTeam, setAwayTeam] = useState<string>('Chelsea');

  // Home form state
  const [homePts, setHomePts] = useState<number>(2.2);
  const [homeWinRate, setHomeWinRate] = useState<number>(0.65);
  const [homeGf, setHomeGf] = useState<number>(2.4);
  const [homeGa, setHomeGa] = useState<number>(0.8);
  const [homeRest, setHomeRest] = useState<number>(7);

  // Away form state
  const [awayPts, setAwayPts] = useState<number>(1.6);
  const [awayWinRate, setAwayWinRate] = useState<number>(0.45);
  const [awayGf, setAwayGf] = useState<number>(1.4);
  const [awayGa, setAwayGa] = useState<number>(1.2);
  const [awayRest, setAwayRest] = useState<number>(4);

  // Odds state
  const [useOdds, setUseOdds] = useState<boolean>(true);
  const [b365H, setB365H] = useState<number>(2.10);
  const [b365D, setB365D] = useState<number>(3.40);
  const [b365A, setB365A] = useState<number>(3.60);

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const payload: PredictRequest = {
        home_team: homeTeam,
        away_team: awayTeam,
        home_recent_points: homePts,
        away_recent_points: awayPts,
        home_recent_win_rate: homeWinRate,
        away_recent_win_rate: awayWinRate,
        home_recent_goals_scored: homeGf,
        away_recent_goals_scored: awayGf,
        home_recent_goals_conceded: homeGa,
        away_recent_goals_conceded: awayGa,
        home_recent_goal_diff: homeGf - homeGa,
        away_recent_goal_diff: awayGf - awayGa,
        home_venue_recent_points: homePts * 1.1,
        away_venue_recent_points: awayPts * 0.9,
        home_rest_days: homeRest,
        away_rest_days: awayRest,
        ...(useOdds
          ? {
              b365_h: b365H,
              b365_d: b365D,
              b365_a: b365A
            }
          : {})
      };

      const res = await api.predictMatch(payload);
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Interactive Machine Learning Inference Simulator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Live Pre-Kickoff Match Outcome Predictor
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Test any hypothetical pre-match matchup. Adjust recent 5-game form, rest days, and betting odds to see real-time model inference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Team Selectors */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Matchup Selection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">
                  🏠 Home Team Host
                </label>
                <input
                  type="text"
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-400 block mb-1">
                  ✈️ Away Team Visitor
                </label>
                <input
                  type="text"
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Sliders: Home vs Away */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Recent 5-Match Form Parameters</span>
              </h3>
            </div>

            {/* Metric 1: Points Per Match */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-400">Home Pts/Game: {homePts.toFixed(1)}</span>
                <span className="text-slate-400">Rolling Points (0 - 3.0)</span>
                <span className="text-blue-400">Away Pts/Game: {awayPts.toFixed(1)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={homePts}
                  onChange={(e) => setHomePts(parseFloat(e.target.value))}
                  className="accent-emerald-500 w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={awayPts}
                  onChange={(e) => setAwayPts(parseFloat(e.target.value))}
                  className="accent-blue-500 w-full"
                />
              </div>
            </div>

            {/* Metric 2: Goals Scored per Game */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-400">Home GF/Game: {homeGf.toFixed(1)}</span>
                <span className="text-slate-400">Scoring Rate (0 - 4.0)</span>
                <span className="text-blue-400">Away GF/Game: {awayGf.toFixed(1)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={homeGf}
                  onChange={(e) => setHomeGf(parseFloat(e.target.value))}
                  className="accent-emerald-500 w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={awayGf}
                  onChange={(e) => setAwayGf(parseFloat(e.target.value))}
                  className="accent-blue-500 w-full"
                />
              </div>
            </div>

            {/* Metric 3: Rest Days */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-400">Home Rest: {homeRest} days</span>
                <span className="text-slate-400">Rest Days Since Last Match</span>
                <span className="text-blue-400">Away Rest: {awayRest} days</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="range"
                  min="2"
                  max="21"
                  value={homeRest}
                  onChange={(e) => setHomeRest(parseInt(e.target.value))}
                  className="accent-emerald-500 w-full"
                />
                <input
                  type="range"
                  min="2"
                  max="21"
                  value={awayRest}
                  onChange={(e) => setAwayRest(parseInt(e.target.value))}
                  className="accent-blue-500 w-full"
                />
              </div>
            </div>
          </div>

          {/* Betting Odds Input */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Pre-Match Bet365 Decimal Odds</span>
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={useOdds}
                  onChange={(e) => setUseOdds(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Include Market Odds</span>
              </label>
            </div>

            {useOdds && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-emerald-400 block mb-1">
                    Home (B365H)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.05"
                    value={b365H}
                    onChange={(e) => setB365H(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Draw (B365D)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.05"
                    value={b365D}
                    onChange={(e) => setB365D(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-blue-400 block mb-1">
                    Away (B365A)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.05"
                    value={b365A}
                    onChange={(e) => setB365A(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Running ML Inference...' : '⚡ Simulate Kickoff Prediction'}</span>
            </button>
          </div>
        </div>

        {/* Right Output Dashboard: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-24 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Prediction Output & Probability Gauge
            </h3>

            {prediction ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Predicted Outcome Card */}
                <div
                  className={`p-6 rounded-2xl border text-center space-y-2 ${
                    prediction.predicted_outcome === 'H'
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-emerald-500/10'
                      : prediction.predicted_outcome === 'D'
                      ? 'bg-slate-800/40 border-slate-600 shadow-slate-500/10'
                      : 'bg-blue-950/30 border-blue-500/50 shadow-blue-500/10'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Predicted Outcome
                  </span>
                  <div
                    className={`text-3xl font-extrabold ${
                      prediction.predicted_outcome === 'H'
                        ? 'text-emerald-400'
                        : prediction.predicted_outcome === 'D'
                        ? 'text-slate-200'
                        : 'text-blue-400'
                    }`}
                  >
                    {prediction.predicted_label}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Model Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Probability Distribution Breakdown */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                    Three-Way Outcome Probabilities
                  </span>

                  {/* Home Win */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-400">🏠 {prediction.home_team} Win (H)</span>
                      <span className="font-mono text-emerald-400">
                        {(prediction.probabilities.H * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probabilities.H * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Draw */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">🤝 Draw (D)</span>
                      <span className="font-mono text-slate-300">
                        {(prediction.probabilities.D * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probabilities.D * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Away Win */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-blue-400">✈️ {prediction.away_team} Win (A)</span>
                      <span className="font-mono text-blue-400">
                        {(prediction.probabilities.A * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probabilities.A * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tactical Insight Box */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Data Science Tactical Insight</span>
                  </div>
                  <p className="leading-relaxed text-slate-400">
                    {prediction.predicted_outcome === 'H'
                      ? `${prediction.home_team} benefits from both structural home pitch advantage (+0.38 goal delta) and superior recent rolling form momentum.`
                      : prediction.predicted_outcome === 'D'
                      ? `Both teams exhibit closely matched form indices. The model assigns high probability to a stalemate draw.`
                      : `${prediction.away_team} overcomes host home advantage due to superior goal differential and points form.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <PlayCircle className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">
                  Configure the matchup on the left and click Simulate Kickoff to view inference results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
