module.exports = [
(()=>{"use strict";return[
"[project]/app/api/reports/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$report$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/report.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["databaseExists"])()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            detail: 'No dataset has been uploaded yet. Upload a CSV first.'
        }, {
            status: 404
        });
    }
    const body = await request.json().catch(()=>({})) || {};
    const type = body?.type || 'executive';
    const provider = body?.provider;
    try {
        const pdfBytes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$report$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatePDFReport"])(type, provider);
        return new Response(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="ABIP_${type}_report.pdf"`
            }
        });
    } catch (err) {
        console.error('Report generation error:', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            detail: `Could not build the report: ${err.message}`
        }, {
            status: 500
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
    let currentRow = [];
    let currentField = '';
    let insideQuote = false;
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
            }
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some((val)=>val !== '')) {
            lines.push(currentRow);
        }
    }
    if (lines.length === 0) {
        return {
            headers: [],
            rows: []
        };
    }
    const rawHeaders = lines[0].map((h)=>h.replace(/^["']|["']$/g, '').trim());
    const rows = lines.slice(1);
    return {
        headers: rawHeaders,
        rows
    };
}
function cleanSalesData(csvContent) {
    const { headers, rows } = parseCSV(csvContent);
    if (headers.length === 0 || rows.length === 0) {
        throw new Error('CSV contains no data.');
    }
    // Check required columns (case-insensitive fallback)
    const headerMap = new Map();
    headers.forEach((h, idx)=>{
        headerMap.set(h.toLowerCase().trim(), idx);
    });
    const missingColumns = [];
    const colIndexes = {};
    for (const col of REQUIRED_COLUMNS){
        const idx = headerMap.get(col.toLowerCase().trim());
        if (idx === undefined) {
            missingColumns.push(col);
        } else {
            colIndexes[col] = idx;
        }
    }
    if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    const rowsBefore = rows.length;
    let duplicatesRemoved = 0;
    let invalidDatesRemoved = 0;
    let numericMissingRowsRemoved = 0;
    let invalidBusinessRowsRemoved = 0;
    const seenRowSignatures = new Set();
    const cleanedRows = [];
    for (const row of rows){
        // Check duplicates based on all columns or transaction ID
        const signature = row.join('|||');
        if (seenRowSignatures.has(signature)) {
            duplicatesRemoved++;
            continue;
        }
        seenRowSignatures.add(signature);
        const transactionId = row[colIndexes['Transaction ID']] || '';
        const rawDate = row[colIndexes['Date']] || '';
        const customerId = (row[colIndexes['Customer ID']] || 'Unknown').trim();
        const gender = (row[colIndexes['Gender']] || 'Unknown').trim();
        const rawAge = row[colIndexes['Age']];
        const category = (row[colIndexes['Product Category']] || 'Unknown').trim();
        const rawQuantity = row[colIndexes['Quantity']];
        const rawPrice = row[colIndexes['Price per Unit']];
        const rawTotal = row[colIndexes['Total Amount']];
        // Validate date
        const parsedDate = new Date(rawDate);
        if (isNaN(parsedDate.getTime()) || !rawDate) {
            invalidDatesRemoved++;
            continue;
        }
        // Format YYYY-MM-DD
        const isoDate = parsedDate.toISOString().slice(0, 10);
        // Validate numeric columns
        const age = Number(rawAge);
        const quantity = Number(rawQuantity);
        const price = Number(rawPrice);
        const total = Number(rawTotal);
        if (isNaN(age) || isNaN(quantity) || isNaN(price) || isNaN(total)) {
            numericMissingRowsRemoved++;
            continue;
        }
        // Validate business constraints: quantity > 0, price > 0, total > 0
        if (quantity <= 0 || price <= 0 || total <= 0) {
            invalidBusinessRowsRemoved++;
            continue;
        }
        cleanedRows.push({
            transaction_id: transactionId,
            date: isoDate,
            customer_id: customerId,
            gender: gender,
            age: Math.round(age),
            product_category: category,
            quantity: Math.round(quantity),
            price_per_unit: price,
            total_amount: total
        });
    }
    const report = {
        rows_before: rowsBefore,
        rows_after: cleanedRows.length,
        duplicates_removed: duplicatesRemoved,
        invalid_dates_removed: invalidDatesRemoved,
        numeric_missing_rows_removed: numericMissingRowsRemoved,
        invalid_business_rows_removed: invalidBusinessRowsRemoved,
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
        ]
    };
    return {
        rows: cleanedRows,
        report
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
        const { rows } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanSalesData"])(csvContent);
        saveSalesData(rows, 'demo_retail_sales.csv');
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
function saveSalesData(rows, filename) {
    ensureDataDir();
    salesCache = rows;
    metaCache = {
        filename,
        uploaded_at: new Date().toISOString()
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
function getDatasetMeta() {
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
"[project]/server/llm.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PROVIDER",
    ()=>DEFAULT_PROVIDER,
    "askLLM",
    ()=>askLLM,
    "availableProviders",
    ()=>availableProviders,
    "buildContext",
    ()=>buildContext,
    "solveDeterministic",
    ()=>solveDeterministic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/analytics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/db.ts [app-route] (ecmascript)");
;
;
const DEFAULT_PROVIDER = 'deterministic';
// Change this if your data is not in rupees (the homepage demo uses $)
const CUR = '₹';
// Must match the default used by the Forecast & Anomalies page and the API route
const ANOMALY_THRESHOLD = 3.5;
function availableProviders() {
    const ollamaCloudConfigured = Boolean(process.env.OLLAMA_API_KEY);
    return [
        {
            id: 'deterministic',
            label: 'Deterministic Mathematical Solver',
            model: 'In-memory solver',
            configured: true,
            note: 'Scans 100% of all rows (e.g. 1,000 rows) directly in memory and answers with zero hallucination.'
        },
        {
            id: 'ollama',
            label: 'Local Ollama · Llama 3.2',
            model: 'llama3.2',
            configured: false,
            note: 'Local Ollama daemon running on http://localhost:11434.'
        },
        {
            id: 'ollama_cloud',
            label: 'Ollama Cloud · GPT-OSS 120B',
            model: 'gpt-oss:120b',
            configured: ollamaCloudConfigured,
            note: 'Hosted Ollama Cloud (ollama.com) running GPT-OSS 120B via OLLAMA_API_KEY.'
        }
    ];
}
function buildContext() {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["databaseExists"])()) {
        return 'No dataset loaded.';
    }
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatasetMeta"])();
    const ov = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOverview"])(rows);
    const sa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesAnalysis"])(rows);
    let fcSummary = 'Forecast not available (insufficient months).';
    try {
        const fc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getForecast"])(rows);
        fcSummary = `Best model: ${fc.model}, Backtest MAPE: ${fc.mape}%, Accuracy: ${fc.accuracy}%. Next month forecasted revenue: ₹${Math.round(fc.next_month_predicted).toLocaleString('en-IN')}.`;
    } catch  {
    // continue
    }
    const an = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAnomalies"])(rows, 5, ANOMALY_THRESHOLD);
    const anomalySummary = an.total > 0 ? `Detected ${an.total} anomalous days (rolling 31-day median baseline, threshold z >= ${ANOMALY_THRESHOLD}). Top anomaly: Date ${an.data[0]?.date}, Actual: ₹${Math.round(an.data[0]?.value).toLocaleString('en-IN')}, Expected: ₹${Math.round(an.data[0]?.expected).toLocaleString('en-IN')} (${an.data[0]?.deviation}).` : 'No anomalies detected.';
    const catSummary = sa.categories.map((c)=>`- ${c.category}: Revenue ₹${Math.round(c.revenue).toLocaleString('en-IN')} (${c.share}% share), Units: ${c.units}, Orders: ${c.orders}, Avg Order: ₹${c.avg_order}`).join('\n');
    const monthSummary = ov.monthly.map((m)=>`- ${m.month}: ₹${Math.round(m.total_revenue).toLocaleString('en-IN')}${m.partial ? ' (partial month)' : ''}`).join('\n');
    const ageSummary = ov.segments.age.map((a)=>`${a.segment}: ${a.count} customers (₹${Math.round(a.revenue).toLocaleString('en-IN')})`).join(', ');
    const genderSummary = ov.segments.gender.map((g)=>`${g.segment}: ${g.count} customers (₹${Math.round(g.revenue).toLocaleString('en-IN')})`).join(', ');
    return `
DATASET CONTEXT:
Filename: ${meta.filename || 'retail_sales.csv'}
Total Transactions / Rows: ${ov.dataset.rows}
Date Range: ${ov.dataset.start} to ${ov.dataset.end}
Total Revenue: ₹${Math.round(ov.kpis.total_sales).toLocaleString('en-IN')}
Total Units Sold: ${ov.kpis.total_quantity}
Average Transaction Value: ₹${ov.kpis.average_transaction}

MONTH-OVER-MONTH TRENDS:
${ov.trends.label ? `Comparing ${ov.trends.label}: Revenue ${ov.trends.revenue}%, Units ${ov.trends.units}%, Orders ${ov.trends.transactions}%, Avg Order ${ov.trends.avg}%` : 'Not enough full months for MoM'}

PRODUCT CATEGORY PERFORMANCE:
${catSummary}

MONTHLY REVENUE:
${monthSummary}

CUSTOMER DEMOGRAPHICS:
Age groups: ${ageSummary}
Gender: ${genderSummary}

ANOMALY DETECTION:
${anomalySummary}

SALES FORECAST (NEXT 6 MONTHS):
${fcSummary}

AUTOMATED BUSINESS INSIGHTS:
${sa.insights.join('\n')}
`.trim();
}
async function askLLM(question, context, requestedProvider) {
    const provider = requestedProvider || DEFAULT_PROVIDER;
    // 1. Local Ollama (llama3.2)
    if (provider === 'ollama') {
        try {
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3.2',
                    prompt: `You are an Autonomous Business Intelligence Analyst. Based on the dataset summary below, answer the question accurately:\n\n${context}\n\nQuestion: ${question}`,
                    stream: false
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.response) {
                    return {
                        answer: data.response,
                        model: 'llama3.2',
                        provider: 'ollama'
                    };
                }
            }
        } catch  {
        // local daemon not running or unreachable
        }
        return {
            answer: solveDeterministic(question),
            model: 'Deterministic Mathematical Solver (Ollama unavailable)',
            provider: 'ollama'
        };
    }
    // 2. Ollama Cloud (hosted API, GPT-OSS 120B)
    if (provider === 'ollama_cloud') {
        const key = process.env.OLLAMA_API_KEY;
        if (key) {
            try {
                const res = await fetch('https://ollama.com/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-oss:120b',
                        stream: false,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are the lead analytical AI engine for the Autonomous Business Intelligence Platform. Answer the user question strictly using the provided dataset aggregate statistics. Use bullet points and exact metrics. If the context does not contain the answer, say so.'
                            },
                            {
                                role: 'user',
                                content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}`
                            }
                        ]
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    const text = data.message?.content;
                    if (text) {
                        return {
                            answer: text,
                            model: 'gpt-oss:120b',
                            provider: 'ollama_cloud'
                        };
                    }
                } else {
                    console.warn('Ollama Cloud returned status', res.status);
                }
            } catch (err) {
                console.warn('Ollama Cloud query failed:', err.message);
            }
        }
        return {
            answer: solveDeterministic(question),
            model: 'Deterministic Mathematical Solver (Ollama Cloud unavailable)',
            provider: 'ollama_cloud'
        };
    }
    // 3. Deterministic Mathematical Solver (default; also catches any stale saved provider id)
    return {
        answer: solveDeterministic(question),
        model: 'Deterministic Mathematical Solver',
        provider: 'deterministic'
    };
}
// ---------------------------------------------------------------------------
// Deterministic Mathematical Solver
// Scans 100% of all rows directly in memory. Every number below is computed
// from the loaded dataset; nothing is generated or estimated by a language model.
// ---------------------------------------------------------------------------
const money = (n)=>`${CUR}${Math.round(n).toLocaleString('en-IN')}`;
const num = (n)=>Math.round(n).toLocaleString('en-IN');
const pct = (part, whole)=>whole > 0 ? (part / whole * 100).toFixed(1) : '0.0';
function groupSum(rows, keyOf) {
    const map = new Map();
    for (const r of rows){
        const k = keyOf(r);
        const cur = map.get(k) || {
            revenue: 0,
            orders: 0,
            units: 0
        };
        cur.revenue += r.total_amount;
        cur.orders += 1;
        cur.units += r.quantity;
        map.set(k, cur);
    }
    return [
        ...map.entries()
    ].map(([key, v])=>({
            key,
            ...v
        })).sort((a, b)=>b.revenue - a.revenue);
}
// Whole-word matching so "average" does not match "age" and "segment" does not match "men".
// Longer stems (5+ letters, e.g. "categor", "anomal") match at the start of a word, so
// "categories" and "anomalies" still work. Short words (4 letters or fewer) must match
// the whole word, with an optional plural "s".
function has(q, ...words) {
    return words.some((w)=>{
        const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = w.length <= 4 ? new RegExp(`\\b${esc}(s)?\\b`) : new RegExp(`\\b${esc}`);
        return re.test(q);
    });
}
function solveDeterministic(question) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["databaseExists"])()) {
        return 'No dataset is loaded yet. Upload a CSV or load the sample dataset first.';
    }
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    if (rows.length === 0) {
        return 'The loaded dataset has no valid rows.';
    }
    const q = question.toLowerCase();
    const totalRevenue = rows.reduce((s, r)=>s + r.total_amount, 0);
    const totalUnits = rows.reduce((s, r)=>s + r.quantity, 0);
    const receipt = `\n\n_Computed from ${num(rows.length)} of ${num(rows.length)} rows (100% scanned). No estimation or generated text._`;
    // Forecast
    if (has(q, 'forecast', 'predict', 'future', 'next month', 'projection')) {
        try {
            const fc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getForecast"])(rows);
            return `### Sales Forecast
- **Selected model**: ${fc.model}
- **Backtest MAPE**: ${fc.mape}% (accuracy ${fc.accuracy}%)
- **Next month forecast revenue**: ${money(fc.next_month_predicted)}

The model was chosen by walk-forward backtesting on your own monthly history.${receipt}`;
        } catch  {
            return `### Sales Forecast\nThere are not enough full months of data to produce a reliable forecast.${receipt}`;
        }
    }
    // Anomalies
    if (has(q, 'anomal', 'outlier', 'spike', 'unusual', 'drop', 'dip')) {
        const an = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAnomalies"])(rows, 5, ANOMALY_THRESHOLD);
        if (an.total === 0) {
            return `### Anomaly Detection\nNo anomalies were detected at the current threshold (z >= ${ANOMALY_THRESHOLD}).${receipt}`;
        }
        const list = an.data.slice(0, 5).map((a)=>`- **${a.date}**: actual ${money(a.value)} vs expected ${money(a.expected)} (${a.deviation})`).join('\n');
        return `### Anomaly Detection
**${an.total}** anomalous days found using a rolling 31-day median baseline with a modified z-score (threshold ${ANOMALY_THRESHOLD}). Top flagged days:
${list}${receipt}`;
    }
    // Category / product
    if (has(q, 'categor', 'product', 'best seller', 'bestseller', 'top selling')) {
        const cats = groupSum(rows, (r)=>r.product_category);
        const worst = has(q, 'lowest', 'worst', 'least', 'weakest', 'bottom');
        const lead = worst ? cats[cats.length - 1] : cats[0];
        const table = cats.map((c, i)=>`${i + 1}. **${c.key}**: ${money(c.revenue)} (${pct(c.revenue, totalRevenue)}%), ${num(c.orders)} orders, ${num(c.units)} units, avg order ${money(c.revenue / c.orders)}`).join('\n');
        return `### Product Category Performance
**${worst ? 'Lowest' : 'Highest'} revenue category: ${lead.key}** with ${money(lead.revenue)} (${pct(lead.revenue, totalRevenue)}% of total).

All ${cats.length} categories ranked by revenue:
${table}${receipt}`;
    }
    // Gender
    if (has(q, 'gender', 'male', 'female', 'men', 'women')) {
        const g = groupSum(rows, (r)=>r.gender);
        const table = g.map((x)=>`- **${x.key}**: ${money(x.revenue)} (${pct(x.revenue, totalRevenue)}%), ${num(x.orders)} orders, avg order ${money(x.revenue / x.orders)}`).join('\n');
        return `### Revenue by Gender
**${g[0].key}** customers generate the most revenue.
${table}${receipt}`;
    }
    // Age
    if (has(q, 'age', 'demographic', 'segment', 'generation')) {
        const bucket = (a)=>a < 25 ? '18-24' : a < 35 ? '25-34' : a < 45 ? '35-44' : a < 55 ? '45-54' : '55+';
        const g = groupSum(rows, (r)=>bucket(r.age));
        const table = g.map((x)=>`- **${x.key}**: ${money(x.revenue)} (${pct(x.revenue, totalRevenue)}%), ${num(x.orders)} orders, avg order ${money(x.revenue / x.orders)}`).join('\n');
        return `### Revenue by Age Group
**${g[0].key}** is the highest-revenue age group.
${table}${receipt}`;
    }
    // Customers
    if (has(q, 'customer', 'buyer', 'client')) {
        const byCust = groupSum(rows, (r)=>r.customer_id);
        const top = byCust.slice(0, 5).map((c, i)=>`${i + 1}. **${c.key}**: ${money(c.revenue)} across ${num(c.orders)} orders`).join('\n');
        return `### Customers
- **Unique customers**: ${num(byCust.length)}
- **Average revenue per customer**: ${money(totalRevenue / byCust.length)}

Top 5 customers by revenue:
${top}${receipt}`;
    }
    // Monthly trends
    if (has(q, 'month', 'trend', 'growth', 'mom', 'season', 'best period', 'peak')) {
        const ov = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOverview"])(rows);
        const full = ov.monthly.filter((m)=>!m.partial);
        const list = ov.monthly.map((m)=>`- ${m.month}: ${money(m.total_revenue)}${m.partial ? ' (partial month)' : ''}`).join('\n');
        let extra = '';
        if (full.length > 0) {
            const best = full.reduce((a, b)=>b.total_revenue > a.total_revenue ? b : a);
            const low = full.reduce((a, b)=>b.total_revenue < a.total_revenue ? b : a);
            extra = `\n**Best full month**: ${best.month} (${money(best.total_revenue)}). **Weakest full month**: ${low.month} (${money(low.total_revenue)}).`;
        }
        const mom = ov.trends.label ? `\n**Latest MoM (${ov.trends.label})**: revenue ${ov.trends.revenue}%, units ${ov.trends.units}%, orders ${ov.trends.transactions}%.` : '';
        return `### Monthly Revenue\n${list}${extra}${mom}${receipt}`;
    }
    // Average order value
    if (has(q, 'average', 'avg', 'aov', 'basket', 'per order', 'per transaction')) {
        return `### Average Order Value
- **Average transaction value**: ${money(totalRevenue / rows.length)}
- **Average units per transaction**: ${(totalUnits / rows.length).toFixed(2)}
- Based on ${num(rows.length)} transactions totalling ${money(totalRevenue)}.${receipt}`;
    }
    // Date range
    if (has(q, 'date range', 'period', 'timeframe', 'time frame', 'from when', 'how long')) {
        const dates = rows.map((r)=>r.date).sort();
        return `### Dataset Coverage\n- **Date range**: ${dates[0]} to ${dates[dates.length - 1]}\n- **Rows**: ${num(rows.length)}${receipt}`;
    }
    // Totals
    if (has(q, 'total', 'revenue', 'sales', 'how many', 'transactions', 'orders', 'units', 'rows', 'overall', 'summary', 'overview')) {
        const dates = rows.map((r)=>r.date).sort();
        const cats = groupSum(rows, (r)=>r.product_category);
        return `### Dataset Overview
- **Total revenue**: ${money(totalRevenue)}
- **Transactions**: ${num(rows.length)}
- **Units sold**: ${num(totalUnits)}
- **Average transaction value**: ${money(totalRevenue / rows.length)}
- **Date range**: ${dates[0]} to ${dates[dates.length - 1]}
- **Categories**: ${cats.length} (top: ${cats[0].key}, ${money(cats[0].revenue)})${receipt}`;
    }
    // Unmatched question: be honest instead of guessing
    return `I couldn't match that question to a calculation I can run exactly. The solver can answer questions about:
- **Categories** (best/worst category, revenue by product)
- **Gender** and **age group** revenue
- **Customers** (top customers, unique customers)
- **Monthly trends** and growth
- **Average order value**
- **Totals** (revenue, transactions, units, date range)
- **Forecast** and **anomalies**

Try rephrasing, for example: "Which product category has the lowest revenue?"${receipt}`;
}
}),
"[project]/server/report.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generatePDFReport",
    ()=>generatePDFReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/PDFDocument.js [app-route] (ecmascript) <export default as PDFDocument>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/colors.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/StandardFonts.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/analytics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$llm$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/llm.ts [app-route] (ecmascript)");
