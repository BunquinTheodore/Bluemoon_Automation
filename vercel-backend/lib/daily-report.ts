import sgMail from '@sendgrid/mail';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db, getBusinessDayBounds } from './firebase-admin';
import { generateEmailTemplate, type TaskPhoto } from './email-templates';

const TAX_RATE = 0.12;

interface ShiftTotals {
  cash?: number;
  turnoverCash?: number;
  digitalWallet?: number;
  turnoverDigital?: number;
  bank?: number;
  turnoverBank?: number;
  imageUrl?: string;
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function shiftTotal(shift: ShiftTotals | undefined): number {
  if (!shift) return 0;
  return (
    num(shift.cash) + num(shift.turnoverCash) +
    num(shift.digitalWallet) + num(shift.turnoverDigital) +
    num(shift.bank) + num(shift.turnoverBank)
  );
}

export type ReportResult =
  | { status: 'not_found' }
  | { status: 'no_owner' }
  | { status: 'sent'; sentTo: string; dailyEarnings: number; netSales: number; photosIncluded: number };

/** Builds and emails the financial report for a YYYY-MM-DD business date. */
export async function sendReportForDate(date: string, subjectPrefix: string): Promise<ReportResult> {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (!sendgridKey) throw new Error('SENDGRID_API_KEY is not configured');
  sgMail.setApiKey(sendgridKey);

  const reportSnapshot = await db.collection('financialReports').where('date', '==', date).limit(1).get();
  if (reportSnapshot.empty) return { status: 'not_found' };
  const report = reportSnapshot.docs[0].data();

  const { start, end } = getBusinessDayBounds(date);
  const photosSnapshot = await db
    .collection('taskSubmissions')
    .where('timestamp', '>=', start)
    .where('timestamp', '<', end)
    .orderBy('timestamp', 'desc')
    .get();

  // `deleted` is absent on fresh submissions, so filter in memory rather than with a `!=` query.
  const taskPhotos: TaskPhoto[] = photosSnapshot.docs
    .filter((doc: QueryDocumentSnapshot) => doc.data().deleted !== true)
    .map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        employeeName: typeof data.employeeName === 'string' ? data.employeeName : 'Unknown',
        taskName: typeof data.taskName === 'string' ? data.taskName : 'Unnamed Task',
        photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : '',
        timestamp: data.timestamp ?? null,
      };
    });

  const ownerSnapshot = await db.collection('users').where('role', '==', 'owner').limit(1).get();
  const ownerFromDb = ownerSnapshot.empty ? undefined : ownerSnapshot.docs[0].data().email;
  const ownerEmail = (typeof ownerFromDb === 'string' && ownerFromDb) || process.env.OWNER_EMAIL;
  if (!ownerEmail) return { status: 'no_owner' };

  const senderEmail = process.env.SENDGRID_SENDER_EMAIL;
  if (!senderEmail) throw new Error('SENDGRID_SENDER_EMAIL is not configured');

  const opening = report.opening as ShiftTotals | undefined;
  const closing = report.closing as ShiftTotals | undefined;
  const openingTotal = shiftTotal(opening);
  const closingTotal = shiftTotal(closing);
  const dailyEarnings = openingTotal + closingTotal;
  const netSales = dailyEarnings * (1 - TAX_RATE);

  const html = generateEmailTemplate({
    date,
    managerName: typeof report.managerName === 'string' ? report.managerName : 'Unknown Manager',
    dailyEarnings,
    netSales,
    openingTotal,
    closingTotal,
    managerFund: num(report.managerFund?.amount),
    expenses: typeof report.expenses === 'string' ? report.expenses : '',
    openingImageUrl: opening?.imageUrl,
    closingImageUrl: closing?.imageUrl,
    managerFundImageUrl: typeof report.managerFund?.imageUrl === 'string' ? report.managerFund.imageUrl : undefined,
    taskPhotos,
  });

  await sgMail.send({
    to: ownerEmail,
    from: senderEmail,
    subject: `${subjectPrefix} - ${date} - Bluemoon Automation`,
    html,
  });

  return { status: 'sent', sentTo: ownerEmail, dailyEarnings, netSales, photosIncluded: taskPhotos.length };
}
