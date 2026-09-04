/**
 * Google Sheets API Integration with Google Identity Services (GIS)
 *
 * Provides OAuth authentication and export functionality for financial reports
 * to Google Sheets using the GIS token client (gapi.auth2 is deprecated).
 */

/// <reference types="gapi" />
/// <reference types="gapi.client.sheets" />

// Minimal typings for the GIS OAuth2 token client
interface GisTokenResponse {
  access_token?: string;
  expires_in?: number | string;
  error?: string;
  error_description?: string;
}

interface GisTokenClient {
  callback: (response: GisTokenResponse) => void;
  error_callback?: (error: { type?: string; message?: string }) => void;
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

interface GisTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GisTokenResponse) => void;
  error_callback?: (error: { type?: string; message?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GisTokenClientConfig) => GisTokenClient;
          revoke: (accessToken: string, callback?: () => void) => void;
        };
      };
    };
  }
}

// Environment variables
const CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SHEET_ID: string | undefined = import.meta.env.VITE_GOOGLE_SHEET_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const DEFAULT_TOKEN_LIFETIME_SECONDS = 3600;
// Treat the token as expired slightly early so a request never races expiry.
const EXPIRY_SAFETY_MARGIN_MS = 60 * 1000;

// Token client and access token (GIS)
let tokenClient: GisTokenClient | null = null;
let accessToken: string | null = null;

// LocalStorage keys for token persistence
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'google_sheets_access_token',
  TOKEN_EXPIRY: 'google_sheets_token_expiry',
};

function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, quota) - token stays in memory only
  }
}

function safeStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Save access token to localStorage with expiry timestamp
 */
function saveToken(token: string, expiresInSeconds: number): void {
  const lifetime =
    Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
      ? expiresInSeconds
      : DEFAULT_TOKEN_LIFETIME_SECONDS;
  const expiryTime = Date.now() + lifetime * 1000 - EXPIRY_SAFETY_MARGIN_MS;
  safeStorageSet(STORAGE_KEYS.ACCESS_TOKEN, token);
  safeStorageSet(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
}

/**
 * Load access token from localStorage (returns null if expired or missing)
 */
function loadToken(): string | null {
  const token = safeStorageGet(STORAGE_KEYS.ACCESS_TOKEN);
  const expiry = safeStorageGet(STORAGE_KEYS.TOKEN_EXPIRY);

  if (!token || !expiry) {
    return null;
  }

  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || Date.now() >= expiryMs) {
    clearToken();
    return null;
  }

  return token;
}

/**
 * Clear stored token from localStorage
 */
function clearToken(): void {
  safeStorageRemove(STORAGE_KEYS.ACCESS_TOKEN);
  safeStorageRemove(STORAGE_KEYS.TOKEN_EXPIRY);
}

/**
 * Drop the current token everywhere (memory, storage, gapi client)
 */
function invalidateToken(): void {
  accessToken = null;
  clearToken();
  if (typeof gapi !== 'undefined' && gapi.client) {
    gapi.client.setToken(null);
  }
}

function isGapiClientReady(): boolean {
  return typeof gapi !== 'undefined' && !!gapi.client;
}

// Financial Report interface (matches Firestore structure)
export interface FinancialReport {
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

/**
 * Load an external script once, resolving when it is available
 */
function loadScript(src: string, isLoaded: () => boolean, errorMessage: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isLoaded()) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existing ?? document.createElement('script');