;
;
;
;
const ANOMALY_THRESHOLD = 3.5;
async function generatePDFReport(type, provider) {
    const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__["PDFDocument"].create();
    const page = pdfDoc.addPage([
        595.28,
        841.89
    ]); // A4 in points
    const font = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StandardFonts"].Helvetica);
    const fontBold = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StandardFonts"].HelveticaBold);
    const { width, height } = page.getSize();
    const margin = 40;
    let cursorY = height - 50;
    const primaryColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.258, 0.165, 0.984); // #422AFB brand
    const darkTextColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.106, 0.145, 0.294); // #1B254B
    const grayColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.4, 0.45, 0.55);
    const lightBgColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.957, 0.969, 0.996);
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesRows"])();
    const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatasetMeta"])();
    const ov = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOverview"])(rows);
    const sa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesAnalysis"])(rows);
    const reportTitles = {
        executive: 'Executive Summary Report',
        sales: 'Sales Performance Report',
        forecast: 'Forecast & Anomaly Detection Report',
        ai: 'AI Insights & Strategic Analysis Report'
    };
    const title = reportTitles[type] || 'Business Intelligence Report';
    const sanitizeForPDF = (str)=>{
        return str.replace(/₹/g, 'Rs ').replace(/•/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[^\x20-\x7E]/g, ' ').trim();
    };
    // Draw Header Banner
    page.drawRectangle({
        x: margin,
        y: cursorY - 45,
        width: width - margin * 2,
        height: 55,
        color: lightBgColor
    });
    page.drawText(title, {
        x: margin + 15,
        y: cursorY - 20,
        size: 18,
        font: fontBold,
        color: primaryColor
    });
    page.drawText(`Autonomous Business Intelligence Platform · Dataset: ${meta.filename || 'retail_sales.csv'} · Generated: ${new Date().toLocaleDateString()}`, {
        x: margin + 15,
        y: cursorY - 38,
        size: 9,
        font,
        color: grayColor
    });
    cursorY -= 75;
    // Function to draw section header
    const drawSection = (text)=>{
        page.drawText(text.toUpperCase(), {
            x: margin,
            y: cursorY,
            size: 11,
            font: fontBold,
            color: primaryColor
        });
        cursorY -= 6;
        page.drawLine({
            start: {
                x: margin,
                y: cursorY
            },
            end: {
                x: width - margin,
                y: cursorY
            },
            thickness: 1,
            color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.85, 0.88, 0.95)
        });
        cursorY -= 16;
    };
    // KPIs Summary Card Grid
    drawSection('Core Business Metrics');
    const cardW = (width - margin * 2 - 30) / 4;
    const cardH = 50;
    const kpis = [
        {
            label: 'TOTAL REVENUE',
            val: `Rs ${Math.round(ov.kpis.total_sales).toLocaleString('en-IN')}`
        },
        {
            label: 'TRANSACTIONS',
            val: ov.kpis.total_transactions.toLocaleString('en-IN')
        },
        {
            label: 'UNITS SOLD',
            val: ov.kpis.total_quantity.toLocaleString('en-IN')
        },
        {
            label: 'AVG ORDER VALUE',
            val: `Rs ${Math.round(ov.kpis.average_transaction).toLocaleString('en-IN')}`
        }
    ];
    kpis.forEach((kpi, idx)=>{
        const cardX = margin + idx * (cardW + 10);
        page.drawRectangle({
            x: cardX,
            y: cursorY - cardH,
            width: cardW,
            height: cardH,
            color: lightBgColor,
            borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.88, 0.9, 0.96),
            borderWidth: 1
        });
        page.drawText(kpi.label, {
            x: cardX + 10,
            y: cursorY - 18,
            size: 8,
            font: fontBold,
            color: grayColor
        });
        page.drawText(kpi.val, {
            x: cardX + 10,
            y: cursorY - 38,
            size: 13,
            font: fontBold,
            color: darkTextColor
        });
    });
    cursorY -= cardH + 24;
    if (type === 'sales' || type === 'executive') {
        drawSection('Product Category Breakdown');
        // Table Header
        page.drawText('Category', {
            x: margin + 10,
            y: cursorY,
            size: 9,
            font: fontBold,
            color: darkTextColor
        });
        page.drawText('Revenue', {
            x: margin + 160,
            y: cursorY,
            size: 9,
            font: fontBold,
            color: darkTextColor
        });
        page.drawText('Share', {
            x: margin + 270,
            y: cursorY,
            size: 9,
            font: fontBold,
            color: darkTextColor
        });
        page.drawText('Units Sold', {
            x: margin + 350,
            y: cursorY,
            size: 9,
            font: fontBold,
            color: darkTextColor
        });
        page.drawText('Avg Order', {
            x: margin + 430,
            y: cursorY,
            size: 9,
            font: fontBold,
            color: darkTextColor
        });
        cursorY -= 14;
        sa.categories.slice(0, 6).forEach((cat, idx)=>{
            const isAlt = idx % 2 === 1;
            if (isAlt) {
                page.drawRectangle({
                    x: margin,
                    y: cursorY - 4,
                    width: width - margin * 2,
                    height: 18,
                    color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.97, 0.98, 1.0)
                });
            }
            page.drawText(cat.category, {
                x: margin + 10,
                y: cursorY,
                size: 9,
                font,
                color: darkTextColor
            });
            page.drawText(`Rs ${Math.round(cat.revenue).toLocaleString('en-IN')}`, {
                x: margin + 160,
                y: cursorY,
                size: 9,
                font,
                color: darkTextColor
            });
            page.drawText(`${cat.share}%`, {
                x: margin + 270,
                y: cursorY,
                size: 9,
                font,
                color: darkTextColor
            });
            page.drawText(`${cat.units.toLocaleString()}`, {
                x: margin + 350,
                y: cursorY,
                size: 9,
                font,
                color: darkTextColor
            });
            page.drawText(`Rs ${cat.avg_order}`, {
                x: margin + 430,
                y: cursorY,
                size: 9,
                font,
                color: darkTextColor
            });
            cursorY -= 20;
        });
        cursorY -= 10;
    }
    if (type === 'forecast' || type === 'executive') {
        drawSection('Predictive Forecasting & Anomaly Status');
        try {
            const fc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getForecast"])(rows);
            page.drawText(`Selected Forecast Model: ${fc.model} (MAPE: ${fc.mape}%, Backtest Accuracy: ${fc.accuracy}%)`, {
                x: margin,
                y: cursorY,
                size: 9.5,
                font: fontBold,
                color: darkTextColor
            });
            cursorY -= 15;
            page.drawText(`Next month predicted revenue is Rs ${Math.round(fc.next_month_predicted).toLocaleString('en-IN')} with an 80% confidence interval.`, {
                x: margin,
                y: cursorY,
                size: 9,
                font,
                color: grayColor
            });
            cursorY -= 20;
        } catch (e) {
            page.drawText(`Forecast note: ${e.message}`, {
                x: margin,
                y: cursorY,
                size: 9,
                font,
                color: grayColor
            });
            cursorY -= 20;
        }
        const an = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAnomalies"])(rows, 3, ANOMALY_THRESHOLD);
        page.drawText(`Anomaly Detection: ${an.total} unusual days flagged (rolling 31-day median baseline, threshold z >= ${ANOMALY_THRESHOLD}).`, {
            x: margin,
            y: cursorY,
            size: 9,
            font: fontBold,
            color: darkTextColor
        });
        cursorY -= 14;
        an.data.slice(0, 3).forEach((item)=>{
            const anomalyText = sanitizeForPDF(`- Date ${item.date}: Rs ${Math.round(item.value).toLocaleString('en-IN')} (Deviation ${item.deviation}, ${item.severity} severity)`);
            page.drawText(anomalyText, {
                x: margin + 10,
                y: cursorY,
                size: 8.5,
                font,
                color: grayColor
            });
            cursorY -= 14;
        });
        cursorY -= 10;
    }
    // Key Findings & AI Section
    drawSection(type === 'ai' ? 'Autonomous AI Analysis' : 'Automated Business Insights');
    let findings = sa.insights;
    if (type === 'ai') {
        const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$llm$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildContext"])();
        const prompt = 'Summarize key findings, risks, and recommendations for this retail dataset.';
        const aiResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$llm$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["askLLM"])(prompt, context, provider);
        const cleanLines = aiResult.answer.split('\n').map((l)=>l.replace(/[*#]/g, '').trim()).filter((l)=>l.length > 5).slice(0, 7);
        if (cleanLines.length > 0) {
            findings = cleanLines;
        }
    }
    findings.forEach((line)=>{
        if (cursorY < 70) return;
        const prefix = line.startsWith('•') || line.startsWith('-') ? '' : '- ';
        const textToDraw = sanitizeForPDF((prefix + line).slice(0, 110));
        page.drawText(textToDraw, {
            x: margin,
            y: cursorY,
            size: 9,
            font,
            color: darkTextColor
        });
        cursorY -= 16;
    });
    // Footer
    page.drawLine({
        start: {
            x: margin,
            y: 40
        },
        end: {
            x: width - margin,
            y: 40
        },
        thickness: 0.5,
        color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rgb"])(0.8, 0.8, 0.8)
    });
    page.drawText('Autonomous Business Intelligence Platform · IFHE Semester Special Project · Shlok Shinde, Shreyas Mogalapalli, Saniya H D, Navya A · Mentor: Mr. Arram Sriram', {
        x: margin,
        y: 28,
        size: 7.5,
        font,
        color: grayColor
    });
    return await pdfDoc.save();
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0d_4c0e-qrkn0._.js.map