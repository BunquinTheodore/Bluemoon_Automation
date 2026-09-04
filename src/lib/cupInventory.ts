import {
  Timestamp,
  type Unsubscribe,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export type DiscrepancyStatus = 'OK' | 'Inventory Discrepancy';

export interface CupInventoryRecord {
  id: string;
  recordId: string;
  branchId: string;
  branchName: string;
  date: string;
  openingCups: number;
  cupsSoldToday: number;
  expectedEndingCups: number;
  actualEndingCups: number;
  difference: number;
  hasDiscrepancy: boolean;
  discrepancyStatus: DiscrepancyStatus;
  submittedByUserId: string;
  submittedByName: string;
  updatedByUserId: string;
  updatedByName: string;
  openingConfirmed?: boolean;
  closingConfirmed?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SaveOpeningInput {
  branchName: string;
  date: string;
  openingCups: number;
  userId: string;
  userName: string;
}

export interface SaveClosingInput {
  branchName: string;
  date: string;
  cupsSoldToday: number;
  actualEndingCups: number;
  userId: string;
  userName: string;
}

export interface UpsertCupInventoryInput {
  branchName: string;
  date: string;
  openingCups: number;
  cupsSoldToday: number;
  actualEndingCups: number;
  userId: string;
  userName: string;
}

function requireAuthenticatedUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('AUTH_REQUIRED: No authenticated Firebase user.');
  }
  return user.uid;
}

function slugifyBranch(branchName: string): string {
  return branchName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default-branch';
}

export function buildCupInventoryRecordId(branchName: string, date: string): string {
  return `${slugifyBranch(branchName)}_${date}`;
}

export interface CupInventoryDerived {
  expectedEndingCups: number;
  difference: number;
  hasDiscrepancy: boolean;
  discrepancyStatus: DiscrepancyStatus;
}

function toSafeCount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function computeCupInventory(
  openingCups: number,
  cupsSoldToday: number,
  actualEndingCups: number
): CupInventoryDerived {
  const opening = toSafeCount(openingCups);
  const sold = toSafeCount(cupsSoldToday);
  const actual = toSafeCount(actualEndingCups);

  const expectedEndingCups = opening - sold;
  const difference = actual - expectedEndingCups;
  const hasDiscrepancy = difference !== 0;

  return {
    expectedEndingCups,
    difference,
    hasDiscrepancy,
    discrepancyStatus: hasDiscrepancy ? 'Inventory Discrepancy' : 'OK',
  };
}

/**
 * Normalizes a raw Firestore document into a fully-populated record.
 * Records created by the opening shift only have partial closing data,
 * so numeric fields default to 0 and derived fields are recomputed.
 */
