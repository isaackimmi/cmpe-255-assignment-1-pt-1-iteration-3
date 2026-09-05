import {
  EdaSummary,
  LeagueStats,
  SeasonTrend,
  GoalDistribution,
  TeamRanking,
  ModelComparisonResponse,
  FeatureWeight,
  FixturesResponse,
  PredictRequest,
  PredictResponse
} from '../types';

const API_BASE = '/api';

export const api = {
  getEdaSummary: async (): Promise<EdaSummary> => {
    const res = await fetch(`${API_BASE}/eda/summary`);
    if (!res.ok) throw new Error('Failed to fetch EDA summary');
    return res.json();
  },

  getLeagues: async (): Promise<LeagueStats[]> => {
    const res = await fetch(`${API_BASE}/eda/leagues`);
    if (!res.ok) throw new Error('Failed to fetch leagues data');
    return res.json();
  },

  getSeasons: async (): Promise<SeasonTrend[]> => {
    const res = await fetch(`${API_BASE}/eda/seasons`);
    if (!res.ok) throw new Error('Failed to fetch seasons data');
    return res.json();
  },

  getGoalDistributions: async (): Promise<{ distribution: GoalDistribution[] }> => {
    const res = await fetch(`${API_BASE}/eda/goal-distributions`);
    if (!res.ok) throw new Error('Failed to fetch goal distributions');
    return res.json();
  },

  getTeams: async (): Promise<TeamRanking[]> => {
    const res = await fetch(`${API_BASE}/eda/teams`);
    if (!res.ok) throw new Error('Failed to fetch team rankings');
    return res.json();
  },

  getModelComparison: async (): Promise<ModelComparisonResponse> => {
    const res = await fetch(`${API_BASE}/models/comparison`);
    if (!res.ok) throw new Error('Failed to fetch model comparison');
    return res.json();
  },

  getFeatureCoefficients: async (): Promise<Record<string, FeatureWeight[]>> => {
    const res = await fetch(`${API_BASE}/models/features`);
    if (!res.ok) throw new Error('Failed to fetch feature coefficients');
    return res.json();
  },

  getMatches: async (params: {
    league?: string;
    team?: string;
    result?: string;
    correct_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<FixturesResponse> => {
    const query = new URLSearchParams();
    if (params.league && params.league !== 'All') query.set('league', params.league);
    if (params.team) query.set('team', params.team);
    if (params.result && params.result !== 'All') query.set('result', params.result);
    if (params.correct_only !== undefined) query.set('correct_only', String(params.correct_only));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/matches?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  predictMatch: async (payload: PredictRequest): Promise<PredictResponse> => {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Prediction request failed');
    return res.json();
  }
};
