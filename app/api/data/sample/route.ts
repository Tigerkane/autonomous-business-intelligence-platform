import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { generateDemoDatasetCSV, cleanSalesData } from '@/server/cleaner';
import { saveSalesData } from '@/server/db';

// db.ts uses Node APIs (fs locally, Vercel Blob when deployed), so this route must run on the Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const uid = await getUid();
  try {
    const csvContent = generateDemoDatasetCSV();
    const { rows, report, quality } = cleanSalesData(csvContent);
    await saveSalesData(uid, rows, 'demo_retail_sales.csv', quality);

    return NextResponse.json({
      message: 'Demo dataset generated and loaded successfully.',
      filename: 'demo_retail_sales.csv',
      database: 'retail_bi.db',
      table: 'sales',
      ...report,
      quality,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Could not generate demo dataset: ${err.message}` },
      { status: 500 }
    );
  }
}
