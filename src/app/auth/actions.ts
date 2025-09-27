
'use server';

import { cookies } from 'next/headers';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { appendDebug } from '@/lib/debug-log';

export async function storeUserInDb(id: string, name: string, email: string) {
  const stmt = db.prepare('INSERT OR IGNORE INTO users (id, name, email) VALUES (?, ?, ?)');
  try {
    stmt.run(id, name, email);
  } catch (error: any) {
    // It's fine if the user already exists, we can ignore the error.
    if (!error.code?.includes('SQLITE_CONSTRAINT')) {
      console.error('Failed to store user in DB:', error);
      throw error;
    }
  }
}

export async function setSessionCookie(token: string) {
  try {
    // `cookies().set` expects a cookie object in Next.js App Router
    // In development (HTTP) we must not set `secure: true` otherwise the cookie
    // will be ignored by the browser. Only mark cookies as secure in production.
    const isProd = process.env.NODE_ENV === 'production';
    (await cookies()).set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    console.log('[auth] setSessionCookie: session cookie set');
    try { appendDebug('[auth] setSessionCookie: session cookie set'); } catch {}
  } catch (err) {
    console.error('[auth] setSessionCookie: failed to set cookie', err);
    throw err;
  }
}

export async function signOut() {
  // This server action is primarily for clearing the cookie
  (await cookies()).delete('session');
  revalidatePath('/');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  // In a real app, you would verify the token with Firebase Admin SDK on the server
  // For this prototype, we will decode the token to get user info.
  // This is not a secure verification.
  try {
    const parts = sessionCookie.value.split('.');
    if (parts.length < 2) return null;
    const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson) as any;
    return {
      uid: payload.user_id || payload.sub,
      name: payload.name,
      email: payload.email,
    };
  } catch (e) {
    console.error('Error decoding token (this is not a real validation):', e);
    return null;
  }
}
