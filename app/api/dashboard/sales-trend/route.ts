import { NextResponse } from 'next/server';
import { hydrate, databaseExists, getSalesRows } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await hydrate();
  if (!databaseExists()) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  const rows = getSalesRows();
  const dailyMap = new Map<string, number>();
  for (const r of rows) {
    dailyMap.set(r.date, (dailyMap.get(r.date) || 0) + r.total_amount);
  }
  const sortedDates = Array.from(dailyMap.keys()).sort();
  const data = sortedDates.map((date) => ({
    date,
    sales: Math.round(dailyMap.get(date)! * 100) / 100,
  }));
  return NextResponse.json({ data });
}
