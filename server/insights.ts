import { getSalesRows } from './db';
import { getMonthlyHistory } from './analytics';
import { SaleRow } from './types';

export type PeriodKey = 'quarter' | '3m' | 'half' | 'year';

/**
 * Profit margin assumptions per category (the dataset has no cost column).
 * Unknown categories fall back to DEFAULT_MARGIN.
 */
export const CATEGORY_MARGIN: Record<string, number> = {
  Clothing: 0.45,
  Beauty: 0.55,
  Electronics: 0.3,
};
const DEFAULT_MARGIN = 0.4;

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  '3m': 'Trailing 3 Months',
  quarter: 'Quarterly',
  half: 'Half-Yearly',
  year: 'Annual',
};

const NEXT_LABELS: Record<PeriodKey, string> = {
  '3m': 'next 3 months',
  quarter: 'next quarter',
  half: 'next half-year',
  year: 'next year',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const margin = (cat: string) => CATEGORY_MARGIN[cat] ?? DEFAULT_MARGIN;

function linearForecast(y: number[]): number {
  const n = y.length;
  if (n === 0) return 0;
  if (n === 1) return y[0];
  let sT = 0, sY = 0, sTY = 0, sT2 = 0;
  for (let t = 0; t < n; t++) {
    sT += t; sY += y[t]; sTY += t * y[t]; sT2 += t * t;
  }
  const den = n * sT2 - sT * sT;
  if (den === 0) return sY / n;
  const slope = (n * sTY - sT * sY) / den;
  const intercept = (sY - slope * sT) / n;
  return Math.max(0, slope * n + intercept);
}

/**
 * Next-period forecast. With 2+ full years of history and a seasonal period
 * (quarter/half), uses same-season-last-year x year-over-year growth so a Q4
 * peak does not leak into the Q1 forecast. Otherwise falls back to linear trend.
 */
function forecastSeries(y: number[], seasons: number): { value: number; method: string } {
  if (seasons > 1 && y.length >= seasons * 2) {
    const lastYear = y.slice(-seasons);
    const prevYear = y.slice(-seasons * 2, -seasons);
    const sumLast = lastYear.reduce((a, b) => a + b, 0);
    const sumPrev = prevYear.reduce((a, b) => a + b, 0);
    const yoy = sumPrev > 0 ? sumLast / sumPrev : 1;
    const sameSeasonLastYear = y[y.length - seasons];
    return { value: Math.max(0, sameSeasonLastYear * yoy), method: 'Seasonal (same period last year x YoY growth)' };
  }
  return { value: linearForecast(y), method: 'Linear trend over complete periods' };
}

/** Bucket a YYYY-MM into a period id, label and ordering key. */
function bucketOf(ym: string, period: PeriodKey, lastYm: string) {
  const [y, m] = ym.split('-').map(Number);
  if (period === 'quarter') {
    const q = Math.floor((m - 1) / 3) + 1;
    return { id: `${y}-Q${q}`, label: `Q${q} ${y}`, months: 3 };
  }
  if (period === 'half') {
    const h = m <= 6 ? 1 : 2;
    return { id: `${y}-H${h}`, label: `H${h} ${y}`, months: 6 };
  }
  if (period === 'year') {
    return { id: `${y}`, label: `${y}`, months: 12 };
  }
  // Rolling 3-month blocks counted back from the latest full month
  const [ly, lm] = lastYm.split('-').map(Number);
  const diff = (ly - y) * 12 + (lm - m);
  const block = Math.floor(diff / 3);
  const endIdx = ly * 12 + (lm - 1) - block * 3;
  const startIdx = endIdx - 2;
  const fmt = (idx: number) => {
    const yy = Math.floor(idx / 12);
    const mm = (idx % 12) + 1;
    return MONTHS[mm - 1] + ' ' + String(yy).slice(2);
  };
  return { id: `${String(10000 - block).padStart(5, '0')}`, label: `${fmt(startIdx)} - ${fmt(endIdx)}`, months: 3 };
}

export function getPeriodAnalysis(uid: string, period: PeriodKey = 'quarter', rows?: SaleRow[]) {
  const data = rows || getSalesRows(uid);
  const { fullMonths } = getMonthlyHistory(uid, data);
  if (fullMonths.length === 0) throw new Error('Not enough complete months of data.');

  const fullYMs = new Set(fullMonths.map((m) => m.ym));
  const lastYm = fullMonths[fullMonths.length - 1].ym;
  const categories = Array.from(new Set(data.map((r) => r.product_category))).sort();

  // "3 Months" = trailing 3-month windows that slide forward one month at a time
  // (Jan-Mar, Feb-Apr, Mar-May, ...), so it tracks recent momentum month by month.
  // Quarterly, by contrast, uses fixed calendar quarters (Q1, Q2, ...).
  if (period === '3m') {
    const monthly = new Map<string, { rev: Record<string, number>; units: Record<string, number> }>();
    for (const r of data) {
      const ym = r.date.slice(0, 7);
      if (!fullYMs.has(ym)) continue;
      let m = monthly.get(ym);
      if (!m) {
        m = {
          rev: Object.fromEntries(categories.map((c) => [c, 0])),
          units: Object.fromEntries(categories.map((c) => [c, 0])),
        };
        monthly.set(ym, m);
      }
      m.rev[r.product_category] += r.total_amount;
      m.units[r.product_category] += r.quantity;
    }
    const yms = Array.from(monthly.keys()).sort();
    const idx = (ym: string) => { const [y, mo] = ym.split('-').map(Number); return y * 12 + mo - 1; };
    const lab = (ym: string) => { const [y, mo] = ym.split('-').map(Number); return MONTHS[mo - 1] + ' ' + String(y).slice(2); };

    const windows: { label: string; rev: Record<string, number>; units: Record<string, number>; endIdx: number }[] = [];
    for (let i = 2; i < yms.length; i++) {
      if (idx(yms[i]) - idx(yms[i - 2]) !== 2) continue; // needs 3 consecutive months
      const rev: Record<string, number> = {}; const units: Record<string, number> = {};
      for (const c of categories) {
        rev[c] = [i - 2, i - 1, i].reduce((t, k) => t + monthly.get(yms[k])!.rev[c], 0);
        units[c] = [i - 2, i - 1, i].reduce((t, k) => t + monthly.get(yms[k])!.units[c], 0);
      }
      windows.push({ label: `${lab(yms[i - 2])} - ${lab(yms[i])}`, rev, units, endIdx: idx(yms[i]) });
    }
    const shown = windows.slice(-12);
    const periods3 = shown.map((w) => ({
      label: w.label,
      revenue: categories.reduce((t, c) => t + w.rev[c], 0),
      profit: categories.reduce((t, c) => t + w.rev[c] * margin(c), 0),
      by_category: w.rev,
      units_by_category: w.units,
    }));

    // Forecast the next 3 months combined.
    const monthIdx = new Map(yms.map((ym) => [idx(ym), ym]));
    const lastIdx = idx(yms[yms.length - 1]);
    const forecast3: Record<string, number> = {};
    const base3: Record<string, number> = {};
    let method3 = 'Linear trend over trailing 3-month totals';
    const hasYear = [...Array(24).keys()].every((k) => monthIdx.has(lastIdx - k));
    for (const c of categories) {
      const get = (k: number) => monthly.get(monthIdx.get(k)!)!.rev[c];
      if (hasYear) {
        const sumLast12 = [...Array(12).keys()].reduce((t, k) => t + get(lastIdx - k), 0);
        const sumPrev12 = [...Array(12).keys()].reduce((t, k) => t + get(lastIdx - 12 - k), 0);
        const yoy = sumPrev12 > 0 ? sumLast12 / sumPrev12 : 1;
        // next months are lastIdx+1..+3; same months last year are lastIdx-11..-9
        const sameLastYear = get(lastIdx - 11) + get(lastIdx - 10) + get(lastIdx - 9);
        forecast3[c] = Math.round(Math.max(0, sameLastYear * yoy));
        base3[c] = sameLastYear;
        method3 = 'Seasonal (same 3 months last year x YoY growth)';
      } else {
        forecast3[c] = Math.round(linearForecast(periods3.map((p) => p.by_category[c])));
       
      }
    }
    const total3 = Object.values(forecast3).reduce((a, b) => a + b, 0);
    const profit3 = categories.reduce((t, c) => t + forecast3[c] * margin(c), 0);
    const last3 = periods3[periods3.length - 1];
    const prev3 = periods3[periods3.length - 2];
    return {
      period,
      period_label: PERIOD_LABELS[period],
      next_label: NEXT_LABELS[period],
      forecast_label: 'Next 3 months',
      categories,
      periods: periods3,
      periods_available: periods3.length,
      seasons: 12,
      compare_base: Object.keys(base3).length ? base3 : null,
      latest: last3 ?? null,
      change_vs_previous_pct: last3 && prev3 && prev3.revenue > 0 ? Math.round(((last3.revenue - prev3.revenue) / prev3.revenue) * 1000) / 10 : null,
      forecast: { method: method3, total_revenue: total3, total_profit: Math.round(profit3), by_category: forecast3 },
      low_history: periods3.length < 3,
    };
  }

  type Agg = { label: string; months: Set<string>; need: number; revenue: Record<string, number>; units: Record<string, number> };
  const buckets = new Map<string, Agg>();

  const bucketCache = new Map<string, ReturnType<typeof bucketOf>>();
  for (const r of data) {
    const ym = r.date.slice(0, 7);
    if (!fullYMs.has(ym)) continue;
    let b = bucketCache.get(ym);
    if (!b) { b = bucketOf(ym, period, lastYm); bucketCache.set(ym, b); }
    if (!buckets.has(b.id)) {
      buckets.set(b.id, {
        label: b.label, months: new Set(), need: b.months,
        revenue: Object.fromEntries(categories.map((c) => [c, 0])),
        units: Object.fromEntries(categories.map((c) => [c, 0])),
      });
    }
    const agg = buckets.get(b.id)!;
    agg.months.add(ym);
    agg.revenue[r.product_category] += r.total_amount;
    agg.units[r.product_category] += r.quantity;
  }

  // Keep only complete periods so a partial last period doesn't read as a drop.
  const ordered = Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);
  const complete = ordered.filter((b) => b.months.size === b.need);
  const periods = complete.map((b) => {
    const revenue = categories.reduce((s, c) => s + b.revenue[c], 0);
    const profit = categories.reduce((s, c) => s + b.revenue[c] * margin(c), 0);
    return { label: b.label, revenue, profit, by_category: b.revenue, units_by_category: b.units };
  });

  const last = periods[periods.length - 1];
  const prev = periods[periods.length - 2];

  // Next-period forecast per category (linear trend over complete periods)
  const forecastByCat: Record<string, number> = {};
  let method = 'Linear trend over complete periods';
  for (const c of categories) {
    const f = forecastSeries(periods.map((p) => p.by_category[c]), 12 / (complete.length ? ordered[0].need : 12));
    forecastByCat[c] = Math.round(f.value);
    method = f.method;
  }
  const forecastTotal = Object.values(forecastByCat).reduce((a, b) => a + b, 0);
  const forecastProfit = categories.reduce((s, c) => s + forecastByCat[c] * margin(c), 0);

  const growth = (cur: number, old: number) => (old > 0 ? ((cur - old) / old) * 100 : 0);

  return {
    period,
    period_label: PERIOD_LABELS[period],
    next_label: NEXT_LABELS[period],
    forecast_label: 'Next (forecast)',
    categories,
    periods,
    periods_available: periods.length,
    seasons: 12 / (ordered.length ? ordered[0].need : 12),
    compare_base: (() => {
      const n = 12 / (ordered.length ? ordered[0].need : 12);
      return n > 1 && periods.length >= n ? periods[periods.length - n].by_category : null;
    })() as Record<string, number> | null,
    latest: last ?? null,
    change_vs_previous_pct: last && prev ? Math.round(growth(last.revenue, prev.revenue) * 10) / 10 : null,
    forecast: {
      method,
      total_revenue: forecastTotal,
      total_profit: Math.round(forecastProfit),
      by_category: forecastByCat,
    },
    low_history: periods.length < 3,
  };
}

