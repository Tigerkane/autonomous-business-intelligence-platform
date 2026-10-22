import { NextResponse } from 'next/server';
import { hydrate, databaseExists } from '@/server/db';
import { getSalesAnalysis } from '@/server/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await hydrate();
  if (!databaseExists()) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  try {
    return NextResponse.json(getSalesAnalysis());
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 422 });
  }
}
