import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, getErrorMessage, isValidDateString, verifyFirebaseToken } from '../lib/firebase-admin';
import { sendReportForDate } from '../lib/daily-report';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Require a Firebase ID token from a signed-in owner.
  const uid = await verifyFirebaseToken(req.headers.authorization);
  if (!uid) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { date } = (req.body ?? {}) as { date?: unknown };
  if (!isValidDateString(date)) {
    return res.status(400).json({ success: false, error: 'A valid date (YYYY-MM-DD) is required' });
  }

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Only owners can request reports' });
    }

    const result = await sendReportForDate(date, 'Manual Report Request');

    if (result.status === 'not_found') {
      return res.status(404).json({ success: false, error: `No financial report found for ${date}` });
    }
    if (result.status === 'no_owner') {
      return res.status(400).json({ success: false, error: 'Owner email not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Report email sent successfully',
      date,
      ...result,
    });
  } catch (error) {
    console.error('Error sending manual report:', error);
    return res.status(500).json({
      success: false,
      error: getErrorMessage(error, 'Failed to send report email'),
    });
  }
}
