import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { hydrate, databaseExists, getSalesRows } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const uid = await getUid();
  if (!uid) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  const rows = getSalesRows(uid);
  const catMap = new Map<string, number>();
  for (const r of rows) {
    catMap.set(rowCategory(r), (catMap.get(rowCategory(r)) || 0) + r.total_amount);
  }
  function rowCategory(r: any) {
    return r.product_category || 'Other';
  }
  const data = Array.from(catMap.entries())
    .map(([category, sales]) => ({
      category,
      sales: Math.round(sales * 100) / 100,
    }))
    .sort((a, b) => b.sales - a.sales);
  return NextResponse.json({ data });
}
