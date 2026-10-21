import { NextResponse } from 'next/server';
import { generateDemoDatasetCSV, cleanSalesData } from '@/server/cleaner';
import { saveSalesData } from '@/server/db';

export async function POST() {
  try {
    const csvContent = generateDemoDatasetCSV();
    const { rows, report } = cleanSalesData(csvContent);
    saveSalesData(rows, 'demo_retail_sales.csv');

    return NextResponse.json({
      message: 'Demo dataset generated and loaded successfully.',
      filename: 'demo_retail_sales.csv',
      database: 'retail_bi.db',
      table: 'sales',
      ...report,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Could not generate demo dataset: ${err.message}` },
      { status: 500 }
    );
  }
}