    const onLoad = () => resolve();
    const onError = () => reject(new Error(errorMessage));
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    if (!existing) {
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

function loadGapiScript(): Promise<void> {
  return loadScript(
    'https://apis.google.com/js/api.js',
    () => typeof gapi !== 'undefined',
    'Failed to load Google API script'
  );
}

function loadGISScript(): Promise<void> {
  return loadScript(
    'https://accounts.google.com/gsi/client',
    () => !!window.google?.accounts,
    'Failed to load Google Identity Services'
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  if (error && typeof error === 'object') {
    const e = error as { message?: string; result?: { error?: { message?: string } } };
    return e.result?.error?.message || e.message || fallback;
  }
  return fallback;
}

/**
 * Initialize Google API client (GIS-based)
 */
export async function initializeGoogleAPI(): Promise<void> {
  try {
    if (!CLIENT_ID || !SHEET_ID) {
      const missingVars: string[] = [];
      if (!CLIENT_ID) missingVars.push('VITE_GOOGLE_OAUTH_CLIENT_ID');
      if (!SHEET_ID) missingVars.push('VITE_GOOGLE_SHEET_ID');
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    await loadGapiScript();

    // Initialize gapi client without auth (GIS handles auth)
    await new Promise<void>((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({ discoveryDocs: DISCOVERY_DOCS });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await loadGISScript();

    if (!window.google?.accounts) {
      throw new Error('Google Identity Services not loaded');
    }

    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        // Replaced per request in signInToGoogle
        callback: () => undefined,
      });
    }

    const storedToken = loadToken();
    if (storedToken) {
      accessToken = storedToken;
      gapi.client.setToken({ access_token: storedToken });
    }
  } catch (error) {
    console.error('Error initializing Google API:', error);
    throw new Error(
      getErrorMessage(
        error,
        'Failed to initialize Google Sheets API. Please check your configuration.'
      )
    );
  }
}

/**
 * Check if user is authenticated (has a non-expired access token)
 */
export function isAuthenticated(): boolean {
  const storedToken = loadToken();
  if (!storedToken) {
    // Storage is the source of truth for expiry; drop any stale in-memory token
    accessToken = null;
    return false;
  }

  if (accessToken !== storedToken) {
    accessToken = storedToken;
    if (isGapiClientReady()) {
      gapi.client.setToken({ access_token: storedToken });
    }
  }
  return true;
}

/**
 * Sign in to Google (triggers OAuth popup) with token persistence
 */
export async function signInToGoogle(): Promise<void> {
  if (isAuthenticated()) {
    return; // Valid token already available - skip OAuth popup
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized. Call initializeGoogleAPI first.'));
      return;
    }

    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse.error || !tokenResponse.access_token) {
        reject(
          new Error(
            tokenResponse.error_description ||
              tokenResponse.error ||
              'Google did not return an access token'
          )
        );
        return;
      }

      accessToken = tokenResponse.access_token;
      saveToken(tokenResponse.access_token, Number(tokenResponse.expires_in));
      if (isGapiClientReady()) {
        gapi.client.setToken({ access_token: tokenResponse.access_token });
      }
      resolve();
    };

    // Fires when the popup is blocked or closed without completing sign-in
    tokenClient.error_callback = (error) => {
      if (error?.type === 'popup_failed_to_open') {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
      } else if (error?.type === 'popup_closed') {
        reject(new Error('Sign-in cancelled'));
      } else {
        reject(new Error(error?.message || 'Failed to sign in with Google'));
      }
    };

    try {
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to sign in with Google');
      reject(
        new Error(
          message.toLowerCase().includes('popup')
            ? 'Popup blocked. Please allow popups for this site.'
            : message
        )
      );
    }
  });
}

/**
 * Sign out from Google and clear the persisted token
 */
