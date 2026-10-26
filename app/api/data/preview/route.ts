import { getUid } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';
import { hydrate, databaseExists, getSalesPreview } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const uid = await getUid();
  if (!uid) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '10', 10) || 10, 1), 100);
  const data = getSalesPreview(uid, limit);
  return NextResponse.json({
    rows: data.length,
    data,
  });
}
