import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBusinessToday, getErrorMessage, isAuthorizedCronRequest } from '../lib/firebase-admin';
import { sendReportForDate } from '../lib/daily-report';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!isAuthorizedCronRequest(req.headers.authorization)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const today = getBusinessToday();

  try {
    const result = await sendReportForDate(today, 'Daily Report');

    if (result.status === 'not_found') {
      return res.status(200).json({ success: true, message: `No financial report found for ${today}` });
    }
    if (result.status === 'no_owner') {
      return res.status(400).json({
        success: false,
        error: 'Owner email not found in Firestore or environment variables',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Daily report email sent successfully',
      date: today,
      ...result,
    });
  } catch (error) {
    console.error('Error sending daily report:', error);
    return res.status(500).json({
      success: false,
      error: getErrorMessage(error, 'Failed to send daily report email'),
    });
  }
}
