import React, { useState, useEffect } from 'react';
import { Fixture } from '../../types';
import { api } from '../../services/api';
import { Search, Filter, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';

interface MatchExplorerProps {
  leagues: string[];
}

export const MatchExplorer: React.FC<MatchExplorerProps> = ({ leagues }) => {
  const [matches, setMatches] = useState<Fixture[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [selectedResult, setSelectedResult] = useState<string>('All');
  const [teamSearch, setTeamSearch] = useState<string>('');
  const [correctFilter, setCorrectFilter] = useState<string>('all'); // all, correct, incorrect
  const [page, setPage] = useState<number>(0);
  const pageSize = 12;

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const correctOnly =
        correctFilter === 'correct' ? true : correctFilter === 'incorrect' ? false : undefined;
      const res = await api.getMatches({
        league: selectedLeague,
        team: teamSearch,
        result: selectedResult,
        correct_only: correctOnly,
        limit: pageSize,
        offset: page * pageSize
      });
      setMatches(res.matches);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedLeague, selectedResult, teamSearch, correctFilter, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>Interactive Match Explorer (2015/16 Test Partition)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Inspect 2015/16 Fixtures & Predictions
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Browse historical fixtures with pre-kickoff betting odds, rolling form statistics, and actual vs model predictions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* League Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">League:</span>
            <select
              value={selectedLeague}
              onChange={(e) => {
                setSelectedLeague(e.target.value);
                setPage(0);
              }}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Leagues</option>
              {leagues.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Result Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Outcome:</span>
            <select
              value={selectedResult}
              onChange={(e) => {
                setSelectedResult(e.target.value);
                setPage(0);
              }}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Results</option>
              <option value="H">Home Win (H)</option>
              <option value="D">Draw (D)</option>
              <option value="A">Away Win (A)</option>
            </select>
          </div>

          {/* Model Accuracy Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Model:</span>
            <select
              value={correctFilter}
              onChange={(e) => {
                setCorrectFilter(e.target.value);
                setPage(0);
              }}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Predictions</option>
              <option value="correct">Correct Only</option>
              <option value="incorrect">Incorrect Only</option>
            </select>
          </div>
        </div>

        {/* Team Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search team (e.g. Arsenal)..."
            value={teamSearch}
            onChange={(e) => {
              setTeamSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg pl-9 pr-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Fixtures Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading fixtures...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          No matches found matching the filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => {
            const pred = m.selected_model_prediction;
            const isCorrect = pred.is_correct;

            return (
              <div
                key={m.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all shadow-sm flex flex-col justify-between"
              >
                {/* League & Date Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2.5">
                  <span className="font-medium text-slate-300">{m.league_name}</span>
                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{m.date}</span>
                  </div>
                </div>

                {/* Score & Matchup */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-sm text-white">
                    <span className="truncate pr-2">{m.home_team}</span>
                    <span className="text-base px-2 py-0.5 rounded bg-slate-800 font-mono">
                      {m.home_goals}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-sm text-white">
                    <span className="truncate pr-2">{m.away_team}</span>
                    <span className="text-base px-2 py-0.5 rounded bg-slate-800 font-mono">
                      {m.away_goals}
                    </span>
                  </div>
                </div>

                {/* Odds & Model Predictions */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Actual Result:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        m.actual_result === 'H'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : m.actual_result === 'D'
                          ? 'bg-slate-700/60 text-slate-200'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}
                    >
                      {m.actual_result === 'H'
                        ? 'Home Win'
                        : m.actual_result === 'D'
                        ? 'Draw'
                        : 'Away Win'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Model Predicted:</span>
                    <div className="flex items-center space-x-1.5 font-bold text-[11px]">
                      {isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                        {pred.predicted_result === 'H'
                          ? 'Home'
                          : pred.predicted_result === 'D'
                          ? 'Draw'
                          : 'Away'}
                      </span>
                    </div>
                  </div>

                  {/* Predicted Probabilities Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                      <span>H: {(pred.prob_h * 100).toFixed(0)}%</span>
                      <span>D: {(pred.prob_d * 100).toFixed(0)}%</span>
                      <span>A: {(pred.prob_a * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full flex overflow-hidden">
                      <div style={{ width: `${pred.prob_h * 100}%` }} className="bg-emerald-500" />
                      <div style={{ width: `${pred.prob_d * 100}%` }} className="bg-slate-400" />
                      <div style={{ width: `${pred.prob_a * 100}%` }} className="bg-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-4">
        <span>
          Showing {matches.length > 0 ? page * pageSize + 1 : 0} to{' '}
          {Math.min((page + 1) * pageSize, total)} of {total.toLocaleString()} fixtures
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-medium flex items-center space-x-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span className="px-3 py-1.5 text-slate-300 font-mono">
            {page + 1} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-medium flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
