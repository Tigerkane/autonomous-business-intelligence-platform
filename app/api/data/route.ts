import { getUid } from '@/lib/user';
import { NextResponse } from 'next/server';
import { hydrate, deleteDataset } from '../../../server/db';

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
    return NextResponse.json({ message: 'Dataset deleted successfully.' });
  } catch (e) {
    return NextResponse.json({ detail: 'Failed to delete dataset.' }, { status: 500 });
  }
}
