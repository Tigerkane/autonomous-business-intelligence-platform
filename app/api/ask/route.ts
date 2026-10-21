import { NextRequest, NextResponse } from 'next/server';
import { databaseExists } from '@/server/db';
import { askLLM, buildContext } from '@/server/llm';

export async function POST(request: NextRequest) {
  if (!databaseExists()) {
    return NextResponse.json(
      { detail: 'No dataset has been uploaded yet. Upload a CSV first.' },
      { status: 404 }
    );
  }

  const { question, provider } = (await request.json().catch(() => ({}))) || {};
  if (!question || typeof question !== 'string' || question.trim().length < 2) {
    return NextResponse.json({ detail: 'Please provide a valid question.' }, { status: 400 });
  }

  try {
    const context = buildContext();
    const result = await askLLM(question.trim(), context, provider);
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
