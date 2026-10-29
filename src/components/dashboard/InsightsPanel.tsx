import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PackageCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const inr = (v: number) => '₹' + Math.round(v || 0).toLocaleString('en-IN');
const COLORS: Record<string, string> = { Electronics: '#6366f1', Clothing: '#10b981', Beauty: '#f59e0b' };
const PERIODS = [
  { id: '3m', label: '3 Months' },
  { id: 'quarter', label: 'Quarterly' },
  { id: 'half', label: 'Half-Yearly' },
  { id: 'year', label: 'Annual' },
];

export const InsightsPanel: React.FC = () => {
  const { loaded, version, theme } = useData();
  const [period, setPeriod] = useState('quarter');
  const [all, setAll] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loaded) return;
    let alive = true;
    fetch('/api/insights')
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok) throw new Error(b.detail || 'Insights unavailable.');
        return b;
      })
      .then((b) => { if (alive) { setAll(b); setError(null); } })
      .catch((e) => { if (alive) { setError(e.message); setAll(null); } });
    return () => { alive = false; };
  }, [loaded, version]);

  if (!loaded) return null;

  const data = all?.[period];
  const a = data?.analysis;
  const s = data?.stock;
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const chartData = a && {
    labels: [...a.periods.map((p: any) => p.label), a.forecast_label || 'Next (forecast)'],
    datasets: a.categories.map((c: string) => ({
      label: c,
      data: [...a.periods.map((p: any) => p.by_category[c]), a.forecast.by_category[c]],
      backgroundColor: COLORS[c] || '#94a3b8',
      borderRadius: 3,
      stack: 'rev',
    })),
  };

  const actionStyle = (act: string) =>
    act === 'Increase stock'
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
      : act === 'Maintain stock'
      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Period Analysis &amp; Stock Recommendation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Past results grouped by period, used to predict the next period and guide stocking.
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                period === p.id ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {(error || data?.error) && <p className="text-xs text-amber-600 dark:text-amber-400">{error || data?.error}</p>}

      {a && s && (
        <>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <PackageCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Prediction</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.headline}</p>
            </div>
          </div>

          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor, boxWidth: 10 } }, tooltip: { callbacks: { label: (c: any) => `${c.dataset.label}: ${inr(c.parsed.y)}` } } },
                scales: {
                  x: { stacked: true, ticks: { color: textColor, maxRotation: 60, font: { size: 10 } }, grid: { display: false } },
                  y: { stacked: true, ticks: { color: textColor, callback: (v: any) => '₹' + v / 1000 + 'k' }, grid: { color: gridColor } },
                },
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {s.recommendations.map((r: any) => {
              const Icon = r.trend_pct > 1 ? TrendingUp : r.trend_pct < -1 ? TrendingDown : Minus;
              return (
                <div key={r.category} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[r.category] || '#94a3b8' }} />
                      {r.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${actionStyle(r.action)}`}>{r.action}</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{inr(r.forecast_revenue)}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {r.trend_pct >= 0 ? '+' : ''}{r.trend_pct}% vs {s.compared_with} · {r.margin_pct}% margin · profit {inr(r.forecast_profit)}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Method: {a.forecast.method}. {a.periods_available} complete {a.period_label.toLowerCase()} periods used.
            {a.low_history ? ' Fewer than 3 periods available, so treat this as indicative only.' : ''}
            {' '}Profit uses assumed category margins.
          </p>
        </>
      )}
    </div>
  );
};
