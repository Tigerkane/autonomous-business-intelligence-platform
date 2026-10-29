import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { hydrate, databaseExists } from '@/server/db';
import { getPeriodAnalysis, getStockRecommendations, PeriodKey } from '@/server/insights';
import { getSalesRows } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID: PeriodKey[] = ['3m', 'quarter', 'half', 'year'];

export async function GET(req: Request) {
  const uid = await getUid();
  if (!uid) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  // One request returns every period so the UI can switch instantly.
  // Each period is computed on its own, so a short dataset can still show the
  // periods it has enough data for.
  const NEEDS: Record<PeriodKey, string> = {
    '3m': 'at least 3 consecutive complete months',
    quarter: 'at least one full calendar quarter (e.g. Jan-Mar)',
    half: 'at least one full half-year (Jan-Jun or Jul-Dec)',
    year: 'at least one full calendar year (Jan-Dec)',
  };
  const rows = getSalesRows(uid);
  const out: Record<string, unknown> = {};
  for (const period of VALID) {
    try {
      const analysis = getPeriodAnalysis(uid, period, rows);
      out[period] = { analysis, stock: getStockRecommendations(uid, period, rows, analysis) };
    } catch {
      out[period] = { error: `Not enough data for this view yet. It needs ${NEEDS[period]} in the dataset.` };
    }
  }
  return NextResponse.json(out);
}
