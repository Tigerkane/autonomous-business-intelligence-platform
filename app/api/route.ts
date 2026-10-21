import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Autonomous Business Intelligence Platform API',
    status: 'running',
    framework: 'Next.js App Router',
    version: '1.0.0',
  });
}
