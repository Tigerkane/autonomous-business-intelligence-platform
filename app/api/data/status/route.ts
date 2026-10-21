import { NextResponse } from 'next/server';
import { databaseExists, getSalesSummary, getDatasetMeta } from '@/server/db';

export async function GET() {
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
