import * as postmark from 'postmark';
import { escapeHtml, formatCurrency, formatDate, safeUrl } from '../templates/financialReportEmail';

/**
 * Postmark email service for sending transactional emails.
 * Server token is read from POSTMARK_SERVER_TOKEN; sender from POSTMARK_SENDER_EMAIL.
 */

export interface FinancialReport {
  date: string;
  dailyEarnings: number;
  openingFund: {
    amount: number;
    photoUrl?: string;
  };
  closingFund: {
    amount: number;
    photoUrl?: string;
  };
  managerFund: {
    amount: number;
    photoUrl?: string;
  };
  expenses: Array<{
    category: string;
    amount: number;
    description?: string;
  }>;
}

export interface TaskPhoto {
  id: string;
  employeeName: string;
  timestamp: Date;
  photoUrl: string;
  taskName?: string;
}

/**
 * Generate HTML email template for daily financial report
 */
function generateReportEmailHTML(
  report: FinancialReport,
  taskPhotos: TaskPhoto[]
): string {
  const netSales = report.dailyEarnings * 0.88; // 88% after 12% tax
  const totalExpenses = report.expenses.reduce((sum, exp) => sum + (Number.isFinite(exp.amount) ? exp.amount : 0), 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Financial Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      background: white;
      border-radius: 8px;
      padding: 25px;
      margin-top: 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }
    .fund-item {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .fund-item h4 {
      margin: 0 0 10px;
      color: #667eea;
      font-size: 16px;
    }
    .fund-amount {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }
    .fund-photo {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-top: 10px;
    }
    .expense-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .expense-item {
      background: #f9f9f9;
      padding: 12px 15px;
      border-radius: 6px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .expense-category {
      font-weight: 600;
      color: #667eea;
    }
    .expense-amount {
      font-weight: 700;
      color: #333;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }
    .photo-card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }
    .photo-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .photo-info {
      font-size: 12px;
      color: #666;
    }
    .photo-info strong {
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 20px;
      font-size: 14px;
      opacity: 0.9;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .container {
        padding: 15px;
      }
      .stat-card {
        padding: 15px;
      }
      .stat-value {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Financial Report</h1>
      <p>${formatDate(report.date)}</p>
    </div>

    <div class="content">
      <!-- Summary Statistics -->
      <div class="section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">💰 Daily Earnings</div>
            <div class="stat-value">${formatCurrency(report.dailyEarnings)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">📈 Net Sales (88%)</div>
            <div class="stat-value">${formatCurrency(netSales)}</div>
          </div>
        </div>
      </div>

      <!-- Funds Details -->
      <div class="section">
        <h3 class="section-title">💵 Funds Breakdown</h3>

        <div class="fund-item">
          <h4>Opening Shift</h4>
          <div class="fund-amount">${formatCurrency(report.openingFund.amount)}</div>
          ${safeUrl(report.openingFund.photoUrl) ? `<img src="${safeUrl(report.openingFund.photoUrl)}" alt="Opening Shift Photo" class="fund-photo">` : ''}
        </div>

        <div class="fund-item">
          <h4>Closing Shift</h4>
          <div class="fund-amount">${formatCurrency(report.closingFund.amount)}</div>
          ${safeUrl(report.closingFund.photoUrl) ? `<img src="${safeUrl(report.closingFund.photoUrl)}" alt="Closing Shift Photo" class="fund-photo">` : ''}
        </div>

        <div class="fund-item">
          <h4>Manager Fund</h4>
          <div class="fund-amount">${formatCurrency(report.managerFund.amount)}</div>
          ${safeUrl(report.managerFund.photoUrl) ? `<img src="${safeUrl(report.managerFund.photoUrl)}" alt="Manager Fund Photo" class="fund-photo">` : ''}
        </div>
      </div>

      <!-- Expenses -->
      ${report.expenses.length > 0 ? `
      <div class="section">
        <h3 class="section-title">💸 Expenses (Total: ${formatCurrency(totalExpenses)})</h3>
        <ul class="expense-list">
          ${report.expenses.map(expense => `
            <li class="expense-item">
              <div>
                <span class="expense-category">${escapeHtml(expense.category)}</span>
                ${expense.description ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${escapeHtml(expense.description)}</div>` : ''}
              </div>
              <span class="expense-amount">${formatCurrency(expense.amount)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Task Completion Photos -->
      ${taskPhotos.length > 0 ? `
      <div class="section">
        <h3 class="section-title">📸 Employee Task Completions (Last 24 Hours)</h3>
        <div class="photo-grid">
          ${taskPhotos.filter(photo => safeUrl(photo.photoUrl)).map(photo => `
            <div class="photo-card">
              <img src="${safeUrl(photo.photoUrl)}" alt="Task completion by ${escapeHtml(photo.employeeName)}">
              <div class="photo-info">
                <strong>${escapeHtml(photo.employeeName)}</strong>
                ${photo.taskName ? `<div>${escapeHtml(photo.taskName)}</div>` : ''}
                <div>${new Date(photo.timestamp).toLocaleString('en-US', {
                  timeZone: 'Asia/Manila',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>Generated automatically by Bluemoon Automation System</p>
      <p>© ${new Date().getFullYear()} Bluemoon Business Management</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send daily financial report email via Postmark
 */
export async function sendDailyReportEmail(
  report: FinancialReport,
  taskPhotos: TaskPhoto[],
  recipientEmail: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const serverToken = process.env.POSTMARK_SERVER_TOKEN;
    const senderEmail = process.env.POSTMARK_SENDER_EMAIL || 'noreply@bluemoon.com';

    if (!serverToken) {
      throw new Error('POSTMARK_SERVER_TOKEN environment variable not set');
    }

    const client = new postmark.ServerClient(serverToken);

    const htmlBody = generateReportEmailHTML(report, taskPhotos);
    const netSales = report.dailyEarnings * 0.88;

    const result = await client.sendEmail({
      From: senderEmail,
      To: recipientEmail,
      Subject: `Daily Financial Report - ${report.date}`,
      HtmlBody: htmlBody,
      TextBody: `
Daily Financial Report - ${report.date}

Daily Earnings: ${formatCurrency(report.dailyEarnings)}
Net Sales (88%): ${formatCurrency(netSales)}

Opening Fund: ${formatCurrency(report.openingFund.amount)}
Closing Fund: ${formatCurrency(report.closingFund.amount)}
Manager Fund: ${formatCurrency(report.managerFund.amount)}

Total Expenses: ${formatCurrency(report.expenses.reduce((sum, exp) => sum + exp.amount, 0))}

Task Photos: ${taskPhotos.length} photos included

Generated by Bluemoon Automation System
      `.trim(),
      MessageStream: 'outbound'
    });

    console.log('Email sent successfully via Postmark:', result.MessageID);

    return {
      success: true,
      messageId: result.MessageID
    };
  } catch (error) {
    console.error('Error sending email via Postmark:', error);
    return {
      success: false,
      error: error instanceof Error && error.message ? error.message : 'Failed to send email'
    };
  }
}
