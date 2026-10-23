import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { hydrate, databaseExists } from '@/server/db';
import { getOverview } from '@/server/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const uid = await getUid();
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  try {
    return NextResponse.json(getOverview(uid));
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 422 });
  }
}
