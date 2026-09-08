import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { PredictResponse, PredictRequest } from '../../types';
import { PlayCircle, Zap, Shield, Flame, Activity, Sparkles, Scale, Percent, ArrowRightLeft, RefreshCw } from 'lucide-react';

interface LiveMatchPredictorProps {
  topTeams: string[];
}

export const LiveMatchPredictor: React.FC<LiveMatchPredictorProps> = ({ topTeams }) => {
  const [homeTeam, setHomeTeam] = useState<string>('Arsenal');
  const [awayTeam, setAwayTeam] = useState<string>('Chelsea');

  // Home form state (numeric)
  const [homePts, setHomePts] = useState<number>(2.2);
  const [homeWinRate, setHomeWinRate] = useState<number>(0.65);
  const [homeGf, setHomeGf] = useState<number>(2.4);
  const [homeGa, setHomeGa] = useState<number>(0.8);
  const [homeRest, setHomeRest] = useState<number>(7);

  // Away form state (numeric)
  const [awayPts, setAwayPts] = useState<number>(1.6);
  const [awayWinRate, setAwayWinRate] = useState<number>(0.45);
  const [awayGf, setAwayGf] = useState<number>(1.4);
  const [awayGa, setAwayGa] = useState<number>(1.2);
  const [awayRest, setAwayRest] = useState<number>(4);

  // Odds state (using string for robust input typing without NaN)
  const [useOdds, setUseOdds] = useState<boolean>(true);
  const [oddsHStr, setOddsHStr] = useState<string>('2.10');
  const [oddsDStr, setOddsDStr] = useState<string>('3.40');
  const [oddsAStr, setOddsAStr] = useState<string>('3.60');

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);

  // Safe numerical parsers
  const numOddsH = useMemo(() => {
    const v = parseFloat(oddsHStr);
    return !isNaN(v) && v > 1.0 ? v : null;
  }, [oddsHStr]);

  const numOddsD = useMemo(() => {
    const v = parseFloat(oddsDStr);
    return !isNaN(v) && v > 1.0 ? v : null;
  }, [oddsDStr]);

  const numOddsA = useMemo(() => {
    const v = parseFloat(oddsAStr);
    return !isNaN(v) && v > 1.0 ? v : null;
  }, [oddsAStr]);

  // Live calculation of implied market probabilities from entered odds
  const impliedMarketProbs = useMemo(() => {
    if (!useOdds || !numOddsH || !numOddsD || !numOddsA) return null;
    const invH = 1.0 / numOddsH;
    const invD = 1.0 / numOddsD;
    const invA = 1.0 / numOddsA;
    const overround = invH + invD + invA;

    return {
      probH: invH / overround,
      probD: invD / overround,
      probA: invA / overround,
      overroundPct: (overround - 1.0) * 100
    };
  }, [useOdds, numOddsH, numOddsD, numOddsA]);

  const executePrediction = async () => {
    setLoading(true);
    try {
      const payload: PredictRequest = {
        home_team: homeTeam.trim() || 'Home Team',
        away_team: awayTeam.trim() || 'Away Team',
        home_recent_points: homePts,
        away_recent_points: awayPts,
        home_recent_win_rate: homeWinRate,
        away_recent_win_rate: awayWinRate,
        home_recent_goals_scored: homeGf,
        away_recent_goals_scored: awayGf,
        home_recent_goals_conceded: homeGa,
        away_recent_goals_conceded: awayGa,
        home_recent_goal_diff: homeGf - homeGa,
        home_venue_recent_points: Math.min(3.0, Math.max(0.0, Number((homePts * 1.1).toFixed(2)))),
        away_venue_recent_points: Math.min(3.0, Math.max(0.0, Number((awayPts * 0.9).toFixed(2)))),
        home_rest_days: homeRest,
        away_rest_days: awayRest,
        ...(useOdds && numOddsH && numOddsD && numOddsA
          ? {
              b365_h: numOddsH,
              b365_d: numOddsD,
              b365_a: numOddsA
            }
          : {})
      };

      const res = await api.predictMatch(payload);
      setPrediction(res);
    } catch (e) {
      console.error('Inference error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Run initial prediction on mount
  useEffect(() => {
    executePrediction();
  }, []);

  const applyPreset = (h: number, d: number, a: number, hP: number, aP: number) => {
    setOddsHStr(h.toFixed(2));
    setOddsDStr(d.toFixed(2));
    setOddsAStr(a.toFixed(2));
    setHomePts(hP);
    setAwayPts(aP);
    setHomeGf(hP * 1.1);
    setAwayGf(aP * 0.9);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
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
          Test any hypothetical pre-match matchup. Adjust recent 5-game form, rest days, and betting odds to see real-time model inference and probability distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Matchup Selection */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
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
                  className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
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
                  className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Form Sliders: Home vs Away */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Recent 5-Match Form Parameters</span>
            </h3>

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
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setHomePts(isNaN(v) ? 0 : v);
                  }}
                  className="accent-emerald-500 w-full cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={awayPts}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setAwayPts(isNaN(v) ? 0 : v);
                  }}
                  className="accent-blue-500 w-full cursor-pointer"
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
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setHomeGf(isNaN(v) ? 0 : v);
                  }}
                  className="accent-emerald-500 w-full cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={awayGf}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setAwayGf(isNaN(v) ? 0 : v);
                  }}
                  className="accent-blue-500 w-full cursor-pointer"
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
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setHomeRest(isNaN(v) ? 7 : v);
                  }}
                  className="accent-emerald-500 w-full cursor-pointer"
                />
                <input
                  type="range"
                  min="2"
                  max="21"
                  value={awayRest}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setAwayRest(isNaN(v) ? 7 : v);
                  }}
                  className="accent-blue-500 w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Betting Odds Input & Presets */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
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

            {/* Quick Matchup Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">Quick Scenario Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(1.35, 5.00, 8.50, 2.6, 0.8)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-400 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  🔥 Heavy Home Fav (1.35)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(2.45, 3.25, 2.90, 1.8, 1.7)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  ⚖️ Even Derby (2.45 / 3.25 / 2.90)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(5.50, 4.00, 1.60, 0.9, 2.4)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-blue-400 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  ✈️ Away Giant (1.60)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(2.10, 3.40, 3.60, 2.2, 1.6)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-400 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  📊 League Average (2.10 / 3.40 / 3.60)
                </button>
              </div>
            </div>

            {useOdds && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-400 block mb-1">
                      Home (B365H)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={oddsHStr}
                      onChange={(e) => setOddsHStr(e.target.value)}
                      placeholder="e.g. 2.10"
                      className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Draw (B365D)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={oddsDStr}
                      onChange={(e) => setOddsDStr(e.target.value)}
                      placeholder="e.g. 3.40"
                      className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-slate-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-blue-400 block mb-1">
                      Away (B365A)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={oddsAStr}
                      onChange={(e) => setOddsAStr(e.target.value)}
                      placeholder="e.g. 3.60"
                      className="w-full bg-slate-800 border border-slate-700 text-sm rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>

                {/* Live Calculated Market Implied Probabilities Box */}
                {impliedMarketProbs ? (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <Percent className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Calculated Market Implied Probabilities:</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Bookmaker Overround: +{impliedMarketProbs.overroundPct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <div className="text-[10px] uppercase text-slate-400 font-sans">Home Win</div>
                        <div className="text-sm font-extrabold">{(impliedMarketProbs.probH * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-200">
                        <div className="text-[10px] uppercase text-slate-400 font-sans">Draw</div>
                        <div className="text-sm font-extrabold">{(impliedMarketProbs.probD * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <div className="text-[10px] uppercase text-slate-400 font-sans">Away Win</div>
                        <div className="text-sm font-extrabold">{(impliedMarketProbs.probA * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    ⚠️ Enter valid decimal odds greater than 1.0 (e.g. 2.10) to compute market implied probabilities.
                  </div>
                )}
              </div>
            )}

            <button
              onClick={executePrediction}
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Running ML Inference...' : '⚡ Simulate Kickoff Prediction'}</span>
            </button>
          </div>
        </div>

        {/* Right Output Dashboard: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-24 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Prediction Output & Probability Gauge
              </h3>
              <button
                onClick={executePrediction}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-run</span>
              </button>
            </div>

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
                    Model Predicted Winner
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
                    Predicted Outcome Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Model vs Market Probability Comparison */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                    Model vs Market Three-Way Probabilities
                  </span>

                  {/* Home Win */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-400">🏠 {prediction.home_team} Win (H)</span>
                      <div className="flex items-center space-x-2 font-mono text-xs">
                        <span className="text-emerald-400 font-bold">
                          Model: {(prediction.probabilities.H * 100).toFixed(1)}%
                        </span>
                        {impliedMarketProbs && (
                          <span className="text-slate-500 text-[11px]">
                            (Mkt: {(impliedMarketProbs.probH * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probabilities.H * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Draw */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">🤝 Draw (D)</span>
                      <div className="flex items-center space-x-2 font-mono text-xs">
                        <span className="text-cyan-400 font-bold">
                          Model: {(prediction.probabilities.D * 100).toFixed(1)}%
                        </span>
                        {impliedMarketProbs && (
                          <span className="text-slate-500 text-[11px]">
                            (Mkt: {(impliedMarketProbs.probD * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-slate-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probabilities.D * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Away Win */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-blue-400">✈️ {prediction.away_team} Win (A)</span>
                      <div className="flex items-center space-x-2 font-mono text-xs">
                        <span className="text-blue-400 font-bold">
                          Model: {(prediction.probabilities.A * 100).toFixed(1)}%
                        </span>
                        {impliedMarketProbs && (
                          <span className="text-slate-500 text-[11px]">
                            (Mkt: {(impliedMarketProbs.probA * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probabilities.A * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tactical Insight Box */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Data Science Tactical Insight</span>
                  </div>
                  <p className="leading-relaxed text-slate-400">
                    {prediction.predicted_outcome === 'H'
                      ? `${prediction.home_team} benefits from structural home pitch advantage (+0.38 goal delta) and superior recent rolling form momentum.`
                      : prediction.predicted_outcome === 'D'
                      ? `Both teams exhibit closely matched form indices. The model assigns high probability to a stalemate draw.`
                      : `${prediction.away_team} overcomes host home advantage due to superior goal differential and form momentum.`}
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
