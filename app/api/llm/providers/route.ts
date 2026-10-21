import { NextResponse } from 'next/server';
import { availableProviders, DEFAULT_PROVIDER } from '@/server/llm';

export async function GET() {
  const providers = availableProviders();
  return NextResponse.json({
    default: DEFAULT_PROVIDER,
    providers,
  });
}