function normalizeRecord(id: string, data: Partial<CupInventoryRecord>): CupInventoryRecord {
  const openingCups = toSafeCount(data.openingCups);
  const cupsSoldToday = toSafeCount(data.cupsSoldToday);
  const actualEndingCups = toSafeCount(data.actualEndingCups);
  const closingConfirmed = data.closingConfirmed === true;
  const derived = closingConfirmed
    ? computeCupInventory(openingCups, cupsSoldToday, actualEndingCups)
    : { expectedEndingCups: openingCups - cupsSoldToday, difference: 0, hasDiscrepancy: false, discrepancyStatus: 'OK' as const };

  return {
    id,
    recordId: data.recordId ?? id,
    branchId: data.branchId ?? '',
    branchName: data.branchName ?? '',
    date: data.date ?? '',
    openingCups,
    cupsSoldToday,
    actualEndingCups,
    expectedEndingCups: derived.expectedEndingCups,
    difference: derived.difference,
    hasDiscrepancy: derived.hasDiscrepancy,
    discrepancyStatus: derived.discrepancyStatus,
    submittedByUserId: data.submittedByUserId ?? '',
    submittedByName: data.submittedByName ?? '',
    updatedByUserId: data.updatedByUserId ?? '',
    updatedByName: data.updatedByName ?? '',
    openingConfirmed: data.openingConfirmed === true,
    closingConfirmed,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function upsertCupInventoryRecord(input: UpsertCupInventoryInput) {
  const authUid = requireAuthenticatedUserId();
  const recordId = buildCupInventoryRecordId(input.branchName, input.date);
  const branchId = slugifyBranch(input.branchName);

  const derived = computeCupInventory(
    input.openingCups,
    input.cupsSoldToday,
    input.actualEndingCups
  );

  const ref = doc(db, 'cupInventoryRecords', recordId);
  const existingSnap = await getDoc(ref);
  const existingData = existingSnap.exists()
    ? (existingSnap.data() as Partial<CupInventoryRecord>)
    : null;

  await setDoc(
    ref,
    {
      recordId,
      branchId,
      branchName: input.branchName,
      date: input.date,
      openingCups: input.openingCups,
      cupsSoldToday: input.cupsSoldToday,
      expectedEndingCups: derived.expectedEndingCups,
      actualEndingCups: input.actualEndingCups,
      difference: derived.difference,
      hasDiscrepancy: derived.hasDiscrepancy,
      discrepancyStatus: derived.discrepancyStatus,
      submittedByUserId: existingData?.submittedByUserId ?? authUid,
      submittedByName: existingData?.submittedByName ?? input.userName,
      updatedByUserId: authUid,
      updatedByName: input.userName,
      updatedAt: serverTimestamp(),
      createdAt: existingData?.createdAt ?? serverTimestamp(),
    },
    { merge: true }
  );

  return { recordId, ...derived };
}

export async function saveOpeningCups(input: SaveOpeningInput) {
  const authUid = requireAuthenticatedUserId();
  const recordId = buildCupInventoryRecordId(input.branchName, input.date);
  const branchId = slugifyBranch(input.branchName);
  const ref = doc(db, 'cupInventoryRecords', recordId);

  const existingSnap = await getDoc(ref);
  const existing = existingSnap.exists()
    ? (existingSnap.data() as Partial<CupInventoryRecord>)
    : null;

  await setDoc(
    ref,
    {
      recordId,
      branchId,
      branchName: input.branchName,
      date: input.date,
      openingCups: input.openingCups,
      openingConfirmed: true,
      submittedByUserId: existing?.submittedByUserId ?? authUid,
      submittedByName: existing?.submittedByName ?? input.userName,
      updatedByUserId: authUid,
      updatedByName: input.userName,
      updatedAt: serverTimestamp(),
      createdAt: existing?.createdAt ?? serverTimestamp(),
    },
    { merge: true }
  );

  return { recordId };
}

export async function saveClosingCups(input: SaveClosingInput) {
  const authUid = requireAuthenticatedUserId();
  const recordId = buildCupInventoryRecordId(input.branchName, input.date);
  const ref = doc(db, 'cupInventoryRecords', recordId);

  const existingSnap = await getDoc(ref);
  const existing = existingSnap.exists()
    ? (existingSnap.data() as Partial<CupInventoryRecord>)
    : null;

  const openingCups = toSafeCount(existing?.openingCups);
  const derived = computeCupInventory(openingCups, input.cupsSoldToday, input.actualEndingCups);

  await setDoc(
    ref,
    {
      cupsSoldToday: input.cupsSoldToday,
      actualEndingCups: input.actualEndingCups,
      expectedEndingCups: derived.expectedEndingCups,
      difference: derived.difference,
      hasDiscrepancy: derived.hasDiscrepancy,
      discrepancyStatus: derived.discrepancyStatus,
      closingConfirmed: true,
      updatedByUserId: authUid,
      updatedByName: input.userName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { recordId, ...derived };
}

export function subscribeCupInventoryRecords(
  onData: (records: CupInventoryRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'cupInventoryRecords'), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((d) =>
        normalizeRecord(d.id, d.data() as Partial<CupInventoryRecord>)
      );
      onData(records);
    },
    (error) => {
      console.error('cupInventoryRecords subscription failed', error);
      onError?.(error);
    }
  );
}
