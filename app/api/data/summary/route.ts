import { NextResponse } from 'next/server';
import { databaseExists, getSalesSummary } from '@/server/db';

export async function GET() {
  if (!databaseExists()) {
    return NextResponse.json({ detail: 'No dataset has been uploaded yet.' }, { status: 404 });
  }
  return NextResponse.json(getSalesSummary());
}
