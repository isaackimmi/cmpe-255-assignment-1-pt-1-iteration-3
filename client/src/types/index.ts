export interface EdaSummary {
  total_matches: number;
  outcomes: {
    home_wins: number;
    home_win_pct: number;
    draws: number;
    draw_pct: number;
    away_wins: number;
    away_win_pct: number;
  };
  goals: {
    avg_home_goals: number;
    avg_away_goals: number;
    avg_total_goals: number;
    home_goal_advantage: number;
  };
  seasons_covered: string[];
  leagues_covered: string[];
}

export interface LeagueStats {
  league_name: string;
  country_name: string;
  total_matches: number;
  home_win_pct: number;
  draw_pct: number;
  away_win_pct: number;
  avg_home_goals: number;
  avg_away_goals: number;
  goal_advantage: number;
}

export interface SeasonTrend {
  season: string;
  total_matches: number;
  home_win_pct: number;
  draw_pct: number;
  away_win_pct: number;
  avg_home_goals: number;
  avg_away_goals: number;
  goal_advantage: number;
}

export interface GoalDistribution {
  goals: string;
  home_frequency: number;
  away_frequency: number;
  home_pct: number;
  away_pct: number;
}

export interface TeamRanking {
  team_name: string;
  league: string;
  home_matches: number;
  home_win_pct: number;
  away_matches: number;
  away_win_pct: number;
  home_advantage_gap: number;
}

export interface ModelMetrics {
  accuracy: number;
  macro_f1: number;
  log_loss: number;
  brier_score: number;
  ece: number;
  model_type: string;
  features_used: string;
  per_class: {
    H: { precision: number; recall: number; f1: number };
    D: { precision: number; recall: number; f1: number };
    A: { precision: number; recall: number; f1: number };
  };
  confusion_matrix: {
    labels: string[];
    matrix: number[][];
    normalized: number[][];
  };
  calibration?: {
    classes: Record<string, {
      bins: Array<{
        bin_center: number;
        avg_predicted_prob: number;
        true_positive_rate: number;
        count: number;
      }>;
      ece: number;
    }>;
    mean_ece: number;
  };
}

export interface ModelComparisonResponse {
  test_sample_size: number;
  test_season: string;
  models: Record<string, ModelMetrics>;
  macro_f1_lift: {
    selected_model: string;
    baseline_model: string;
    macro_f1_selected: number;
    macro_f1_market: number;
    lift: number;
    bootstrap_ci_95: {
      mean_diff: number;
      ci_lower: number;
      ci_upper: number;
      is_significant: boolean;
    };
  };
}

export interface FeatureWeight {
  feature: string;
  weight: number;
}

export interface Fixture {
  id: number;
  date: string;
  league_name: string;
  country_name: string;
  home_team: string;
  away_team: string;
  home_goals: number;
  away_goals: number;
  actual_result: string;
  odds: {
    b365_h: number | null;
    b365_d: number | null;
    b365_a: number | null;
    implied_prob_h: number | null;
    implied_prob_d: number | null;
    implied_prob_a: number | null;
  };
  form: {
    home_recent_points: number;
    away_recent_points: number;
    home_recent_gd: number;
    away_recent_gd: number;
    home_rest_days: number;
    away_rest_days: number;
  };
  selected_model_prediction: {
    predicted_result: string;
    prob_h: number;
    prob_d: number;
    prob_a: number;
    is_correct: boolean;
  };
}

export interface FixturesResponse {
  total: number;
  offset: number;
  limit: number;
  matches: Fixture[];
}

export interface PredictRequest {
  home_team: string;
  away_team: string;
  home_recent_points: number;
  away_recent_points: number;
  home_recent_win_rate: number;
  away_recent_win_rate: number;
  home_recent_goals_scored: number;
  away_recent_goals_scored: number;
  home_recent_goals_conceded: number;
  away_recent_goals_conceded: number;
  home_recent_goal_diff: number;
  away_recent_goal_diff: number;
  home_venue_recent_points: number;
  away_venue_recent_points: number;
  home_rest_days: number;
  away_rest_days: number;
  b365_h?: number;
  b365_d?: number;
  b365_a?: number;
}

export interface PredictResponse {
  home_team: string;
  away_team: string;
  predicted_outcome: string;
  predicted_label: string;
  probabilities: {
    H: number;
    D: number;
    A: number;
  };
  confidence: number;
}
