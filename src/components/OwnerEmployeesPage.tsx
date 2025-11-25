import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ArrowLeft, LogOut, Users, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface OwnerEmployeesPageProps {
  onBack: () => void;
  onLogout: () => void;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  position: string;
  status: 'full-time' | 'part-time';
  birthday: string;
  joinDate: string;
}

export function OwnerEmployeesPage({ onBack, onLogout }: OwnerEmployeesPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const loadedEmployees: Employee[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();

          // Format join date
          let joinDateStr = 'N/A';
          if (data.joinDate) {
            const joinDate = typeof data.joinDate === 'string'
              ? new Date(data.joinDate)
              : data.joinDate.toDate ? data.joinDate.toDate() : new Date();
            joinDateStr = joinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }

          return {
            id: docSnap.id,
            name: data.name || '',
            email: data.email || '',
            contactNumber: data.contactNumber || '',
            position: data.position || '',
            status: (data.status === 'part-time' ? 'part-time' : 'full-time') as 'full-time' | 'part-time',
            birthday: data.birthday || '',
            joinDate: joinDateStr,
          };
        })
        .filter((emp) => emp.isActive !== false && emp.name.trim().length > 0);

      setEmployees(loadedEmployees);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fullTimeCount = employees.filter(e => e.status === 'full-time').length;
  const partTimeCount = employees.filter(e => e.status === 'part-time').length;

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
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl text-cyan-900">Employees</h1>
                  <p className="text-sm text-gray-500">Staff directory and management</p>
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
            <Card className="border-indigo-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl text-indigo-700">{employees.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-cyan-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Full-Time</p>
                    <p className="text-2xl text-cyan-700">{fullTimeCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Part-Time</p>
                    <p className="text-2xl text-gray-700">{partTimeCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Employee Cards - Mobile Friendly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:hidden">
          {employees.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-cyan-600 text-white">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                      <Badge className="mt-1" variant={employee.status === 'full-time' ? 'default' : 'outline'}>
                        {employee.status === 'full-time' ? 'Full-time' : 'Part-time'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {employee.contactNumber}
                    </div>
                    <div className="text-gray-600">
                      Birthday: {employee.birthday}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Joined: {employee.joinDate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Employee Table - Desktop */}
        <Card className="hidden md:block border-cyan-100">
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>Complete staff directory (read-only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Birthday</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Join Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-cyan-600 text-white text-xs">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'full-time' ? 'default' : 'outline'} className={employee.status === 'full-time' ? 'bg-cyan-600' : ''}>
                          {employee.status === 'full-time' ? 'Full-time' : 'Part-time'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{employee.position}</TableCell>
                      <TableCell className="text-sm text-gray-600">{employee.birthday}</TableCell>
                      <TableCell className="text-sm text-gray-600">{employee.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">{employee.contactNumber}</TableCell>
                      <TableCell className="text-sm text-gray-500">{employee.joinDate}</TableCell>
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