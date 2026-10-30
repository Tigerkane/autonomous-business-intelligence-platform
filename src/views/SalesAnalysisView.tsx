import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Lightbulb,
  Calendar,
  Layers,
  ArrowUpRight,
  BarChart2,
  Table as TableIcon,
  Users,
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useData } from '../contexts/DataContext';
import { SalesAnalysisData } from '../types';
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

interface SalesAnalysisViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const SalesAnalysisView: React.FC<SalesAnalysisViewProps> = ({ onNavigate }) => {
  const { loaded, version, theme } = useData();
  const [data, setData] = useState<SalesAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grain, setGrain] = useState<'weekly' | 'monthly'>('monthly');

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loaded) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch('/api/analysis/sales')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load sales analysis data.');
        return res.json();
      })
      .then((json: SalesAnalysisData) => {
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
            Synthesizing category revenue matrices and weekday patterns...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 max-w-xl mx-auto">
        <p className="font-semibold text-sm">{error || 'Could not load sales analysis.'}</p>
      </div>
    );
  }

  // Trend Chart
  const trendLabels =
    grain === 'weekly'
      ? data.trend.weekly.map((w) => {
          const d = new Date(w.date);
          return `${d.getUTCDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
        })
      : data.trend.monthly.map((m) => {
          const [y, mon] = m.month.split('-');
          const d = new Date(Number(y), Number(mon) - 1, 1);
          return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        });

  const trendValues =
    grain === 'weekly'
      ? data.trend.weekly.map((w) => w.revenue)
      : data.trend.monthly.map((m) => m.total_revenue);

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: trendValues,
        borderColor: '#4f46e5',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(79, 70, 229, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(79, 70, 229, 0.25)');
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0,
        borderWidth: 2.5,
        pointRadius: grain === 'weekly' ? 2 : 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const trendChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          label: (ctx: any) => ` Revenue: ₹${Math.round(ctx.parsed.y).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 }, maxTicksLimit: 12 },
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
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

  // Stacked Category Chart with shared deterministic category colors
  const stackedLabels = data.stacked.months.map((ym) => {
    const [y, mon] = ym.split('-');
    const d = new Date(Number(y), Number(mon) - 1, 1);
    return d.toLocaleString('en-US', { month: 'short' });
  });

  const stackedChartData = {
    labels: stackedLabels,
    datasets: data.stacked.series.map((s, idx) => ({
      label: s.category,
      data: s.values,
      backgroundColor: getCategoryColor(s.category, idx),
      borderRadius: 4,
    })),
  };

  const stackedChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 'bold' },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ₹${Math.round(ctx.parsed.y).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 } },
      },
      y: {
        stacked: true,
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
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

  // Weekday Bar Chart
  const weekdayData = {
    labels: data.weekday.map((w) => w.day),
    datasets: [
      {
        label: 'Avg Daily Revenue',
        data: data.weekday.map((w) => w.avg_daily_revenue),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };

  const weekdayOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          label: (ctx: any) => ` Avg Daily Sales: ₹${Math.round(ctx.parsed.y).toLocaleString('en-IN')}`,
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

  // Gender Analysis Data
  const genderStats = data.gender_analysis?.stats || [];
  const genderMatrix = data.gender_analysis?.matrix;
  const genderInsight = data.gender_analysis?.insight || 'Spending is similar across genders.';

  const genderDonutData = {
    labels: genderStats.map((s) => s.gender),
    datasets: [
      {
        data: genderStats.map((s) => s.revenue),
        backgroundColor: genderStats.map((s) => getGenderColor(s.gender)),
        borderWidth: 2,
        borderColor: isDark ? '#0d1527' : '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const genderDonutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ₹${Math.round(ctx.parsed).toLocaleString('en-IN')}`,
        },
      },
    },
  };

  // Gender x Category grouped bar chart
  const genderCatData = {
    labels: genderMatrix?.categories || [],
    datasets: (genderMatrix?.series || []).map((s) => ({
      label: s.gender,
      data: s.values,
      backgroundColor: getGenderColor(s.gender),
      borderRadius: 4,
    })),
  };

  const genderCatOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 'bold' },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ₹${Math.round(ctx.parsed.y).toLocaleString('en-IN')}`,
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Automated Key Insights Banner */}
      {data.insights.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/40 to-indigo-950/50 border border-indigo-500/20 shadow-xs text-white">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
              Autonomous Highlights & Trends
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed font-medium"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Trajectory + Weekday Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracking aggregate sales volume across time intervals
              </p>
            </div>
            {/* Grain Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <button
                onClick={() => setGrain('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  grain === 'weekly'
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setGrain('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  grain === 'monthly'
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Right: Weekday Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekday Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Average daily revenue by day of week
              </p>
            </div>
            <Calendar className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="h-64 w-full">
            <Bar data={weekdayData} options={weekdayOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: Stacked Category Breakdown Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Category Revenue Composition
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stacked monthly sales split across product categories
            </p>
          </div>
          <Layers className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="h-72 w-full">
          <Bar data={stackedChartData} options={stackedChartOptions} />
        </div>
      </div>

      {/* Row 3: Category Performance Breakdown Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Performance Scorecard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Granular metrics across revenue, volume, and customer order value
            </p>
          </div>
          <TableIcon className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Product Category</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Revenue</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Market Share</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Gross Profit</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Margin</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Units Sold</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Orders</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Avg Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.categories.map((c, i) => (
                <tr
                  key={c.category}
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(c.category, i) }}
                      />
                      <span>{c.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white font-mono">
                    {inr(c.revenue)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.share}%`,
                            backgroundColor: getCategoryColor(c.category, i),
                          }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {c.share}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {inr(c.profit ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                      {c.margin ?? 0}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                    {c.units.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                    {c.orders.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white font-mono">
                    {inr(c.avg_order)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Customer Gender Distribution & Category Correlation */}
      {genderStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Revenue by Gender Donut & Metrics Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Revenue by Gender
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Distribution of orders, units, sales, and average basket size by customer gender
                  </p>
                </div>
                <Users className="w-5 h-5 text-indigo-500" />
              </div>

              {/* Donut Chart */}
              <div className="h-48 w-full relative mb-4">
                <Doughnut data={genderDonutData} options={genderDonutOptions} />
              </div>

              {/* Gender Metrics Table */}
              <div className="overflow-x-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400">
                      <th className="px-3 py-2 font-bold uppercase text-[10px]">Gender</th>
                      <th className="px-3 py-2 font-bold uppercase text-[10px]">Orders</th>
                      <th className="px-3 py-2 font-bold uppercase text-[10px]">Units</th>
                      <th className="px-3 py-2 font-bold uppercase text-[10px]">Revenue</th>
                      <th className="px-3 py-2 font-bold uppercase text-[10px]">Avg Basket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {genderStats.map((s) => (
                      <tr key={s.gender} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
                        <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: getGenderColor(s.gender) }}
                            />
                            <span>{s.gender}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 font-mono">
                          {s.orders.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 font-mono">
                          {s.units.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-white">
                          {inr(s.revenue)}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-white">
                          {inr(s.avg_basket)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guarded Insight badge */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{genderInsight}</span>
            </div>
          </div>

          {/* Card 2: Gender x Category Grouped Bar Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Gender × Product Category Revenue
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Category preference comparison for Male and Female customer segments
                  </p>
                </div>
                <Layers className="w-5 h-5 text-indigo-500" />
              </div>

              <div className="h-72 w-full">
                <Bar data={genderCatData} options={genderCatOptions} />
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/30 text-xs text-indigo-700 dark:text-indigo-300">
              Correlating customer segments with product categories to optimize targeted merchandising.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
