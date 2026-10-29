import fs from 'fs';
import path from 'path';
import { cleanSalesData } from '../server/cleaner';
import { getPeriodAnalysis, getStockRecommendations } from '../server/insights';

export function runInsightsTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;
  const assert = (c: boolean, name: string, d?: string) => {
    if (c) { console.log(`  ✓ ${name}`); passed++; }
    else { console.error(`  ✗ ${name} ${d ? `(${d})` : ''}`); failed++; }
  };

  console.log('\n--- Running Period Analysis & Stock Recommendation Tests ---');
  const csv = fs.readFileSync(path.resolve(process.cwd(), 'tests', 'fixtures', 'abip_sales_clean.csv'), 'utf8');
  const { rows } = cleanSalesData(csv);

  for (const p of ['3m', 'quarter', 'half', 'year'] as const) {
    try {
      const a = getPeriodAnalysis('t', p, rows);
      const sumCats = a.periods.reduce((s, x) => s + x.revenue, 0);
      const sumRows = a.periods.length ? sumCats : 0;
      assert(a.periods.length > 0 || p === 'year', `${p}: has complete periods or is too short`, `n=${a.periods.length}`);
      assert(a.forecast.total_revenue >= 0, `${p}: forecast is non-negative`);
      if (p !== '3m') assert(sumRows <= rows.reduce((s, r) => s + r.total_amount, 0) + 1, `${p}: period revenue never exceeds dataset total`);
    } catch (e: any) {
      assert(p === 'year', `${p}: handled short data`, e.message);
    }
  }

  const q = getPeriodAnalysis('t', 'quarter', rows);
  const m3 = getPeriodAnalysis('t', '3m', rows);
  assert(q.periods.map((x) => x.label).join() !== m3.periods.map((x) => x.label).join(), '3m and quarterly produce different periods');
  assert(m3.forecast.total_revenue !== q.forecast.total_revenue, '3m and quarterly forecasts differ');
  const s = getStockRecommendations('t', 'quarter', rows);
  const sorted = [...s.recommendations].sort((a, b) => b.forecast_revenue - a.forecast_revenue);
  assert(s.recommendations[0].category === sorted[0].category, 'Top recommendation = highest forecast revenue');
  assert(s.recommendations.filter((r) => r.action === 'Increase stock').length <= 1, 'At most one "Increase stock" action');
  assert(s.headline.length > 0, 'Headline generated');
  return { passed, failed };
}
