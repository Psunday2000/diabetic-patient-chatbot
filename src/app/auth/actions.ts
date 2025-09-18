'use server';

import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function storeUserInDb(id: string, name: string, email: string) {
  const stmt = db.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)');
  try {
    stmt.run(id, name, email);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`User with email ${email} already exists.`);
      return;
    }
    throw error;
  }
}

export async function signUp(name: string, email: string, password: string):Promise<{error?: string}> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    await storeUserInDb(user.uid, name, email);
    
    const token = await user.getIdToken();
    cookies().set('session', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    revalidatePath('/');
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signIn(email: string, password: string):Promise<{error?: string}> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();
    cookies().set('session', token, { httpOnly: true, secure: true, sameSite: 'strict' });
    revalidatePath('/');
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signOut() {
  await auth.signOut();
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
    // For this prototype, we'll assume the client-side token is valid enough for UI purposes
    // and rely on middleware for route protection.
    // A proper implementation would look something like:
    // import { getAuth } from 'firebase-admin/auth';
    // const decodedToken = await getAuth().verifyIdToken(sessionCookie.value);
    // return decodedToken;
    // For now, we return a placeholder. This part needs a proper backend implementation.
    
    // This is a simplified "decoding" for demo purposes only. DO NOT USE IN PRODUCTION.
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
