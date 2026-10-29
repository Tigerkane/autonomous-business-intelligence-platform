import fs from 'fs';
import path from 'path';
import { cleanSalesData } from '../server/cleaner';

export function runCleanerTests(): { passed: number; failed: number } {
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

  console.log('\n--- Running Data Cleaner & Validation Tests ---');

  const fixturesDir = path.resolve(process.cwd(), 'tests', 'fixtures');
  const cleanPath = path.join(fixturesDir, 'abip_sales_clean.csv');
  const cleanCsv = fs.readFileSync(cleanPath, 'utf8');
  const cleanResult = cleanSalesData(cleanCsv);

  // 1. Clean CSV validation
  assert(cleanResult.rows.length === 1000, 'Clean CSV yields exactly 1,000 rows', `got ${cleanResult.rows.length}`);
  assert(cleanResult.quality.rows_dropped === 0, 'Clean CSV has 0 rows dropped');
  const errorsOnClean = cleanResult.quality.issues.filter(i => i.severity === 'error');
  assert(errorsOnClean.length === 0, 'Clean CSV produces 0 error-level issues', `got ${errorsOnClean.length}`);

  // 2. Dirty CSV validation
  const dirtyPath = path.join(fixturesDir, 'abip_sales_dirty.csv');
  const dirtyCsv = fs.readFileSync(dirtyPath, 'utf8');
  const dirtyResult = cleanSalesData(dirtyCsv);

  assert(dirtyResult.report.rows_before === 1000, 'Dirty CSV original rows is 1,000');
  assert(dirtyResult.report.duplicates_removed === 3, 'Catches and drops 3 duplicate transaction IDs', `got ${dirtyResult.report.duplicates_removed}`);
  assert(dirtyResult.report.negative_values_removed === 6, 'Catches and drops 6 negative quantity/amount rows', `got ${dirtyResult.report.negative_values_removed}`);
  assert(dirtyResult.rows.length === 991, 'Dirty CSV keeps 991 valid rows (9 dropped for errors)', `got ${dirtyResult.rows.length}`);

  const issueCodes = new Map(dirtyResult.quality.issues.map(i => [i.code, i.count]));
  assert(issueCodes.get('negative_amount') === 6, 'Issues tracker records 6 negative amount errors');
  assert(issueCodes.get('duplicate_id') === 3, 'Issues tracker records 3 duplicate ID errors');
  assert(issueCodes.get('total_mismatch') === 8, 'Catches 8 total amount != qty * price warnings', `got ${issueCodes.get('total_mismatch')}`);
  assert(issueCodes.get('invalid_age') === 5, 'Catches 5 Age outside 0-120 warnings', `got ${issueCodes.get('invalid_age')}`);
  assert(issueCodes.get('wrong_date_format') === 5, 'Catches 5 wrong date format (DD/MM/YYYY) warnings', `got ${issueCodes.get('wrong_date_format')}`);
  assert(issueCodes.get('future_date') === 4, 'Catches 4 future date warnings', `got ${issueCodes.get('future_date')}`);
  assert(issueCodes.get('invalid_gender') === 2, 'Catches 2 invalid gender value warnings', `got ${issueCodes.get('invalid_gender')}`);

  // 3. Ground rules: Blank cells handling
  const blankAges = dirtyResult.rows.filter(r => r.age === 0);
  assert(blankAges.length >= 6, 'Blank Age converted to 0 as per ground rules');
  const unknownCats = dirtyResult.rows.filter(r => r.product_category === 'Unknown');
  assert(unknownCats.length === 3, 'Blank Product Category converted to Unknown (3 rows)');

  // 4. Unit Cost & Profit calculation
  assert(cleanResult.rows.every(r => r.unit_cost !== undefined && r.profit !== undefined), 'Fallback unit_cost and profit populated for all rows when omitted');
  
  const csvWithCost = [
    'Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Unit Cost,Total Amount',
    'T1,2023-05-01,C1,Female,30,Beauty,2,500,200,1000',
    'T2,2023-05-02,C2,Male,25,Electronics,1,1000,1200,1000',
  ].join('\n');
  const costResult = cleanSalesData(csvWithCost);
  assert(costResult.rows.length === 2, 'Parsed CSV with explicit Unit Cost column');
  assert(costResult.rows[0].unit_cost === 200 && costResult.rows[0].profit === 600, 'Calculates profit accurately: 1000 - (2 * 200) = 600');
  const costExceeds = costResult.quality.issues.find(i => i.code === 'cost_exceeds_price');
  assert(costExceeds !== undefined && costExceeds.count === 1, 'Triggers warning when Unit Cost exceeds Price per Unit');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('cleaner.test.ts')) {
  const { passed, failed } = runCleanerTests();
  process.exit(failed > 0 ? 1 : 0);
}
