import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Only import analytics dynamically to avoid issues in non-browser contexts
let analytics: import('firebase/analytics').Analytics | undefined;

const env = import.meta.env as Record<string, string | undefined>;

/** Reads a required env var and fails loudly at startup if it is missing. */
function requireEnv(name: string): string {
  const value = env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `[firebase] Missing required environment variable "${name}". ` +
        'Add it to your .env.local (see .env.example) and restart the dev server.'
    );
  }
  return value.trim();
}

const firebaseConfig = {
  apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnv('VITE_FIREBASE_APP_ID'),
  // measurementId is optional
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || undefined,
};

const app = initializeApp(firebaseConfig);

// Optionally enable Analytics if a measurement ID is present and window exists
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  import('firebase/analytics')
    .then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    })
    .catch((error: unknown) => {
      console.error('[firebase] Failed to initialise Analytics:', error);
    });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app, analytics };
