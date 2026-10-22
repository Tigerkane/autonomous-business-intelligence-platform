import { NextResponse } from 'next/server';
import { hydrate, databaseExists, getSalesSummary, getDatasetMeta } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await hydrate();
  if (!databaseExists()) {
    return NextResponse.json({
      database_exists: false,
      rows: 0,
    });
  }
  const summary = getSalesSummary();
  const meta = getDatasetMeta();
  return NextResponse.json({
    database_exists: true,
    ...summary,
    ...meta,
  });
}
