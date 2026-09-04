/**
 * React Hook for Google Sheets Integration
 *
 * Manages authentication state, loading states, and export operations
 * for Google Sheets API.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  exportReportToSheets,
  getSheetUrl,
  initializeGoogleAPI,
  isAuthenticated as hasValidToken,
  signInToGoogle,
  signOut,
  type FinancialReport,
} from '../lib/googleSheets';

export interface UseGoogleSheetsReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  /** Resolves to true when a valid token is available afterwards. */
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  exportReport: (report: FinancialReport) => Promise<void>;
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function useGoogleSheets(): UseGoogleSheetsReturn {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Initialize Google API on mount
  useEffect(() => {
    mountedRef.current = true;

    initializeGoogleAPI()
      .then(() => {
        if (mountedRef.current) {
          setAuthenticated(hasValidToken());
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to initialize Google API:', err);
        if (mountedRef.current) {
          setError(messageOf(err, 'Failed to initialize Google Sheets'));
        }
      })
      .finally(() => {
        if (mountedRef.current) {
          setIsInitializing(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Sign in to Google
   */
  const handleSignIn = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await signInToGoogle();
      if (mountedRef.current) setAuthenticated(true);
      toast.success('Connected to Google Sheets!');
      return true;
    } catch (err: unknown) {
      const errorMessage = messageOf(err, 'Failed to sign in');
      if (mountedRef.current) setError(errorMessage);
      if (errorMessage === 'Sign-in cancelled') {
        toast.info(errorMessage);
      } else {
        toast.error(errorMessage);
      }
      return false;
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  /**
   * Sign out from Google
   */
  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut();
      if (mountedRef.current) setAuthenticated(false);
      toast.success('Disconnected from Google Sheets');
    } catch (err: unknown) {
      const errorMessage = messageOf(err, 'Failed to sign out');
      if (mountedRef.current) setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  /**
   * Export financial report to Google Sheets
   */
  const handleExportReport = useCallback(async (report: FinancialReport) => {
    // Check the live token rather than React state so a sign-in that just
    // completed (or a token that just expired) is reflected immediately.
    if (!hasValidToken()) {
      if (mountedRef.current) setAuthenticated(false);
      toast.error('Please connect to Google Sheets first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await exportReportToSheets(report);

      const sheetUrl = getSheetUrl();
      toast.success('Exported to Google Sheets!', {
        description: `Report for ${report.date} has been saved`,
        action: {
          label: 'View Sheet',
          onClick: () => window.open(sheetUrl, '_blank', 'noopener,noreferrer'),
        },
        duration: 5000,
      });
    } catch (err: unknown) {
      const errorMessage = messageOf(err, 'Failed to export report');

      if (errorMessage.includes('Export cancelled')) {
        toast.info('Export cancelled');
      } else {
        if (mountedRef.current) {
          setError(errorMessage);
          // A 401/403 clears the stored token; reflect that in the UI
          setAuthenticated(hasValidToken());
        }
        toast.error(errorMessage, { duration: 5000 });
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated: authenticated,
    isLoading,
    isInitializing,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
    exportReport: handleExportReport,
  };
}
