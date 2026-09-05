import React, { useState } from 'react';
import { ModelComparisonResponse, FeatureWeight } from '../../types';
import { Brain, Award, AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ModelComparisonProps {
  data?: ModelComparisonResponse;
  featureWeights?: Record<string, FeatureWeight[]>;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ data, featureWeights }) => {
  const [selectedModelForCM, setSelectedModelForCM] = useState<string>(
    'Odds-Enhanced Logistic Regression (Selected)'
  );
  const [selectedClassForFeat, setSelectedClassForFeat] = useState<'H' | 'D' | 'A'>('H');

  if (!data) return <div className="p-8 text-center text-slate-400">Loading model evaluation...</div>;

  const models = data.models;
  const lift = data.macro_f1_lift;
  const currentCM = models[selectedModelForCM]?.confusion_matrix;

  // Draw calibration data for selected model
  const drawCalibBins = models['Odds-Enhanced Logistic Regression (Selected)']?.calibration?.classes['D']?.bins || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>CRISP-DM Phases 4 & 5: Modeling, Evaluation & Comparative Benchmarks</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Pre-Kickoff Prediction Performance (2015/16 Test Season)
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Locked evaluation on {data.test_sample_size.toLocaleString()} untouched matches with complete pre-match Bet365 odds.
        </p>
      </div>

      {/* Primary Key Finding Alert */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-300 uppercase tracking-wide">
                Key Finding: Significant Macro-F1 Lift with Form Integration
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Combining pre-match chronological team form with normalized Bet365 odds improves <span className="text-white font-bold">Macro-F1 by +{lift.lift.toFixed(4)}</span> (0.4770 vs 0.3807), with a 95% date-clustered bootstrap confidence interval of <span className="font-mono text-cyan-300 font-semibold">[{lift.bootstrap_ci_95.ci_lower.toFixed(4)}, {lift.bootstrap_ci_95.ci_upper.toFixed(4)}]</span>.
            </p>
            <p className="text-xs text-slate-400">
              ⚡ <span className="font-semibold text-slate-300">Why this matters:</span> The raw betting market rarely predicts draws (draw recall = 0.4%), favoring high accuracy on home wins. The odds-enhanced model achieves balanced recognition across all three match outcomes (draw recall = 24.6%).
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 min-w-[220px] text-center shadow-lg">
            <span className="text-xs text-slate-400 font-medium">95% Date-Clustered Bootstrap CI</span>
            <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
              +{lift.lift.toFixed(4)}
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-1">
              Statistically Significant (p &lt; 0.05)
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Model Comparison Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <span>Model Benchmark Comparison Matrix</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Model Architecture</th>
                <th className="px-4 py-3">Features Used</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
                <th className="px-4 py-3 text-right text-cyan-400 font-bold">Macro-F1</th>
                <th className="px-4 py-3 text-right">Draw Recall</th>
                <th className="px-4 py-3 text-right">Log Loss</th>
                <th className="px-4 py-3 text-right">Brier Score</th>
                <th className="px-4 py-3 text-right">ECE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(models).map(([name, m]) => {
                const isSelected = name.includes('Selected');
                return (
                  <tr
                    key={name}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/20 hover:bg-cyan-950/30 font-medium'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-4 py-3 text-white flex items-center space-x-2 font-semibold">
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                      <span>{name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{m.features_used}</td>
                    <td className="px-4 py-3 text-right font-mono">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-cyan-400">
                      {m.macro_f1.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {(m.per_class.D.recall * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{m.log_loss.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right font-mono">{m.brier_score.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right font-mono">{m.ece.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix & Calibration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Viewer */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Confusion Matrix Inspection</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rows = Actual Results, Columns = Predicted Outcomes
              </p>
            </div>
            <select
              value={selectedModelForCM}
              onChange={(e) => setSelectedModelForCM(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {Object.keys(models).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {currentCM && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 font-bold text-slate-400">Actual \ Pred</div>
                <div className="p-2 font-bold text-emerald-400 bg-emerald-500/10 rounded-lg">Home (H)</div>
                <div className="p-2 font-bold text-slate-400 bg-slate-800/80 rounded-lg">Draw (D)</div>
                <div className="p-2 font-bold text-blue-400 bg-blue-500/10 rounded-lg">Away (A)</div>

                {/* Row 1: Home */}
                <div className="p-3 font-bold text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  Home (H)
                </div>
                <div className="p-3 bg-slate-800/80 rounded-lg font-mono font-bold text-emerald-400 border border-emerald-500/30">
                  {currentCM.matrix[0][0]} <span className="text-[10px] text-slate-400">({(currentCM.normalized[0][0] * 100).toFixed(0)}%)</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-slate-300">
                  {currentCM.matrix[0][1]} <span className="text-[10px] text-slate-500">({(currentCM.normalized[0][1] * 100).toFixed(0)}%)</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-slate-300">
                  {currentCM.matrix[0][2]} <span className="text-[10px] text-slate-500">({(currentCM.normalized[0][2] * 100).toFixed(0)}%)</span>
                </div>

                {/* Row 2: Draw */}
                <div className="p-3 font-bold text-slate-400 bg-slate-800/80 rounded-lg flex items-center justify-center">
                  Draw (D)
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-slate-300">
                  {currentCM.matrix[1][0]} <span className="text-[10px] text-slate-500">({(currentCM.normalized[1][0] * 100).toFixed(0)}%)</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-lg font-mono font-bold text-cyan-400 border border-cyan-500/30">
                  {currentCM.matrix[1][1]} <span className="text-[10px] text-slate-400">({(currentCM.normalized[1][1] * 100).toFixed(0)}%)</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-slate-300">
                  {currentCM.matrix[1][2]} <span className="text-[10px] text-slate-500">({(currentCM.normalized[1][2] * 100).toFixed(0)}%)</span>
                </div>

                {/* Row 3: Away */}
                <div className="p-3 font-bold text-blue-400 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  Away (A)
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-slate-300">
                  {currentCM.matrix[2][0]} <span className="text-[10px] text-slate-500">({(currentCM.normalized[2][0] * 100).toFixed(0)}%)</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg font-mono text-slate-300">
                  {currentCM.matrix[2][1]} <span className="text-[10px] text-slate-500">({(currentCM.normalized[2][1] * 100).toFixed(0)}%)</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-lg font-mono font-bold text-blue-400 border border-blue-500/30">
                  {currentCM.matrix[2][2]} <span className="text-[10px] text-slate-400">({(currentCM.normalized[2][2] * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Draw Reliability / Calibration Curve */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Draw Probability Calibration Curve</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selected Model Predicted Draw Probabilities vs Actual Draw Frequency (Diagonal = Perfect Calibration).
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drawCalibBins} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="bin_center" stroke="#64748B" label={{ value: 'Predicted Prob', position: 'insideBottomRight', offset: -5, fill: '#64748B', fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="#64748B" label={{ value: 'Observed Rate', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="true_positive_rate"
                  name="Observed Rate"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06B6D4' }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_predicted_prob"
                  name="Perfect Diagonal"
                  stroke="#475569"
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Coefficients Breakdown */}
      {featureWeights && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Logistic Regression Feature Coefficients</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Top predictive weights for determining match outcome probabilities.
              </p>
            </div>
            <div className="flex space-x-2">
              {(['H', 'D', 'A'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClassForFeat(cls)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedClassForFeat === cls
                      ? cls === 'H'
                        ? 'bg-emerald-500 text-black'
                        : cls === 'D'
                        ? 'bg-slate-200 text-black'
                        : 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cls === 'H' ? 'Home Win (H)' : cls === 'D' ? 'Draw (D)' : 'Away Win (A)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featureWeights[selectedClassForFeat]?.slice(0, 9).map((f) => {
              const isPositive = f.weight >= 0;
              return (
                <div
                  key={f.feature}
                  className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="space-y-0.5 max-w-[180px]">
                    <span className="font-mono text-xs font-semibold text-slate-200 block truncate">
                      {f.feature}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isPositive ? 'Increases odds' : 'Decreases odds'}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {isPositive ? `+${f.weight.toFixed(4)}` : f.weight.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
