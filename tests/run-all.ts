import { runCleanerTests } from './cleaner.test';
import { runAnalyticsTests } from './analytics.test';
import { runE2EPipelineTests } from './e2e_pipeline.test';

async function main() {
  console.log('====================================================');
  console.log('   ABIP (Autonomous BI Platform) Automated Test Suite');
  console.log('====================================================');

  const start = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;

  // 1. Cleaner & Data Quality Tests
  const cleanerRes = runCleanerTests();
  totalPassed += cleanerRes.passed;
  totalFailed += cleanerRes.failed;

  // 2. Analytics & Benchmark Tests
  const analyticsRes = runAnalyticsTests();
  totalPassed += analyticsRes.passed;
  totalFailed += analyticsRes.failed;

  // 3. E2E Pipeline & Storage Isolation Tests
  const e2eRes = await runE2EPipelineTests();
  totalPassed += e2eRes.passed;
  totalFailed += e2eRes.failed;

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log('\n====================================================');
  console.log(`TEST RUN FINISHED in ${duration}s`);
  console.log(`Total tests: ${totalPassed + totalFailed}`);
  console.log(`Passed:      ${totalPassed}`);
  console.log(`Failed:      ${totalFailed}`);
  console.log('====================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
