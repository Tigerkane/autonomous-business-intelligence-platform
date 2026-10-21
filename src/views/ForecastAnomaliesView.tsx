import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Sliders,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ListFilter,
  Download,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useData } from '../contexts/DataContext';
import { AnomaliesData, ForecastData } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { NavTab } from '../components/layout/Sidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const inr = (v: number) => '₹' + Math.round(v || 0).toLocaleString('en-IN');

interface UnusualTransaction {
  transaction_id: string;
  date: string;
  customer_id: string;
  category: string;
  amount: number;
  typical: number;
  lower_bound: number;
  upper_bound: number;
  direction: 'High' | 'Low';
  times_typical: number;
  score: number;
}

interface UnusualTransactionsData {
  data: UnusualTransaction[];
  total: number;
  by_category: Record<string, number>;
  method: string;
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const t = String(v ?? '');
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const EXPORT_BTN =
  'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer';

interface DailyPoint {
  date: string;
  value: number;
  expected: number;
}

interface ForecastAnomaliesViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const ForecastAnomaliesView: React.FC<ForecastAnomaliesViewProps> = ({ onNavigate }) => {
  const { loaded, version, theme } = useData();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomaliesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(3.5);
  const [unusual, setUnusual] = useState<UnusualTransactionsData | null>(null);
  const [txCategory, setTxCategory] = useState<string>('All');

