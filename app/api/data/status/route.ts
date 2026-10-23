import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { hydrate, databaseExists, getSalesSummary, getDatasetMeta } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const uid = await getUid();
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json({
      database_exists: false,
      rows: 0,
    });
  }
  const summary = getSalesSummary(uid);
  const meta = getDatasetMeta(uid);
  return NextResponse.json({
    database_exists: true,
    ...summary,
    ...meta,
  });
}
