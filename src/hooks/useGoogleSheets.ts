/**
 * React Hook for Google Sheets Integration
 *
 * Manages authentication state, loading states, and export operations
 * for Google Sheets API.
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  exportReportToSheets,
  getSheetUrl,
  initializeGoogleAPI,
  isAuthenticated,
  signInToGoogle,
  signOut,
  type FinancialReport,
} from '../lib/googleSheets';

export interface UseGoogleSheetsReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  exportReport: (report: FinancialReport) => Promise<void>;
}

export function useGoogleSheets(): UseGoogleSheetsReturn {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google API on mount
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        await initializeGoogleAPI();

        // Check if already authenticated
        if (mounted) {
          const authStatus = isAuthenticated();
          setAuthenticated(authStatus);
          setIsInitializing(false);
        }

        // Listen for auth state changes
        if (window.gapi && window.gapi.auth2) {
          const authInstance = window.gapi.auth2.getAuthInstance();
          if (authInstance) {
            authInstance.isSignedIn.listen((signedIn: boolean) => {
              if (mounted) {
                setAuthenticated(signedIn);
              }
            });
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize Google API:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize Google Sheets');
          setIsInitializing(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Sign in to Google
   */
  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInToGoogle();
      setAuthenticated(true);
      toast.success('Connected to Google Sheets!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out from Google
   */
  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut();
      setAuthenticated(false);
      toast.success('Disconnected from Google Sheets');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign out';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Export financial report to Google Sheets
   */
  const handleExportReport = async (report: FinancialReport) => {
    if (!authenticated) {
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
          onClick: () => window.open(sheetUrl, '_blank'),
        },
        duration: 5000,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to export report';

      // Don't show error toast if user cancelled duplicate export
      if (errorMessage.includes('Export cancelled')) {
        toast.info('Export cancelled');
      } else {
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