  // Sorting & Display Controls
  const [sortField, setSortField] = useState<'date' | 'value' | 'expected' | 'severity' | 'score'>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loaded) {
      setForecast(null);
      setAnomalies(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch('/api/forecast').then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || 'Forecast calculation unavailable.');
        }
        return res.json();
      }),
      fetch(`/api/anomalies?threshold=${threshold}&limit=500`).then((res) => res.json()),
    ])
      .then(([fc, an]) => {
        if (isMounted) {
          setForecast(fc);
          setAnomalies(an);
          setForecastError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setForecastError(err.message);
          // fetch anomalies independently with current threshold
          fetch(`/api/anomalies?threshold=${threshold}&limit=500`)
            .then((r) => r.json())
            .then((an) => setAnomalies(an))
            .catch(() => {});
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loaded, version, threshold]);

  // Unusual transactions (per-category IQR) - independent of the threshold slider
  useEffect(() => {
    if (!loaded) {
      setUnusual(null);
      return;
    }
    let isMounted = true;
    fetch('/api/anomalies/transactions?limit=200')
      .then((res) => res.json())
      .then((d) => {
        if (isMounted && d && Array.isArray(d.data)) setUnusual(d);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [loaded, version]);

  const txCategories = useMemo(
    () => (unusual ? Object.keys(unusual.by_category).sort() : []),
    [unusual]
  );

  const filteredTx = useMemo(() => {
    if (!unusual) return [];
    return txCategory === 'All'
      ? unusual.data
      : unusual.data.filter((t) => t.category === txCategory);
  }, [unusual, txCategory]);

  // Sort and filter anomalies for exact display - declared before any conditional returns
  const handleSort = (field: 'date' | 'value' | 'expected' | 'severity' | 'score') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc for values/scores
    }
  };

  const sortedAnomalies = useMemo(() => {
    if (!anomalies?.data) return [];
    const list = [...anomalies.data];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'value') {
        comparison = a.value - b.value;
      } else if (sortField === 'expected') {
        comparison = a.expected - b.expected;
      } else if (sortField === 'severity') {
        const order = { High: 2, Medium: 1 };
        comparison = (order[a.severity] || 0) - (order[b.severity] || 0);
      } else {
        comparison = Math.abs(a.score) - Math.abs(b.score);
      }
      return sortAsc ? comparison : -comparison;
    });
    // Display all detected anomalies without truncation - if anomalies has 20 show 20
    return list;
  }, [anomalies, sortField, sortAsc]);

  // Daily revenue line with the rolling median baseline and flagged days marked
  const dailyChartData = useMemo(() => {
    const series: DailyPoint[] = ((anomalies as any)?.series as DailyPoint[]) || [];
    if (series.length === 0) return null;
    const flaggedByDate = new Map<string, { severity: string; score: number }>();
    (anomalies?.data || []).forEach((a) => flaggedByDate.set(a.date, { severity: a.severity, score: a.score }));

    return {
      labels: series.map((p) => p.date),
      datasets: [
        {
          label: 'Daily revenue',
          data: series.map((p) => p.value),
          borderColor: '#6366f1',
          backgroundColor: '#6366f1',
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
          order: 3,
        },
        {
          label: 'Rolling 31-day median',
          data: series.map((p) => p.expected),
          borderColor: isDark ? 'rgba(148, 163, 184, 0.8)' : 'rgba(100, 116, 139, 0.8)',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
          order: 2,
        },
        {
          label: 'Flagged day',
          data: series.map((p) => (flaggedByDate.has(p.date) ? p.value : null)),
          showLine: false,
          borderColor: 'transparent',
          backgroundColor: '#f59e0b',
          pointBackgroundColor: series.map((p) =>
            flaggedByDate.get(p.date)?.severity === 'High' ? '#ef4444' : '#f59e0b'
          ),
          pointBorderColor: isDark ? '#0d1527' : '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: series.map((p) =>
            flaggedByDate.get(p.date)?.severity === 'High' ? 6 : 5
          ),
          pointHoverRadius: 8,
          order: 1,
        },
      ],
    };
  }, [anomalies, isDark]);

  // Build forecast chart series
  let chartData: any = null;
  if (forecast) {
    const historyLabels = forecast.history.map((h) => {
      const [y, mon] = h.date.split('-');
      const d = new Date(Number(y), Number(mon) - 1, 1);
      return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    });

    const forecastLabels = forecast.data.map((f) => {
      const [y, mon] = f.date.split('-');
      const d = new Date(Number(y), Number(mon) - 1, 1);
      return `${d.toLocaleString('en-US', { month: 'short', year: '2-digit' })} (Est)`;
    });

    const allLabels = [...historyLabels, ...forecastLabels];
    const historyVals = [...forecast.history.map((h) => h.sales), ...forecast.data.map(() => null)];
    const predictedVals = [
      ...forecast.history.map(() => null),
      ...forecast.data.map((f) => f.predicted),
    ];
    // bridge last historical point to first forecast point
    if (forecast.history.length > 0 && forecast.data.length > 0) {
      predictedVals[forecast.history.length - 1] = forecast.history[forecast.history.length - 1].sales;
    }

    const upperVals = [
      ...forecast.history.map(() => null),
      ...forecast.data.map((f) => f.upper),
    ];
    const lowerVals = [
      ...forecast.history.map(() => null),
      ...forecast.data.map((f) => f.lower),
    ];

    chartData = {
      labels: allLabels,
      datasets: [
        {
          label: 'Historical Sales',
          data: historyVals,
          borderColor: '#4f46e5',
          backgroundColor: '#4f46e5',
          borderWidth: 2.5,
          pointRadius: 4,
          tension: 0.3,
        },
        {
          label: 'Predicted Sales',
          data: predictedVals,
          borderColor: '#10b981',
          borderDash: [5, 5],
          backgroundColor: '#10b981',
          borderWidth: 2.5,
          pointRadius: 4,
          tension: 0.3,
        },
        {
          label: 'Upper Confidence Bound (~80%)',
          data: upperVals,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.1)',
          fill: '+1',
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: 'Lower Confidence Bound (~80%)',
          data: lowerVals,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)',
          fill: false,
          borderWidth: 1,
          pointRadius: 0,
        },
      ],
    };
  }

  // Early returns are now strictly after ALL hooks have been invoked
  if (!loaded) {
    return <EmptyState onGoToUpload={() => onNavigate('upload')} />;
  }

  if (loading && !anomalies && !forecast) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Running forecast backtests & anomaly detection...
          </p>
        </div>
      </div>
    );
  }

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 'bold' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          label: (ctx: any) =>
            ctx.parsed.y !== null
              ? ` ${ctx.dataset.label}: ₹${Math.round(ctx.parsed.y).toLocaleString('en-IN')}`
              : '',
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (v: any) => '₹' + (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
        },
      },
    },
  };

  const dailyChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: true },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 'bold' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          title: (items: any[]) => (items[0] ? items[0].label : ''),
          label: (ctx: any) => {
            if (ctx.parsed.y === null) return '';
            const base = ` ${ctx.dataset.label}: ${inr(ctx.parsed.y)}`;
            if (ctx.dataset.label !== 'Flagged day') return base;
            const hit = anomalies?.data.find((a) => a.date === ctx.label);
            return hit
              ? `${base} (${hit.severity}, ${hit.deviation} vs median, score ${hit.score})`
              : base;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11 },
          autoSkip: true,
          maxTicksLimit: 12,
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (v: any) => '₹' + (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
        },
      },
    },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top ML Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Forecast Model */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Selected Algorithm
          </p>
          <h4 className="text-xl font-black text-slate-900 dark:text-white truncate">
            {forecast?.model || 'Linear Regression'}
          </h4>
          <span className="text-xs text-indigo-500 font-semibold mt-1 inline-block">
            Walk-forward cross-validated
          </span>
        </div>

        {/* Backtest Accuracy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Backtest Accuracy
          </p>
          <h4 className="text-xl font-black text-emerald-500">
            {forecast ? `${forecast.accuracy}%` : '—'}
          </h4>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
            MAPE: {forecast ? `${forecast.mape}%` : '—'}
          </span>
        </div>

        {/* Next Month Predicted */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Next Month Target
          </p>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">
            {forecast ? inr(forecast.next_month_predicted) : '—'}
          </h4>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
            Horizon: 6 Months Ahead
          </span>
        </div>

        {/* Anomalies Detected */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Anomalous Days
          </p>
          <h4 className="text-xl font-black text-amber-500">
            {anomalies ? `${anomalies.total} Days` : '0'}
          </h4>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
            Displaying all {sortedAnomalies.length} in table
          </span>
        </div>
      </div>

      {/* Predictive Forecast Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              6-Month Predictive Sales Horizon
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated with walk-forward cross validation and ~80% confidence interval band
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            Walk-forward Backtest
          </span>
        </div>

        {forecastError ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            {forecastError}
          </div>
        ) : chartData ? (
          <div className="h-80 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400">
            No forecast data available.
          </div>
        )}

        {forecast && (
          <p className="mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {forecast.model === 'Recent 3-month average'
              ? 'Why the line is flat: the backtest compared a linear trend with a recent 3-month average, and the average had the lower error on held-out months, so it was selected.'
              : 'Why this model: the backtest compared a linear trend with a recent 3-month average, and ' +
                forecast.model.toLowerCase() +
                ' had the lower error on held-out months, so it was selected.'}
          </p>
        )}

        {forecast && forecast.history.length < 24 && (
          <p className="mt-3 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Based on only {forecast.history.length} months of history. Treat the 6-month
            projection as indicative; 24+ months are needed to learn seasonality.
          </p>
        )}
      </div>

      {/* Daily revenue with anomaly markers */}
      {dailyChartData && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Revenue with Flagged Days
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each dot is a day flagged at the current threshold (red = High, amber = Medium). The dashed
              line is the rolling 31-day median each day is compared against.
            </p>
          </div>
          <div className="h-80 w-full">
            <Line data={dailyChartData as any} options={dailyChartOptions} />
          </div>
        </div>
      )}

      {/* Anomalies Detection Table & Explanation */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Daily Revenue Anomalies</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flags days whose total revenue deviates from the rolling 31-day median baseline, scored with a
              modified z-score (MAD). High = score of 5 or more.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Threshold (z):</span>
              <span className="font-mono font-bold text-amber-500">{threshold.toFixed(1)}</span>
              <input
                type="range"
                min="2.5"
                max="6.0"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-24 sm:w-28 accent-indigo-600 cursor-pointer"
                title="Lower = more days flagged. 3.5 is the standard cutoff for modified z-scores."
              />
            </div>

            <button
              type="button"
              className={EXPORT_BTN}
              onClick={() =>
                downloadCSV('daily_revenue_anomalies.csv', [
                  ['Date', 'Actual Revenue', 'Expected Baseline', 'Deviation', 'Severity', 'Z-Score (MAD)', 'Main Driver', 'Driver Share %'],
                  ...sortedAnomalies.map((a: any) => [a.date, a.value, a.expected, a.deviation, a.severity, a.score, a.driver ?? '', a.driver_share ?? '']),
                ])
              }
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              Total Flagged: {anomalies?.total || 0} · Displaying all {sortedAnomalies.length}
            </span>
          </div>
        </div>

        {anomalies && sortedAnomalies.length > 0 ? (
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#131d33] border-b border-slate-200/80 dark:border-white/10 shadow-2xs">
                <tr className="text-slate-600 dark:text-slate-300">
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <span>Date</span>
                      {sortField === 'date' ? (
                        sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">
                    <button
                      onClick={() => handleSort('value')}
                      className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <span>Actual Revenue</span>
                      {sortField === 'value' ? (
                        sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">
                    <button
                      onClick={() => handleSort('expected')}
                      className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <span>Expected Baseline</span>
                      {sortField === 'expected' ? (
                        sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Deviation</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">
                    <button
                      onClick={() => handleSort('severity')}
                      className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <span>Severity</span>
                      {sortField === 'severity' ? (
                        sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">
                    <button
                      onClick={() => handleSort('score')}
                      className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <span>Z-Score (MAD)</span>
                      {sortField === 'score' ? (
                        sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Main Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {sortedAnomalies.map((item, idx) => (
                  <tr
                    key={`${item.date}-${idx}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white font-mono">
                      {item.date}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {inr(item.value)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {inr(item.expected)}
                    </td>
                    <td className="px-4 py-3 font-semibold font-mono">
                      <span
                        className={
                          item.deviation.startsWith('+')
                            ? 'text-emerald-500'
                            : 'text-rose-500'
                        }
                      >
                        {item.deviation}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.severity === 'High'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {item.score}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {(item as any).driver ? (
                        <span>
                          {(item as any).driver}
                          <span className="text-slate-400"> ({(item as any).driver_share}%)</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No statistical anomalies flagged for this dataset.
          </div>
        )}
      </div>

      {/* Unusual Transactions (per-category IQR) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Unusual Transactions</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual sales outside the normal range for their own product category (fences set 2 × IQR
              beyond the quartiles, computed per category, so expensive categories are not flagged just for being expensive).
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
              <ListFilter className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Category:</span>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All" className="bg-white dark:bg-slate-800">All</option>
                {txCategories.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-800">
                    {c} ({unusual?.by_category[c]})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className={EXPORT_BTN}
              onClick={() =>
                downloadCSV('unusual_transactions.csv', [
                  ['Transaction', 'Date', 'Customer', 'Category', 'Amount', 'Category Median', 'Times Typical', 'Direction'],
                  ...filteredTx.map((t) => [t.transaction_id, t.date, t.customer_id, t.category, t.amount, t.typical, t.times_typical, t.direction]),
                ])
              }
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              Flagged: {unusual?.total || 0} · Showing {filteredTx.length}
            </span>
          </div>
        </div>

        {filteredTx.length > 0 ? (
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#131d33] border-b border-slate-200/80 dark:border-white/10 shadow-2xs">
                <tr className="text-slate-600 dark:text-slate-300">
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Transaction</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Date</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Customer</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Category</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Amount</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Category Median</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">× Typical</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredTx.map((t) => (
                  <tr
                    key={t.transaction_id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white font-mono">
                      {t.transaction_id}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">{t.date}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">{t.customer_id}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{t.category}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{inr(t.amount)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{inr(t.typical)}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {t.times_typical}×
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          t.direction === 'High'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {t.direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No unusual transactions flagged for this selection.
          </div>
        )}
      </div>
    </div>
  );
};
