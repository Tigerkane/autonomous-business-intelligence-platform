import { getUid } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';
import { hydrate, databaseExists } from '@/server/db';
import { generatePDFReport } from '@/server/report';

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

  const body = (await request.json().catch(() => ({}))) || {};
  const type = body?.type || 'executive';
  const provider = body?.provider;

  try {
    const pdfBytes = await generatePDFReport(uid, type, provider);
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ABIP_${type}_report.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Report generation error:', err);
    return NextResponse.json(
      { detail: `Could not build the report: ${err.message}` },
      { status: 500 }
    );
  }
}
