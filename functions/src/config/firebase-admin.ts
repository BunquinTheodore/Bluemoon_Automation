import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK.
 *
 * Inside Cloud Functions the default service account is used automatically.
 * If explicit service-account credentials are provided via environment
 * variables (e.g. for local development), they take precedence.
 */
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET || 'final-bluemoon-automation.appspot.com';

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
  } else {
    admin.initializeApp({ storageBucket });
  }
}

export const db = admin.firestore();
export const storage = admin.storage();
export const adminApp = admin;

export type UserRole = 'owner' | 'manager' | 'employee';

/**
 * Look up the caller's role from the `users` collection.
 * Returns null when the user document or role is missing.
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  const snapshot = await db.collection('users').doc(uid).get();
  const role = snapshot.data()?.role;
  return role === 'owner' || role === 'manager' || role === 'employee' ? role : null;
}
