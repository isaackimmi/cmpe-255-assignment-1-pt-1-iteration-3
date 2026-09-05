import React, { useState } from 'react';
import { EdaSummary, LeagueStats, SeasonTrend, GoalDistribution, TeamRanking } from '../../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Home, Compass, Calendar, Goal, Trophy, ArrowUpRight } from 'lucide-react';

interface EdaDashboardProps {
  summary?: EdaSummary;
  leagues: LeagueStats[];
  seasons: SeasonTrend[];
  goalDistributions: GoalDistribution[];
  teams: TeamRanking[];
}

export const EdaDashboard: React.FC<EdaDashboardProps> = ({
  summary,
  leagues,
  seasons,
  goalDistributions,
  teams,
}) => {
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [teamSearch, setTeamSearch] = useState<string>('');

  const filteredTeams = teams.filter((t) => {
    const matchesSearch = t.team_name.toLowerCase().includes(teamSearch.toLowerCase());
    const matchesLeague = selectedLeague === 'All' || t.league === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>CRISP-DM Phase 2: Data Understanding & Exploratory Analysis</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Home-Field Advantage Across Europe (2008/09 – 2015/16)
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Analyzing 25,979 matches across 11 top-tier European leagues to quantify the structural advantage of playing at home.
        </p>
      </div>

      {/* Outcome Breakdown Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Home className="w-20 h-20 text-emerald-400" />
          </div>
          <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Home Wins (H)</span>
          <div className="text-4xl font-extrabold text-white mt-2">
            {summary?.outcomes.home_win_pct}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary?.outcomes.home_wins.toLocaleString()} matches won by host teams
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
              style={{ width: `${summary?.outcomes.home_win_pct}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Draws (D)</span>
          <div className="text-4xl font-extrabold text-white mt-2">
            {summary?.outcomes.draw_pct}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary?.outcomes.draws.toLocaleString()} matches ended level
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-slate-500 to-slate-400 h-full rounded-full"
              style={{ width: `${summary?.outcomes.draw_pct}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">Away Wins (A)</span>
          <div className="text-4xl font-extrabold text-white mt-2">
            {summary?.outcomes.away_win_pct}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary?.outcomes.away_wins.toLocaleString()} matches won by visiting teams
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full"
              style={{ width: `${summary?.outcomes.away_win_pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* League Comparison Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <span>Home vs Draw vs Away Rates by League</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Spain (La Liga) and England (Premier League) exhibit strong home win rates (~46-47%).
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={leagues}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748B" unit="%" />
              <YAxis
                type="category"
                dataKey="league_name"
                stroke="#94A3B8"
                tick={{ fontSize: 11 }}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#F8FAFC'
                }}
              />
              <Legend />
              <Bar dataKey="home_win_pct" name="Home Win %" fill="#10B981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="draw_pct" name="Draw %" fill="#64748B" radius={[0, 4, 4, 0]} />
              <Bar dataKey="away_win_pct" name="Away Win %" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Season Trend & Goal Distribution in 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Season Trend */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Season-by-Season Home Advantage Stability</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Home win rate remains remarkably stable between 44% and 47% across 8 consecutive seasons.
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seasons} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="season" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={[35, 55]} stroke="#64748B" unit="%" />
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
                  dataKey="home_win_pct"
                  name="Home Win %"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="away_win_pct"
                  name="Away Win %"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Goal className="w-4 h-4 text-emerald-400" />
              <span>Goal Scoring Distribution (Home vs Away)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Host teams average 1.54 goals/game vs 1.16 goals/game for visiting teams.
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalDistributions} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="goals" stroke="#64748B" />
                <YAxis stroke="#64748B" unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC'
                  }}
                />
                <Legend />
                <Bar dataKey="home_pct" name="Home Goals %" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="away_pct" name="Away Goals %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Level Breakdown Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Team-Level Home Dominance Ranking</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Teams with highest home win rate and home vs away disparity (min. 30 home & away games).
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Leagues</option>
              {leagues.map((l) => (
                <option key={l.league_name} value={l.league_name}>
                  {l.league_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search team..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">League</th>
                <th className="px-4 py-3 text-center">Home Matches</th>
                <th className="px-4 py-3 text-right">Home Win %</th>
                <th className="px-4 py-3 text-right">Away Win %</th>
                <th className="px-4 py-3 text-right text-emerald-400">Home Gap (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTeams.slice(0, 10).map((t, idx) => (
                <tr key={t.team_name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white flex items-center space-x-2">
                    <span className="text-slate-500 text-xs w-4">#{idx + 1}</span>
                    <span>{t.team_name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{t.league}</td>
                  <td className="px-4 py-3 text-center">{t.home_matches}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">{t.home_win_pct}%</td>
                  <td className="px-4 py-3 text-right text-blue-400">{t.away_win_pct}%</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-300">+{t.home_advantage_gap}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
