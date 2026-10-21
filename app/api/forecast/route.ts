import { NextResponse } from 'next/server';
import { databaseExists } from '@/server/db';
import { getForecast } from '@/server/analytics';

export async function GET() {
  if (!databaseExists()) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  try {
    return NextResponse.json(getForecast());
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 422 });
  }
}