export type StockAction = 'Increase stock' | 'Maintain stock' | 'Review / reduce stock';

export function getStockRecommendations(
  uid: string,
  period: PeriodKey = 'quarter',
  rows?: SaleRow[],
  analysis?: ReturnType<typeof getPeriodAnalysis>
) {
  const pa = analysis ?? getPeriodAnalysis(uid, period, rows);
  const { categories, latest, periods, forecast } = pa;
  if (!latest) throw new Error('No complete period available for recommendations.');

  const compareBase = pa.compare_base;
  const compareLabel = compareBase ? 'same period last year' : 'last period';
  const totalForecast = forecast.total_revenue || 1;

  const cats = categories.map((c) => {
    const lastRev = latest.by_category[c];
    const fc = forecast.by_category[c];
    const baseRev = compareBase ? compareBase[c] : lastRev;
    const trendPct = baseRev > 0 ? ((fc - baseRev) / baseRev) * 100 : 0;
    return {
      category: c,
      last_period_revenue: Math.round(lastRev),
      forecast_revenue: fc,
      forecast_share_pct: Math.round((fc / totalForecast) * 1000) / 10,
      forecast_profit: Math.round(fc * margin(c)),
      margin_pct: Math.round(margin(c) * 100),
      trend_pct: Math.round(trendPct * 10) / 10,
      units_last_period: latest.units_by_category[c],
    };
  });

  // Rank by forecast revenue: highest demand gets the stock priority.
  const ranked = [...cats].sort((a, b) => b.forecast_revenue - a.forecast_revenue);
  const topRevenue = ranked[0];
  const topProfit = [...cats].sort((a, b) => b.forecast_profit - a.forecast_profit)[0];

  const recommendations = ranked.map((c, i) => {
    let action: StockAction;
    if (i === 0 && c.trend_pct > -5) action = 'Increase stock';
    else if (c.trend_pct <= -5 && i === ranked.length - 1) action = 'Review / reduce stock';
    else action = 'Maintain stock';

    const dir = c.trend_pct >= 0 ? 'up' : 'down';
    const reason =
      `${c.category} is forecast at ₹${c.forecast_revenue.toLocaleString('en-IN')} ${pa.next_label} ` +
      `(${c.forecast_share_pct}% of sales, trend ${dir} ${Math.abs(c.trend_pct)}% vs ${compareLabel}).`;
    return { ...c, rank: i + 1, action, reason };
  });

  let headline = `Stock more ${topRevenue.category}: it has the highest forecast sales (₹${topRevenue.forecast_revenue.toLocaleString('en-IN')}) for the ${pa.next_label}.`;
  if (topProfit.category !== topRevenue.category) {
    headline += ` Note: ${topProfit.category} earns more profit (₹${topProfit.forecast_profit.toLocaleString('en-IN')}) at its ${topProfit.margin_pct}% margin, so balance stock between the two.`;
  }

  return {
    period: pa.period,
    period_label: pa.period_label,
    headline,
    compared_with: compareLabel,
    top_by_revenue: topRevenue.category,
    top_by_profit: topProfit.category,
    recommendations,
    low_history: pa.low_history,
  };
}
