import { NextRequest, NextResponse } from 'next/server';
import { hydrate, databaseExists } from '@/server/db';
import { getUnusualTransactions } from '@/server/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;

export async function GET(request: NextRequest) {
  await hydrate();
  if (!databaseExists()) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limitQuery = limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT;
  const limit = isNaN(limitQuery) ? DEFAULT_LIMIT : Math.min(Math.max(limitQuery, 1), MAX_LIMIT);
  return NextResponse.json(getUnusualTransactions(undefined, limit));
}
