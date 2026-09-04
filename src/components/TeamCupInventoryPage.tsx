import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Coffee, LogOut } from 'lucide-react';
import { User } from '../App';
import {
  CupInventoryRecord,
  buildCupInventoryRecordId,
  saveClosingCups,
  saveOpeningCups,
  subscribeCupInventoryRecords,
} from '../lib/cupInventory';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface TeamCupInventoryPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toNonNegativeInt(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return NaN;
  return n;
}

function getSaveErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  const message = (err as { message?: string } | null)?.message ?? '';

  if (code === 'permission-denied') {
    return 'Permission denied by Firestore. Sign in with Google and ensure updated Firestore rules are deployed.';
  }

  if (message.includes('AUTH_REQUIRED')) {
    return 'You are not authenticated with Firebase. Please sign out and sign in with Google.';
  }

  return 'Failed to save shift data.';
}

export function TeamCupInventoryPage({ user, onBack, onLogout }: TeamCupInventoryPageProps) {
  const [branchName, setBranchName] = useState(user.branch || 'Main Branch');
  const [date, setDate] = useState(todayDateString());
  const [records, setRecords] = useState<CupInventoryRecord[]>([]);

  // Opening shift state
  const [openingCups, setOpeningCups] = useState('');
  const [isSavingOpening, setIsSavingOpening] = useState(false);

  // Closing shift state
  const [cupsSoldToday, setCupsSoldToday] = useState('');
  const [actualEndingCups, setActualEndingCups] = useState('');
  const [isSavingClosing, setIsSavingClosing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeCupInventoryRecords(
      (data) => setRecords(data),
      (error) => {
        console.error('Failed to load cup inventory records', error);
        toast.error('Failed to load existing cup inventory records.');
      }
    );
    return () => unsubscribe();
  }, []);

  const trimmedBranch = branchName.trim();
  const existingRecord = useMemo(() => {
    if (!trimmedBranch || !date) return null;
    const targetId = buildCupInventoryRecordId(trimmedBranch, date);
    return records.find((r) => r.recordId === targetId || r.id === targetId) ?? null;
  }, [records, trimmedBranch, date]);

  // Sync form inputs with the matched record whenever it changes.
  useEffect(() => {
    if (existingRecord) {
      if (existingRecord.openingConfirmed) setOpeningCups(String(existingRecord.openingCups));
      if (existingRecord.closingConfirmed) {
        setCupsSoldToday(String(existingRecord.cupsSoldToday));
        setActualEndingCups(String(existingRecord.actualEndingCups));
      }
    } else {
      setOpeningCups('');
      setCupsSoldToday('');
      setActualEndingCups('');
    }
  }, [existingRecord]);

  const openingConfirmed = existingRecord?.openingConfirmed ?? false;
  const closingConfirmed = existingRecord?.closingConfirmed ?? false;

  const handleSaveOpening = async () => {
    if (!branchName.trim()) { toast.error('Please enter Branch/Store'); return; }
    if (!date) { toast.error('Please select a date'); return; }
    const opening = toNonNegativeInt(openingCups);
    if (Number.isNaN(opening)) { toast.error('Opening Cups must be a valid non-negative whole number'); return; }

    setIsSavingOpening(true);
    try {
      await saveOpeningCups({
        branchName: branchName.trim(),
        date,
        openingCups: opening,
        userId: user.id,
        userName: user.name,
      });
      toast.success('Opening shift confirmed');
    } catch (err) {
      console.error('Failed to save opening shift', err);
      toast.error(getSaveErrorMessage(err));
    } finally {
      setIsSavingOpening(false);
    }
  };

  const handleSaveClosing = async () => {
    if (!branchName.trim()) { toast.error('Please enter Branch/Store'); return; }
    if (!date) { toast.error('Please select a date'); return; }
    if (!openingConfirmed) { toast.error('Confirm the opening shift before closing'); return; }
    const sold = toNonNegativeInt(cupsSoldToday);
    const actual = toNonNegativeInt(actualEndingCups);
    if (Number.isNaN(sold) || Number.isNaN(actual)) {
      toast.error('Please enter valid non-negative whole numbers');
      return;
    }

    setIsSavingClosing(true);
    try {
      const result = await saveClosingCups({
        branchName: branchName.trim(),
        date,
        cupsSoldToday: sold,
        actualEndingCups: actual,
        userId: user.id,
        userName: user.name,
      });
      toast.success('Closing shift confirmed', {
        description: result.hasDiscrepancy
          ? 'Inventory discrepancy detected — please check with your manager.'
          : 'No discrepancy — inventory checks out.',
      });
    } catch (err) {
      console.error('Failed to save closing shift', err);
      toast.error(getSaveErrorMessage(err));
    } finally {
      setIsSavingClosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <Coffee className="w-6 h-6 text-cyan-700" />
                </div>
                <div>
                  <h1 className="text-2xl text-cyan-900">Cup Inventory</h1>
                  <p className="text-sm text-gray-500">Opening &amp; closing shift input</p>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onLogout}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Branch & Date */}
        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle>Branch &amp; Date</CardTitle>
            <CardDescription>Select the branch and date for this cup inventory entry.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch/Store</Label>
                <Input
                  id="branchName"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Enter branch/store name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordDate">Date</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening Shift */}
        <Card className="border-cyan-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Opening Shift</CardTitle>
                <CardDescription className="mt-1">
                  Opening staff: enter the cup count at the start of the day.
                </CardDescription>
              </div>
              {openingConfirmed && (
                <Badge className="bg-green-600 shrink-0">Confirmed</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {openingConfirmed ? (
              <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Opening Cups</p>
                  <p className="text-3xl text-gray-900">{existingRecord?.openingCups}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openingCups">Opening Cups</Label>
                  <Input
                    id="openingCups"
                    type="number"
                    min="0"
                    step="1"
                    value={openingCups}
                    onChange={(e) => setOpeningCups(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSaveOpening}
                  disabled={isSavingOpening}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {isSavingOpening ? 'Saving...' : 'Confirm Opening Shift'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Closing Shift */}
        <Card className="border-cyan-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Closing Shift</CardTitle>
                <CardDescription className="mt-1">
                  Closing staff: enter cups sold today and the manually counted ending cup count.
                </CardDescription>
              </div>
              {closingConfirmed && (
                <Badge className="bg-green-600 shrink-0">Confirmed</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {closingConfirmed ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cups Sold Today</p>
                    <p className="text-3xl text-gray-900">{existingRecord?.cupsSoldToday}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ending Cups (Manual Tally)</p>
                    <p className="text-3xl text-gray-900">{existingRecord?.actualEndingCups}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cupsSoldToday">Cups Sold Today</Label>
                    <Input
                      id="cupsSoldToday"
                      type="number"
                      min="0"
                      step="1"
                      value={cupsSoldToday}
                      onChange={(e) => setCupsSoldToday(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actualEndingCups">Ending Cups (Manual Tally)</Label>
                    <Input
                      id="actualEndingCups"
                      type="number"
                      min="0"
                      step="1"
                      value={actualEndingCups}
                      onChange={(e) => setActualEndingCups(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleSaveClosing}
                  disabled={isSavingClosing || !openingConfirmed}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {isSavingClosing ? 'Saving...' : 'Confirm Closing Shift'}
                </Button>
                {!openingConfirmed && (
                  <p className="text-xs text-gray-500">Confirm the opening shift first to enable closing.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
