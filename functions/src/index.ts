/**
 * Firebase Cloud Functions for Bluemoon Automation
 *
 * This module exports all cloud functions:
 * 1. cleanupOldPhotos - Scheduled function (daily at 12:00 AM Asia/Manila) to delete photos older than 24 hours
 * 2. sendDailyReport - Scheduled function (daily at 11:59 PM) to email financial reports
 * 3. sendReportManual - Callable function (Postmark) to manually send reports from the UI
 * 4. sendReportEmailV2 - Callable function (Trigger Email extension) to send reports from the UI
 */

// Import and export photo cleanup function
export { cleanupOldPhotos } from './functions/cleanupPhotos';

// Import and export email report functions
export { sendDailyReport, sendReportManual } from './functions/sendDailyReport';

// Email function backed by the Trigger Email from Firestore extension
export { sendReportEmailV2 } from './functions/sendReportEmailV2';
