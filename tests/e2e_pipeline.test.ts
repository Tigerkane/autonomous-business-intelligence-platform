import fs from 'fs';
import path from 'path';
import { cleanSalesData } from '../server/cleaner';
import {
  saveSalesData,
  hydrate,
  getSalesRows,
  databaseExists,
  deleteDataset,
} from '../server/db';
import {
  getOverview,
  getSalesAnalysis,
  getForecast,
  getAnomalies,
  getUnusualTransactions,
} from '../server/analytics';

export async function runE2EPipelineTests(): Promise<{ passed: number; failed: number }> {
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

  console.log('\n--- Running End-to-End Pipeline & Storage Tests ---');

  const fixturesDir = path.resolve(process.cwd(), 'tests', 'fixtures');
  const cleanPath = path.join(fixturesDir, 'abip_sales_clean.csv');
  const cleanCsv = fs.readFileSync(cleanPath, 'utf8');

  // Step 1: Clean and Parse
  const { rows, quality } = cleanSalesData(cleanCsv);
  assert(rows.length === 1000, 'Pipeline: CSV parsed into 1,000 rows');

  // Step 2: User A stores data
  const userA = 'test-e2e-user-a';
  const userB = 'test-e2e-user-b';

  await deleteDataset(userA);
  await deleteDataset(userB);

  await saveSalesData(userA, rows, 'abip_sales_clean.csv', quality);
  assert(databaseExists(userA), 'User A dataset is saved and exists');
  assert(!databaseExists(userB), 'User B has NO dataset (Row Level Security / User Isolation)');

  // Step 3: Hydrate and verify rows
  await hydrate(userA);
  const rowsA = getSalesRows(userA);
  assert(rowsA.length === 1000, 'User A hydrated 1,000 rows from database');

  // Step 4: Run Analytics via stored rows
  const ovA = getOverview(userA);
  assert(ovA.kpis.total_sales === 303025, 'Overview from stored rows has total revenue ₹3,03,025');

  const saA = getSalesAnalysis(userA);
  assert(saA.categories.length === 3, 'Sales analysis has 3 product categories');
  assert(saA.gender_analysis.stats.length === 2, 'Gender analysis has Female and Male segments');

  const fcA = getForecast(userA);
  assert(fcA.next_month_predicted === 51200, 'Forecast next month is ₹51,200');

  const anA = getAnomalies(userA);
  assert(anA.total === 0, 'Clean dataset has 0 anomalies');

  const utA = getUnusualTransactions(userA);
  assert(utA.total === 16, 'Clean dataset has 16 unusual transactions');

  // Step 5: Clean up
  await deleteDataset(userA);
  assert(!databaseExists(userA), 'User A dataset deleted successfully');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('e2e_pipeline.test.ts')) {
  runE2EPipelineTests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
