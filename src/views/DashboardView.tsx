import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  TrendingDown,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Users,
  ArrowRight,
  LineChart,
  RefreshCw,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useData } from '../contexts/DataContext';
import { OverviewData } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { NavTab } from '../components/layout/Sidebar';
import { getCategoryColor, getGenderColor } from '../design/tokens';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const inr = (v: number) => '₹' + Math.round(v || 0).toLocaleString('en-IN');

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { loaded, version, theme } = useData();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendGrain, setTrendGrain] = useState<'weekly' | 'monthly'>('monthly');
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'profit'>('revenue');
  const [categoryMetric, setCategoryMetric] = useState<'revenue' | 'profit'>('revenue');

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loaded) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch('/api/dashboard/overview')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard overview data.');
        return res.json();
      })
      .then((json: OverviewData) => {
        if (isMounted) {
          setData(json);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loaded, version]);

  if (!loaded) {
    return <EmptyState onGoToUpload={() => onNavigate('upload')} />;
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Synthesizing autonomous KPI scorecards...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 max-w-xl mx-auto">
        <p className="font-semibold text-sm">{error || 'Could not load dashboard data.'}</p>
      </div>
    );
  }

  // Trend Chart
  const isProfit = trendMetric === 'profit';
  const trendLabels =
    trendGrain === 'weekly'
      ? data.weekly.map((w) => {
          const d = new Date(w.date);
          return `${d.getUTCDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
        })
      : data.monthly.filter((m) => !m.partial).map((m) => {
          const [y, mon] = m.month.split('-');
          const d = new Date(Number(y), Number(mon) - 1, 1);
          return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        });

  const trendValues =
    trendGrain === 'weekly'
      ? data.weekly.map((w) => (isProfit ? (w.profit ?? 0) : w.revenue))
      : data.monthly.filter((m) => !m.partial).map((m) => (isProfit ? (m.total_profit ?? 0) : m.total_revenue));

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: isProfit ? 'Gross Profit (₹)' : 'Revenue (₹)',
        data: trendValues,
        borderColor: isProfit ? '#10b981' : '#4f46e5',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          if (isProfit) {
            gradient.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          } else {
            gradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(79, 70, 229, 0.25)');
            gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');
          }
          return gradient;
        },
        fill: true,
        tension: 0,
        pointRadius: trendGrain === 'weekly' ? 2 : 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
    ],
  };

  const lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${isProfit ? 'Profit' : 'Revenue'}: ₹${Math.round(ctx.parsed.y).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
        },
        border: { display: false },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11 },
          callback: (v: any) => {
            const num = Number(v);
            if (Math.abs(num) >= 1_000_000) return '₹' + (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (Math.abs(num) >= 1_000) return '₹' + (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
            return '₹' + Math.round(num);
          },
        },
      },
    },
  };

  // Category Donut with shared deterministic colors
  const isCategoryProfit = categoryMetric === 'profit';
  const donutData = {
    labels: data.categories.map((c) => c.category),
    datasets: [
      {
        data: data.categories.map((c) => (isCategoryProfit ? (c.profit ?? 0) : c.sales)),
        backgroundColor: data.categories.map((c, i) => getCategoryColor(c.category, i)),
        borderWidth: 2,
        borderColor: isDark ? '#0d1527' : '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const donutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) =>
            ` ${isCategoryProfit ? 'Gross Profit' : 'Revenue'}: ₹${Math.round(ctx.parsed).toLocaleString('en-IN')}`,
        },
      },
    },
  };

  // Demographics Bar Data
  const ageLabels = data.segments.age.map((a) => a.segment);
  const ageRevenues = data.segments.age.map((a) => a.revenue);

  const ageBarData = {
    labels: ageLabels,
    datasets: [
      {
        label: 'Revenue by Age Group',
        data: ageRevenues,
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  const ageBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          label: (ctx: any) => ` ₹${Math.round(ctx.parsed.y).toLocaleString('en-IN')}`,
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Total Revenue
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {inr(data.kpis.total_sales)}
              </h3>
              {data.kpis.total_profit !== undefined && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {inr(data.kpis.total_profit)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    {data.kpis.profit_margin}% margin
                  </span>
                </div>
              )}
              {data.trends.revenue !== undefined && (
                <div
                  className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                    data.trends.revenue > 0
                      ? 'text-emerald-500'
                      : data.trends.revenue < 0
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {data.trends.revenue > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {data.trends.revenue > 0 ? '+' : ''}
                    {data.trends.revenue}%
                  </span>
                  <span className="text-slate-400 font-normal">vs prev month</span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Orders / Transactions
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {data.kpis.total_transactions.toLocaleString('en-IN')}
              </h3>
              {data.trends.transactions !== undefined && (
                <div
                  className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                    data.trends.transactions > 0
                      ? 'text-emerald-500'
                      : data.trends.transactions < 0
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {data.trends.transactions > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {data.trends.transactions > 0 ? '+' : ''}
                    {data.trends.transactions}%
                  </span>
                  <span className="text-slate-400 font-normal">orders</span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Units Sold
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {data.kpis.total_quantity.toLocaleString('en-IN')}
              </h3>
              {data.trends.units !== undefined && (
                <div
                  className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                    data.trends.units > 0
                      ? 'text-emerald-500'
                      : data.trends.units < 0
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {data.trends.units > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {data.trends.units > 0 ? '+' : ''}
                    {data.trends.units}%
                  </span>
                  <span className="text-slate-400 font-normal">volume</span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Avg. Transaction Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Avg. Basket Size
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {inr(data.kpis.average_transaction)}
              </h3>
              {data.trends.avg !== undefined && (
                <div
                  className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                    data.trends.avg > 0
                      ? 'text-emerald-500'
                      : data.trends.avg < 0
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {data.trends.avg > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {data.trends.avg > 0 ? '+' : ''}
                    {data.trends.avg}%
                  </span>
                  <span className="text-slate-400 font-normal">per transaction</span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory & Category Share Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isProfit ? 'Gross Profit Trajectory' : 'Revenue Trajectory'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isProfit
                  ? 'Gross margin & profitability trajectory over time intervals'
                  : 'Aggregate retail sales performance across time intervals'}
              </p>
            </div>
            {/* Metric & Grain Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setTrendMetric('revenue')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    trendMetric === 'revenue'
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setTrendMetric('profit')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    trendMetric === 'profit'
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Profit
                </button>
              </div>

              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setTrendGrain('weekly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    trendGrain === 'weekly'
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTrendGrain('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    trendGrain === 'monthly'
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex-1 min-h-[340px] w-full">
            <div className="absolute inset-0">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Right: Category Mix Donut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isCategoryProfit ? 'Category Profit Mix' : 'Category Sales Mix'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isCategoryProfit
                    ? 'Gross profit contribution by category'
                    : 'Revenue split by product category'}
                </p>
              </div>
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setCategoryMetric('revenue')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    !isCategoryProfit
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setCategoryMetric('profit')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    isCategoryProfit
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Profit
                </button>
              </div>
            </div>

            <div className="relative h-44 w-full flex items-center justify-center my-2">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isCategoryProfit ? 'Total Profit' : 'Total Revenue'}
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {inr(isCategoryProfit ? (data.kpis.total_profit ?? 0) : data.kpis.total_sales)}
                </span>
                {isCategoryProfit && data.kpis.profit_margin !== undefined && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {data.kpis.profit_margin}% avg margin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
            {data.categories.map((c, i) => {
              const currentVal = isCategoryProfit ? (c.profit ?? 0) : c.sales;
              const totalVal = isCategoryProfit ? (data.kpis.total_profit || 1) : data.kpis.total_sales;
              const share = ((currentVal / totalVal) * 100).toFixed(1);

              return (
                <div
                  key={c.category}
                  className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: getCategoryColor(c.category, i) }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {c.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.margin !== undefined && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                          {c.margin}% margin
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px] font-medium font-mono">
                        {share}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pl-4.5 pt-1 border-t border-slate-100/80 dark:border-white/[0.03]">
                    <div className="text-slate-500 dark:text-slate-400">
                      <span>Rev: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {inr(c.sales)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <span>Profit: </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {inr(c.profit ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Executive Category Profitability & Contribution Breakdown Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Profitability & Contribution Scorecard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Executive margin analysis and net profit contribution across retail product categories (Electronics, Beauty, Clothing)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Total Profit: <strong className="text-emerald-600 dark:text-emerald-400">{inr(data.kpis.total_profit ?? 0)}</strong>
            </span>
            {data.kpis.profit_margin !== undefined && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                {data.kpis.profit_margin}% Gross Margin
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Product Category</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Revenue</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Revenue Share</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Gross Profit</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Profit Margin</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Profit Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
              {data.categories.map((c, i) => {
                const revShare = ((c.sales / data.kpis.total_sales) * 100).toFixed(1);
                const totalProfit = data.kpis.total_profit || 1;
                const profitShare = (((c.profit ?? 0) / totalProfit) * 100).toFixed(1);

                return (
                  <tr
                    key={c.category}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 font-sans font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getCategoryColor(c.category, i) }}
                        />
                        <span>{c.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {inr(c.sales)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${revShare}%`,
                              backgroundColor: getCategoryColor(c.category, i),
                            }}
                          />
                        </div>
                        <span>{revShare}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {inr(c.profit ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {c.margin ?? 0}% margin
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(100, Math.max(0, Number(profitShare)))}%` }}
                          />
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{profitShare}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demographics & Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Demographics Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Customer Age Demographic Spread
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revenue contribution grouped by customer age brackets
              </p>
            </div>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="h-60 w-full">
            <Bar data={ageBarData} options={ageBarOptions} />
          </div>

          {/* Compact Male / Female Customer Split */}
          {(() => {
            const maleCust = data.customer_gender_split?.male ?? (data.segments.gender.find((g) => g.segment.toLowerCase() === 'male')?.unique_customers ?? 0);
            const femaleCust = data.customer_gender_split?.female ?? (data.segments.gender.find((g) => g.segment.toLowerCase() === 'female')?.unique_customers ?? 0);
            const unknownCust = data.customer_gender_split?.unknown ?? (data.segments.gender.find((g) => g.segment.toLowerCase() === 'unknown')?.unique_customers ?? 0);
            const totalCust = maleCust + femaleCust + unknownCust || 1;
            const malePct = (maleCust / totalCust) * 100;
            const femalePct = (femaleCust / totalCust) * 100;
            const unknownPct = (unknownCust / totalCust) * 100;

            return (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Customer Gender Split (Unique Customers)
                  </span>
                  <span className="text-slate-400 font-medium font-mono">
                    {maleCust + femaleCust + unknownCust} unique customers
                  </span>
                </div>
                
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                  <div
                    style={{ width: `${malePct}%`, backgroundColor: getGenderColor('Male') }}
                    title={`Male: ${maleCust} (${malePct.toFixed(1)}%)`}
                    className="h-full transition-all"
                  />
                  <div
                    style={{ width: `${femalePct}%`, backgroundColor: getGenderColor('Female') }}
                    title={`Female: ${femaleCust} (${femalePct.toFixed(1)}%)`}
                    className="h-full transition-all"
                  />
                  {unknownCust > 0 && (
                    <div
                      style={{ width: `${unknownPct}%`, backgroundColor: getGenderColor('Unknown') }}
                      title={`Unknown: ${unknownCust} (${unknownPct.toFixed(1)}%)`}
                      className="h-full transition-all"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between mt-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getGenderColor('Male') }} />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Male:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{maleCust}</span>
                    <span className="text-slate-400">({malePct.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getGenderColor('Female') }} />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Female:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{femaleCust}</span>
                    <span className="text-slate-400">({femalePct.toFixed(1)}%)</span>
                  </div>
                  {unknownCust > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getGenderColor('Unknown') }} />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Unknown:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{unknownCust}</span>
                      <span className="text-slate-400">({unknownPct.toFixed(1)}%)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Feature Navigation Cards */}
        <div className="space-y-3.5 flex flex-col justify-between">
          <div
            onClick={() => onNavigate('forecast-anomalies')}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-indigo-800/20 border border-indigo-500/20 hover:border-indigo-400 transition-all text-white shadow-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Predictive Analytics
              </span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Sales Forecast & Outliers
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Walk-forward forecast and 31-day rolling median anomaly detection.
            </p>
          </div>

          <div
            onClick={() => onNavigate('ask-data')}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-500/20 hover:border-purple-400 transition-all text-white shadow-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                AI Reasoning
              </span>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Ask AI Business Analyst
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Query metrics in plain English with grounded Ollama AI analyst context.
            </p>
          </div>

          <div
            onClick={() => onNavigate('reports')}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-500/20 hover:border-emerald-400 transition-all text-white shadow-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Executive Export
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Download PDF Reports
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Executive, Sales, and Forecast PDF documents ready for leadership.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
