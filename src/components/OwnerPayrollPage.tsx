import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, LogOut, Receipt, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface OwnerPayrollPageProps {
  onBack: () => void;
  onLogout: () => void;
}

interface PayrollEntry {
  id: string;
  employeeName: string;
  employeeStatus: string;
  daysWorked: number;
  payRate: number;
  totalPay: number;
  period: string;
}

export function OwnerPayrollPage({ onBack, onLogout }: OwnerPayrollPageProps) {
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payroll from Firestore
  useEffect(() => {
    const q = query(collection(db, 'payroll'), orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPayroll: PayrollEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          employeeName: data.employeeName || '',
          employeeStatus: data.employeeStatus || 'full-time',
          daysWorked: data.daysWorked || 0,
          payRate: data.payRate || 0,
          totalPay: data.totalPay || 0,
          period: data.period || 'N/A',
        };
      });

      setPayrollEntries(loadedPayroll);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculate statistics
  const totalPayroll = payrollEntries.reduce((sum, entry) => sum + entry.totalPay, 0);

  // Get current week period string
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const currentWeekPeriod = `${startOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;

  const currentWeekPayroll = payrollEntries
    .filter(e => e.period === currentWeekPeriod)
    .reduce((sum, entry) => sum + entry.totalPay, 0);

  const totalEmployees = new Set(payrollEntries.map(e => e.employeeName)).size;

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
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
          <>
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
                  {payrollEntries.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant={entry.employeeStatus === 'full-time' ? 'default' : 'outline'} className={entry.employeeStatus === 'full-time' ? 'bg-cyan-600' : ''}>
                          {entry.employeeStatus === 'full-time' ? 'Full-time' : 'Part-time'}
                        </Badge>
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
          </>
        )}
      </main>
    </div>
  );
}