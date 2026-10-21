import { getSalesRows } from './db';
import { SaleRow } from './types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdDev(nums: number[], ddof = 1): number {
  if (nums.length <= ddof) return 0;
  const m = mean(nums);
  const variance = nums.reduce((sum, n) => sum + Math.pow(n - m, 2), 0) / (nums.length - ddof);
  return Math.sqrt(variance);
}

// Simple 1D linear regression y = m*t + c
function fitLinear(y: number[]): (step: number) => number {
  const n = y.length;
  if (n === 0) return () => 0;
  if (n === 1) return () => y[0];

  let sumT = 0;
  let sumY = 0;
  let sumTY = 0;
  let sumT2 = 0;

  for (let t = 0; t < n; t++) {
    sumT += t;
    sumY += y[t];
    sumTY += t * y[t];
    sumT2 += t * t;
  }

  const denominator = n * sumT2 - sumT * sumT;
  if (denominator === 0) {
    const avg = sumY / n;
    return () => avg;
  }

  const slope = (n * sumTY - sumT * sumY) / denominator;
  const intercept = (sumY - slope * sumT) / n;

  return (step: number) => slope * step + intercept;
}

export function getMonthlyHistory(rows?: SaleRow[]) {
  const data = rows || getSalesRows();
  const monthMap = new Map<string, { total: number; dates: Set<string>; year: number; month: number }>();

  for (const row of data) {
    const ym = row.date.slice(0, 7);
    if (!monthMap.has(ym)) {
      const [y, m] = ym.split('-').map(Number);
      monthMap.set(ym, { total: 0, dates: new Set(), year: y, month: m });
    }
    const entry = monthMap.get(ym)!;
    entry.total += row.total_amount;
    entry.dates.add(row.date);
  }

  const sortedMonths = Array.from(monthMap.keys()).sort();
  const fullMonths: { ym: string; total: number }[] = [];
  const droppedMonths: string[] = [];

  for (const ym of sortedMonths) {
    const entry = monthMap.get(ym)!;
    const daysInMonth = getDaysInMonth(entry.year, entry.month - 1);
    if (entry.dates.size / daysInMonth >= 0.8) {
      fullMonths.push({ ym, total: entry.total });
    } else {
      droppedMonths.push(ym);
    }
  }

  return {
    fullMonths,
    droppedMonths,
  };
}

