import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { hydrate, deleteDataset } from '../../../server/db';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    // Load the current dataset first so "existed" is accurate on a cold serverless instance
    const uid = await getUid();
  await hydrate(uid);
    const existed = await deleteDataset(uid);
    if (!existed) {
      return NextResponse.json({ detail: 'No dataset found.' }, { status: 404 });
    }
    try {
      const supabase = await createClient();
      await supabase.from('datasets').delete().eq('user_id', uid);
    } catch (e) {
      console.error('Failed to delete dataset record:', e);
    }
    return NextResponse.json({ message: 'Dataset deleted successfully.' });
  } catch (e) {
    return NextResponse.json({ detail: 'Failed to delete dataset.' }, { status: 500 });
  }
}
