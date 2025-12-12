/**
 * Google Sheets API Integration with Google Identity Services (GIS)
 *
 * Provides OAuth authentication and export functionality for financial reports
 * to Google Sheets using the new GIS library (replaces deprecated gapi.auth2).
 *
 * Migration from gapi.auth2 to Google Identity Services completed.
 */

/// <reference types="gapi" />
/// <reference types="gapi.client.sheets" />

// Add global type declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
          revoke: (accessToken: string, callback?: () => void) => void;
        };
      };
    };
  }
}

// Environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

// Token client and access token (GIS)
let tokenClient: any = null;
let accessToken: string | null = null;

// LocalStorage keys for token persistence
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'google_sheets_access_token',
  TOKEN_EXPIRY: 'google_sheets_token_expiry',
};

/**
 * Save access token to localStorage with expiry timestamp
 */
function saveToken(token: string): void {
  const expiryTime = Date.now() + (3600 * 1000); // 1 hour from now
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  console.log('Token saved to localStorage, expires:', new Date(expiryTime).toLocaleString());
}

/**
 * Load access token from localStorage (returns null if expired or missing)
 */
function loadToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

  if (!token || !expiry) {
    return null;
  }

  // Check if token is expired
  if (Date.now() >= parseInt(expiry)) {
    console.log('Token expired, clearing localStorage');
    clearToken();
    return null;
  }

  return token;
}

/**
 * Clear stored token from localStorage
 */
function clearToken(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  console.log('Token cleared from localStorage');
}

/**
 * Check if a valid token exists in localStorage
 */
function isTokenValid(): boolean {
  const token = loadToken();
  return token !== null;
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
  submittedAt: any;
}

/**
 * Load Google API script (gapi)
 */
async function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof gapi !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.body.appendChild(script);
  });
}

/**
 * Load Google Identity Services script (GIS)
 */
async function loadGISScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.body.appendChild(script);
  });
}

/**
 * Initialize Google API client (NEW: GIS-based)
 */
export async function initializeGoogleAPI(): Promise<void> {
  try {
    // Check if environment variables are configured
    if (!CLIENT_ID || !SHEET_ID) {
      const missingVars = [];
      if (!CLIENT_ID) missingVars.push('VITE_GOOGLE_OAUTH_CLIENT_ID');
      if (!SHEET_ID) missingVars.push('VITE_GOOGLE_SHEET_ID');
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Step 1: Load gapi script
    await loadGapiScript();

    // Step 2: Initialize gapi client (WITHOUT auth - important!)
    await new Promise<void>((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          // Initialize WITHOUT clientId and scope (GIS handles auth)
          await gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    // Step 3: Load GIS script
    await loadGISScript();

    // Step 4: Initialize token client (GIS)
    if (!window.google?.accounts) {
      throw new Error('Google Identity Services not loaded');
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // Will be set dynamically in signInToGoogle
    });

    // Try to load stored token from localStorage
    const storedToken = loadToken();
    if (storedToken) {
      accessToken = storedToken;
      gapi.client.setToken({ access_token: storedToken });
      console.log('Restored token from localStorage');
    } else {
      console.log('No stored token found');
    }

    console.log('Google API initialized successfully with GIS');
  } catch (error: any) {
    console.error('Error initializing Google API:', error);
    throw new Error(
      error.message || 'Failed to initialize Google Sheets API. Please check your configuration.'
    );
  }
}

/**
 * Check if user is authenticated (has valid access token)
 */
export function isAuthenticated(): boolean {
  // Check memory first
  if (accessToken !== null && accessToken !== '') {
    return true;
  }

  // Check localStorage if memory is empty
  const storedToken = loadToken();
  if (storedToken) {
    accessToken = storedToken;
    gapi.client.setToken({ access_token: storedToken });
    return true;
  }

  return false;
}

/**
 * Sign in to Google (triggers OAuth popup) - NEW: GIS-based with token persistence
 */
export async function signInToGoogle(): Promise<void> {
  // First, check if we already have a valid token
  if (isTokenValid() && accessToken) {
    console.log('Using existing valid token from localStorage');
    return; // Skip OAuth popup
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized. Call initializeGoogleAPI first.'));
      return;
    }

    try {
      // Set callback for token response
      tokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error));
          return;
        }

        // Store access token in memory
        accessToken = tokenResponse.access_token;

        // Save token to localStorage
        saveToken(tokenResponse.access_token);

        // Set token for gapi client
        gapi.client.setToken({
          access_token: tokenResponse.access_token,
        });

        console.log('Successfully signed in with Google and saved token');
        resolve();
      };

      // Request access token (triggers OAuth popup)
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (error: any) {
      if (error.message && error.message.includes('popup')) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
      } else {
        reject(new Error(error.message || 'Failed to sign in with Google'));
      }
    }
  });
}

