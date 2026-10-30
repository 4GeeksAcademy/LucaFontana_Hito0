export type InvalidBreakdownItem = {
  rule: string;
  label: string;
  count: number;
};

export type CategoryBreakdownItem = {
  category: string;
  count: number;
  percentage: number;
};

export type StatusBreakdownItem = {
  status: string;
  count: number;
  percentage: number;
};

export type SatisfactionBreakdownItem = {
  score: number;
  label: string;
  count: number;
  percentage: number;
};

export type IncidentAnalysisResponse = {
  source_file: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  invalid_breakdown: InvalidBreakdownItem[];
  category_breakdown: CategoryBreakdownItem[];
  status_breakdown: StatusBreakdownItem[];
  satisfaction_index: {
    closed_cases: number;
    scored_closed_cases: number;
    average_score: number;
    breakdown: SatisfactionBreakdownItem[];
  };
};