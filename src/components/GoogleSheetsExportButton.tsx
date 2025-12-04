/**
 * Google Sheets Export Button Component
 *
 * Simplified single-button interface that auto-handles OAuth authentication
 * and exports financial reports to Google Sheets seamlessly.
 */

import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { type FinancialReport } from '../lib/googleSheets';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { Button } from './ui/button';

export interface GoogleSheetsExportButtonProps {
  report: FinancialReport | null;
  disabled?: boolean;
}

export function GoogleSheetsExportButton({
  report,
  disabled = false,
}: GoogleSheetsExportButtonProps) {
  const {
    isAuthenticated,
    isLoading,
    isInitializing,
    signIn,
    exportReport,
  } = useGoogleSheets();

  /**
   * Handle button click - auto-authenticate if needed, then export
   */
  const handleClick = async () => {
    if (!report) return;

    try {
      // Auto-authenticate if not already signed in
      if (!isAuthenticated) {
        await signIn();
        // After successful sign-in, export will happen automatically
        // via the auth state change listener in useGoogleSheets
      }

      // If already authenticated, export immediately
      if (isAuthenticated) {
        await exportReport(report);
      }
    } catch (error) {
      // Error handling is done in useGoogleSheets hook with toasts
      console.error('Error in export flow:', error);
    }
  };

  /**
   * Determine button state and content
   */
  const getButtonContent = () => {
    // Still initializing Google API
    if (isInitializing) {
      return {
        icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
        text: 'Save to Google Sheets',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed',
      };
    }

    // Loading state (authenticating or exporting)
    if (isLoading) {
      return {
        icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
        text: 'Saving...',
        disabled: true,
        className: 'bg-cyan-600 cursor-not-allowed',
      };
    }

    // No report selected
    if (!report) {
      return {
        icon: <FileSpreadsheet className="w-4 h-4 mr-2" />,
        text: 'Save to Google Sheets',
        disabled: true,
        className: 'bg-cyan-600 opacity-50 cursor-not-allowed',
      };
    }

    // Ready to save (report selected)
    return {
      icon: <FileSpreadsheet className="w-4 h-4 mr-2" />,
      text: 'Save to Google Sheets',
      disabled: disabled,
      className: 'bg-cyan-600 hover:bg-cyan-700',
    };
  };

  const buttonContent = getButtonContent();

  return (
    <Button
      onClick={handleClick}
      disabled={buttonContent.disabled}
      className={`text-white disabled:opacity-50 ${buttonContent.className}`}
      title={
        !report
          ? 'Select a report to save'
          : 'Save this report to Google Sheets'
      }
    >
      {buttonContent.icon}
      {buttonContent.text}
    </Button>
  );
}
