import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, LogOut, Receipt, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface OwnerPayrollPageProps {
  onBack: () => void;
  onLogout: () => void;
}

const mockPayrollEntries = [
  {
    id: '1',
    employeeName: 'Sarah Johnson',
    daysWorked: 6,
    payRate: 600.00,
    totalPay: 3600.00,
    period: 'Oct 16-22, 2025',
    status: 'Full-time'
  },
  {
    id: '2',
    employeeName: 'Mike Chen',
    daysWorked: 5,
    payRate: 600.00,
    totalPay: 3000.00,
    period: 'Oct 16-22, 2025',
    status: 'Full-time'
  },
  {
    id: '3',
    employeeName: 'Emma Davis',
    daysWorked: 4,
    payRate: 500.00,
    totalPay: 2000.00,
    period: 'Oct 16-22, 2025',
    status: 'Part-time'
  },
  {
    id: '4',
    employeeName: 'James Wilson',
    daysWorked: 3,
    payRate: 500.00,
    totalPay: 1500.00,
    period: 'Oct 16-22, 2025',
    status: 'Part-time'
  },
  {
    id: '5',
    employeeName: 'Sarah Johnson',
    daysWorked: 6,
    payRate: 600.00,
    totalPay: 3600.00,
    period: 'Oct 9-15, 2025',
    status: 'Full-time'
  },
  {
    id: '6',
    employeeName: 'Mike Chen',
    daysWorked: 6,
    payRate: 600.00,
    totalPay: 3600.00,
    period: 'Oct 9-15, 2025',
    status: 'Full-time'
  },
];

export function OwnerPayrollPage({ onBack, onLogout }: OwnerPayrollPageProps) {
  const totalPayroll = mockPayrollEntries.reduce((sum, entry) => sum + entry.totalPay, 0);
  const currentWeekPayroll = mockPayrollEntries
    .filter(e => e.period === 'Oct 16-22, 2025')
    .reduce((sum, entry) => sum + entry.totalPay, 0);
  const totalEmployees = new Set(mockPayrollEntries.map(e => e.employeeName)).size;

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
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Receipt className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-2xl text-cyan-900">Audit / Payroll</h1>
                  <p className="text-sm text-gray-500">Employee payments and audit trail</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Week Total</p>
                    <p className="text-2xl text-green-700">₱{currentWeekPayroll.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-amber-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">All-Time Total</p>
                    <p className="text-2xl text-amber-700">₱{totalPayroll.toLocaleString()}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-indigo-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl text-indigo-700">{totalEmployees}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payroll Table */}
        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
            <CardDescription>Complete payment history for all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Days Worked</TableHead>
                    <TableHead className="text-center">Pay Rate</TableHead>
                    <TableHead className="text-center">Total Pay</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayrollEntries.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.employeeName}</TableCell>
                      <TableCell>
                        <span className={`text-sm px-2 py-1 rounded ${
                          entry.status === 'Full-time' 
                            ? 'bg-cyan-100 text-cyan-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {entry.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{entry.daysWorked}</TableCell>
                      <TableCell className="text-center">₱{entry.payRate.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-green-700">
                        ₱{entry.totalPay.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{entry.period}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}