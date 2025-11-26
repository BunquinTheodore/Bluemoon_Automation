import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { ArrowLeft, LogOut, DollarSign, Calendar as CalendarIcon, TrendingUp, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface OwnerSalesPageProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (screen: any, task?: any, recipe?: any, financialReport?: any) => void;
}

interface FinancialReport {
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

export function OwnerSalesPage({ onBack, onLogout, onNavigate }: OwnerSalesPageProps) {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<{ url: string; title: string } | null>(null);

  // Fetch financial reports from Firestore
  useEffect(() => {
    const q = query(collection(db, 'financialReports'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReports: FinancialReport[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          reportId: data.reportId || doc.id,
          managerId: data.managerId || '',
          managerName: data.managerName || '',
          date: data.date || '',
          opening: data.opening || { cash: 0, digitalWallet: 0, bank: 0, turnoverCash: 0, turnoverDigital: 0, turnoverBank: 0 },
          closing: data.closing || { cash: 0, digitalWallet: 0, bank: 0, turnoverCash: 0, turnoverDigital: 0, turnoverBank: 0 },
          managerFund: data.managerFund || { amount: 0 },
          expenses: data.expenses || '',
          status: data.status || 'pending',
          submittedAt: data.submittedAt,
        };
      });

      setReports(loadedReports);
      if (loadedReports.length > 0 && !selectedReport) {
        setSelectedReport(loadedReports[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ESC key listener for closing fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenPhoto) {
        setFullscreenPhoto(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [fullscreenPhoto]);

  // Filter reports by selected date
  const filteredReports = selectedDate
    ? reports.filter(r => r.date === selectedDate.toISOString().split('T')[0])
    : reports;

  // Calculate totals for selected report
  const openingNetCash = selectedReport
    ? selectedReport.opening.cash + selectedReport.opening.turnoverCash
    : 0;

  const openingNetDigital = selectedReport
    ? selectedReport.opening.digitalWallet + selectedReport.opening.turnoverDigital
    : 0;

  const openingNetBank = selectedReport
    ? selectedReport.opening.bank + selectedReport.opening.turnoverBank
    : 0;

  const openingTotal = openingNetCash + openingNetDigital + openingNetBank;

  const closingNetCash = selectedReport
    ? selectedReport.closing.cash + selectedReport.closing.turnoverCash
    : 0;

  const closingNetDigital = selectedReport
    ? selectedReport.closing.digitalWallet + selectedReport.closing.turnoverDigital
    : 0;

  const closingNetBank = selectedReport
    ? selectedReport.closing.bank + selectedReport.closing.turnoverBank
    : 0;

  const closingTotal = closingNetCash + closingNetDigital + closingNetBank;

  const dailyEarnings = openingTotal + closingTotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl text-cyan-900">Sales & Reports</h1>
                  <p className="text-sm text-gray-500">Financial and operational reports</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
          <>
            {/* Date Filter and Reports List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Date Selector */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Filter by Date
                  </CardTitle>
                  <CardDescription>Select a date to filter reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg border shadow-sm"
                  />
                  {selectedDate && (
                    <Button
                      onClick={() => setSelectedDate(undefined)}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      Clear Filter
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Reports List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>
                    {selectedDate
                      ? `Reports for ${selectedDate.toLocaleDateString()}`
                      : `All reports (${reports.length})`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No reports found for the selected date
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredReports.map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedReport(report)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedReport?.id === report.id
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 hover:border-cyan-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {new Date(report.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-sm text-gray-600">By {report.managerName}</p>
                            </div>
                            <Badge variant={report.status === 'approved' ? 'default' : 'outline'}>
                              {report.status}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Selected Report Details */}
            {selectedReport && (
              <>
                {/* Daily Earnings Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Daily Earnings</p>
                          <p className="text-3xl font-bold text-green-700">
                            ₱{dailyEarnings.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(selectedReport.date).toLocaleDateString()}
                          </p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Financial Summary - Opening & Closing Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Opening Shift */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
                      <CardHeader>
                        <CardTitle className="text-cyan-800">Opening Shift</CardTitle>
                        <CardDescription>Morning financial summary (after turnover)</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Cash */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div className="flex flex-col">
                              <span className="text-gray-600">Cash</span>
                              <span className="text-xs text-gray-400">
                                ₱{selectedReport.opening.cash.toLocaleString()} + ₱{selectedReport.opening.turnoverCash.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-lg text-cyan-700 font-semibold">
                              ₱{openingNetCash.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Digital Wallet */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div className="flex flex-col">
                              <span className="text-gray-600">Digital Wallet</span>
                              <span className="text-xs text-gray-400">
                                ₱{selectedReport.opening.digitalWallet.toLocaleString()} + ₱{selectedReport.opening.turnoverDigital.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-lg text-cyan-700 font-semibold">
                              ₱{openingNetDigital.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Bank Amount */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div className="flex flex-col">
                              <span className="text-gray-600">Bank Amount</span>
                              <span className="text-xs text-gray-400">
                                ₱{selectedReport.opening.bank.toLocaleString()} + ₱{selectedReport.opening.turnoverBank.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-lg text-cyan-700 font-semibold">
                              ₱{openingNetBank.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="border-t-2 border-cyan-300 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-semibold">Net Total</span>
                            <span className="text-2xl font-bold text-cyan-800">₱{openingTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

          {/* Closing Shift */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <CardTitle className="text-orange-800">Closing Shift</CardTitle>
                <CardDescription>Evening financial summary (after turnover)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cash */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-600">Cash</span>
                      <span className="text-xs text-gray-400">
                        ₱{selectedReport.closing.cash.toLocaleString()} + ₱{selectedReport.closing.turnoverCash.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-lg text-orange-700 font-semibold">
                      ₱{closingNetCash.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Digital Wallet */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-600">Digital Wallet</span>
                      <span className="text-xs text-gray-400">
                        ₱{selectedReport.closing.digitalWallet.toLocaleString()} + ₱{selectedReport.closing.turnoverDigital.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-lg text-orange-700 font-semibold">
                      ₱{closingNetDigital.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Bank Amount */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-600">Bank Amount</span>
                      <span className="text-xs text-gray-400">
                        ₱{selectedReport.closing.bank.toLocaleString()} + ₱{selectedReport.closing.turnoverBank.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-lg text-orange-700 font-semibold">
                      ₱{closingNetBank.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-orange-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">Net Total</span>
                    <span className="text-2xl font-bold text-orange-800">₱{closingTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Manager Fund */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="text-purple-800">Manager Fund</CardTitle>
              <CardDescription>Allocated fund for manager operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <span className="text-gray-700 font-medium">Fund Amount</span>
                <span className="text-2xl font-bold text-purple-700">
                  ₱{selectedReport.managerFund.amount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenses */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader>
              <CardTitle className="text-red-800">Expenses</CardTitle>
              <CardDescription>Daily operational expenses and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-white rounded-lg border border-red-100">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedReport.expenses || 'No expenses recorded for this date.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Report Photos */}
        {selectedReport && (selectedReport.opening?.imageUrl || selectedReport.closing?.imageUrl || selectedReport.managerFund?.imageUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader>
                <CardTitle className="text-indigo-800 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Financial Report Photos
                </CardTitle>
                <CardDescription>Visual proof of daily financial records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  {/* Opening Shift Photo */}
                  {selectedReport.opening?.imageUrl && (
                    <div
                      className="cursor-pointer group"
                      onClick={() => setFullscreenPhoto({
                        url: selectedReport.opening.imageUrl!,
                        title: 'Opening Shift'
                      })}
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-cyan-200 hover:shadow-xl transition-shadow">
                        <img
                          src={selectedReport.opening.imageUrl}
                          alt="Opening shift financial report"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <Badge className="absolute top-3 left-3 bg-cyan-600 shadow-lg">
                          <Camera className="w-3 h-3 mr-1" />
                          Opening Shift
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Closing Shift Photo */}
                  {selectedReport.closing?.imageUrl && (
                    <div
                      className="cursor-pointer group"
                      onClick={() => setFullscreenPhoto({
                        url: selectedReport.closing.imageUrl!,
                        title: 'Closing Shift'
                      })}
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-200 hover:shadow-xl transition-shadow">
                        <img
                          src={selectedReport.closing.imageUrl}
                          alt="Closing shift financial report"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <Badge className="absolute top-3 left-3 bg-orange-600 shadow-lg">
                          <Camera className="w-3 h-3 mr-1" />
                          Closing Shift
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Manager Fund Photo */}
                  {selectedReport.managerFund?.imageUrl && (
                    <div
                      className="cursor-pointer group"
                      onClick={() => setFullscreenPhoto({
                        url: selectedReport.managerFund.imageUrl!,
                        title: 'Manager Fund'
                      })}
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-200 hover:shadow-xl transition-shadow">
                        <img
                          src={selectedReport.managerFund.imageUrl}
                          alt="Manager fund financial report"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <Badge className="absolute top-3 left-3 bg-purple-600 shadow-lg">
                          <Camera className="w-3 h-3 mr-1" />
                          Manager Fund
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Show message if no photos available */}
                {!selectedReport.opening?.imageUrl && !selectedReport.closing?.imageUrl && !selectedReport.managerFund?.imageUrl && (
                  <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Camera className="w-16 h-16 text-gray-300" />
                    <p className="text-gray-500 text-center">
                      No photos available for this report
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
              </>
            )}
          </>
        )}
      </main>

      {/* Fullscreen Photo Viewer */}
      <AnimatePresence>
        {fullscreenPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
            onClick={() => setFullscreenPhoto(null)}
          >
            {/* Close Button - Top Right, doesn't overlay image */}
            <div className="absolute top-0 right-0 p-6 z-10">
              <Button
                onClick={() => setFullscreenPhoto(null)}
                variant="ghost"
                size="icon"
                className="bg-white hover:bg-gray-100 rounded-full shadow-2xl"
              >
                <X className="w-6 h-6 text-gray-900" />
              </Button>
            </div>

            {/* Photo Title - Top Left */}
            <div className="absolute top-0 left-0 p-6 z-10">
              <Badge className="bg-cyan-600 text-white text-sm px-4 py-2 shadow-lg">
                {fullscreenPhoto.title}
              </Badge>
            </div>

            {/* Centered Photo with padding so controls don't overlay */}
            <div className="w-full h-full flex items-center justify-center p-16">
              <img
                src={fullscreenPhoto.url}
                alt={fullscreenPhoto.title}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