export function getOverview(rows?: SaleRow[]) {
  const data = rows || getSalesRows();
  if (data.length === 0) {
    throw new Error('No dataset has been uploaded yet.');
  }

  let totalSales = 0;
  let totalQuantity = 0;
  let minDate = data[0].date;
  let maxDate = data[0].date;

  const monthMap = new Map<
    string,
    {
      revenue: number;
      units: number;
      orders: number;
      dates: Set<string>;
      year: number;
      month: number;
    }
  >();

  const categoryMap = new Map<string, number>();

  for (const row of data) {
    totalSales += row.total_amount;
    totalQuantity += row.quantity;
    if (row.date < minDate) minDate = row.date;
    if (row.date > maxDate) maxDate = row.date;

    const ym = row.date.slice(0, 7);
    if (!monthMap.has(ym)) {
      const [y, m] = ym.split('-').map(Number);
      monthMap.set(ym, {
        revenue: 0,
        units: 0,
        orders: 0,
        dates: new Set(),
        year: y,
        month: m,
      });
    }
    const mEntry = monthMap.get(ym)!;
    mEntry.revenue += row.total_amount;
    mEntry.units += row.quantity;
    mEntry.orders += 1;
    mEntry.dates.add(row.date);

    categoryMap.set(row.product_category, (categoryMap.get(row.product_category) || 0) + row.total_amount);
  }

  const sortedMonths = Array.from(monthMap.keys()).sort();
  const monthly = sortedMonths.map((ym) => {
    const entry = monthMap.get(ym)!;
    const daysInMonth = getDaysInMonth(entry.year, entry.month - 1);
    const partial = entry.dates.size / daysInMonth < 0.8;
    return {
      month: ym,
      total_revenue: Math.round(entry.revenue * 100) / 100,
      avg_revenue: Math.round((entry.revenue / entry.orders) * 100) / 100,
      units: entry.units,
      orders: entry.orders,
      partial,
    };
  });

  const fullMonths = monthly.filter((m) => !m.partial);

  let trends: {
    revenue?: number;
    units?: number;
    transactions?: number;
    avg?: number;
    label?: string;
  } = {};

  if (fullMonths.length >= 2) {
    const last = fullMonths[fullMonths.length - 1];
    const prev = fullMonths[fullMonths.length - 2];
    const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : 0);

    trends = {
      revenue: pct(last.total_revenue, prev.total_revenue),
      units: pct(last.units, prev.units),
      transactions: pct(last.orders, prev.orders),
      avg: pct(last.avg_revenue, prev.avg_revenue),
      label: `${last.month} vs ${prev.month}`,
    };
  }

  // Weekly series: bucket by 7-day windows or ISO week ending dates
  const dailyRev = new Map<string, number>();
  for (const row of data) {
    dailyRev.set(row.date, (dailyRev.get(row.date) || 0) + row.total_amount);
  }

  const sortedDates = Array.from(dailyRev.keys()).sort();
  const weekly: { date: string; revenue: number }[] = [];
  if (sortedDates.length > 0) {
    let weekEnd = new Date(sortedDates[0]);
    // set to end of current week (e.g. Sunday)
    const day = weekEnd.getUTCDay();
    const diff = (7 - day) % 7;
    weekEnd.setUTCDate(weekEnd.getUTCDate() + diff);

    let currentWeekRev = 0;
    const maxD = new Date(maxDate);

    for (const dStr of sortedDates) {
      const d = new Date(dStr);
      while (d > weekEnd && weekEnd <= maxD) {
        weekly.push({
          date: weekEnd.toISOString().slice(0, 10),
          revenue: Math.round(currentWeekRev * 100) / 100,
        });
        currentWeekRev = 0;
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
      }
      currentWeekRev += dailyRev.get(dStr)!;
    }
    if (currentWeekRev > 0) {
      weekly.push({
        date: weekEnd.toISOString().slice(0, 10),
        revenue: Math.round(currentWeekRev * 100) / 100,
      });
    }
  }

  // Categories sorted
  const categories = Array.from(categoryMap.entries())
    .map(([cat, rev]) => ({ category: cat, sales: Math.round(rev * 100) / 100 }))
    .sort((a, b) => b.sales - a.sales);

  // Age segments: 18-24, 25-34, 35-44, 45-54, 55+
  const ageBuckets = [
    { label: '18-24', min: 18, max: 24, count: 0, revenue: 0 },
    { label: '25-34', min: 25, max: 34, count: 0, revenue: 0 },
    { label: '35-44', min: 35, max: 44, count: 0, revenue: 0 },
    { label: '45-54', min: 45, max: 54, count: 0, revenue: 0 },
    { label: '55+', min: 55, max: 200, count: 0, revenue: 0 },
  ];

  const genderMap = new Map<string, { count: number; revenue: number }>();

  for (const row of data) {
    for (const b of ageBuckets) {
      if (row.age >= b.min && row.age <= b.max) {
        b.count++;
        b.revenue += row.total_amount;
        break;
      }
    }

    const g = row.gender || 'Other';
    if (!genderMap.has(g)) genderMap.set(g, { count: 0, revenue: 0 });
    const gEntry = genderMap.get(g)!;
    gEntry.count++;
    gEntry.revenue += row.total_amount;
  }

  const ageSegments = ageBuckets.map((b) => ({
    segment: b.label,
    count: b.count,
    revenue: Math.round(b.revenue * 100) / 100,
  }));

  const genderSegments = Array.from(genderMap.entries()).map(([g, v]) => ({
    segment: g,
    count: v.count,
    revenue: Math.round(v.revenue * 100) / 100,
  }));

  return {
    dataset: {
      rows: data.length,
      start: minDate,
      end: maxDate,
    },
    kpis: {
      total_sales: Math.round(totalSales * 100) / 100,
      total_quantity: totalQuantity,
      total_transactions: data.length,
      average_transaction: Math.round((totalSales / data.length) * 100) / 100,
    },
    trends,
    weekly,
    monthly: monthly.map((m) => ({
      month: m.month,
      total_revenue: m.total_revenue,
      avg_revenue: m.avg_revenue,
      partial: m.partial,
    })),
    categories,
    segments: {
      age: ageSegments,
      gender: genderSegments,
    },
  };
}

