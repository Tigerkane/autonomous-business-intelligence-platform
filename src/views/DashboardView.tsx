import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  TrendingDown,
  Sparkles,
  PieChart as PieIcon,
  Calendar,
  Users,
  ArrowRight,
  LineChart,
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
      <div className="space-y-6 animate-pulse select-none" aria-busy="true">
        {/* Header title skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="w-64 h-7 bg-slate-800 rounded-lg mb-2" />
            <div className="w-96 max-w-full h-4 bg-slate-850 rounded" />
          </div>
          <div className="w-36 h-9 rounded-xl bg-slate-800 border border-slate-700/50" />
        </div>

        {/* 4 KPI Scorecard Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800/90 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-24 h-3 bg-slate-700/60 rounded" />
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20" />
              </div>
              <div className="w-28 h-7 bg-slate-700/80 rounded-lg mb-2" />
              <div className="w-32 h-3 bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e172e] border border-slate-800/90 h-80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-40 h-4 bg-slate-700 rounded" />
              <div className="w-24 h-7 bg-slate-800 rounded-lg" />
            </div>
            <div className="w-full h-48 rounded-xl bg-slate-900/60 border border-slate-800/60" />
          </div>
          <div className="p-6 rounded-2xl bg-[#0e172e] border border-slate-800/90 h-80 flex flex-col justify-between">
            <div className="w-32 h-4 bg-slate-700 rounded" />
            <div className="w-36 h-36 rounded-full border-[16px] border-slate-800 self-center my-auto" />
            <div className="w-full h-10 bg-slate-800/60 rounded-xl" />
          </div>
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
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition-all duration-500">
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-500">
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-amber-500/30 hover:shadow-amber-500/5 transition-all duration-500">
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Avg. Transaction Value */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-purple-500/30 hover:shadow-purple-500/5 transition-all duration-500">
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Executive Layout: 8-col Analytical Core & 4-col Intelligence Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Primary Analytical Core */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue & Profit Trajectory Hub */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-white/[0.14] transition-all duration-500 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-indigo-400" />
                  <span>{isProfit ? 'Gross Profit Trajectory' : 'Revenue Trajectory'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isProfit
                    ? 'Gross margin & profitability trajectory over time intervals'
                    : 'Aggregate retail sales performance across time intervals'}
                </p>
              </div>
              {/* Metric & Grain Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <button
                    onClick={() => setTrendMetric('revenue')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trendMetric === 'revenue'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setTrendMetric('profit')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trendMetric === 'profit'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Profit
                  </button>
                </div>

                <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <button
                    onClick={() => setTrendGrain('weekly')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trendGrain === 'weekly'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTrendGrain('monthly')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trendGrain === 'monthly'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
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

          {/* Executive Category Profitability & Contribution Breakdown Table */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-white/[0.14] transition-all duration-500 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Category Profitability & Contribution Scorecard
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Executive margin analysis and net profit contribution across retail product categories (Electronics, Beauty, Clothing)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  Total Profit: <strong className="text-emerald-400">{inr(data.kpis.total_profit ?? 0)}</strong>
                </span>
                {data.kpis.profit_margin !== undefined && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-mono">
                    {data.kpis.profit_margin}% Gross Margin
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-white/[0.08] rounded-xl bg-white/[0.01]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.08] text-slate-400">
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Product Category</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Revenue</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Revenue Share</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Gross Profit</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Profit Margin</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Profit Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  {data.categories.map((c, i) => {
                    const revShare = ((c.sales / data.kpis.total_sales) * 100).toFixed(1);
                    const totalProfit = data.kpis.total_profit || 1;
                    const profitShare = (((c.profit ?? 0) / totalProfit) * 100).toFixed(1);

                    return (
                      <tr
                        key={c.category}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3 font-sans font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: getCategoryColor(c.category, i) }}
                            />
                            <span>{c.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {inr(c.sales)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
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
                        <td className="px-4 py-3 font-bold text-emerald-400">
                          {inr(c.profit ?? 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            {c.margin ?? 0}% margin
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-emerald-950/40 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${Math.min(100, Math.max(0, Number(profitShare)))}%` }}
                              />
                            </div>
                            <span className="text-emerald-400 font-semibold">{profitShare}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Demographics Bar Chart */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-white/[0.14] transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Customer Age Demographic Spread</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Revenue contribution grouped across customer age brackets
                </p>
              </div>
            </div>
            <div className="h-60 w-full">
              <Bar data={ageBarData} options={ageBarOptions} />
            </div>

            {/* Compact Male / Female Customer Split Bar */}
            {(() => {
              const maleCust = data.customer_gender_split?.male ?? (data.segments.gender.find((g) => g.segment.toLowerCase() === 'male')?.unique_customers ?? 0);
              const femaleCust = data.customer_gender_split?.female ?? (data.segments.gender.find((g) => g.segment.toLowerCase() === 'female')?.unique_customers ?? 0);
              const unknownCust = data.customer_gender_split?.unknown ?? (data.segments.gender.find((g) => g.segment.toLowerCase() === 'unknown')?.unique_customers ?? 0);
              const totalCust = maleCust + femaleCust + unknownCust || 1;
              const malePct = (maleCust / totalCust) * 100;
              const femalePct = (femaleCust / totalCust) * 100;
              const unknownPct = (unknownCust / totalCust) * 100;

              return (
                <div className="mt-5 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-300">Customer Gender Distribution</span>
                    <span className="text-slate-400 font-mono text-[11px]">{totalCust.toLocaleString()} Total Unique Customers</span>
                  </div>

                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/[0.06]">
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
                      <span className="text-slate-400 font-medium">Male:</span>
                      <span className="font-bold text-white font-mono">{maleCust}</span>
                      <span className="text-slate-500">({malePct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getGenderColor('Female') }} />
                      <span className="text-slate-400 font-medium">Female:</span>
                      <span className="font-bold text-white font-mono">{femaleCust}</span>
                      <span className="text-slate-500">({femalePct.toFixed(1)}%)</span>
                    </div>
                    {unknownCust > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getGenderColor('Unknown') }} />
                        <span className="text-slate-400 font-medium">Unknown:</span>
                        <span className="font-bold text-white font-mono">{unknownCust}</span>
                        <span className="text-slate-500">({unknownPct.toFixed(1)}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Column (4 cols): Intelligence Rail & Action Center */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Mix & Donut Hub */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 hover:border-white/[0.14] transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-purple-400" />
                    <span>{isCategoryProfit ? 'Category Profit Mix' : 'Category Sales Mix'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isCategoryProfit
                      ? 'Gross profit contribution'
                      : 'Revenue split by category'}
                  </p>
                </div>
                <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  <button
                    onClick={() => setCategoryMetric('revenue')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      !isCategoryProfit
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setCategoryMetric('profit')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      isCategoryProfit
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Profit
                  </button>
                </div>
              </div>

              <div className="relative h-48 w-full flex items-center justify-center my-3">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isCategoryProfit ? 'Total Profit' : 'Total Revenue'}
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {inr(isCategoryProfit ? (data.kpis.total_profit ?? 0) : data.kpis.total_sales)}
                  </span>
                  {isCategoryProfit && data.kpis.profit_margin !== undefined && (
                    <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                      {data.kpis.profit_margin}% avg margin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Category List */}
            <div className="space-y-2 mt-4 pt-3 border-t border-white/[0.06]">
              {data.categories.map((c, i) => {
                const currentVal = isCategoryProfit ? (c.profit ?? 0) : c.sales;
                const totalVal = isCategoryProfit ? (data.kpis.total_profit || 1) : data.kpis.total_sales;
                const share = ((currentVal / totalVal) * 100).toFixed(1);

                return (
                  <div
                    key={c.category}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getCategoryColor(c.category, i) }}
                        />
                        <span className="font-bold text-slate-200 truncate">
                          {c.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {c.margin !== undefined && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-mono">
                            {c.margin}% margin
                          </span>
                        )}
                        <span className="text-slate-400 text-[11px] font-medium font-mono">
                          {share}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pl-4.5 pt-1 border-t border-white/[0.03]">
                      <div className="text-slate-400">
                        <span>Rev: </span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {inr(c.sales)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>Profit: </span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {inr(c.profit ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executive Intelligence Command Cards */}
          <div className="space-y-3.5 flex flex-col justify-between">
            <div
              onClick={() => onNavigate('forecast-anomalies')}
              className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/40 to-indigo-950/30 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Predictive Horizon
                </span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">
                Forecast & Anomaly Detection
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                6-month predictive trajectory with 31-day rolling median anomaly flagging.
              </p>
            </div>

            <div
              onClick={() => onNavigate('ask-data')}
              className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/40 to-purple-950/30 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  AI Business Reasoning
                </span>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">
                Autonomous AI Analyst
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask questions about trends, margins, and customer behavior with natural language.
              </p>
            </div>

            <div
              onClick={() => onNavigate('reports')}
              className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-emerald-950/30 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Executive PDF Studio
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">
                Download PDF Reports
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate vector-grade executive summaries and stakeholder reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