export async function signOut(): Promise<void> {
  try {
    if (accessToken && window.google?.accounts) {
      window.google.accounts.oauth2.revoke(accessToken);
    }
    invalidateToken();
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Calculate financial totals from report
 */
function calculateTotals(report: FinancialReport) {
  const n = (value: number | undefined | null) => (Number.isFinite(value) ? (value as number) : 0);

  const openingCashTotal = n(report.opening.cash) + n(report.opening.turnoverCash);
  const openingDigitalTotal = n(report.opening.digitalWallet) + n(report.opening.turnoverDigital);
  const openingBankTotal = n(report.opening.bank) + n(report.opening.turnoverBank);
  const openingTotal = openingCashTotal + openingDigitalTotal + openingBankTotal;

  const closingCashTotal = n(report.closing.cash) + n(report.closing.turnoverCash);
  const closingDigitalTotal = n(report.closing.digitalWallet) + n(report.closing.turnoverDigital);
  const closingBankTotal = n(report.closing.bank) + n(report.closing.turnoverBank);
  const closingTotal = closingCashTotal + closingDigitalTotal + closingBankTotal;

  const dailyEarnings = openingTotal + closingTotal;
  const netSales = dailyEarnings * 0.88;

  return {
    openingCashTotal,
    openingDigitalTotal,
    openingBankTotal,
    openingTotal,
    closingCashTotal,
    closingDigitalTotal,
    closingBankTotal,
    closingTotal,
    dailyEarnings,
    netSales,
  };
}

/**
 * Format financial report into row array (31 columns)
 */
export function formatReportToRow(report: FinancialReport): (string | number)[] {
  const totals = calculateTotals(report);

  return [
    report.date,                          // A: Date
    report.managerName,                   // B: Manager Name
    report.managerId,                     // C: Manager ID
    report.status,                        // D: Report Status
    report.opening.cash,                  // E: Opening Cash Base
    report.opening.turnoverCash,          // F: Opening Cash Turnover
    totals.openingCashTotal,              // G: Opening Cash Total
    report.opening.digitalWallet,         // H: Opening Digital Base
    report.opening.turnoverDigital,       // I: Opening Digital Turnover
    totals.openingDigitalTotal,           // J: Opening Digital Total
    report.opening.bank,                  // K: Opening Bank Base
    report.opening.turnoverBank,          // L: Opening Bank Turnover
    totals.openingBankTotal,              // M: Opening Bank Total
    totals.openingTotal,                  // N: Opening Total
    report.closing.cash,                  // O: Closing Cash Base
    report.closing.turnoverCash,          // P: Closing Cash Turnover
    totals.closingCashTotal,              // Q: Closing Cash Total
    report.closing.digitalWallet,         // R: Closing Digital Base
    report.closing.turnoverDigital,       // S: Closing Digital Turnover
    totals.closingDigitalTotal,           // T: Closing Digital Total
    report.closing.bank,                  // U: Closing Bank Base
    report.closing.turnoverBank,          // V: Closing Bank Turnover
    totals.closingBankTotal,              // W: Closing Bank Total
    totals.closingTotal,                  // X: Closing Total
    totals.dailyEarnings,                 // Y: Daily Earnings
    totals.netSales,                      // Z: Net Sales (88%)
    report.managerFund.amount,            // AA: Manager Fund
    report.expenses || '',                // AB: Expenses
    report.opening.imageUrl || '',        // AC: Opening Photo URL
    report.closing.imageUrl || '',        // AD: Closing Photo URL
    report.managerFund.imageUrl || '',    // AE: Manager Fund Photo URL
  ];
}

function getHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as { status?: number; result?: { error?: { code?: number } } };
  return e.status ?? e.result?.error?.code;
}

/**
 * Check if report already exists in Google Sheets (duplicate detection)
 */
export async function checkDuplicateReport(date: string): Promise<boolean> {
  try {
    if (!isAuthenticated() || !accessToken) {
      throw new Error('Not authenticated');
    }

    gapi.client.setToken({ access_token: accessToken });

    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID as string,
      range: 'Financial Reports!A:A', // Check Date column only
    });

    const values = response.result.values;
    if (!values || values.length === 0) {
      return false;
    }

    // Skip header row (index 0) and check if date exists
    const dates = values.slice(1).flat();
    return dates.includes(date);
  } catch (error) {
    const status = getHttpStatus(error);
    if (status === 401 || status === 403) {
      // Let the caller surface the auth failure instead of silently exporting
      throw error;
    }
    console.error('Error checking for duplicates:', error);
    // If we can't check, assume no duplicate to allow export
    return false;
  }
}

/**
 * Export financial report to Google Sheets
 */
export async function exportReportToSheets(report: FinancialReport): Promise<void> {
  try {
    if (!isAuthenticated() || !accessToken) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    gapi.client.setToken({ access_token: accessToken });

    const isDuplicate = await checkDuplicateReport(report.date);
    if (isDuplicate) {
      const confirmed = window.confirm(
        `A report for ${report.date} already exists in Google Sheets. Do you want to export it again?`
      );
      if (!confirmed) {
        throw new Error('Export cancelled - duplicate report');
      }
    }

    const rowData = formatReportToRow(report);

    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID as string,
      range: 'Financial Reports!A:AE',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    });

    if (!response.result.updates) {
      throw new Error('Failed to append data to sheet');
    }
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to export to Google Sheets');
    if (message === 'Export cancelled - duplicate report') {
      throw error; // User cancellation, not a failure
    }

    console.error('Error exporting to Google Sheets:', error);

    const status = getHttpStatus(error);
    if (status === 401 || status === 403) {
      // Token invalid or expired - force re-authentication next time
      invalidateToken();
      throw new Error('Access denied. Please re-authenticate.');
    }
    if (status === 404) {
      throw new Error('Google Sheet not found. Please check the Sheet ID.');
    }
    if (status === 429) {
      throw new Error('Too many requests. Please wait a minute and try again.');
    }
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }
    throw new Error(message);
  }
}

/**
 * Get the Google Sheet URL for direct access
 */
export function getSheetUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID ?? ''}/edit`;
}
