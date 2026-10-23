import { getUid } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';
import { hydrate, databaseExists } from '@/server/db';
import { getAnomalies } from '@/server/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_THRESHOLD = 3.5;

export async function GET(request: NextRequest) {
  const uid = await getUid();
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  const searchParams = request.nextUrl.searchParams;
  const limitQuery = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 500;
  const limit = isNaN(limitQuery) ? 500 : limitQuery;
  const thresholdQuery = searchParams.get('threshold') ? parseFloat(searchParams.get('threshold')!) : DEFAULT_THRESHOLD;
  const threshold = isNaN(thresholdQuery) ? DEFAULT_THRESHOLD : thresholdQuery;
  return NextResponse.json(getAnomalies(uid, undefined, limit, threshold));
}
