import { NextRequest, NextResponse } from 'next/server';
import { databaseExists } from '@/server/db';
import { getAnomalies } from '@/server/analytics';

const DEFAULT_THRESHOLD = 3.5;

export async function GET(request: NextRequest) {
  if (!databaseExists()) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  const searchParams = request.nextUrl.searchParams;
  const limitQuery = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 500;
  const limit = isNaN(limitQuery) ? 500 : limitQuery;
  const thresholdQuery = searchParams.get('threshold') ? parseFloat(searchParams.get('threshold')!) : DEFAULT_THRESHOLD;
  const threshold = isNaN(thresholdQuery) ? DEFAULT_THRESHOLD : thresholdQuery;
  return NextResponse.json(getAnomalies(undefined, limit, threshold));
}
