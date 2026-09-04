/**
 * Email Template Generator for Financial Reports
 *
 * Generates professional HTML email with financial data and embedded Cloudinary images
 */

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
  };
  closing: {
    cash: number;
    digitalWallet: number;
    bank: number;
    turnoverCash: number;
    turnoverDigital: number;
    turnoverBank: number;
    imageUrl?: string;
  };
  managerFund: {
    amount: number;
    imageUrl?: string;
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
 * Escape a value for safe interpolation into HTML.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Only allow http(s) URLs in image tags.
 */
export function safeUrl(url: string | undefined): string | null {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return escapeHtml(url);
}

/**
 * Format number as Philippine Peso currency (NaN-safe)
 */
export function formatCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `₱${safe.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  // Parse YYYY-MM-DD as a local calendar date (avoids UTC shift on `new Date('YYYY-MM-DD')`)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(dateString);
  if (Number.isNaN(date.getTime())) return escapeHtml(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate complete HTML email template
 */
export function generateFinancialReportHTML(
  report: FinancialReportData,
  totals: FinancialTotals
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Report - ${escapeHtml(report.date)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f7fa;
      color: #333333;
    }
    .email-container {
      max-width: 700px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 32px 24px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-card {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      color: #ffffff;
      padding: 24px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    .summary-card-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #0891b2;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .data-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .data-card-title {
      font-size: 16px;
      font-weight: 600;
      color: #0891b2;
      margin-bottom: 12px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      font-size: 14px;
      color: #6b7280;
    }
    .data-value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .data-total {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid #0891b2;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .data-total-label {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .data-total-value {
      font-size: 24px;
      font-weight: 700;
      color: #0891b2;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    .photo-card {
      text-align: center;
    }
    .photo-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      margin-bottom: 8px;
    }
    .photo-label {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
    }
    .photo-placeholder {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f3f4f6;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      color: #9ca3af;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .expenses-box {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 20px;
    }
    .expenses-text {
      font-size: 14px;
      color: #991b1b;
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 4px 0;
      font-size: 14px;
      color: #6b7280;
    }

    @media only screen and (max-width: 600px) {
      .summary-cards,
      .data-grid,
      .photo-grid {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 24px;
      }
      .summary-card-value {
        font-size: 28px;
      }
      .photo-card img,
      .photo-placeholder {
        height: 250px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📊 Daily Financial Report</h1>
      <p>${formatDate(report.date)}</p>
      <p style="font-size: 14px; margin-top: 4px;">Submitted by ${escapeHtml(report.managerName)}</p>
    </div>

    <div class="content">
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-card-label">💰 Daily Earnings</div>
          <div class="summary-card-value">${formatCurrency(totals.dailyEarnings)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">📈 Net Sales (88%)</div>
          <div class="summary-card-value">${formatCurrency(totals.netSales)}</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">💵 Shift Financial Summary</h2>
        <div class="data-grid">
          <div class="data-card">
            <div class="data-card-title">Opening Shift</div>
            <div class="data-row">
              <span class="data-label">Cash</span>
              <span class="data-value">${formatCurrency(totals.openingBreakdown.cash)}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Digital Wallet</span>
              <span class="data-value">${formatCurrency(totals.openingBreakdown.digital)}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Bank Amount</span>
              <span class="data-value">${formatCurrency(totals.openingBreakdown.bank)}</span>
            </div>
            <div class="data-total">
              <span class="data-total-label">Net Total</span>
              <span class="data-total-value">${formatCurrency(totals.openingTotal)}</span>
            </div>
          </div>

          <div class="data-card">
            <div class="data-card-title">Closing Shift</div>
            <div class="data-row">
              <span class="data-label">Cash</span>
              <span class="data-value">${formatCurrency(totals.closingBreakdown.cash)}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Digital Wallet</span>
              <span class="data-value">${formatCurrency(totals.closingBreakdown.digital)}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Bank Amount</span>
              <span class="data-value">${formatCurrency(totals.closingBreakdown.bank)}</span>
            </div>
            <div class="data-total">
              <span class="data-total-label">Net Total</span>
              <span class="data-total-value">${formatCurrency(totals.closingTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">💼 Manager Fund</h2>
        <div class="data-card">
          <div class="data-row">
            <span class="data-label">Fund Amount</span>
            <span class="data-total-value">${formatCurrency(report.managerFund.amount)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">💸 Daily Expenses</h2>
        <div class="expenses-box">
          <div class="expenses-text">${report.expenses ? escapeHtml(report.expenses) : 'No expenses recorded for this date.'}</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📸 Financial Report Photos</h2>
        <div class="photo-grid">
          ${safeUrl(report.opening.imageUrl) ? `
          <div class="photo-card">
            <img src="${safeUrl(report.opening.imageUrl)}" alt="Opening Shift Photo" />
            <div class="photo-label">Opening Shift</div>
          </div>
          ` : `
          <div class="photo-card">
            <div class="photo-placeholder">No photo available</div>
            <div class="photo-label">Opening Shift</div>
          </div>
          `}

          ${safeUrl(report.closing.imageUrl) ? `
          <div class="photo-card">
            <img src="${safeUrl(report.closing.imageUrl)}" alt="Closing Shift Photo" />
            <div class="photo-label">Closing Shift</div>
          </div>
          ` : `
          <div class="photo-card">
            <div class="photo-placeholder">No photo available</div>
            <div class="photo-label">Closing Shift</div>
          </div>
          `}

          ${safeUrl(report.managerFund.imageUrl) ? `
          <div class="photo-card">
            <img src="${safeUrl(report.managerFund.imageUrl)}" alt="Manager Fund Photo" />
            <div class="photo-label">Manager Fund</div>
          </div>
          ` : `
          <div class="photo-card">
            <div class="photo-placeholder">No photo available</div>
            <div class="photo-label">Manager Fund</div>
          </div>
          `}
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Bluemoon Business Management System</strong></p>
      <p>Automated Financial Reporting</p>
      <p style="font-size: 12px; margin-top: 12px;">© ${new Date().getFullYear()} Bluemoon. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
