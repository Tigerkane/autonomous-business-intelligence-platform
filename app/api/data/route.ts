import { NextResponse } from 'next/server';
import { deleteDataset } from '../../../server/db';

export async function DELETE() {
  try {
    const existed = deleteDataset();
    if (!existed) {
      return NextResponse.json({ detail: 'No dataset found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Dataset deleted successfully.' });
  } catch (e) {
    return NextResponse.json({ detail: 'Failed to delete dataset.' }, { status: 500 });
  }
}
