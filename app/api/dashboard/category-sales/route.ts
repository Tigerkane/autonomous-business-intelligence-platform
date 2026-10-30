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
  const catMap = new Map<string, { sales: number; profit: number }>();
  for (const r of rows) {
    const cat = rowCategory(r);
    const cost = r.total_cost ?? (r.unit_cost !== undefined ? r.quantity * r.unit_cost : r.total_amount * 0.65);
    const profit = r.profit ?? (r.total_amount - cost);
    const curr = catMap.get(cat) || { sales: 0, profit: 0 };
    curr.sales += r.total_amount;
    curr.profit += profit;
    catMap.set(cat, curr);
  }
  function rowCategory(r: any) {
    return r.product_category || 'Other';
  }
  const data = Array.from(catMap.entries())
    .map(([category, val]) => ({
      category,
      sales: Math.round(val.sales * 100) / 100,
      profit: Math.round(val.profit * 100) / 100,
      margin: val.sales > 0 ? Math.round(((val.profit / val.sales) * 100) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
  return NextResponse.json({ data });
}
