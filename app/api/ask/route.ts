import { getUid } from '@/lib/user';
import { databaseExists, hydrate } from '@/server/db';
import { askLLM, buildContext } from '@/server/llm';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const uid = await getUid();
  if (!uid) {
    return NextResponse.json(
      { detail: 'No dataset has been uploaded yet. Upload a CSV first.' },
      { status: 404 }
    );
  }
  await hydrate(uid);
  if (!databaseExists(uid)) {
    return NextResponse.json(
      { detail: 'No dataset has been uploaded yet. Upload a CSV first.' },
      { status: 404 }
    );
  }

  const { question, provider, apiKey } = (await request.json().catch(() => ({}))) || {};
  if (!question || typeof question !== 'string' || question.trim().length < 2) {
    return NextResponse.json({ detail: 'Please provide a valid question.' }, { status: 400 });
  }

  try {
    const context = buildContext(uid);
    const result = await askLLM(uid, question.trim(), context, provider, apiKey);
    return NextResponse.json({
      question,
      answer: result.answer,
      provider: result.provider,
      model: result.model,
    });
  } catch (err: any) {
    console.error('Ask error:', err);
    return NextResponse.json(
      { detail: err.message || 'AI analysis request failed.' },
      { status: 500 }
    );
  }
}