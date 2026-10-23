import { getUid } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';
import { cleanSalesData } from '@/server/cleaner';
import { saveSalesData } from '@/server/db';
import { describeIssues } from '@/server/quality';

// db.ts uses Node APIs (fs locally, Vercel Blob when deployed), so this route must run on the Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // same 25MB limit the Express/multer setup used

export async function POST(request: NextRequest) {
  const uid = await getUid();
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: 'No file selected.' }, { status: 400 });
    }

    const filename = file.name || 'uploaded_sales.csv';
    if (!filename.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ detail: 'Only CSV files are supported.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { detail: 'File is too large. The maximum size is 25 MB.' },
        { status: 413 }
      );
    }

    const text = await file.text();
    const { rows, report, quality } = cleanSalesData(text);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          detail: `No valid rows remain after validation. ${describeIssues(quality)}`.trim(),
        },
        { status: 422 }
      );
    }

    await saveSalesData(uid, rows, filename, quality);

    const dropped = report.rows_before - report.rows_after;
    return NextResponse.json({
      message:
        dropped > 0
          ? `CSV uploaded. ${dropped} of ${report.rows_before} rows were dropped during validation.`
          : 'CSV uploaded and processed successfully.',
      filename,
      database: 'retail_bi.db',
      table: 'sales',
      ...report,
      quality,
    });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    return NextResponse.json(
      { detail: err.message || 'Failed to process CSV file.' },
      { status: 422 }
    );
  }
}
