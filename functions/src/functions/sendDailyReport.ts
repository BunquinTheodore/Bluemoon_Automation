import * as functions from 'firebase-functions';
import { db, getUserRole } from '../config/firebase-admin';
import { sendDailyReportEmail, FinancialReport, TaskPhoto } from '../services/postmark';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Today's calendar date in Asia/Manila as YYYY-MM-DD.
 * (`toISOString()` would return the UTC date, which is a day behind late at night in Manila.)
 */
export function getManilaDateString(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Verify the caller is signed in and is an owner or manager.
 */
export async function assertOwnerOrManager(context: functions.https.CallableContext): Promise<void> {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to send reports');
  }
  const role = await getUserRole(context.auth.uid);
  if (role !== 'owner' && role !== 'manager') {
    throw new functions.https.HttpsError('permission-denied', 'Only owners and managers can send reports');
  }
}

/**
 * Fetch financial report and task photos for a specific date
 */
async function fetchReportData(dateString: string): Promise<{ report: FinancialReport; taskPhotos: TaskPhoto[] }> {
  console.log(`Fetching report data for date: ${dateString}`);

  const reportSnapshot = await db
    .collection('financialReports')
    .where('date', '==', dateString)
    .limit(1)
    .get();

  if (reportSnapshot.empty) {
    throw new Error(`No financial report found for date: ${dateString}`);
  }

  const reportData = reportSnapshot.docs[0].data();
  const rawExpenses: unknown = reportData.expenses;

  const report: FinancialReport = {
    date: reportData.date || dateString,
    dailyEarnings: toNumber(reportData.dailyEarnings),
    openingFund: {
      amount: toNumber(reportData.openingFund?.amount),
      photoUrl: reportData.openingFund?.photoUrl || undefined,
    },
    closingFund: {
      amount: toNumber(reportData.closingFund?.amount),
      photoUrl: reportData.closingFund?.photoUrl || undefined,
    },
    managerFund: {
      amount: toNumber(reportData.managerFund?.amount),
      photoUrl: reportData.managerFund?.photoUrl || undefined,
    },
    expenses: Array.isArray(rawExpenses)
      ? rawExpenses.map((exp: Record<string, unknown>) => ({
          category: String(exp?.category ?? 'Expense'),
          amount: toNumber(exp?.amount),
          description: exp?.description ? String(exp.description) : undefined,
        }))
      : [],
  };

  // Task completion photos from the last 24 hours (deleted ones filtered in memory)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const taskPhotosSnapshot = await db
    .collection('taskSubmissions')
    .where('timestamp', '>=', twentyFourHoursAgo)
    .orderBy('timestamp', 'desc')
    .get();

  const taskPhotos: TaskPhoto[] = taskPhotosSnapshot.docs
    .map((doc) => {
      const data = doc.data();
      const ts = data.timestamp;
      return {
        id: doc.id,
        employeeName: data.employeeName || 'Unknown',
        timestamp: ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date(),
        photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : '',
        taskName: data.taskName || undefined,
        deleted: data.deleted === true,
      };
    })
    .filter((photo) => photo.photoUrl && !photo.deleted)
    .map(({ deleted: _deleted, ...photo }) => photo);

  console.log(`Found report with ${taskPhotos.length} task photos`);

  return { report, taskPhotos };
}

/**
 * Scheduled function to send daily financial report email
 * Runs daily at 11:59 PM Asia/Manila time
 */
export const sendDailyReport = functions
  .region('asia-southeast1')
  .pubsub.schedule('59 23 * * *')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    try {
      console.log('Starting daily report email job...');

      const ownerEmail = process.env.OWNER_EMAIL;
      if (!ownerEmail) {
        throw new Error('OWNER_EMAIL environment variable not set');
      }

      const dateString = getManilaDateString();
      const { report, taskPhotos } = await fetchReportData(dateString);
      const emailResult = await sendDailyReportEmail(report, taskPhotos, ownerEmail);

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Failed to send email');
      }

      const result = {
        success: true,
        message: 'Daily report email sent successfully',
        sentTo: ownerEmail,
        photosIncluded: taskPhotos.length,
        messageId: emailResult.messageId,
        timestamp: new Date().toISOString(),
      };

      console.log('Daily report email sent:', result);
      return result;
    } catch (error) {
      console.error('Error in sendDailyReport:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send daily report',
        timestamp: new Date().toISOString(),
      };
    }
  });

/**
 * Callable function to manually send a report for a specific date
 * Called from the Owner Sales page when user clicks "Email Report" button
 *
 * @param data - { date: string } - Date in YYYY-MM-DD format
 * @param context - Firebase Auth context (caller must be an owner or manager)
 */
export const sendReportManual = functions
  .region('asia-southeast1')
  .https.onCall(async (data: { date?: unknown } | null, context) => {
    try {
      await assertOwnerOrManager(context);

      const ownerEmail = process.env.OWNER_EMAIL;
      if (!ownerEmail) {
        throw new functions.https.HttpsError('failed-precondition', 'Owner email not configured');
      }

      const date = data?.date;
      if (typeof date !== 'string' || !DATE_REGEX.test(date)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Date parameter is required (format: YYYY-MM-DD)'
        );
      }

      console.log('Manual report send requested for date:', date);

      const { report, taskPhotos } = await fetchReportData(date);
      const emailResult = await sendDailyReportEmail(report, taskPhotos, ownerEmail);

      if (!emailResult.success) {
        throw new functions.https.HttpsError('internal', emailResult.error || 'Failed to send email');
      }

      const result = {
        success: true,
        message: 'Report email sent successfully',
        sentTo: ownerEmail,
        photosIncluded: taskPhotos.length,
        messageId: emailResult.messageId,
        date,
      };

      console.log('Manual report email sent:', result);
      return result;
    } catch (error) {
      console.error('Error in sendReportManual:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Failed to send report email';
      const code = message.startsWith('No financial report found') ? 'not-found' : 'internal';
      throw new functions.https.HttpsError(code, message);
    }
  });
