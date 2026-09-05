import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/layout/Hero';
import { EdaDashboard } from './components/eda/EdaDashboard';
import { ModelComparison } from './components/models/ModelComparison';
import { MatchExplorer } from './components/explorer/MatchExplorer';
import { LiveMatchPredictor } from './components/simulator/LiveMatchPredictor';
import { api } from './services/api';
import {
  EdaSummary,
  LeagueStats,
  SeasonTrend,
  GoalDistribution,
  TeamRanking,
  ModelComparisonResponse,
  FeatureWeight
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // State
  const [edaSummary, setEdaSummary] = useState<EdaSummary | undefined>();
  const [leagues, setLeagues] = useState<LeagueStats[]>([]);
  const [seasons, setSeasons] = useState<SeasonTrend[]>([]);
  const [goalDist, setGoalDist] = useState<GoalDistribution[]>([]);
  const [teams, setTeams] = useState<TeamRanking[]>([]);
  const [modelsData, setModelsData] = useState<ModelComparisonResponse | undefined>();
  const [featureWeights, setFeatureWeights] = useState<Record<string, FeatureWeight[]> | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const [sum, lgs, sea, gd, tms, mods, feats] = await Promise.all([
          api.getEdaSummary(),
          api.getLeagues(),
          api.getSeasons(),
          api.getGoalDistributions(),
          api.getTeams(),
          api.getModelComparison(),
          api.getFeatureCoefficients()
        ]);

        setEdaSummary(sum);
        setLeagues(lgs);
        setSeasons(sea);
        setGoalDist(gd.distribution);
        setTeams(tms);
        setModelsData(mods);
        setFeatureWeights(feats);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center space-y-4 text-slate-300">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="font-semibold text-sm tracking-wide">Loading European Soccer DS Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'overview' && (
          <div>
            <Hero
              eda={edaSummary}
              models={modelsData}
              onExploreMatches={() => setActiveTab('explorer')}
              onOpenSimulator={() => setActiveTab('simulator')}
            />
            {/* Embedded summary sections in Overview */}
            <div className="border-t border-slate-800/80">
              <EdaDashboard
                summary={edaSummary}
                leagues={leagues}
                seasons={seasons}
                goalDistributions={goalDist}
                teams={teams}
              />
            </div>
            <div className="border-t border-slate-800/80">
              <ModelComparison data={modelsData} featureWeights={featureWeights} />
            </div>
          </div>
        )}

        {activeTab === 'eda' && (
          <EdaDashboard
            summary={edaSummary}
            leagues={leagues}
            seasons={seasons}
            goalDistributions={goalDist}
            teams={teams}
          />
        )}

        {activeTab === 'models' && (
          <ModelComparison data={modelsData} featureWeights={featureWeights} />
        )}

        {activeTab === 'explorer' && (
          <MatchExplorer leagues={edaSummary?.leagues_covered || []} />
        )}

        {activeTab === 'simulator' && (
          <LiveMatchPredictor topTeams={teams.map((t) => t.team_name)} />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300">CMPE 255 — Data Mining Assignment 1 Part 1</span>
            <p className="text-[11px] mt-0.5">CRISP-DM European Soccer Home Advantage & Pre-Kickoff Prediction System</p>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React + Vite Frontend</span>
            <span>•</span>
            <span>Kaggle SQLite Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
