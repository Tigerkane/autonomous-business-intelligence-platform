import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

/**
 * Returns the id used to scope all stored data.
 * Default: per-browser cookie. For real per-account separation, replace the
 * body with your auth provider's user id (Clerk: auth().userId, etc.).
 */
export async function getUid(): Promise<string> {
  const jar = await cookies();
  let uid = jar.get('abip_uid')?.value;
  if (!uid) {
    uid = randomUUID();
    jar.set('abip_uid', uid, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }
  return uid;
}
