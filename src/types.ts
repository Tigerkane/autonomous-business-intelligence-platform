export interface IssueExample {
  /** Line number in the uploaded file (the header row is line 1) */
  row: number;
  detail: string;
}

export interface ValidationIssue {
  code: string;
  /** Completes the sentence "N rows ..." (e.g. "with invalid or unreadable dates") */
  label: string;
  /** error = rows were dropped, warning = rows were kept */
  severity: 'error' | 'warning';
  count: number;
  examples: IssueExample[];
}

export interface DataQuality {
  /** upload = computed from the original file, stored = recomputed from saved rows */
  source: 'upload' | 'stored';
  rows_in_file: number;
  rows_kept: number;
  rows_dropped: number;
  date_start: string;
  date_end: string;
  span_days: number;
  months_with_data: number;
  days_with_sales: number;
  avg_transactions_per_day: number;
  /** Blank cells per required column in the original file */
  missing_values: Record<string, number>;
  warnings: string[];
  issues: ValidationIssue[];
}

export interface DatasetStatus {
  database_exists: boolean;
  total_rows?: number;
  total_quantity?: number;
  total_sales?: number;
  average_transaction?: number;
  filename?: string;
  uploaded_at?: string;
  quality?: DataQuality;
}

export interface KPIStats {
  total_sales: number;
  total_quantity: number;
  total_transactions: number;
  average_transaction: number;
  total_cost?: number;
  total_profit?: number;
  profit_margin?: number;
}

export interface OverviewData {
  dataset: {
    rows: number;
    start: string;
    end: string;
  };
  kpis: KPIStats;
  trends: {
    revenue?: number;
    units?: number;
    transactions?: number;
    avg?: number;
    profit?: number;
    label?: string;
  };
  weekly: { date: string; revenue: number; profit?: number }[];
  monthly: {
    month: string;
    total_revenue: number;
    avg_revenue: number;
    total_profit?: number;
    profit_margin?: number;
    partial: boolean;
  }[];
  categories: { category: string; sales: number; profit?: number; margin?: number }[];
  segments: {
    age: { segment: string; count: number; revenue: number }[];
    gender: { segment: string; count: number; revenue: number; unique_customers?: number }[];
  };
  customer_gender_split?: {
    male: number;
    female: number;
    unknown: number;
  };
}

export interface GenderStat {
  gender: string;
  orders: number;
  units: number;
  revenue: number;
  avg_basket: number;
  unique_customers: number;
  share: number;
}

export interface GenderCategoryMatrix {
  categories: string[];
  genders: string[];
  series: { gender: string; values: number[] }[];
}

export interface SalesAnalysisData {
  trend: {
    weekly: { date: string; revenue: number }[];
    monthly: {
      month: string;
      total_revenue: number;
      avg_revenue: number;
      partial: boolean;
    }[];
  };
  stacked: {
    months: string[];
    series: { category: string; values: number[] }[];
  };
  categories: {
    category: string;
    revenue: number;
    share: number;
    units: number;
    orders: number;
    avg_order: number;
    profit?: number;
    margin?: number;
  }[];
  weekday: { day: string; avg_daily_revenue: number }[];
  gender_analysis?: {
    stats: GenderStat[];
    matrix: GenderCategoryMatrix;
    insight: string;
  };
  insights: string[];
  partial_months_excluded: string[];
}

export interface ForecastData {
  history: { date: string; sales: number }[];
  data: {
    date: string;
    predicted: number;
    lower: number;
    upper: number;
  }[];
  model: string;
  mape: number;
  accuracy: number;
  next_month_predicted: number;
  partial_months_excluded: string[];
}

export interface AnomalyItem {
  date: string;
  value: number;
  expected: number;
  deviation: string;
  severity: 'High' | 'Medium';
  score: number;
}

export interface AnomaliesData {
  data: AnomalyItem[];
  total: number;
  threshold?: number;
}

export interface LLMProvider {
  id: string;
  label: string;
  model: string;
  configured: boolean;
  note: string;
  status_label?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  model?: string;
  provider?: string;
}