export function getSalesAnalysis(rows?: SaleRow[]) {
  const data = rows || getSalesRows();
  const ov = getOverview(data);
  const total = ov.kpis.total_sales;

  // Stacked monthly category revenue for full months
  const { fullMonths, droppedMonths } = getMonthlyHistory(data);
  const fullYMs = new Set(fullMonths.map((m) => m.ym));

  const allCategories = Array.from(new Set(data.map((r) => r.product_category))).sort();
  const stackedMap = new Map<string, Record<string, number>>();

  for (const ym of fullYMs) {
    stackedMap.set(ym, {});
    for (const cat of allCategories) {
      stackedMap.get(ym)![cat] = 0;
    }
  }

  const catAgg = new Map<string, { revenue: number; units: number; orders: number }>();
  for (const cat of allCategories) {
    catAgg.set(cat, { revenue: 0, units: 0, orders: 0 });
  }

  // Weekday daily revenue: 0=Mon, 1=Tue, ..., 6=Sun
  const weekdayRev = [0, 0, 0, 0, 0, 0, 0];
  const weekdayDates = [new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>()];

  for (const row of data) {
    const ym = row.date.slice(0, 7);
    if (fullYMs.has(ym)) {
      stackedMap.get(ym)![row.product_category] += row.total_amount;
    }

    const c = catAgg.get(row.product_category)!;
    c.revenue += row.total_amount;
    c.units += row.quantity;
    c.orders += 1;

    // Date day of week: getUTCDay() gives 0=Sun, 1=Mon, ..., 6=Sat
    // Convert to 0=Mon ... 6=Sun
    const dateObj = new Date(row.date);
    const day = (dateObj.getUTCDay() + 6) % 7;
    weekdayRev[day] += row.total_amount;
    weekdayDates[day].add(row.date);
  }

  const stackedMonths = Array.from(stackedMap.keys()).sort();
  const stackedSeries = allCategories.map((cat) => ({
    category: cat,
    values: stackedMonths.map((m) => Math.round((stackedMap.get(m)?.[cat] || 0) * 100) / 100),
  }));

  const categories = allCategories
    .map((name) => {
      const r = catAgg.get(name)!;
      return {
        category: name,
        revenue: Math.round(r.revenue * 100) / 100,
        share: total ? Math.round((r.revenue / total) * 1000) / 10 : 0,
        units: r.units,
        orders: r.orders,
        avg_order: r.orders ? Math.round((r.revenue / r.orders) * 100) / 100 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const weekday = WEEKDAYS.map((dayName, idx) => {
    const daysCount = weekdayDates[idx].size || 1;
    return {
      day: dayName,
      avg_daily_revenue: Math.round((weekdayRev[idx] / daysCount) * 100) / 100,
    };
  });

  const monthlyFull = ov.monthly.filter((m) => !m.partial);

  // Generate automated natural language business insights
  const insights: string[] = [];
  if (categories.length >= 2) {
    const top = categories[0];
    const low = categories[categories.length - 1];
    insights.push(`${top.category} leads with ${top.share}% of revenue; ${low.category} trails at ${low.share}%.`);
  }

  if (monthlyFull.length > 0) {
    const sortedByRev = [...monthlyFull].sort((a, b) => b.total_revenue - a.total_revenue);
    const best = sortedByRev[0];
    const weak = sortedByRev[sortedByRev.length - 1];
    const formatMY = (ym: string) => {
      const [y, m] = ym.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[Number(m) - 1]} ${y}`;
    };
    insights.push(
      `Best month was ${formatMY(best.month)} (₹${Math.round(best.total_revenue).toLocaleString('en-IN')}); weakest was ${formatMY(weak.month)} (₹${Math.round(weak.total_revenue).toLocaleString('en-IN')}).`
    );
  }

  if (weekday.length > 0) {
    const bestDay = [...weekday].sort((a, b) => b.avg_daily_revenue - a.avg_daily_revenue)[0];
    insights.push(
      `${bestDay.day} is the strongest weekday, averaging ₹${Math.round(bestDay.avg_daily_revenue).toLocaleString('en-IN')} per day.`
    );
  }

  // Latest month-over-month change and the category that drove it
  if (stackedMonths.length >= 2) {
    const last = stackedMonths.length - 1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = (ym: string) => `${monthNames[Number(ym.split('-')[1]) - 1]} ${ym.split('-')[0]}`;
    const prevTotal = stackedSeries.reduce((sum, s) => sum + s.values[last - 1], 0);
    const lastTotal = stackedSeries.reduce((sum, s) => sum + s.values[last], 0);
    if (prevTotal > 0) {
      const change = ((lastTotal - prevTotal) / prevTotal) * 100;
      const up = lastTotal >= prevTotal;
      let driver = '';
      let best = 0;
      for (const s of stackedSeries) {
        const delta = (s.values[last] - s.values[last - 1]) * (up ? 1 : -1);
        if (delta > best) {
          best = delta;
          driver = s.category;
        }
      }
      insights.push(
        `Revenue ${up ? 'rose' : 'fell'} ${Math.abs(Math.round(change * 10) / 10)}% in ${label(stackedMonths[last])} vs ${label(stackedMonths[last - 1])}${driver ? `; ${driver} drove most of the change.` : '.'}`
      );
    }
  }

  return {
    trend: {
      weekly: ov.weekly,
      monthly: monthlyFull,
    },
    stacked: {
      months: stackedMonths,
      series: stackedSeries,
    },
    categories,
    weekday,
    insights,
    partial_months_excluded: droppedMonths,
  };
}

export function getForecast(rows?: SaleRow[]) {
  const data = rows || getSalesRows();
  const { fullMonths, droppedMonths } = getMonthlyHistory(data);

  const HORIZON = 6;
  const MIN_MONTHS = 6;
  const BACKTEST_MONTHS = 3;

  if (fullMonths.length < MIN_MONTHS) {
    throw new Error(`Need at least ${MIN_MONTHS} full months of data to forecast; found ${fullMonths.length}.`);
  }

  const y = fullMonths.map((m) => m.total);
  const n = y.length;

  // Model 1: Linear Regression
  const linearNext = (history: number[], steps: number): number[] => {
    const predictor = fitLinear(history);
    const result: number[] = [];
    for (let s = 0; s < steps; s++) {
      result.push(predictor(history.length + s));
    }
    return result;
  };

  // Model 2: Recent 3-month average
  const recentMeanNext = (history: number[], steps: number): number[] => {
    const last3 = history.slice(-3);
    const avg = mean(last3);
    return Array(steps).fill(avg);
  };

  const models: Record<string, (h: number[], steps: number) => number[]> = {
    'Linear trend': linearNext,
    'Recent 3-month average': recentMeanNext,
  };

  const scores: Record<string, number> = {};
  const errors: Record<string, number[]> = {};

  for (const [name, fn] of Object.entries(models)) {
    const errs: number[] = [];
    for (let i = n - BACKTEST_MONTHS; i < n; i++) {
      const train = y.slice(0, i);
      const pred = fn(train, 1)[0];
      const actual = y[i];
      errs.push(actual - pred);
    }
    errors[name] = errs;

    // MAPE over backtest months
    const actuals = y.slice(-BACKTEST_MONTHS);
    const mape = mean(errs.map((e, idx) => Math.abs(e) / actuals[idx]));
    scores[name] = mape;
  }

  // Pick model with lowest MAPE
  let bestModel = 'Linear trend';
  let lowestMape = Infinity;
  for (const [name, score] of Object.entries(scores)) {
    if (score < lowestMape) {
      lowestMape = score;
      bestModel = name;
    }
  }

  const bestErrors = errors[bestModel];
  const sigma = bestErrors.length > 1 ? stdDev(bestErrors, 1) : 0.15 * mean(y);
  const band = 1.28 * sigma; // ~80% prediction interval

  const preds = models[bestModel](y, HORIZON).map((v) => Math.max(0, v));

  // Determine next month string
  const lastYM = fullMonths[fullMonths.length - 1].ym;
  const [lastY, lastM] = lastYM.split('-').map(Number);

  const forecastRows: { date: string; predicted: number; lower: number; upper: number }[] = [];

  for (let i = 1; i <= HORIZON; i++) {
    const nextDateObj = new Date(Date.UTC(lastY, lastM - 1 + i, 1));
    const nextYM = nextDateObj.toISOString().slice(0, 7);
    const val = preds[i - 1];
    forecastRows.push({
      date: nextYM,
      predicted: Math.round(val * 100) / 100,
      lower: Math.round(Math.max(0, val - band) * 100) / 100,
      upper: Math.round((val + band) * 100) / 100,
    });
  }

  const history = fullMonths.map((m) => ({
    date: m.ym,
    sales: Math.round(m.total * 100) / 100,
  }));

  const mapePct = Math.round(lowestMape * 1000) / 10;
  const accuracy = Math.round(Math.max(0, 100 - mapePct) * 10) / 10;

  return {
    history,
    data: forecastRows,
    model: bestModel,
    mape: mapePct,
    accuracy,
    next_month_predicted: forecastRows[0].predicted,
    partial_months_excluded: droppedMonths,
  };
}

// ---------------------------------------------------------------------------
// Daily revenue anomalies
//
// Method: for every day with sales, compare daily revenue to a rolling median
// baseline built from all days within +/-15 calendar days (min 7 sales-days).
// The residuals are scored with a modified z-score (0.6745 * residual / MAD) and
// flagged at |z| >= threshold (default 3.5, the standard cutoff for this score).
// Days with no sales are not part of the series, so they are not scored.
// (Tested: log-scaling the revenue first hides real spikes on sparse data, so the
// score is computed on plain revenue.)
// ---------------------------------------------------------------------------
const DAY_MS = 86400000;
const ANOMALY_WINDOW_RADIUS_DAYS = 15; // 31-day centered window
const ANOMALY_MIN_PERIODS = 7;
const ANOMALY_HIGH_Z = 5; // fixed severity band, independent of the sensitivity slider

export function getAnomalies(rows?: SaleRow[], limit = 500, threshold = 3.5) {
  const data = rows || getSalesRows();
  const dailyMap = new Map<string, number>();

  for (const row of data) {
    dailyMap.set(row.date, (dailyMap.get(row.date) || 0) + row.total_amount);
  }

  const sortedDates = Array.from(dailyMap.keys()).sort();
  const n = sortedDates.length;
  if (n < 14) {
    return { data: [], total: 0, threshold, series: [] as { date: string; value: number; expected: number }[] };
  }

  const dailyVals = sortedDates.map((d) => dailyMap.get(d)!);
  const dayNum = sortedDates.map((d) => Math.floor(Date.parse(`${d}T00:00:00Z`) / DAY_MS));

  const expected: number[] = [];
  const residuals: number[] = [];

  let lo = 0;
  let hi = 0;
  for (let i = 0; i < n; i++) {
    while (dayNum[lo] < dayNum[i] - ANOMALY_WINDOW_RADIUS_DAYS) lo++;
    while (hi < n && dayNum[hi] <= dayNum[i] + ANOMALY_WINDOW_RADIUS_DAYS) hi++;
    const windowSlice = dailyVals.slice(lo, hi);
    const exp = windowSlice.length >= ANOMALY_MIN_PERIODS ? median(windowSlice) : dailyVals[i];
    expected.push(exp);
    residuals.push(dailyVals[i] - exp);
  }

  const medResid = median(residuals);
  const absDeviations = residuals.map((r) => Math.abs(r - medResid));
  let mad = median(absDeviations);
  if (mad === 0) {
    mad = stdDev(residuals) || 1.0;
  }

  const cutoff = Math.max(1.0, threshold);
  const flagged: {
    date: string;
    value: number;
    expected: number;
    deviation: string;
    severity: 'High' | 'Medium';
    score: number;
    absScore: number;
    driver: string;
    driver_share: number;
  }[] = [];

  for (let i = 0; i < n; i++) {
    const z = (0.6745 * (residuals[i] - medResid)) / mad;
    if (Math.abs(z) >= cutoff) {
      const val = dailyVals[i];
      const exp = expected[i];
      const pct = exp ? ((val - exp) / exp) * 100 : 0;
      flagged.push({
        date: sortedDates[i],
        value: Math.round(val * 100) / 100,
        expected: Math.round(exp * 100) / 100,
        deviation: `${pct >= 0 ? '+' : ''}${Math.round(pct)}%`,
        severity: Math.abs(z) >= ANOMALY_HIGH_Z ? 'High' : 'Medium',
        score: Math.round(z * 10) / 10,
        absScore: Math.abs(z),
        driver: '',
        driver_share: 0,
      });
    }
  }

  flagged.sort((a, b) => b.absScore - a.absScore);

  // Which category drove each flagged day: the category whose revenue moved furthest from its own
  // typical day (median daily revenue), in the same direction as the anomaly.
  const catDay = new Map<string, Map<string, number>>();
  for (const row of data) {
    let m = catDay.get(row.product_category);
    if (!m) {
      m = new Map<string, number>();
      catDay.set(row.product_category, m);
    }
    m.set(row.date, (m.get(row.date) || 0) + row.total_amount);
  }
  const catTypical = new Map<string, number>();
  for (const [cat, m] of catDay) {
    catTypical.set(cat, median(sortedDates.map((d) => m.get(d) || 0)));
  }

  const topFlagged = flagged.slice(0, limit);
  for (const item of topFlagged) {
    const up = item.value >= item.expected;
    let totalMove = 0;
    let bestMove = 0;
    let bestCat = '';
    for (const [cat, m] of catDay) {
      const excess = (m.get(item.date) || 0) - (catTypical.get(cat) || 0);
      const move = up ? excess : -excess;
      if (move > 0) {
        totalMove += move;
        if (move > bestMove) {
          bestMove = move;
          bestCat = cat;
        }
      }
    }
    item.driver = bestCat || '-';
    item.driver_share = totalMove > 0 ? Math.round((bestMove / totalMove) * 100) : 0;
  }

  const resultData = topFlagged.map(({ absScore, ...item }) => item);

  // Full daily series (actual vs rolling median) so the page can draw the line chart with markers
  const series = sortedDates.map((date, i) => ({
    date,
    value: Math.round(dailyVals[i] * 100) / 100,
    expected: Math.round(expected[i] * 100) / 100,
  }));

  return {
    data: resultData,
    total: flagged.length,
    threshold: cutoff,
    series,
  };
}

// ---------------------------------------------------------------------------
// Unusual transactions
//
// Method: Tukey IQR fences computed separately for each product category, so an
// expensive category (e.g. Electronics) is not flagged just for being expensive.
// Categories with fewer than 8 transactions are skipped (too few to judge).
// ---------------------------------------------------------------------------
function quantileSorted(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return base + 1 < sorted.length
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

// Fence multiplier for unusual transactions. 1.5 is Tukey's standard outlier fence (flags ~2% of
// this dataset); 3.0 is the "far out" fence (flags almost nothing). 2.0 keeps the table focused.
export const UNUSUAL_TX_FENCE = 2.0;

export function getUnusualTransactions(rows?: SaleRow[], limit = 200, fence = UNUSUAL_TX_FENCE) {
  const data = rows || getSalesRows();
  const byCategory = new Map<string, SaleRow[]>();
  for (const r of data) {
    const list = byCategory.get(r.product_category);
    if (list) list.push(r);
    else byCategory.set(r.product_category, [r]);
  }

  const flagged: {
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
  }[] = [];
  const perCategory: Record<string, number> = {};

  for (const [category, list] of byCategory) {
    if (list.length < 8) continue;
    const sorted = list.map((r) => r.total_amount).sort((a, b) => a - b);
    const q1 = quantileSorted(sorted, 0.25);
    const q3 = quantileSorted(sorted, 0.75);
    const iqr = q3 - q1;
    const lower = q1 - fence * iqr;
    const upper = q3 + fence * iqr;
    const typical = median(sorted);

    for (const r of list) {
      const amt = r.total_amount;
      if (amt > upper || amt < lower) {
        const high = amt > upper;
        const distance = iqr > 0 ? (high ? amt - upper : lower - amt) / iqr : 0;
        flagged.push({
          transaction_id: r.transaction_id,
          date: r.date,
          customer_id: r.customer_id,
          category,
          amount: Math.round(amt * 100) / 100,
          typical: Math.round(typical * 100) / 100,
          lower_bound: Math.round(lower * 100) / 100,
          upper_bound: Math.round(upper * 100) / 100,
          direction: high ? 'High' : 'Low',
          times_typical: typical > 0 ? Math.round((amt / typical) * 10) / 10 : 0,
          score: Math.round(distance * 100) / 100,
        });
        perCategory[category] = (perCategory[category] || 0) + 1;
      }
    }
  }

  flagged.sort((a, b) => b.score - a.score);

  return {
    data: flagged.slice(0, limit),
    total: flagged.length,
    by_category: perCategory,
    method: `Per-category IQR fences (${fence} x IQR)`,
  };
}
