import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { hydrate, databaseExists, getSalesSummary } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const uid = await getUid();
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  return NextResponse.json(getSalesSummary(uid));
}
