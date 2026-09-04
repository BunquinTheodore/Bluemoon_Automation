/**
 * Cloud Function: sendReportEmailV2
 *
 * Sends financial reports via email using Firebase Extension (Trigger Email from Firestore)
 * with SendGrid as the email service provider
 */

import * as functions from 'firebase-functions';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { generateFinancialReportHTML, formatDate } from '../templates/financialReportEmail';
import { assertOwnerOrManager } from './sendDailyReport';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_RECIPIENT = 'bluemoon.owner.alangilan@gmail.com';

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

interface ShiftFunds {
  cash: number;
  digitalWallet: number;
  bank: number;
  turnoverCash: number;
  turnoverDigital: number;
  turnoverBank: number;
  imageUrl?: string;
  imagePath?: string;
}

function normalizeShift(raw: unknown): ShiftFunds {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    cash: toNumber(r.cash),
    digitalWallet: toNumber(r.digitalWallet),
    bank: toNumber(r.bank),
    turnoverCash: toNumber(r.turnoverCash),
    turnoverDigital: toNumber(r.turnoverDigital),
    turnoverBank: toNumber(r.turnoverBank),
    imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : undefined,
    imagePath: typeof r.imagePath === 'string' ? r.imagePath : undefined,
  };
}

interface FinancialReportData {
  id: string;
  reportId: string;
  managerId: string;
  managerName: string;
  date: string;
  opening: {
    cash: number;
    digitalWallet: number;
    bank: number;
    turnoverCash: number;
    turnoverDigital: number;
    turnoverBank: number;
    imageUrl?: string;
    imagePath?: string;
  };
  closing: {
    cash: number;
    digitalWallet: number;
    bank: number;
    turnoverCash: number;
    turnoverDigital: number;
    turnoverBank: number;
    imageUrl?: string;
    imagePath?: string;
  };
  managerFund: {
    amount: number;
    imageUrl?: string;
    imagePath?: string;
  };
  expenses: string;
  status: string;
  submittedAt: unknown;
}

interface FinancialTotals {
  openingTotal: number;
  closingTotal: number;
  dailyEarnings: number;
  netSales: number;
  openingBreakdown: {
    cash: number;
    digital: number;
    bank: number;
  };
  closingBreakdown: {
    cash: number;
    digital: number;
    bank: number;
  };
}

/**
 * Fetch financial report from Firestore by date
 */
async function fetchFinancialReport(date: string): Promise<FinancialReportData> {
  const reportSnapshot = await db
    .collection('financialReports')
    .where('date', '==', date)
    .limit(1)
    .get();

  if (reportSnapshot.empty) {
    throw new Error(`No financial report found for date: ${date}`);
  }

  const reportDoc = reportSnapshot.docs[0];
  const data = reportDoc.data();

  return {
    id: reportDoc.id,
    reportId: data.reportId || reportDoc.id,
    managerId: data.managerId || '',
    managerName: data.managerName || '',
    date: data.date || '',
    opening: normalizeShift(data.opening),
    closing: normalizeShift(data.closing),
    managerFund: {
      amount: toNumber(data.managerFund?.amount),
      imageUrl: typeof data.managerFund?.imageUrl === 'string' ? data.managerFund.imageUrl : undefined,
      imagePath: typeof data.managerFund?.imagePath === 'string' ? data.managerFund.imagePath : undefined,
    },
    expenses: typeof data.expenses === 'string' ? data.expenses : '',
    status: data.status || 'pending',
    submittedAt: data.submittedAt
  };
}

/**
 * Calculate financial totals from report data
 */
function calculateTotals(report: FinancialReportData): FinancialTotals {
  const openingTotal =
    (report.opening.cash + report.opening.turnoverCash) +
    (report.opening.digitalWallet + report.opening.turnoverDigital) +
    (report.opening.bank + report.opening.turnoverBank);

  const closingTotal =
    (report.closing.cash + report.closing.turnoverCash) +
    (report.closing.digitalWallet + report.closing.turnoverDigital) +
    (report.closing.bank + report.closing.turnoverBank);

  const dailyEarnings = openingTotal + closingTotal;
  const netSales = dailyEarnings * 0.88;

  return {
    openingTotal,
    closingTotal,
    dailyEarnings,
    netSales,
    openingBreakdown: {
      cash: report.opening.cash + report.opening.turnoverCash,
      digital: report.opening.digitalWallet + report.opening.turnoverDigital,
      bank: report.opening.bank + report.opening.turnoverBank
    },
    closingBreakdown: {
      cash: report.closing.cash + report.closing.turnoverCash,
      digital: report.closing.digitalWallet + report.closing.turnoverDigital,
      bank: report.closing.bank + report.closing.turnoverBank
    }
  };
}

/**
 * Callable Cloud Function to send financial report email
 *
 * @param data - { date: "YYYY-MM-DD" }
 * @param context - Firebase auth context
 */
export const sendReportEmailV2 = functions
  .region('asia-southeast1')
  .https.onCall(async (data: { date?: unknown } | null, context) => {
    try {
      await assertOwnerOrManager(context);

      const date = data?.date;
      if (typeof date !== 'string' || !DATE_REGEX.test(date)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Date parameter required (format: YYYY-MM-DD)'
        );
      }

      console.log('sendReportEmailV2: fetching financial report for date:', date);

      const report = await fetchFinancialReport(date);
      const totals = calculateTotals(report);
      const htmlBody = generateFinancialReportHTML(report, totals);

      const recipientEmail = process.env.OWNER_EMAIL || DEFAULT_RECIPIENT;
      const formattedDate = formatDate(date);

      // Create email document in emailQueue collection
      // Firebase Extension will detect this and send the email
      const emailDoc = await db.collection('emailQueue').add({
        to: [recipientEmail],
        message: {
          subject: `Daily Financial Report - ${formattedDate}`,
          html: htmlBody,
          text: `Financial report for ${date}. Please view this email in an HTML-compatible email client.`
        },
        // Metadata for tracking
        reportId: report.reportId,
        reportDate: report.date,
        sentBy: context.auth?.uid || 'manual',
        createdAt: Timestamp.now()
      });

      console.log(`Email document created with ID: ${emailDoc.id}`);

      // Wait briefly for extension to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check delivery status
      const emailStatus = await emailDoc.get();
      const emailData = emailStatus.data();
      const delivery = emailData?.delivery;

      console.log('Email delivery status:', delivery?.state || 'PENDING');

      if (delivery?.state === 'ERROR') {
        console.error('Email delivery error:', delivery.error);
        throw new functions.https.HttpsError(
          'internal',
          `Email sending failed: ${delivery.error || 'Unknown error'}`
        );
      }

      return {
        success: true,
        message: 'Email queued successfully',
        sentTo: recipientEmail,
        emailId: emailDoc.id,
        deliveryState: delivery?.state || 'PENDING',
        date,
        reportId: report.reportId
      };
    } catch (error) {
      console.error('Error in sendReportEmailV2:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Failed to send email';
      const code = message.startsWith('No financial report found') ? 'not-found' : 'internal';
      throw new functions.https.HttpsError(code, message);
    }
  });
