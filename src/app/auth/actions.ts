
'use server';

import { cookies } from 'next/headers';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function storeUserInDb(id: string, name: string, email: string) {
  const stmt = db.prepare('INSERT OR IGNORE INTO users (id, name, email) VALUES (?, ?, ?)');
  try {
    stmt.run(id, name, email);
  } catch (error: any) {
    // It's fine if the user already exists, we can ignore the error.
    if (!error.code?.includes('SQLITE_CONSTRAINT')) {
        console.error("Failed to store user in DB:", error);
        throw error;
    }
  }
}

export async function setSessionCookie(token: string) {
    cookies().set('session', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 7 });
}

export async function signOut() {
  // This server action is primarily for clearing the cookie
  cookies().delete('session');
  revalidatePath('/');
}

export async function getCurrentUser() {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return null;
    }
    
    // In a real app, you would verify the token with Firebase Admin SDK on the server
    // For this prototype, we will decode the token to get user info.
    // This is not a secure verification.
    try {
        const payload = JSON.parse(Buffer.from(sessionCookie.value.split('.')[1], 'base64').toString());
        return {
            uid: payload.user_id,
            name: payload.name,
            email: payload.email,
        };
    } catch(e) {
        console.error("Error decoding token (this is not a real validation):", e);
        return null;
    }
}
