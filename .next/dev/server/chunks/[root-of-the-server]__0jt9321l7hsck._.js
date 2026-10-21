module.exports = [
(()=>{"use strict";return[
"[project]/app/api/forecast/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/analytics.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["databaseExists"])()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            detail: 'No dataset has been uploaded yet.'
        }, {
            status: 404
        });
    }
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getForecast"])());
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            detail: err.message
        }, {
            status: 422
        });
    }
}
}),
"[project]/server/analytics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UNUSUAL_TX_FENCE",
    ()=>UNUSUAL_TX_FENCE,
    "getAnomalies",
    ()=>getAnomalies,
    "getForecast",
    ()=>getForecast,
    "getMonthlyHistory",
    ()=>getMonthlyHistory,
    "getOverview",
    ()=>getOverview,
    "getSalesAnalysis",
    ()=>getSalesAnalysis,
    "getUnusualTransactions",
    ()=>getUnusualTransactions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/db.ts [app-route] (ecmascript)");
;
const WEEKDAYS = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
];
function getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
}
function mean(nums) {
    if (nums.length === 0) return 0;
    return nums.reduce((a, b)=>a + b, 0) / nums.length;
}
function median(nums) {
    if (nums.length === 0) return 0;
    const sorted = [
        ...nums
    ].sort((a, b)=>a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function stdDev(nums, ddof = 1) {
    if (nums.length <= ddof) return 0;
    const m = mean(nums);
    const variance = nums.reduce((sum, n)=>sum + Math.pow(n - m, 2), 0) / (nums.length - ddof);
    return Math.sqrt(variance);
}
// Simple 1D linear regression y = m*t + c
function fitLinear(y) {
    const n = y.length;
    if (n === 0) return ()=>0;
    if (n === 1) return ()=>y[0];
    let sumT = 0;
    let sumY = 0;
    let sumTY = 0;
    let sumT2 = 0;
    for(let t = 0; t < n; t++){
        sumT += t;
        sumY += y[t];
        sumTY += t * y[t];
        sumT2 += t * t;
    }
    const denominator = n * sumT2 - sumT * sumT;
    if (denominator === 0) {
        const avg = sumY / n;
        return ()=>avg;
    }
    const slope = (n * sumTY - sumT * sumY) / denominator;
    const intercept = (sumY - slope * sumT) / n;
    return (step)=>slope * step + intercept;
}
function getMonthlyHistory(rows) {
    const data = rows || (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    const monthMap = new Map();
    for (const row of data){
        const ym = row.date.slice(0, 7);
        if (!monthMap.has(ym)) {
            const [y, m] = ym.split('-').map(Number);
            monthMap.set(ym, {
                total: 0,
                dates: new Set(),
                year: y,
                month: m
            });
        }
        const entry = monthMap.get(ym);
        entry.total += row.total_amount;
        entry.dates.add(row.date);
    }
    const sortedMonths = Array.from(monthMap.keys()).sort();
    const fullMonths = [];
    const droppedMonths = [];
    for (const ym of sortedMonths){
        const entry = monthMap.get(ym);
        const daysInMonth = getDaysInMonth(entry.year, entry.month - 1);
        if (entry.dates.size / daysInMonth >= 0.8) {
            fullMonths.push({
                ym,
                total: entry.total
            });
        } else {
            droppedMonths.push(ym);
        }
    }
    return {
        fullMonths,
        droppedMonths
    };
}
function getOverview(rows) {
    const data = rows || (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    if (data.length === 0) {
        throw new Error('No dataset has been uploaded yet.');
    }
    let totalSales = 0;
    let totalQuantity = 0;
    let minDate = data[0].date;
    let maxDate = data[0].date;
    const monthMap = new Map();
    const categoryMap = new Map();
    for (const row of data){
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
                month: m
            });
        }
        const mEntry = monthMap.get(ym);
        mEntry.revenue += row.total_amount;
        mEntry.units += row.quantity;
        mEntry.orders += 1;
        mEntry.dates.add(row.date);
        categoryMap.set(row.product_category, (categoryMap.get(row.product_category) || 0) + row.total_amount);
    }
    const sortedMonths = Array.from(monthMap.keys()).sort();
    const monthly = sortedMonths.map((ym)=>{
        const entry = monthMap.get(ym);
        const daysInMonth = getDaysInMonth(entry.year, entry.month - 1);
        const partial = entry.dates.size / daysInMonth < 0.8;
        return {
            month: ym,
            total_revenue: Math.round(entry.revenue * 100) / 100,
            avg_revenue: Math.round(entry.revenue / entry.orders * 100) / 100,
            units: entry.units,
            orders: entry.orders,
            partial
        };
    });
    const fullMonths = monthly.filter((m)=>!m.partial);
    let trends = {};
    if (fullMonths.length >= 2) {
        const last = fullMonths[fullMonths.length - 1];
        const prev = fullMonths[fullMonths.length - 2];
        const pct = (a, b)=>b ? Math.round((a - b) / b * 1000) / 10 : 0;
        trends = {
            revenue: pct(last.total_revenue, prev.total_revenue),
            units: pct(last.units, prev.units),
            transactions: pct(last.orders, prev.orders),
            avg: pct(last.avg_revenue, prev.avg_revenue),
            label: `${last.month} vs ${prev.month}`
        };
    }
    // Weekly series: bucket by 7-day windows or ISO week ending dates
    const dailyRev = new Map();
    for (const row of data){
        dailyRev.set(row.date, (dailyRev.get(row.date) || 0) + row.total_amount);
    }
    const sortedDates = Array.from(dailyRev.keys()).sort();
    const weekly = [];
    if (sortedDates.length > 0) {
        let weekEnd = new Date(sortedDates[0]);
        // set to end of current week (e.g. Sunday)
        const day = weekEnd.getUTCDay();
        const diff = (7 - day) % 7;
        weekEnd.setUTCDate(weekEnd.getUTCDate() + diff);
        let currentWeekRev = 0;
        const maxD = new Date(maxDate);
        for (const dStr of sortedDates){
            const d = new Date(dStr);
            while(d > weekEnd && weekEnd <= maxD){
                weekly.push({
                    date: weekEnd.toISOString().slice(0, 10),
                    revenue: Math.round(currentWeekRev * 100) / 100
                });
                currentWeekRev = 0;
                weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
            }
            currentWeekRev += dailyRev.get(dStr);
        }
        if (currentWeekRev > 0) {
            weekly.push({
                date: weekEnd.toISOString().slice(0, 10),
                revenue: Math.round(currentWeekRev * 100) / 100
            });
        }
    }
    // Categories sorted
    const categories = Array.from(categoryMap.entries()).map(([cat, rev])=>({
            category: cat,
            sales: Math.round(rev * 100) / 100
        })).sort((a, b)=>b.sales - a.sales);
    // Age segments: 18-24, 25-34, 35-44, 45-54, 55+
    const ageBuckets = [
        {
            label: '18-24',
            min: 18,
            max: 24,
            count: 0,
            revenue: 0
        },
        {
            label: '25-34',
            min: 25,
            max: 34,
            count: 0,
            revenue: 0
        },
        {
            label: '35-44',
            min: 35,
            max: 44,
            count: 0,
            revenue: 0
        },
        {
            label: '45-54',
            min: 45,
            max: 54,
            count: 0,
            revenue: 0
        },
        {
            label: '55+',
            min: 55,
            max: 200,
            count: 0,
            revenue: 0
        }
    ];
    const genderMap = new Map();
    for (const row of data){
        for (const b of ageBuckets){
            if (row.age >= b.min && row.age <= b.max) {
                b.count++;
                b.revenue += row.total_amount;
                break;
            }
        }
        const g = row.gender || 'Other';
        if (!genderMap.has(g)) genderMap.set(g, {
            count: 0,
            revenue: 0
        });
        const gEntry = genderMap.get(g);
        gEntry.count++;
        gEntry.revenue += row.total_amount;
    }
    const ageSegments = ageBuckets.map((b)=>({
            segment: b.label,
            count: b.count,
            revenue: Math.round(b.revenue * 100) / 100
        }));
    const genderSegments = Array.from(genderMap.entries()).map(([g, v])=>({
            segment: g,
            count: v.count,
            revenue: Math.round(v.revenue * 100) / 100
        }));
    return {
        dataset: {
            rows: data.length,
            start: minDate,
            end: maxDate
        },
        kpis: {
            total_sales: Math.round(totalSales * 100) / 100,
            total_quantity: totalQuantity,
            total_transactions: data.length,
            average_transaction: Math.round(totalSales / data.length * 100) / 100
        },
        trends,
        weekly,
        monthly: monthly.map((m)=>({
                month: m.month,
                total_revenue: m.total_revenue,
                avg_revenue: m.avg_revenue,
                partial: m.partial
            })),
        categories,
        segments: {
            age: ageSegments,
            gender: genderSegments
        }
    };
}
function getSalesAnalysis(rows) {
    const data = rows || (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    const ov = getOverview(data);
    const total = ov.kpis.total_sales;
    // Stacked monthly category revenue for full months
    const { fullMonths, droppedMonths } = getMonthlyHistory(data);
    const fullYMs = new Set(fullMonths.map((m)=>m.ym));
    const allCategories = Array.from(new Set(data.map((r)=>r.product_category))).sort();
    const stackedMap = new Map();
    for (const ym of fullYMs){
        stackedMap.set(ym, {});
        for (const cat of allCategories){
            stackedMap.get(ym)[cat] = 0;
        }
    }
    const catAgg = new Map();
    for (const cat of allCategories){
        catAgg.set(cat, {
            revenue: 0,
            units: 0,
            orders: 0
        });
    }
    // Weekday daily revenue: 0=Mon, 1=Tue, ..., 6=Sun
    const weekdayRev = [
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ];
    const weekdayDates = [
        new Set(),
        new Set(),
        new Set(),
        new Set(),
        new Set(),
        new Set(),
        new Set()
    ];
    for (const row of data){
        const ym = row.date.slice(0, 7);
        if (fullYMs.has(ym)) {
            stackedMap.get(ym)[row.product_category] += row.total_amount;
        }
        const c = catAgg.get(row.product_category);
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
    const stackedSeries = allCategories.map((cat)=>({
            category: cat,
            values: stackedMonths.map((m)=>Math.round((stackedMap.get(m)?.[cat] || 0) * 100) / 100)
        }));
    const categories = allCategories.map((name)=>{
        const r = catAgg.get(name);
        return {
            category: name,
            revenue: Math.round(r.revenue * 100) / 100,
            share: total ? Math.round(r.revenue / total * 1000) / 10 : 0,
            units: r.units,
            orders: r.orders,
            avg_order: r.orders ? Math.round(r.revenue / r.orders * 100) / 100 : 0
        };
    }).sort((a, b)=>b.revenue - a.revenue);
    const weekday = WEEKDAYS.map((dayName, idx)=>{
        const daysCount = weekdayDates[idx].size || 1;
        return {
            day: dayName,
            avg_daily_revenue: Math.round(weekdayRev[idx] / daysCount * 100) / 100
        };
    });
    const monthlyFull = ov.monthly.filter((m)=>!m.partial);
    // Generate automated natural language business insights
    const insights = [];
    if (categories.length >= 2) {
        const top = categories[0];
        const low = categories[categories.length - 1];
        insights.push(`${top.category} leads with ${top.share}% of revenue; ${low.category} trails at ${low.share}%.`);
    }
    if (monthlyFull.length > 0) {
        const sortedByRev = [
            ...monthlyFull
        ].sort((a, b)=>b.total_revenue - a.total_revenue);
        const best = sortedByRev[0];
        const weak = sortedByRev[sortedByRev.length - 1];
        const formatMY = (ym)=>{
            const [y, m] = ym.split('-');
            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];
            return `${monthNames[Number(m) - 1]} ${y}`;
        };
        insights.push(`Best month was ${formatMY(best.month)} (₹${Math.round(best.total_revenue).toLocaleString('en-IN')}); weakest was ${formatMY(weak.month)} (₹${Math.round(weak.total_revenue).toLocaleString('en-IN')}).`);
    }
    if (weekday.length > 0) {
        const bestDay = [
            ...weekday
        ].sort((a, b)=>b.avg_daily_revenue - a.avg_daily_revenue)[0];
        insights.push(`${bestDay.day} is the strongest weekday, averaging ₹${Math.round(bestDay.avg_daily_revenue).toLocaleString('en-IN')} per day.`);
    }
    // Latest month-over-month change and the category that drove it
    if (stackedMonths.length >= 2) {
        const last = stackedMonths.length - 1;
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];
        const label = (ym)=>`${monthNames[Number(ym.split('-')[1]) - 1]} ${ym.split('-')[0]}`;
        const prevTotal = stackedSeries.reduce((sum, s)=>sum + s.values[last - 1], 0);
        const lastTotal = stackedSeries.reduce((sum, s)=>sum + s.values[last], 0);
        if (prevTotal > 0) {
            const change = (lastTotal - prevTotal) / prevTotal * 100;
            const up = lastTotal >= prevTotal;
            let driver = '';
            let best = 0;
            for (const s of stackedSeries){
                const delta = (s.values[last] - s.values[last - 1]) * (up ? 1 : -1);
                if (delta > best) {
                    best = delta;
                    driver = s.category;
                }
            }
            insights.push(`Revenue ${up ? 'rose' : 'fell'} ${Math.abs(Math.round(change * 10) / 10)}% in ${label(stackedMonths[last])} vs ${label(stackedMonths[last - 1])}${driver ? `; ${driver} drove most of the change.` : '.'}`);
        }
    }
    return {
        trend: {
            weekly: ov.weekly,
            monthly: monthlyFull
        },
        stacked: {
            months: stackedMonths,
            series: stackedSeries
        },
        categories,
        weekday,
        insights,
        partial_months_excluded: droppedMonths
    };
}
function getForecast(rows) {
    const data = rows || (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    const { fullMonths, droppedMonths } = getMonthlyHistory(data);
    const HORIZON = 6;
    const MIN_MONTHS = 6;
    const BACKTEST_MONTHS = 3;
    if (fullMonths.length < MIN_MONTHS) {
        throw new Error(`Need at least ${MIN_MONTHS} full months of data to forecast; found ${fullMonths.length}.`);
    }
    const y = fullMonths.map((m)=>m.total);
    const n = y.length;
    // Model 1: Linear Regression
    const linearNext = (history, steps)=>{
        const predictor = fitLinear(history);
        const result = [];
        for(let s = 0; s < steps; s++){
            result.push(predictor(history.length + s));
        }
        return result;
    };
    // Model 2: Recent 3-month average
    const recentMeanNext = (history, steps)=>{
        const last3 = history.slice(-3);
        const avg = mean(last3);
        return Array(steps).fill(avg);
    };
    const models = {
        'Linear trend': linearNext,
        'Recent 3-month average': recentMeanNext
    };
    const scores = {};
    const errors = {};
    for (const [name, fn] of Object.entries(models)){
        const errs = [];
        for(let i = n - BACKTEST_MONTHS; i < n; i++){
            const train = y.slice(0, i);
            const pred = fn(train, 1)[0];
            const actual = y[i];
            errs.push(actual - pred);
        }
        errors[name] = errs;
        // MAPE over backtest months
        const actuals = y.slice(-BACKTEST_MONTHS);
        const mape = mean(errs.map((e, idx)=>Math.abs(e) / actuals[idx]));
        scores[name] = mape;
    }
    // Pick model with lowest MAPE
    let bestModel = 'Linear trend';
    let lowestMape = Infinity;
    for (const [name, score] of Object.entries(scores)){
        if (score < lowestMape) {
            lowestMape = score;
            bestModel = name;
        }
    }
    const bestErrors = errors[bestModel];
    const sigma = bestErrors.length > 1 ? stdDev(bestErrors, 1) : 0.15 * mean(y);
    const band = 1.28 * sigma; // ~80% prediction interval
    const preds = models[bestModel](y, HORIZON).map((v)=>Math.max(0, v));
    // Determine next month string
    const lastYM = fullMonths[fullMonths.length - 1].ym;
    const [lastY, lastM] = lastYM.split('-').map(Number);
    const forecastRows = [];
    for(let i = 1; i <= HORIZON; i++){
        const nextDateObj = new Date(Date.UTC(lastY, lastM - 1 + i, 1));
        const nextYM = nextDateObj.toISOString().slice(0, 7);
        const val = preds[i - 1];
        forecastRows.push({
            date: nextYM,
            predicted: Math.round(val * 100) / 100,
            lower: Math.round(Math.max(0, val - band) * 100) / 100,
            upper: Math.round((val + band) * 100) / 100
        });
    }
    const history = fullMonths.map((m)=>({
            date: m.ym,
            sales: Math.round(m.total * 100) / 100
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
        partial_months_excluded: droppedMonths
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
function getAnomalies(rows, limit = 500, threshold = 3.5) {
    const data = rows || (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    const dailyMap = new Map();
    for (const row of data){
        dailyMap.set(row.date, (dailyMap.get(row.date) || 0) + row.total_amount);
    }
    const sortedDates = Array.from(dailyMap.keys()).sort();
    const n = sortedDates.length;
    if (n < 14) {
        return {
            data: [],
            total: 0,
            threshold,
            series: []
        };
    }
    const dailyVals = sortedDates.map((d)=>dailyMap.get(d));
    const dayNum = sortedDates.map((d)=>Math.floor(Date.parse(`${d}T00:00:00Z`) / DAY_MS));
    const expected = [];
    const residuals = [];
    let lo = 0;
    let hi = 0;
    for(let i = 0; i < n; i++){
        while(dayNum[lo] < dayNum[i] - ANOMALY_WINDOW_RADIUS_DAYS)lo++;
        while(hi < n && dayNum[hi] <= dayNum[i] + ANOMALY_WINDOW_RADIUS_DAYS)hi++;
        const windowSlice = dailyVals.slice(lo, hi);
        const exp = windowSlice.length >= ANOMALY_MIN_PERIODS ? median(windowSlice) : dailyVals[i];
        expected.push(exp);
        residuals.push(dailyVals[i] - exp);
    }
    const medResid = median(residuals);
    const absDeviations = residuals.map((r)=>Math.abs(r - medResid));
    let mad = median(absDeviations);
    if (mad === 0) {
        mad = stdDev(residuals) || 1.0;
    }
    const cutoff = Math.max(1.0, threshold);
    const flagged = [];
    for(let i = 0; i < n; i++){
        const z = 0.6745 * (residuals[i] - medResid) / mad;
        if (Math.abs(z) >= cutoff) {
            const val = dailyVals[i];
            const exp = expected[i];
            const pct = exp ? (val - exp) / exp * 100 : 0;
            flagged.push({
                date: sortedDates[i],
                value: Math.round(val * 100) / 100,
                expected: Math.round(exp * 100) / 100,
                deviation: `${pct >= 0 ? '+' : ''}${Math.round(pct)}%`,
                severity: Math.abs(z) >= ANOMALY_HIGH_Z ? 'High' : 'Medium',
                score: Math.round(z * 10) / 10,
                absScore: Math.abs(z),
                driver: '',
                driver_share: 0
            });
        }
    }
    flagged.sort((a, b)=>b.absScore - a.absScore);
    // Which category drove each flagged day: the category whose revenue moved furthest from its own
    // typical day (median daily revenue), in the same direction as the anomaly.
    const catDay = new Map();
    for (const row of data){
        let m = catDay.get(row.product_category);
        if (!m) {
            m = new Map();
            catDay.set(row.product_category, m);
        }
        m.set(row.date, (m.get(row.date) || 0) + row.total_amount);
    }
    const catTypical = new Map();
    for (const [cat, m] of catDay){
        catTypical.set(cat, median(sortedDates.map((d)=>m.get(d) || 0)));
    }
    const topFlagged = flagged.slice(0, limit);
    for (const item of topFlagged){
        const up = item.value >= item.expected;
        let totalMove = 0;
        let bestMove = 0;
        let bestCat = '';
        for (const [cat, m] of catDay){
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
        item.driver_share = totalMove > 0 ? Math.round(bestMove / totalMove * 100) : 0;
    }
    const resultData = topFlagged.map(({ absScore, ...item })=>item);
    // Full daily series (actual vs rolling median) so the page can draw the line chart with markers
    const series = sortedDates.map((date, i)=>({
            date,
            value: Math.round(dailyVals[i] * 100) / 100,
            expected: Math.round(expected[i] * 100) / 100
        }));
    return {
        data: resultData,
        total: flagged.length,
        threshold: cutoff,
        series
    };
}
// ---------------------------------------------------------------------------
// Unusual transactions
//
// Method: Tukey IQR fences computed separately for each product category, so an
// expensive category (e.g. Electronics) is not flagged just for being expensive.
// Categories with fewer than 8 transactions are skipped (too few to judge).
// ---------------------------------------------------------------------------
function quantileSorted(sorted, q) {
    if (sorted.length === 0) return 0;
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return base + 1 < sorted.length ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}
const UNUSUAL_TX_FENCE = 2.0;
function getUnusualTransactions(rows, limit = 200, fence = UNUSUAL_TX_FENCE) {
    const data = rows || (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    const byCategory = new Map();
    for (const r of data){
        const list = byCategory.get(r.product_category);
        if (list) list.push(r);
        else byCategory.set(r.product_category, [
            r
        ]);
    }
    const flagged = [];
    const perCategory = {};
    for (const [category, list] of byCategory){
        if (list.length < 8) continue;
        const sorted = list.map((r)=>r.total_amount).sort((a, b)=>a - b);
        const q1 = quantileSorted(sorted, 0.25);
        const q3 = quantileSorted(sorted, 0.75);
        const iqr = q3 - q1;
        const lower = q1 - fence * iqr;
        const upper = q3 + fence * iqr;
        const typical = median(sorted);
        for (const r of list){
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
                    times_typical: typical > 0 ? Math.round(amt / typical * 10) / 10 : 0,
                    score: Math.round(distance * 100) / 100
                });
                perCategory[category] = (perCategory[category] || 0) + 1;
            }
        }
    }
    flagged.sort((a, b)=>b.score - a.score);
    return {
        data: flagged.slice(0, limit),
        total: flagged.length,
        by_category: perCategory,
        method: `Per-category IQR fences (${fence} x IQR)`
    };
}
}),
"[project]/server/cleaner.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REQUIRED_COLUMNS",
    ()=>REQUIRED_COLUMNS,
    "cleanSalesData",
    ()=>cleanSalesData,
    "generateDemoDatasetCSV",
    ()=>generateDemoDatasetCSV,
    "getCSVTemplate",
    ()=>getCSVTemplate,
    "parseCSV",
    ()=>parseCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/quality.ts [app-route] (ecmascript)");
;
const REQUIRED_COLUMNS = [
    'Transaction ID',
    'Date',
    'Customer ID',
    'Gender',
    'Age',
    'Product Category',
    'Quantity',
    'Price per Unit',
    'Total Amount'
];
function parseCSV(csvText) {
    const lines = [];
    const lineNos = [];
    let currentRow = [];
    let currentField = '';
    let insideQuote = false;
    let physicalLine = 1;
    let rowStartLine = 1;
    const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for(let i = 0; i < text.length; i++){
        const char = text[i];
        const nextChar = text[i + 1];
        if (char === '"') {
            if (insideQuote && nextChar === '"') {
                currentField += '"';
                i++; // skip escaped quote
            } else {
                insideQuote = !insideQuote;
            }
        } else if (char === ',' && !insideQuote) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if (char === '\n' && !insideQuote) {
            currentRow.push(currentField.trim());
            if (currentRow.some((val)=>val !== '')) {
                lines.push(currentRow);
                lineNos.push(rowStartLine);
            }
            currentRow = [];
            currentField = '';
            physicalLine++;
            rowStartLine = physicalLine;
        } else {
            if (char === '\n') physicalLine++;
            currentField += char;
        }
    }
    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some((val)=>val !== '')) {
            lines.push(currentRow);
            lineNos.push(rowStartLine);
        }
    }
    if (lines.length === 0) {
        return {
            headers: [],
            rows: [],
            lineNumbers: []
        };
    }
    const rawHeaders = lines[0].map((h)=>h.replace(/^["']|["']$/g, '').trim());
    return {
        headers: rawHeaders,
        rows: lines.slice(1),
        lineNumbers: lineNos.slice(1)
    };
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const normalizeName = (s)=>s.toLowerCase().replace(/[^a-z0-9]/g, '');
function levenshtein(a, b) {
    const dp = Array.from({
        length: b.length + 1
    }, (_, j)=>j);
    for(let i = 1; i <= a.length; i++){
        let prev = dp[0];
        dp[0] = i;
        for(let j = 1; j <= b.length; j++){
            const tmp = dp[j];
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return dp[b.length];
}
function buildDate(y, m, d, ambiguous) {
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const dt = new Date(Date.UTC(y, m - 1, d));
    // Reject impossible dates such as 2025-02-30 (JS would roll them over)
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
    return {
        iso: dt.toISOString().slice(0, 10),
        ambiguous
    };
}
/** Returns an ISO date, or null when the text is not a real calendar date. */ function parseDate(raw) {
    const s = (raw || '').trim();
    if (!s) return null;
    // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD (optionally followed by a time)
    let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/);
    if (m) return buildDate(+m[1], +m[2], +m[3], false);
    // DD-MM-YYYY or MM-DD-YYYY (also with / or .)
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[T\s].*)?$/);
    if (m) {
        const a = +m[1];
        const b = +m[2];
        const y = +m[3];
        if (a > 12 && b <= 12) return buildDate(y, b, a, false); // clearly DD/MM
        if (b > 12 && a <= 12) return buildDate(y, a, b, false); // clearly MM/DD
        if (a <= 12 && b <= 12) return buildDate(y, b, a, a !== b); // ambiguous: assume DD/MM
        return null;
    }
    // Text months such as "15 Jan 2025" or "Jan 15, 2025"
    if (/[a-z]{3,}/i.test(s)) {
        const t = Date.parse(s);
        if (!isNaN(t)) {
            const d = new Date(t);
            return buildDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), false);
        }
    }
    return null;
}
/** Parses numbers such as 1200, "1,200.50", "₹1,200", "$5", "(500)". Returns null if blank or not numeric. */ function parseNumber(raw) {
    if (raw === undefined) return null;
    let s = raw.trim();
    if (s === '') return null;
    let negative = false;
    if (/^\(.*\)$/.test(s)) {
        negative = true;
        s = s.slice(1, -1);
    }
    s = s.replace(/[₹$€£\s,]/g, '');
    if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    const n = Number(s);
    if (isNaN(n)) return null;
    return negative ? -Math.abs(n) : n;
}
class IssueTracker {
    map = new Map();
    add(code, label, severity, row, detail) {
        let issue = this.map.get(code);
        if (!issue) {
            issue = {
                code,
                label,
                severity,
                count: 0,
                examples: []
            };
            this.map.set(code, issue);
        }
        issue.count++;
        if (issue.examples.length < 5) issue.examples.push({
            row,
            detail
        });
    }
    list() {
        return [
            ...this.map.values()
        ].sort((a, b)=>a.severity === b.severity ? b.count - a.count : a.severity === 'error' ? -1 : 1);
    }
}
function cleanSalesData(csvContent) {
    // Excel often saves CSVs with a UTF-8 byte-order mark, which would corrupt the first header name
    const text = csvContent.replace(/^\uFEFF/, '');
    const { headers, rows, lineNumbers } = parseCSV(text);
    if (headers.length === 0) {
        throw new Error('The file is empty.');
    }
    if (headers.length === 1 && /[;\t|]/.test(headers[0])) {
        throw new Error('This file does not look comma-separated (it appears to use semicolons, tabs or pipes). Re-save it as a comma-separated CSV and upload it again.');
    }
    // Match required columns ignoring case, spaces, underscores and hyphens
    const headerMap = new Map();
    headers.forEach((h, idx)=>{
        const key = normalizeName(h);
        if (!headerMap.has(key)) headerMap.set(key, idx);
    });
    const missingColumns = [];
    const colIndexes = {};
    for (const col of REQUIRED_COLUMNS){
        const idx = headerMap.get(normalizeName(col));
        if (idx === undefined) {
            missingColumns.push(col);
        } else {
            colIndexes[col] = idx;
        }
    }
    if (missingColumns.length > 0) {
        const usedIdx = new Set(Object.values(colIndexes));
        const hints = [];
        for (const col of missingColumns){
            let best = null;
            headers.forEach((h, idx)=>{
                if (usedIdx.has(idx)) return;
                const d = levenshtein(normalizeName(h), normalizeName(col));
                if (d <= 3 && (!best || d < best.d)) best = {
                    h,
                    d
                };
            });
            if (best) hints.push(`Rename "${best.h}" to "${col}".`);
        }
        throw new Error([
            `Missing required column${missingColumns.length > 1 ? 's' : ''}: ${missingColumns.join(', ')}.`,
            `Columns found in your file: ${headers.join(', ')}.`,
            ...hints
        ].join('\n'));
    }
    if (rows.length === 0) {
        throw new Error('The file has a header row but no data rows.');
    }
    const rowsBefore = rows.length;
    let duplicatesRemoved = 0;
    let duplicateIdConflicts = 0;
    let invalidDatesRemoved = 0;
    let numericMissingRowsRemoved = 0;
    let negativeRemoved = 0;
    let zeroRemoved = 0;
    let ambiguousDates = 0;
    let totalMismatchRows = 0;
    const tracker = new IssueTracker();
    // Blank cells per required column, counted on the raw file before any cleaning
    const missingValues = {};
    for (const col of REQUIRED_COLUMNS){
        let blanks = 0;
        for (const row of rows){
            const v = row[colIndexes[col]];
            if (v === undefined || v.trim() === '') blanks++;
        }
        missingValues[col] = blanks;
    }
    const seenById = new Map();
    const seenSignatures = new Set();
    const cleanedRows = [];
    for(let r = 0; r < rows.length; r++){
        const row = rows[r];
        const line = lineNumbers[r];
        const transactionId = (row[colIndexes['Transaction ID']] || '').trim();
        const rawDate = row[colIndexes['Date']] || '';
        const customerId = (row[colIndexes['Customer ID']] || 'Unknown').trim();
        const gender = (row[colIndexes['Gender']] || 'Unknown').trim();
        const rawAge = row[colIndexes['Age']];
        const category = (row[colIndexes['Product Category']] || 'Unknown').trim();
        const rawQuantity = row[colIndexes['Quantity']];
        const rawPrice = row[colIndexes['Price per Unit']];
        const rawTotal = row[colIndexes['Total Amount']];
        // 1. Date
        const parsedDate = parseDate(rawDate);
        if (!parsedDate) {
            invalidDatesRemoved++;
            tracker.add('invalid_date', 'with invalid or unreadable dates', 'error', line, rawDate.trim() === '' ? 'blank date' : `"${rawDate.trim()}"`);
            continue;
        }
        // 2. Numeric columns (a blank Age is kept as 0; a non-numeric Age drops the row)
        const ageBlank = rawAge === undefined ? false : rawAge.trim() === '';
        const ageParsed = parseNumber(rawAge);
        const quantity = parseNumber(rawQuantity);
        const price = parseNumber(rawPrice);
        const total = parseNumber(rawTotal);
        const badNumeric = [];
        if (!ageBlank && ageParsed === null) badNumeric.push(`Age "${rawAge ?? ''}"`);
        if (quantity === null) badNumeric.push(`Quantity "${rawQuantity ?? ''}"`);
        if (price === null) badNumeric.push(`Price per Unit "${rawPrice ?? ''}"`);
        if (total === null) badNumeric.push(`Total Amount "${rawTotal ?? ''}"`);
        if (badNumeric.length > 0) {
            numericMissingRowsRemoved++;
            tracker.add('missing_numeric', 'with missing or non-numeric Age, Quantity, Price or Total', 'error', line, badNumeric.join(', '));
            continue;
        }
        const age = ageParsed ?? 0;
        const q = quantity;
        const p = price;
        const t = total;
        // 3. Business constraints
        if (q < 0 || p < 0 || t < 0) {
            negativeRemoved++;
            const parts = [];
            if (q < 0) parts.push(`Quantity ${q}`);
            if (p < 0) parts.push(`Price ${p}`);
            if (t < 0) parts.push(`Total ${t}`);
            tracker.add('negative_amount', 'with negative Quantity, Price or Total', 'error', line, parts.join(', '));
            continue;
        }
        if (q === 0 || p === 0 || t === 0) {
            zeroRemoved++;
            const parts = [];
            if (q === 0) parts.push('Quantity 0');
            if (p === 0) parts.push('Price 0');
            if (t === 0) parts.push('Total 0');
            tracker.add('zero_amount', 'with zero Quantity, Price or Total', 'error', line, parts.join(', '));
            continue;
        }
        // 4. Duplicates (only valid rows count, so a bad first copy never blocks a good second copy)
        const signature = row.join('|||');
        if (transactionId !== '') {
            const first = seenById.get(transactionId);
            if (first) {
                duplicatesRemoved++;
                const conflict = first.signature !== signature;
                if (conflict) duplicateIdConflicts++;
                tracker.add('duplicate_id', 'with duplicate Transaction IDs (first occurrence kept)', 'error', line, `${transactionId} (first seen on row ${first.line}${conflict ? ', different values' : ''})`);
                continue;
            }
            seenById.set(transactionId, {
                line,
                signature
            });
        } else {
            if (seenSignatures.has(signature)) {
                duplicatesRemoved++;
                tracker.add('duplicate_id', 'with duplicate Transaction IDs (first occurrence kept)', 'error', line, 'identical row with a blank Transaction ID');
                continue;
            }
            seenSignatures.add(signature);
            tracker.add('blank_id', 'with a blank Transaction ID (kept)', 'warning', line, 'blank Transaction ID');
        }
        // Warnings on rows that are kept
        if (parsedDate.ambiguous) {
            ambiguousDates++;
            tracker.add('ambiguous_date', 'with ambiguous dates read as DD/MM/YYYY (kept)', 'warning', line, `"${rawDate.trim()}"`);
        }
        if (Math.abs(t - q * p) > Math.max(1, 0.01 * t)) {
            totalMismatchRows++;
            tracker.add('total_mismatch', 'where Total Amount differs from Quantity × Price by more than 1% (kept)', 'warning', line, `${q} × ${p} = ${Math.round(q * p * 100) / 100}, file says ${t}`);
        }
        cleanedRows.push({
            transaction_id: transactionId,
            date: parsedDate.iso,
            customer_id: customerId,
            gender: gender,
            age: Math.round(age),
            product_category: category,
            quantity: Math.round(q),
            price_per_unit: p,
            total_amount: t
        });
    }
    const report = {
        rows_before: rowsBefore,
        rows_after: cleanedRows.length,
        duplicates_removed: duplicatesRemoved,
        invalid_dates_removed: invalidDatesRemoved,
        numeric_missing_rows_removed: numericMissingRowsRemoved,
        invalid_business_rows_removed: negativeRemoved + zeroRemoved,
        columns: [
            'transaction_id',
            'date',
            'customer_id',
            'gender',
            'age',
            'product_category',
            'quantity',
            'price_per_unit',
            'total_amount'
        ],
        duplicate_id_conflicts: duplicateIdConflicts,
        negative_values_removed: negativeRemoved,
        zero_values_removed: zeroRemoved,
        ambiguous_dates: ambiguousDates,
        total_mismatch_rows: totalMismatchRows
    };
    const coverage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["summarizeCoverage"])(cleanedRows);
    const quality = {
        source: 'upload',
        rows_in_file: rowsBefore,
        rows_kept: cleanedRows.length,
        rows_dropped: rowsBefore - cleanedRows.length,
        ...coverage,
        missing_values: missingValues,
        warnings: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildWarnings"])(coverage, cleanedRows.length, rowsBefore),
        issues: tracker.list()
    };
    return {
        rows: cleanedRows,
        report,
        quality
    };
}
function getCSVTemplate() {
    return [
        'Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount',
        'TXN001,2023-01-15,CUST101,Female,28,Beauty,2,500,1000',
        'TXN002,2023-01-16,CUST102,Male,34,Electronics,1,1200,1200',
        'TXN003,2023-01-17,CUST103,Female,45,Clothing,3,350,1050',
        'TXN004,2023-02-05,CUST104,Male,22,Electronics,2,600,1200',
        'TXN005,2023-02-14,CUST105,Female,31,Beauty,4,250,1000'
    ].join('\n');
}
function generateDemoDatasetCSV() {
    const categories = [
        'Electronics',
        'Clothing',
        'Beauty'
    ];
    const prices = {
        Electronics: [
            300,
            500,
            800,
            1200,
            1500
        ],
        Clothing: [
            150,
            250,
            350,
            500,
            750
        ],
        Beauty: [
            80,
            150,
            250,
            400,
            500
        ]
    };
    const genders = [
        'Male',
        'Female'
    ];
    const rows = [
        'Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount'
    ];
    // Generate 1000 deterministic realistic rows across 2023
    let txn = 1;
    const startDate = new Date(Date.UTC(2023, 0, 1));
    for(let i = 0; i < 1000; i++){
        const dayOffset = Math.floor(i / 1000 * 364);
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() + dayOffset);
        const dateStr = date.toISOString().slice(0, 10);
        const category = categories[i % categories.length];
        const catPrices = prices[category];
        const price = catPrices[(i * 7 + 3) % catPrices.length];
        const quantity = 1 + i % 4;
        const total = price * quantity;
        const gender = genders[i * 3 % 2];
        const age = 18 + (i * 13 + 7) % 52;
        const customerId = `CUST${String(100 + i % 180).padStart(4, '0')}`;
        rows.push(`${txn},${dateStr},${customerId},${gender},${age},${category},${quantity},${price},${total}`);
        txn++;
    }
    return rows.join('\n');
}
}),
"[project]/server/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "databaseExists",
    ()=>databaseExists,
    "deleteDataset",
    ()=>deleteDataset,
    "ensureDatabase",
    ()=>ensureDatabase,
    "getDatasetMeta",
    ()=>getDatasetMeta,
    "getKPIs",
    ()=>getKPIs,
    "getSalesPreview",
    ()=>getSalesPreview,
    "getSalesRows",
    ()=>getSalesRows,
    "getSalesSummary",
    ()=>getSalesSummary,
    "initDatabase",
    ()=>initDatabase,
    "saveSalesData",
    ()=>saveSalesData
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/cleaner.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/quality.ts [app-route] (ecmascript)");
;
;
;
;
const DATA_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(process.cwd(), 'data');
const DB_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'retail_bi.json');
const META_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'dataset_meta.json');
const SAMPLE_CSV = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'retail_sales.csv');
// In-memory cache for fast analytical aggregation
let salesCache = null;
let metaCache = null;
function ensureDataDir() {
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DATA_DIR)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(DATA_DIR, {
            recursive: true
        });
    }
}
function initDatabase() {
    ensureDataDir();
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE) && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) {
        try {
            salesCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(DB_FILE, 'utf-8'));
            metaCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(META_FILE, 'utf-8'));
            if (salesCache && salesCache.length > 0) {
                console.log(`[DB] Loaded ${salesCache.length} rows from disk cache.`);
                return;
            }
        } catch (e) {
            console.warn('[DB] Failed to read disk cache, initializing fallback...');
        }
    }
    // Auto-seed with demo dataset so new sessions have active models and forecasts
    try {
        const csvContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDemoDatasetCSV"])();
        const { rows, quality } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanSalesData"])(csvContent);
        saveSalesData(rows, 'demo_retail_sales.csv', quality);
        console.log(`[DB] Auto-seeded demo dataset with ${rows.length} rows.`);
    } catch (err) {
        salesCache = null;
        metaCache = null;
        console.warn('[DB] Started clean without auto-seed:', err);
    }
}
let isDbInit = false;
function ensureDatabase() {
    if (!isDbInit) {
        isDbInit = true;
        initDatabase();
    }
}
function databaseExists() {
    ensureDatabase();
    if (salesCache && salesCache.length > 0) return true;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE)) {
        try {
            salesCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(DB_FILE, 'utf-8'));
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) {
                metaCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(META_FILE, 'utf-8'));
            }
            return salesCache && salesCache.length > 0 || false;
        } catch  {
            return false;
        }
    }
    return false;
}
function getSalesRows() {
    ensureDatabase();
    if (salesCache) return salesCache;
    if (databaseExists() && salesCache) return salesCache;
    return [];
}
function saveSalesData(rows, filename, quality) {
    ensureDataDir();
    salesCache = rows;
    metaCache = {
        filename,
        uploaded_at: new Date().toISOString(),
        ...quality ? {
            quality
        } : {}
    };
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(DB_FILE, JSON.stringify(rows), 'utf-8');
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(META_FILE, JSON.stringify(metaCache), 'utf-8');
}
function deleteDataset() {
    const existed = databaseExists();
    salesCache = null;
    metaCache = null;
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(DB_FILE);
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(META_FILE);
    } catch (e) {
        console.error('Error deleting dataset files:', e);
    }
    return existed;
}
function readMeta() {
    if (metaCache) return metaCache;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) {
        try {
            metaCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(META_FILE, 'utf-8'));
            return metaCache;
        } catch  {
        // return default
        }
    }
    return {
        filename: 'Dataset',
        uploaded_at: new Date().toISOString()
    };
}
function getDatasetMeta() {
    const meta = readMeta();
    if (!meta.quality) {
        // Datasets saved before validation summaries existed: recompute what we can from the stored rows
        const rows = getSalesRows();
        if (rows.length > 0) return {
            ...meta,
            quality: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qualityFromRows"])(rows)
        };
    }
    return meta;
}
function getSalesSummary() {
    const rows = getSalesRows();
    if (rows.length === 0) {
        return {
            total_rows: 0,
            total_quantity: 0,
            total_sales: 0,
            average_transaction: 0
        };
    }
    let totalQuantity = 0;
    let totalSales = 0;
    for (const row of rows){
        totalQuantity += row.quantity;
        totalSales += row.total_amount;
    }
    return {
        total_rows: rows.length,
        total_quantity: totalQuantity,
        total_sales: Math.round(totalSales * 100) / 100,
        average_transaction: Math.round(totalSales / rows.length * 100) / 100
    };
}
function getKPIs() {
    const summary = getSalesSummary();
    return {
        total_sales: summary.total_sales,
        total_quantity: summary.total_quantity,
        total_transactions: summary.total_rows,
        average_transaction: summary.average_transaction
    };
}
function getSalesPreview(limit = 10) {
    const rows = getSalesRows();
    return rows.slice(0, Math.min(limit, 100));
}
}),
"[project]/server/quality.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildWarnings",
    ()=>buildWarnings,
    "describeIssues",
    ()=>describeIssues,
    "qualityFromRows",
    ()=>qualityFromRows,
    "summarizeCoverage",
    ()=>summarizeCoverage
]);
function describeIssues(q) {
    const errs = q.issues.filter((i)=>i.severity === 'error' && i.count > 0);
    if (errs.length === 0) return '';
    return errs.map((i)=>{
        const where = i.examples.length ? ` (e.g. ${i.examples.map((e)=>`row ${e.row}`).join(', ')})` : '';
        return `${i.count} ${i.count === 1 ? 'row' : 'rows'} ${i.label}${where}`;
    }).join('; ') + '.';
}
function summarizeCoverage(rows) {
    if (rows.length === 0) {
        return {
            date_start: '',
            date_end: '',
            span_days: 0,
            months_with_data: 0,
            days_with_sales: 0,
            avg_transactions_per_day: 0
        };
    }
    const days = new Set();
    const months = new Set();
    let min = rows[0].date;
    let max = rows[0].date;
    for (const r of rows){
        days.add(r.date);
        months.add(r.date.slice(0, 7));
        if (r.date < min) min = r.date;
        if (r.date > max) max = r.date;
    }
    const span = Math.round((Date.parse(`${max}T00:00:00Z`) - Date.parse(`${min}T00:00:00Z`)) / 86400000) + 1;
    return {
        date_start: min,
        date_end: max,
        span_days: span,
        months_with_data: months.size,
        days_with_sales: days.size,
        avg_transactions_per_day: Math.round(rows.length / span * 100) / 100
    };
}
function buildWarnings(c, rowsKept, rowsInFile) {
    const w = [];
    if (rowsKept === 0) return w;
    if (c.months_with_data < 6) {
        w.push(`Very short history: only ${c.months_with_data} month(s) of data (${c.date_start} to ${c.date_end}). The forecast will be unreliable.`);
    } else if (c.months_with_data < 24) {
        w.push(`Short history: ${c.months_with_data} months of data (${c.date_start} to ${c.date_end}). Forecasts are indicative only; 24+ months are needed to model seasonality.`);
    }
    if (c.avg_transactions_per_day < 5) {
        w.push(`Low volume: about ${c.avg_transactions_per_day} transactions per day on average, so daily revenue and anomaly scores will be noisy.`);
    }
    const gapDays = c.span_days - c.days_with_sales;
    if (c.span_days > 0 && gapDays / c.span_days > 0.1) {
        w.push(`${gapDays} of ${c.span_days} days in the date range have no sales (${Math.round(gapDays / c.span_days * 100)}%).`);
    }
    if (rowsKept < 100) {
        w.push(`Small dataset: only ${rowsKept} valid rows. Statistics may not be representative.`);
    }
    const dropped = rowsInFile - rowsKept;
    if (rowsInFile > 0 && dropped / rowsInFile > 0.1) {
        w.push(`${dropped} of ${rowsInFile} rows (${Math.round(dropped / rowsInFile * 100)}%) were dropped during validation. Check the source file.`);
    }
    return w;
}
function qualityFromRows(rows) {
    const c = summarizeCoverage(rows);
    return {
        source: 'stored',
        rows_in_file: rows.length,
        rows_kept: rows.length,
        rows_dropped: 0,
        ...c,
        missing_values: {},
        warnings: buildWarnings(c, rows.length, rows.length),
        issues: []
    };
}
}),
]})(),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0jt9321l7hsck._.js.map