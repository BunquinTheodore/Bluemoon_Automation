import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Coffee, LogOut } from 'lucide-react';
import { CupInventoryRecord, subscribeCupInventoryRecords } from '../lib/cupInventory';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface OwnerCupInventoryPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function OwnerCupInventoryPage({ onBack, onLogout }: OwnerCupInventoryPageProps) {
  const [records, setRecords] = useState<CupInventoryRecord[]>([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [discrepancyOnly, setDiscrepancyOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCupInventoryRecords(
      (data) => {
        setRecords(data);
        setLoadError(null);
        setIsLoading(false);
      },
      (error) => {
        console.error('Failed to load cup inventory records', error);
        setLoadError('Failed to load cup inventory records. Please try again later.');
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const branchMatch = !branchFilter.trim()
        ? true
        : r.branchName.toLowerCase().includes(branchFilter.trim().toLowerCase());
      const dateMatch = !dateFilter ? true : r.date === dateFilter;
      const discrepancyMatch = discrepancyOnly ? r.hasDiscrepancy : true;
      return branchMatch && dateMatch && discrepancyMatch;
    });
  }, [records, branchFilter, dateFilter, discrepancyOnly]);

  const totalDiscrepancies = filtered.filter((r) => r.hasDiscrepancy).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  <h1 className="text-2xl text-cyan-900">Cup Inventory Tracking</h1>
                  <p className="text-sm text-gray-500">Owner real-time cross-branch monitoring</p>
                </div>
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={onLogout} className="text-gray-700 hover:text-red-600 hover:bg-red-50" title="Logout" aria-label="Logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-cyan-100">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Records (filtered)</p>
              <p className="text-2xl text-cyan-800">{filtered.length}</p>
            </CardContent>
          </Card>
          <Card className="border-red-100">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Discrepancies</p>
              <p className="text-2xl text-red-700">{totalDiscrepancies}</p>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">No Discrepancy</p>
              <p className="text-2xl text-green-700">{filtered.length - totalDiscrepancies}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Monitor by branch/date and focus on discrepancy records.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branchFilter">Branch/Store</Label>
              <Input id="branchFilter" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} placeholder="Filter by branch" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Date</Label>
              <Input id="dateFilter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Discrepancy Filter</Label>
              <Button
                type="button"
                variant={discrepancyOnly ? 'default' : 'outline'}
                aria-pressed={discrepancyOnly}
                onClick={() => setDiscrepancyOnly((v) => !v)}
                className={discrepancyOnly ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {discrepancyOnly ? 'Showing Discrepancies Only' : 'Show All Records'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Result Count</Label>
              <div className="rounded-lg border p-2 text-sm text-gray-700">{filtered.length} record(s)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle>Cross-Branch Records</CardTitle>
            <CardDescription>Historical records for reporting and auditing (read-only).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Branch</th>
                    <th className="py-2 pr-3">Opening</th>
                    <th className="py-2 pr-3">Sold</th>
                    <th className="py-2 pr-3">Expected End</th>
                    <th className="py-2 pr-3">Actual End</th>
                    <th className="py-2 pr-3">Difference</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-3">{r.date}</td>
                      <td className="py-2 pr-3">{r.branchName}</td>
                      <td className="py-2 pr-3">{r.openingCups}</td>
                      <td className="py-2 pr-3">{r.cupsSoldToday}</td>
                      <td className="py-2 pr-3">{r.expectedEndingCups}</td>
                      <td className="py-2 pr-3">{r.actualEndingCups}</td>
                      <td className={`py-2 pr-3 ${r.hasDiscrepancy ? 'text-red-600' : 'text-green-600'}`}>
                        {r.closingConfirmed ? r.difference : '-'}
                      </td>
                      <td className="py-2 pr-3">
                        {r.closingConfirmed ? (
                          <Badge className={r.hasDiscrepancy ? 'bg-red-600' : 'bg-green-600'}>{r.discrepancyStatus}</Badge>
                        ) : (
                          <Badge variant="outline">Pending Closing</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loadError && <p className="text-sm text-red-600 mt-3">{loadError}</p>}
              {!loadError && isLoading && <p className="text-sm text-gray-500 mt-3">Loading records...</p>}
              {!loadError && !isLoading && filtered.length === 0 && (
                <p className="text-sm text-gray-500 mt-3">No records found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
