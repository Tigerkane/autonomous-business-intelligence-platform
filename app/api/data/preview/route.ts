import { NextRequest, NextResponse } from 'next/server';
import { hydrate, databaseExists, getSalesPreview } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await hydrate();
  if (!databaseExists()) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '10', 10) || 10, 1), 100);
  const data = getSalesPreview(limit);
  return NextResponse.json({
    rows: data.length,
    data,
  });
}
