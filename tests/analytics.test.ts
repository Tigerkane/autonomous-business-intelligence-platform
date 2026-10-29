import fs from 'fs';
import path from 'path';
import { cleanSalesData } from '../server/cleaner';
import {
  getOverview,
  getSalesAnalysis,
  getForecast,
  getAnomalies,
  getUnusualTransactions,
} from '../server/analytics';

export function runAnalyticsTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  console.log('\n--- Running Analytics & Benchmark Tests ---');

  const fixturesDir = path.resolve(process.cwd(), 'tests', 'fixtures');
  const cleanPath = path.join(fixturesDir, 'abip_sales_clean.csv');
  const cleanCsv = fs.readFileSync(cleanPath, 'utf8');
  const { rows: cleanRows } = cleanSalesData(cleanCsv);

  const uid = 'test-benchmarks';
  const ov = getOverview(uid, cleanRows);
  const sa = getSalesAnalysis(uid, cleanRows);
  const fc = getForecast(uid, cleanRows);
  const an = getAnomalies(uid, cleanRows);
  const ut = getUnusualTransactions(uid, cleanRows);

  // 1. Core KPIs
  assert(cleanRows.length === 1000, 'Total rows is 1,000');
  assert(ov.kpis.total_sales === 303025, 'Total revenue is exactly ₹3,03,025', `got ${ov.kpis.total_sales}`);
  assert(ov.kpis.total_quantity === 2507, 'Total units is exactly 2,507', `got ${ov.kpis.total_quantity}`);
  assert(Math.round(ov.kpis.average_transaction) === 303, 'Avg basket is ₹303', `got ${ov.kpis.average_transaction}`);
  assert((ov.kpis.total_profit || 0) > 0, 'Total profit is computed and positive', `got ${ov.kpis.total_profit}`);
  assert((ov.kpis.profit_margin || 0) > 0, 'Profit margin is computed and positive', `got ${ov.kpis.profit_margin}%`);

  const uniqueCustomers = new Set(cleanRows.map((r) => r.customer_id)).size;
  assert(uniqueCustomers === 369, 'Unique customers is exactly 369', `got ${uniqueCustomers}`);

  const avgAge = Math.round((cleanRows.reduce((acc, r) => acc + r.age, 0) / cleanRows.length) * 10) / 10;
  assert(avgAge === 40.6, 'Average age is exactly 40.6', `got ${avgAge}`);

  // 2. Category Revenue
  const catRev = new Map(ov.categories.map((c) => [c.category, c.sales]));
  assert(catRev.get('Electronics') === 203700, 'Electronics revenue is ₹2,03,700', `got ${catRev.get('Electronics')}`);
  assert(catRev.get('Clothing') === 61715, 'Clothing revenue is ₹61,715', `got ${catRev.get('Clothing')}`);
  assert(catRev.get('Beauty') === 37610, 'Beauty revenue is ₹37,610', `got ${catRev.get('Beauty')}`);

  // 3. Monthly Revenue
  const monthRev = new Map(ov.monthly.map((m) => [m.month, m.total_revenue]));
  assert(monthRev.get('2026-01') === 46455, 'Jan revenue is ₹46,455', `got ${monthRev.get('2026-01')}`);
  assert(monthRev.get('2026-02') === 50830, 'Feb revenue is ₹50,830', `got ${monthRev.get('2026-02')}`);
  assert(monthRev.get('2026-03') === 52140, 'Mar revenue is ₹52,140', `got ${monthRev.get('2026-03')}`);
  assert(monthRev.get('2026-04') === 47645, 'Apr revenue is ₹47,645', `got ${monthRev.get('2026-04')}`);
  assert(monthRev.get('2026-05') === 50400, 'May revenue is ₹50,400', `got ${monthRev.get('2026-05')}`);
  assert(monthRev.get('2026-06') === 55555, 'Jun revenue is ₹55,555', `got ${monthRev.get('2026-06')}`);

  // 4. Jun vs May Trends
  assert(ov.trends.revenue === 10.2, 'Jun vs May revenue trend is +10.2%', `got ${ov.trends.revenue}`);
  assert(ov.trends.transactions === -3.3, 'Jun vs May orders trend is -3.3%', `got ${ov.trends.transactions}`);
  assert(ov.trends.units === 1.2, 'Jun vs May units trend is +1.2%', `got ${ov.trends.units}`);
  assert(ov.trends.avg === 14, 'Jun vs May avg basket trend is +14%', `got ${ov.trends.avg}`);

  // 5. Forecast
  assert(fc.next_month_predicted === 51200, 'Forecast next month is ₹51,200', `got ${fc.next_month_predicted}`);

  // 6. Anomalies & Unusual Transactions on Clean
  assert(an.total === 0, 'Daily revenue anomalies on clean CSV is 0', `got ${an.total}`);
  assert(ut.total === 16, 'Unusual transactions on clean CSV is 16', `got ${ut.total}`);
  assert(ut.by_category['Beauty'] === 16, 'All 16 unusual transactions are in Beauty');

  // 7. Anomalies on Anomaly Test CSV
  const anomalyPath = path.join(fixturesDir, 'abip_sales_anomaly_test.csv');
  const anomalyCsv = fs.readFileSync(anomalyPath, 'utf8');
  const { rows: anomalyRows } = cleanSalesData(anomalyCsv);
  const anTest = getAnomalies(uid, anomalyRows);
  const utTest = getUnusualTransactions(uid, anomalyRows);

  assert(anTest.total === 5, 'Daily revenue anomalies on anomaly test CSV is exactly 5', `got ${anTest.total}`);
  const flaggedDates = anTest.data.map((d: any) => d.date).sort();
  const expectedDates = ['2026-02-10', '2026-03-25', '2026-04-20', '2026-05-22', '2026-06-15'];
  assert(
    JSON.stringify(flaggedDates) === JSON.stringify(expectedDates),
    'Flagged anomaly dates match expected exactly: 2026-02-10, 03-25, 04-20, 05-22, 06-15',
    `got ${flaggedDates.join(', ')}`
  );
  assert(utTest.total === 16, 'Unusual transactions on anomaly CSV is still 16', `got ${utTest.total}`);

  // 8. Gender Analysis
  const femaleStat = sa.gender_analysis.stats.find((s) => s.gender === 'Female');
  const maleStat = sa.gender_analysis.stats.find((s) => s.gender === 'Male');
  assert(femaleStat?.orders === 496, 'Female orders is 496', `got ${femaleStat?.orders}`);
  assert(femaleStat?.units === 1246, 'Female units is 1,246', `got ${femaleStat?.units}`);
  assert(femaleStat?.revenue === 151150, 'Female revenue is ₹1,51,150', `got ${femaleStat?.revenue}`);
  assert(maleStat?.orders === 504, 'Male orders is 504', `got ${maleStat?.orders}`);
  assert(maleStat?.units === 1261, 'Male units is 1,261', `got ${maleStat?.units}`);
  assert(maleStat?.revenue === 151875, 'Male revenue is ₹1,51,875', `got ${maleStat?.revenue}`);
  assert(sa.gender_analysis.insight === 'Spending is similar across genders.', 'Gender insight text matches guard rule');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('analytics.test.ts')) {
  const { passed, failed } = runAnalyticsTests();
  process.exit(failed > 0 ? 1 : 0);
}
