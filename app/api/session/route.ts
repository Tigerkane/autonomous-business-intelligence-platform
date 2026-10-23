import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  const store = await cookies();

  if (!email || typeof email !== 'string') {
    store.delete('abip_uid'); // sign-out: next visit gets a fresh anonymous uid
    return NextResponse.json({ ok: true });
  }

  const uid = createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 32);

  store.set('abip_uid', uid, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  });
  return NextResponse.json({ ok: true });
}
