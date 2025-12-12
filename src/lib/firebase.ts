import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Only import analytics dynamically to avoid issues in non-browser contexts
let analytics: import('firebase/analytics').Analytics | undefined;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  // measurementId is optional
  measurementId: (import.meta.env as any).VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

const app = initializeApp(firebaseConfig);

// Optionally enable Analytics if a measurement ID is present and window exists
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  import('firebase/analytics')
    .then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    })
    .catch(() => {
      // ignore analytics load errors in dev
    });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app, analytics };
