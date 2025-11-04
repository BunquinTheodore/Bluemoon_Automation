import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, LogOut, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface OwnerSalesPageProps {
  onBack: () => void;
  onLogout: () => void;
}

// Mock data for financial reports
const mockFinancialData = {
  opening: {
    cash: 5000,
    digitalWallet: 3500,
    bankAmount: 12000,
  },
  closing: {
    cash: 8500,
    digitalWallet: 6200,
    bankAmount: 18500,
  },
};

// Mock APEPO report data
const mockApepoReport = {
  audit: 'Daily audit completed. All registers balanced correctly. Minor discrepancy of ₱50 found in cash register, resolved.',
  people: 'Sarah Johnson - Cashier',
  equipment: 'All equipment functioning properly. Espresso machine cleaned and maintained. Refrigerator temperature at optimal levels.',
  product: 'Coffee beans stock sufficient for 3 days. Milk products fresh, rotated properly. Syrup inventory adequate.',
  others: 'Customer feedback positive. Peak hours 10am-12pm and 2pm-4pm. Recommended increasing staff during lunch rush.',
  submittedBy: 'John Smith',
  submittedDate: new Date('2025-10-23'),
};

export function OwnerSalesPage({ onBack, onLogout }: OwnerSalesPageProps) {
  const openingTotal = mockFinancialData.opening.cash + mockFinancialData.opening.digitalWallet + mockFinancialData.opening.bankAmount;
  const closingTotal = mockFinancialData.closing.cash + mockFinancialData.closing.digitalWallet + mockFinancialData.closing.bankAmount;

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
        {/* Financial Summary - Opening & Closing Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opening Shift */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
              <CardHeader>
                <CardTitle className="text-cyan-800">Opening Shift</CardTitle>
                <CardDescription>Morning financial summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Cash</span>
                  <span className="text-lg text-cyan-700">₱{mockFinancialData.opening.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Digital Wallet</span>
                  <span className="text-lg text-cyan-700">₱{mockFinancialData.opening.digitalWallet.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Bank Amount</span>
                  <span className="text-lg text-cyan-700">₱{mockFinancialData.opening.bankAmount.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-cyan-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Total</span>
                    <span className="text-2xl text-cyan-800">₱{openingTotal.toLocaleString()}</span>
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
                <CardDescription>Evening financial summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Cash</span>
                  <span className="text-lg text-orange-700">₱{mockFinancialData.closing.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Digital Wallet</span>
                  <span className="text-lg text-orange-700">₱{mockFinancialData.closing.digitalWallet.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Bank Amount</span>
                  <span className="text-lg text-orange-700">₱{mockFinancialData.closing.bankAmount.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-orange-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Total</span>
                    <span className="text-2xl text-orange-800">₱{closingTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Daily Earnings Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Daily Earnings</p>
                  <p className="text-3xl text-green-700">
                    ₱{(closingTotal - openingTotal).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* APEPO Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-cyan-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>APEPO Report</CardTitle>
                  <CardDescription>
                    Submitted by {mockApepoReport.submittedBy} on {mockApepoReport.submittedDate.toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className="bg-cyan-600">Manager Report</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-cyan-500 pl-4 py-2">
                <h4 className="text-cyan-800 mb-2">A - Audit</h4>
                <p className="text-gray-700">{mockApepoReport.audit}</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h4 className="text-purple-800 mb-2">P - People (Employees and Roles)</h4>
                <p className="text-gray-700">{mockApepoReport.people}</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="text-blue-800 mb-2">E - Equipment Check</h4>
                <p className="text-gray-700">{mockApepoReport.equipment}</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="text-green-800 mb-2">P - Product</h4>
                <p className="text-gray-700">{mockApepoReport.product}</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h4 className="text-orange-800 mb-2">O - Others</h4>
                <p className="text-gray-700">{mockApepoReport.others}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