/**
 * Sign out from Google - NEW: GIS-based with token persistence
 */
export async function signOut(): Promise<void> {
  try {
    if (accessToken && window.google?.accounts) {
      // Revoke the token
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Token revoked successfully');
      });
    }

    // Clear memory
    accessToken = null;

    // Clear localStorage
    clearToken();

    // Clear gapi token
    gapi.client.setToken(null as any);

    console.log('Signed out and cleared stored token');
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Calculate financial totals from report
 */
function calculateTotals(report: FinancialReport) {
  const openingCashTotal = report.opening.cash + report.opening.turnoverCash;
  const openingDigitalTotal = report.opening.digitalWallet + report.opening.turnoverDigital;
  const openingBankTotal = report.opening.bank + report.opening.turnoverBank;
  const openingTotal = openingCashTotal + openingDigitalTotal + openingBankTotal;

  const closingCashTotal = report.closing.cash + report.closing.turnoverCash;
  const closingDigitalTotal = report.closing.digitalWallet + report.closing.turnoverDigital;
  const closingBankTotal = report.closing.bank + report.closing.turnoverBank;
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
export function formatReportToRow(report: FinancialReport): any[] {
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

/**
 * Check if report already exists in Google Sheets (duplicate detection)
 */
export async function checkDuplicateReport(date: string): Promise<boolean> {
  try {
    // Ensure we have a valid token
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Set token before API call
    gapi.client.setToken({ access_token: accessToken });

    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
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
    // Check authentication
    if (!isAuthenticated()) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    // Ensure token is set
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Set token before API calls
    gapi.client.setToken({ access_token: accessToken });

    // Check for duplicates
    const isDuplicate = await checkDuplicateReport(report.date);
    if (isDuplicate) {
      const confirmed = window.confirm(
        `A report for ${report.date} already exists in Google Sheets. Do you want to export it again?`
      );
      if (!confirmed) {
        throw new Error('Export cancelled - duplicate report');
      }
    }

    // Format report data
    const rowData = formatReportToRow(report);

    // Append to Google Sheets
    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Financial Reports!A:AE',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    });

    console.log('Export successful:', response);

    if (!response.result.updates) {
      throw new Error('Failed to append data to sheet');
    }
  } catch (error: any) {
    console.error('Error exporting to Google Sheets:', error);

    // Handle specific error cases
    if (error.status === 401 || error.status === 403) {
      // Token might be invalid - clear stored token
      console.log('Token invalid (401/403), clearing localStorage');
      clearToken();
      accessToken = null;
      throw new Error('Access denied. Please re-authenticate.');
    } else if (error.status === 404) {
      throw new Error('Google Sheet not found. Please check the Sheet ID.');
    } else if (error.status === 429) {
      throw new Error('Too many requests. Please wait a minute and try again.');
    } else if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    } else if (error.message === 'Export cancelled - duplicate report') {
      throw error; // Re-throw cancellation
    } else {
      throw new Error(error.message || 'Failed to export to Google Sheets');
    }
  }
}

/**
 * Get the Google Sheet URL for direct access
 */
export function getSheetUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
}
