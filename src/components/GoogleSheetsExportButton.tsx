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
    error,
    signIn,
    exportReport,
  } = useGoogleSheets();

  /**
   * Handle button click - auto-authenticate if needed, then export
   */
  const handleClick = async () => {
    if (!report) return;

    // Auto-authenticate if not already signed in. signIn resolves to whether a
    // valid token is now available, so we don't rely on stale React state here.
    const ready = isAuthenticated || (await signIn());
    if (!ready) return;

    await exportReport(report);
  };

  const isBusy = isInitializing || isLoading;
  const isDisabled = disabled || isBusy || !report;

  const title = isInitializing
    ? 'Preparing Google Sheets...'
    : !report
      ? 'Select a report to save'
      : error
        ? error
        : 'Save this report to Google Sheets';

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={isBusy}
      className={`text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed ${
        isInitializing ? 'bg-gray-400 hover:bg-gray-400' : ''
      }`}
      title={title}
    >
      {isBusy ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
      ) : (
        <FileSpreadsheet className="w-4 h-4 mr-2" aria-hidden="true" />
      )}
      {isLoading ? 'Saving...' : 'Save to Google Sheets'}
    </Button>
  );
}
