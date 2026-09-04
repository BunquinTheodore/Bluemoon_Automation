import { timingSafeEqual } from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n');

if (!getApps().length) {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials are not configured (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)'
    );
  }
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const db = getFirestore();
export const auth = getAuth();

/** All business dates are computed in Asia/Manila (UTC+8, no DST). */
export const BUSINESS_TZ_OFFSET = '+08:00';

/** Returns today's date as YYYY-MM-DD in Asia/Manila. */
export function getBusinessToday(): string {
  const shifted = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

export function isValidDateString(date: unknown): date is string {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return !Number.isNaN(new Date(`${date}T00:00:00${BUSINESS_TZ_OFFSET}`).getTime());
}

/** Start (inclusive) and end (exclusive) of a business day as Date objects. */
export function getBusinessDayBounds(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00${BUSINESS_TZ_OFFSET}`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Verifies the Vercel cron / shared-secret header. Vercel sends
 * `Authorization: Bearer <CRON_SECRET>` for scheduled invocations.
 */
export function isAuthorizedCronRequest(authorizationHeader: string | undefined): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET is not configured; refusing request');
    return false;
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authorizationHeader ?? '');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Verifies a Firebase ID token and returns the caller's uid, or null. */
export async function verifyFirebaseToken(authorizationHeader: string | undefined): Promise<string | null> {
  if (!authorizationHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await auth.verifyIdToken(authorizationHeader.slice('Bearer '.length));
    return decoded.uid;
  } catch (error) {
    console.error('Invalid Firebase ID token:', error);
    return null;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
