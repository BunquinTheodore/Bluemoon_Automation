import type { Timestamp } from 'firebase-admin/firestore';

export interface TaskPhoto {
  employeeName: string;
  taskName: string;
  photoUrl: string;
  timestamp?: Timestamp | { seconds: number } | Date | null;
}

export interface EmailTemplateData {
  date: string;
  managerName: string;
  dailyEarnings: number;
  netSales: number;
  openingTotal: number;
  closingTotal: number;
  managerFund: number;
  expenses: string;
  openingImageUrl?: string;
  closingImageUrl?: string;
  managerFundImageUrl?: string;
  taskPhotos: TaskPhoto[];
}

const BUSINESS_TZ = 'Asia/Manila';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only allow http(s) URLs to be embedded as image sources. */
function safeUrl(url: string | undefined): string | null {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return escapeHtml(url);
}

function formatCurrency(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTimestamp(timestamp: TaskPhoto['timestamp']): string {
  let date: Date | null = null;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp && typeof (timestamp as { seconds?: unknown }).seconds === 'number') {
    date = new Date((timestamp as { seconds: number }).seconds * 1000);
  }
  if (!date || Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString('en-PH', { timeZone: BUSINESS_TZ });
}

function photoOrPlaceholder(url: string | undefined, alt: string): string {
  const src = safeUrl(url);
  return src
    ? `<img src="${src}" class="photo" alt="${escapeHtml(alt)}" />`
    : '<p style="color: #9ca3af;">No photo available</p>';
}

export function generateEmailTemplate(data: EmailTemplateData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          padding: 30px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
        }
        .section {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background-color: #ffffff;
        }
        .earnings {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-color: #86efac;
        }
        .earnings h2 {
          color: #166534;
          margin: 0;
          font-size: 24px;
        }
        .net-sales {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #93c5fd;
        }
        .net-sales h2 {
          color: #1e40af;
          margin: 0;
          font-size: 24px;
        }
        .section h3 {
          margin-top: 0;
          color: #374151;
        }
        .photo {
          width: 100%;
          max-width: 600px;
          height: auto;
          border-radius: 8px;
          margin-top: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .task-photo {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #06b6d4;
        }
        .task-photo p {
          margin: 5px 0;
        }
        .task-photo strong {
          color: #06b6d4;
        }
        pre {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 4px;
          border-left: 3px solid #06b6d4;
          overflow-x: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          margin-top: 30px;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Daily Report - ${escapeHtml(data.date)}</h1>
          <p>Submitted by: ${escapeHtml(data.managerName)}</p>
        </div>

        <div class="section earnings">
          <h2>💰 Daily Earnings: ₱${formatCurrency(data.dailyEarnings)}</h2>
        </div>

        <div class="section net-sales">
          <h2>📈 Net Sales (after 12% tax): ₱${formatCurrency(data.netSales)}</h2>
        </div>

        <div class="section">
          <h3>Opening Shift: ₱${formatCurrency(data.openingTotal)}</h3>
          ${photoOrPlaceholder(data.openingImageUrl, 'Opening shift financial report')}
        </div>

        <div class="section">
          <h3>Closing Shift: ₱${formatCurrency(data.closingTotal)}</h3>
          ${photoOrPlaceholder(data.closingImageUrl, 'Closing shift financial report')}
        </div>

        <div class="section">
          <h3>Manager Fund: ₱${formatCurrency(data.managerFund)}</h3>
          ${photoOrPlaceholder(data.managerFundImageUrl, 'Manager fund photo')}
        </div>

        <div class="section">
          <h3>💸 Expenses</h3>
          <pre>${escapeHtml(data.expenses || 'No expenses recorded for this date.')}</pre>
        </div>

        <div class="section">
          <h3>📸 Employee Task Completion Photos (${data.taskPhotos.length})</h3>
          ${data.taskPhotos.length > 0 ? data.taskPhotos.map((photo) => `
              <div class="task-photo">
                <p><strong>${escapeHtml(photo.employeeName)}</strong> - ${escapeHtml(photo.taskName)}</p>
                <p><small>Completed at: ${formatTimestamp(photo.timestamp)}</small></p>
                ${photoOrPlaceholder(photo.photoUrl, `${photo.taskName} completion photo`)}
              </div>
            `).join('') : '<p style="color: #9ca3af;">No task photos available for this period.</p>'}
        </div>

        <div class="footer">
          <p><strong>Generated automatically by Bluemoon Automation System</strong></p>
          <p>Generated: ${new Date().toLocaleString('en-PH', { timeZone: BUSINESS_TZ })}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
