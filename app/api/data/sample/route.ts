import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { generateDemoDatasetCSV, cleanSalesData } from '@/server/cleaner';
import { saveSalesData } from '@/server/db';
import { createClient } from '@/lib/supabase/server';

// db.ts uses Node APIs (fs locally, Vercel Blob when deployed), so this route must run on the Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const uid = await getUid();
  if (!uid) {
    return NextResponse.json({ detail: 'Not signed in.' }, { status: 401 });
  }
  try {
    const csvContent = generateDemoDatasetCSV();
    const { rows, report, quality } = cleanSalesData(csvContent);
    await saveSalesData(uid, rows, 'demo_retail_sales.csv', quality);

    try {
      const supabase = await createClient();
      await supabase.from('datasets').delete().eq('user_id', uid);
      await supabase.from('datasets').insert({ user_id: uid, filename: 'demo_retail_sales.csv', total_rows: rows.length });
    } catch (e) {
      console.error('Failed to record dataset:', e);
    }

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
