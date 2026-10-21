import { NextRequest, NextResponse } from 'next/server';
import { cleanSalesData } from '@/server/cleaner';
import { saveSalesData } from '@/server/db';

export async function POST(request: NextRequest) {
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

    const text = await file.text();
    const { rows, report } = cleanSalesData(text);

    if (rows.length === 0) {
      return NextResponse.json({ detail: 'No valid rows remain after cleaning.' }, { status: 400 });
    }

    saveSalesData(rows, filename);

    return NextResponse.json({
      message: 'CSV uploaded and processed successfully.',
      filename,
      database: 'retail_bi.db',
      table: 'sales',
      ...report,
    });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    return NextResponse.json({ detail: err.message || 'Failed to process CSV file.' }, { status: 422 });
  }
}
