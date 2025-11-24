import logo from 'figma:asset/2ea8e337c311dd84e6a339fac104593b92115d60.png';
import { collection, doc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import {
  Calendar as CalendarIcon,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Edit,
  FileBarChart,
  Image,
  LogOut,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Upload,
  Users,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Screen, User } from '../App';
import { db } from '../lib/firebase';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';

interface ManagerDashboardProps {
  user: User;
  onNavigate: (screen: Screen) => void;
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
  isActive: boolean;
}

interface ManagerTask {
  id: string;
  name: string;
  completed: boolean;
  type: 'daily' | 'weekly';
  day?: string;
  icon?: any;
}

interface InventoryItemExtended {
  id: string;
  productName: string;
  sealed: number;
  loose: number;
  unit: string;
  lastUpdated: Date;
  station: 'kitchen' | 'coffee-bar';
}

const mockInventory: InventoryItemExtended[] = [
  { id: '1', productName: 'Espresso Beans', sealed: 25, loose: 2, unit: 'kg', lastUpdated: new Date('2025-10-20'), station: 'coffee-bar' },
  { id: '2', productName: 'Whole Milk', sealed: 12, loose: 1, unit: 'no. of package', lastUpdated: new Date('2025-10-21'), station: 'coffee-bar' },
  { id: '3', productName: 'Almond Milk', sealed: 8, loose: 0, unit: 'no. of package', lastUpdated: new Date('2025-10-21'), station: 'coffee-bar' },
  { id: '4', productName: 'Vanilla Syrup', sealed: 5, loose: 1, unit: 'bottle', lastUpdated: new Date('2025-10-20'), station: 'coffee-bar' },
  { id: '5', productName: 'Paper Cups (16oz)', sealed: 200, loose: 15, unit: 'pcs', lastUpdated: new Date('2025-10-19'), station: 'coffee-bar' },
  { id: '6', productName: 'Rice', sealed: 50, loose: 5, unit: 'kg', lastUpdated: new Date('2025-10-21'), station: 'kitchen' },
  { id: '7', productName: 'Cooking Oil', sealed: 8, loose: 2, unit: 'bottle', lastUpdated: new Date('2025-10-20'), station: 'kitchen' },
  { id: '8', productName: 'Salt', sealed: 10, loose: 1, unit: 'kg', lastUpdated: new Date('2025-10-19'), station: 'kitchen' },
];

export function ManagerDashboard({ user, onNavigate, onLogout }: ManagerDashboardProps) {
  // Manager's Own Tasks (loaded from Firestore managerTasks collection)
  const [managerTasks, setManagerTasks] = useState<ManagerTask[]>([]);

  useEffect(() => {
    const tasksCollection = collection(db, 'managerTasks');

    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
      const loadedTasks: ManagerTask[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as any;
          const status = (data as any).status === 'completed' ? 'completed' : 'pending';

          return {
            id: docSnap.id,
            name: data.name || '',
            completed: status === 'completed',
            type: (data.type === 'weekly' ? 'weekly' : 'daily') as 'daily' | 'weekly',
            day: data.day,
            icon: undefined,
          };
        })

        .filter((task) => task.name.trim().length > 0);

      setManagerTasks(loadedTasks);
    });

    return () => unsubscribe();
  }, []);

  // Employee Task Assignment (generic for all employees)
  const [employeeTaskName, setEmployeeTaskName] = useState('');
  const [employeeTaskDescription, setEmployeeTaskDescription] = useState('');
  const [employeeTaskStation, setEmployeeTaskStation] = useState<'kitchen' | 'coffee-bar'>('kitchen');
  const [employeeTaskCategory, setEmployeeTaskCategory] = useState<'opening' | 'closing'>('opening');
  const [isEmployeeTaskOpen, setIsEmployeeTaskOpen] = useState(false);

  // APEPO Report State
  const [apepoAudit, setApepoAudit] = useState('');
  const [apepoPeople, setApepoPeople] = useState('');
  const [apepoEquipment, setApepoEquipment] = useState('');
  const [apepoProduct, setApepoProduct] = useState('');
  const [apepoOthers, setApepoOthers] = useState('');

  // Financial Report State - Opening START
  const [startingCash, setStartingCash] = useState('');
  const [startingDigital, setStartingDigital] = useState('');
  const [startingBank, setStartingBank] = useState('');
  
  // Financial Report State - Opening TURNOVER
  const [turnoverCash, setTurnoverCash] = useState('');
  const [turnoverDigital, setTurnoverDigital] = useState('');
  const [turnoverBank, setTurnoverBank] = useState('');
  
  // Financial Report State - Closing START
  const [closingStartCash, setClosingStartCash] = useState('');
  const [closingStartDigital, setClosingStartDigital] = useState('');
  const [closingStartBank, setClosingStartBank] = useState('');
  
  // Financial Report State - Closing TURNOVER
  const [closingTurnoverCash, setClosingTurnoverCash] = useState('');
  const [closingTurnoverDigital, setClosingTurnoverDigital] = useState('');
  const [closingTurnoverBank, setClosingTurnoverBank] = useState('');
  
  // Image uploads for financial reports
  const [openingImage, setOpeningImage] = useState<File | null>(null);
  const [closingImage, setClosingImage] = useState<File | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [financialStatus, setFinancialStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Manager Fund State
  const [managerFundAmount, setManagerFundAmount] = useState('');
  const [managerFundImage, setManagerFundImage] = useState<File | null>(null);

  // Expenses State
  const [expenses, setExpenses] = useState('');

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItemExtended[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSealed, setNewProductSealed] = useState('');
  const [newProductLoose, setNewProductLoose] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('kg');
  const [wastedInventoryImage, setWastedInventoryImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'inventory'));
        if (!snapshot.empty) {
          const items: InventoryItemExtended[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            const sealed = typeof data.sealed === 'number' ? data.sealed : 0;
            const loose = typeof data.loose === 'number' ? data.loose : 0;
            const unit = data.unit || '';
            const lastUpdatedRaw = (data as any).lastUpdated;
            const lastUpdated = lastUpdatedRaw && typeof lastUpdatedRaw.toDate === 'function'
              ? lastUpdatedRaw.toDate()
              : new Date();
            const station: 'kitchen' | 'coffee-bar' = data.station === 'coffee-bar' ? 'coffee-bar' : 'kitchen';

            return {
              id: data.inventoryId || docSnap.id,
              productName: data.productName || '',
              sealed,
              loose,
              unit,
              lastUpdated,
              station,
            };
          });
          setInventory(items);
        }
      } catch (error) {
        console.error('Error loading inventory from Firestore', error);
      }
    };

    fetchInventory();
  }, []);

  // Request State
  const [requestItemName, setRequestItemName] = useState('');
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestPriority, setRequestPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [requestRemarks, setRequestRemarks] = useState('');

  // Payroll State
  const [payrollEmployeeName, setPayrollEmployeeName] = useState('');
  const [payrollDaysWorked, setPayrollDaysWorked] = useState('');
  const [payrollPayRate, setPayrollPayRate] = useState('');

  // Employee State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    position: '',
    status: 'full-time' as 'full-time' | 'part-time',
    birthday: '',
  });

  // Fetch employees from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const loadedEmployees: Employee[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || '',
            email: data.email || '',
            contactNumber: data.contactNumber || '',
            position: data.position || '',
            status: (data.status === 'part-time' ? 'part-time' : 'full-time') as 'full-time' | 'part-time',
            birthday: data.birthday || '',
            joinDate: data.joinDate || new Date().toISOString(),
            isActive: data.isActive !== false,
          };
        })
        .filter((emp) => emp.isActive);

      setEmployees(loadedEmployees);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleManagerTask = async (id: string) => {
    const task = managerTasks.find((t) => t.id === id);
    if (!task) {
      return;
    }

    const newStatus = task.completed ? 'pending' : 'completed';

    try {
      const taskDocRef = doc(db, 'managerTasks', id);
      await updateDoc(taskDocRef, {
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating manager task status', error);
      toast.error('Failed to update task status. Please try again.');
    }
  };

  const handleAssignEmployeeTask = async () => {
    if (!employeeTaskName.trim()) {
      toast.error('Please fill in the task name');
      return;
    }

    try {
      const tasksCollection = collection(db, 'tasks');
      const taskDocRef = doc(tasksCollection);
      const qrCodeId = `TASK-${taskDocRef.id.slice(0, 8).toUpperCase()}`;

      await setDoc(taskDocRef, {
        taskId: taskDocRef.id,
        name: employeeTaskName.trim(),
        description: employeeTaskDescription.trim() || '',
        station: employeeTaskStation,
        category: employeeTaskCategory,
        status: 'pending',
        qrCodeId,
        assignedBy: user.id,
        assignedByName: user.name,
        createdAt: serverTimestamp(),
      });

      const stationLabel = employeeTaskStation === 'kitchen' ? 'Kitchen' : 'Coffee Bar';
      const categoryLabel = employeeTaskCategory === 'opening' ? 'Opening' : 'Closing';
      const extraDetails = employeeTaskDescription && employeeTaskDescription.trim().length > 0
        ? `\nDetails: ${employeeTaskDescription.trim()}`
        : '';

      toast.success('Task created for employees!', {
        description: `${employeeTaskName} - Station: ${stationLabel}, Category: ${categoryLabel}${extraDetails}`,
      });

      setEmployeeTaskName('');
      setEmployeeTaskDescription('');
    } catch (error) {
      console.error('Error creating task for employees', error);
      toast.error('Failed to create task. Please try again.');
    }
  };

  const handleSubmitApepo = () => {
    if (!apepoAudit || !apepoPeople || !apepoEquipment || !apepoProduct || !apepoOthers) {
      toast.error('Please fill in all APEPO fields');
      return;
    }
    toast.success('APEPO report submitted!');
    setApepoAudit('');
    setApepoPeople('');
    setApepoEquipment('');
    setApepoProduct('');
    setApepoOthers('');
  };

  const handleSubmitFinancialReport = async () => {
    if (
      !startingCash ||
      !startingDigital ||
      !startingBank ||
      !turnoverCash ||
      !turnoverDigital ||
      !turnoverBank ||
      !closingStartCash ||
      !closingStartDigital ||
      !closingStartBank ||
      !closingTurnoverCash ||
      !closingTurnoverDigital ||
      !closingTurnoverBank
    ) {
      toast.error('Please fill in all financial fields');
      return;
    }

    try {
      const reportDate = selectedDate || new Date();
      const dateString = reportDate.toISOString().split('T')[0];

      const reportsCollection = collection(db, 'financialReports');
      const reportDocRef = doc(reportsCollection);

      await setDoc(reportDocRef, {
        reportId: reportDocRef.id,
        managerId: user.id,
        managerName: user.name,
        date: dateString,
        timestamp: serverTimestamp(),

        opening: {
          cash: parseFloat(startingCash),
          digitalWallet: parseFloat(startingDigital),
          bank: parseFloat(startingBank),
          turnoverCash: parseFloat(turnoverCash),
          turnoverDigital: parseFloat(turnoverDigital),
          turnoverBank: parseFloat(turnoverBank),
        },

        closing: {
          cash: parseFloat(closingStartCash),
          digitalWallet: parseFloat(closingStartDigital),
          bank: parseFloat(closingStartBank),
          turnoverCash: parseFloat(closingTurnoverCash),
          turnoverDigital: parseFloat(closingTurnoverDigital),
          turnoverBank: parseFloat(closingTurnoverBank),
        },

        managerFund: {
          amount: managerFundAmount ? parseFloat(managerFundAmount) : 0,
        },

        expenses: expenses || '',
        status: 'pending',
        submittedAt: serverTimestamp(),
      });

      toast.success('Financial report submitted!');
      setFinancialStatus('pending');

      // Clear form fields
      setStartingCash('');
      setStartingDigital('');
      setStartingBank('');
      setTurnoverCash('');
      setTurnoverDigital('');
      setTurnoverBank('');
      setClosingStartCash('');
      setClosingStartDigital('');
      setClosingStartBank('');
      setClosingTurnoverCash('');
      setClosingTurnoverDigital('');
      setClosingTurnoverBank('');
      setManagerFundAmount('');
      setExpenses('');
    } catch (error) {
      console.error('Error submitting financial report:', error);
      toast.error('Failed to submit financial report. Please try again.');
    }
  };

  // Load financial report for selected date
  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);

    if (!date) return;

    try {
      const dateString = date.toISOString().split('T')[0];
      const reportsSnapshot = await getDocs(collection(db, 'financialReports'));

      const report = reportsSnapshot.docs.find(doc => doc.data().date === dateString);

      if (report) {
        const data = report.data();

        // Load opening shift data
        setStartingCash(data.opening?.cash?.toString() || '');
        setStartingDigital(data.opening?.digitalWallet?.toString() || '');
        setStartingBank(data.opening?.bank?.toString() || '');
        setTurnoverCash(data.opening?.turnoverCash?.toString() || '');
        setTurnoverDigital(data.opening?.turnoverDigital?.toString() || '');
        setTurnoverBank(data.opening?.turnoverBank?.toString() || '');

        // Load closing shift data
        setClosingStartCash(data.closing?.cash?.toString() || '');
        setClosingStartDigital(data.closing?.digitalWallet?.toString() || '');
        setClosingStartBank(data.closing?.bank?.toString() || '');
        setClosingTurnoverCash(data.closing?.turnoverCash?.toString() || '');
        setClosingTurnoverDigital(data.closing?.turnoverDigital?.toString() || '');
        setClosingTurnoverBank(data.closing?.turnoverBank?.toString() || '');

        // Load manager fund and expenses
        setManagerFundAmount(data.managerFund?.amount?.toString() || '');
        setExpenses(data.expenses || '');

        setFinancialStatus(data.status || 'pending');

        toast.success(`Loaded report for ${dateString}`);
      } else {
        // Clear form if no report for this date
        setStartingCash('');
        setStartingDigital('');
        setStartingBank('');
        setTurnoverCash('');
        setTurnoverDigital('');
        setTurnoverBank('');
        setClosingStartCash('');
        setClosingStartDigital('');
        setClosingStartBank('');
        setClosingTurnoverCash('');
        setClosingTurnoverDigital('');
        setClosingTurnoverBank('');
        setManagerFundAmount('');
        setExpenses('');
        setFinancialStatus('pending');

        toast.info(`No report found for ${dateString}`);
      }
    } catch (error) {
      console.error('Error loading financial report:', error);
      toast.error('Failed to load report');
    }
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
    toast.success('Product removed from inventory');
  };

  const handleSubmitInventory = () => {
    toast.success('Inventory submitted to owner!');
  };

  const handleSubmitRequest = async () => {
    if (!requestItemName.trim() || !requestQuantity) {
      toast.error('Please fill in item name and quantity');
      return;
    }

    const quantityNumber = parseInt(requestQuantity, 10);
    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      toast.error('Quantity must be a positive number');
      return;
    }

    try {
      const requestsCollection = collection(db, 'requests');
      const requestDocRef = doc(requestsCollection);

      await setDoc(requestDocRef, {
        requestId: requestDocRef.id,
        itemName: requestItemName.trim(),
        quantity: quantityNumber,
        unit: 'units',
        priority: requestPriority,
        remarks: requestRemarks.trim(),
        managerId: user.id,
        managerName: user.name,
        submittedAt: serverTimestamp(),
      });

      toast.success('Request submitted to owner!', {
        description: `${requestItemName.trim()} (Qty: ${quantityNumber}) - Priority: ${requestPriority}`,
      });

      setRequestItemName('');
      setRequestQuantity('');
      setRequestRemarks('');
    } catch (error) {
      console.error('Error submitting request to owner', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  // Employee CRUD Handlers
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      name: '',
      email: '',
      contactNumber: '',
      position: '',
      status: 'full-time',
      birthday: '',
    });
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      email: employee.email,
      contactNumber: employee.contactNumber,
      position: employee.position,
      status: employee.status,
      birthday: employee.birthday,
    });
    setShowEmployeeForm(true);
  };

  const handleSaveEmployee = async () => {
    if (!employeeFormData.name.trim() || !employeeFormData.email.trim()) {
      toast.error('Please fill in name and email');
      return;
    }

    try {
      const employeesCollection = collection(db, 'employees');

      if (editingEmployee) {
        // Update existing employee
        const employeeDocRef = doc(db, 'employees', editingEmployee.id);
        await updateDoc(employeeDocRef, {
          name: employeeFormData.name.trim(),
          email: employeeFormData.email.trim(),
          contactNumber: employeeFormData.contactNumber.trim(),
          position: employeeFormData.position.trim(),
          status: employeeFormData.status,
          birthday: employeeFormData.birthday,
          updatedAt: serverTimestamp(),
        });
        toast.success('Employee updated successfully!');
      } else {
        // Add new employee
        const employeeDocRef = doc(employeesCollection);
        await setDoc(employeeDocRef, {
          employeeId: employeeDocRef.id,
          name: employeeFormData.name.trim(),
          email: employeeFormData.email.trim(),
          contactNumber: employeeFormData.contactNumber.trim(),
          position: employeeFormData.position.trim(),
          status: employeeFormData.status,
          birthday: employeeFormData.birthday,
          joinDate: new Date().toISOString(),
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Employee added successfully!');
      }

      setShowEmployeeForm(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const employeeDocRef = doc(db, 'employees', employeeId);
      await updateDoc(employeeDocRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
      toast.success('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee. Please try again.');
    }
  };

  const handleCancelEmployeeForm = () => {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
  };

  const handleSubmitPayroll = async () => {
    if (!payrollEmployeeName || !payrollDaysWorked || !payrollPayRate) {
      toast.error('Please fill in all payroll fields');
      return;
    }

    const daysWorked = parseInt(payrollDaysWorked);
    const payRate = parseFloat(payrollPayRate);

    if (isNaN(daysWorked) || isNaN(payRate) || daysWorked <= 0 || payRate <= 0) {
      toast.error('Please enter valid numbers for days worked and pay rate');
      return;
    }

    try {
      // Find employee to get their status
      const employee = employees.find(emp => emp.name === payrollEmployeeName);
      const employeeStatus = employee?.status || 'full-time';
      const employeeId = employee?.id || '';

      const totalPay = daysWorked * payRate;

      // Generate period string (e.g., "Nov 18-24, 2025")
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const periodString = `${startOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;

      const payrollCollection = collection(db, 'payroll');
      const payrollDocRef = doc(payrollCollection);

      await setDoc(payrollDocRef, {
        payrollId: payrollDocRef.id,
        employeeId,
        employeeName: payrollEmployeeName,
        employeeStatus: employeeStatus,
        managerId: user.id,
        managerName: user.name,
        daysWorked,
        payRate,
        totalPay,
        period: periodString,
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      toast.success('Payroll entry submitted!', {
        description: `${payrollEmployeeName} - Total: ₱${totalPay.toFixed(2)}`,
      });

      setPayrollEmployeeName('');
      setPayrollDaysWorked('');
      setPayrollPayRate('');
    } catch (error) {
      console.error('Error submitting payroll:', error);
      toast.error('Failed to submit payroll. Please try again.');
    }
  };

  const handleSubmitManagerFund = () => {
    if (!managerFundAmount || !managerFundImage) {
      toast.error('Please enter amount and upload an image');
      return;
    }
    toast.success('Manager fund submitted!');
    setManagerFundAmount('');
    setManagerFundImage(null);
  };

  const handleSubmitExpenses = () => {
    if (!expenses.trim()) {
      toast.error('Please enter expenses details');
      return;
    }
    toast.success('Expenses submitted!');
    setExpenses('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* ... (rest of the code remains the same) */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="Bluemoon" className="h-8" />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('photo-viewer')}
                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                title="View Photo Submissions"
              >
                <Camera className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-cyan-600 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-cyan-100">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <ClipboardList className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <FileBarChart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <Wallet className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
          </TabsList>

          {/* Task Management Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Tasks */}
              <Card className="border-cyan-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2 text-cyan-800">
                    <ClipboardList className="w-5 h-5" />
                    Daily Tasks
                  </CardTitle>
                  <CardDescription>Tasks to complete every day</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {managerTasks.filter(task => task.type === 'daily').map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors"
                      >
                        <Checkbox
                          id={task.id}
                          checked={task.completed}
                          onCheckedChange={() => handleToggleManagerTask(task.id)}
                        />
                        <label
                          htmlFor={task.id}
                          className={`flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}`}
                        >
                          {task.name}
                        </label>
                        {task.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Tasks */}
              <Card className="border-purple-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <CalendarIcon className="w-5 h-5" />
                    Weekly Tasks
                  </CardTitle>
                  <CardDescription>Recurring tasks scheduled throughout the week</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {managerTasks.filter(task => task.type === 'weekly').map((task, index) => {
                      const TaskIcon = task.icon || ClipboardList;
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors bg-white"
                        >
                          <Checkbox
                            id={task.id}
                            checked={task.completed}
                            onCheckedChange={() => handleToggleManagerTask(task.id)}
                          />
                          <TaskIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          <div className="flex-1">
                            <label
                              htmlFor={task.id}
                              className={`cursor-pointer block ${task.completed ? 'line-through text-gray-500' : ''}`}
                            >
                              {task.name}
                            </label>
                            {task.day && (
                              <span className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                                <CalendarIcon className="w-3 h-3" />
                                Every {task.day}
                              </span>
                            )}
                          </div>
                          {task.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assign Tasks to Employees */}
            <Card className="border-cyan-100">
              <Collapsible open={isEmployeeTaskOpen} onOpenChange={setIsEmployeeTaskOpen}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-cyan-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <CardTitle>Assign Tasks to Employees</CardTitle>
                        <CardDescription>Create and assign tasks to your team</CardDescription>
                      </div>
                      <motion.div
                        animate={{ rotate: isEmployeeTaskOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      </motion.div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeTaskName">Task Name</Label>
                        <Input
                          id="employeeTaskName"
                          placeholder="e.g., Clean coffee machine"
                          value={employeeTaskName}
                          onChange={(e) => setEmployeeTaskName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employeeTaskDescription">Task Description</Label>
                        <Input
                          id="employeeTaskDescription"
                          placeholder="Optional details or instructions..."
                          value={employeeTaskDescription}
                          onChange={(e) => setEmployeeTaskDescription(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employeeTaskStation">Station</Label>
                        <Select value={employeeTaskStation} onValueChange={(v: 'kitchen' | 'coffee-bar') => setEmployeeTaskStation(v)}>
                          <SelectTrigger id="employeeTaskStation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kitchen">Kitchen</SelectItem>
                            <SelectItem value="coffee-bar">Coffee Bar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employeeTaskCategory">Category</Label>
                        <Select value={employeeTaskCategory} onValueChange={(v: 'opening' | 'closing') => setEmployeeTaskCategory(v)}>
                          <SelectTrigger id="employeeTaskCategory">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="opening">Opening</SelectItem>
                            <SelectItem value="closing">Closing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleAssignEmployeeTask} className="w-full bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task for Employees
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Calendar for History */}
            <Card className="border-cyan-100 shadow-md">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-cyan-800">
                  <CalendarIcon className="w-5 h-5" />
                  View History
                </CardTitle>
                <CardDescription>Select a date to view historical APEPO and Financial reports</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-lg border-2 border-cyan-100 shadow-sm bg-white"
                />
              </CardContent>
            </Card>

            {/* Financial Report - NOW FIRST */}
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Financial Report</CardTitle>
                <CardDescription>Opening and closing shift financial details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Opening Shift */}
                  <div className="border border-cyan-200 rounded-lg p-4 bg-cyan-50">
                    <h3 className="mb-4 text-cyan-800">Opening Shift</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="startingCash">Cash (₱)</Label>
                        <Input
                          id="startingCash"
                          type="number"
                          placeholder="0.00"
                          value={startingCash}
                          onChange={(e) => setStartingCash(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startingDigital">Digital Wallet (₱)</Label>
                        <Input
                          id="startingDigital"
                          type="number"
                          placeholder="0.00"
                          value={startingDigital}
                          onChange={(e) => setStartingDigital(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startingBank">Bank Amount (₱)</Label>
                        <Input
                          id="startingBank"
                          type="number"
                          placeholder="0.00"
                          value={startingBank}
                          onChange={(e) => setStartingBank(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="turnoverCash">Turnover Cash (₱)</Label>
                        <Input
                          id="turnoverCash"
                          type="number"
                          placeholder="0.00"
                          value={turnoverCash}
                          onChange={(e) => setTurnoverCash(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="turnoverDigital">Turnover Digital Wallet (₱)</Label>
                        <Input
                          id="turnoverDigital"
                          type="number"
                          placeholder="0.00"
                          value={turnoverDigital}
                          onChange={(e) => setTurnoverDigital(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="turnoverBank">Turnover Bank Amount (₱)</Label>
                        <Input
                          id="turnoverBank"
                          type="number"
                          placeholder="0.00"
                          value={turnoverBank}
                          onChange={(e) => setTurnoverBank(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="openingImage">Upload Opening Image</Label>
                        <Input
                          id="openingImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setOpeningImage(e.target.files ? e.target.files[0] : null)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Closing Shift */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h3 className="mb-4 text-orange-800">Closing Shift</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="closingStartCash">Cash (₱)</Label>
                        <Input
                          id="closingStartCash"
                          type="number"
                          placeholder="0.00"
                          value={closingStartCash}
                          onChange={(e) => setClosingStartCash(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closingStartDigital">Digital Wallet (₱)</Label>
                        <Input
                          id="closingStartDigital"
                          type="number"
                          placeholder="0.00"
                          value={closingStartDigital}
                          onChange={(e) => setClosingStartDigital(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closingStartBank">Bank Amount (₱)</Label>
                        <Input
                          id="closingStartBank"
                          type="number"
                          placeholder="0.00"
                          value={closingStartBank}
                          onChange={(e) => setClosingStartBank(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="closingTurnoverCash">Turnover Cash (₱)</Label>
                        <Input
                          id="closingTurnoverCash"
                          type="number"
                          placeholder="0.00"
                          value={closingTurnoverCash}
                          onChange={(e) => setClosingTurnoverCash(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closingTurnoverDigital">Turnover Digital Wallet (₱)</Label>
                        <Input
                          id="closingTurnoverDigital"
                          type="number"
                          placeholder="0.00"
                          value={closingTurnoverDigital}
                          onChange={(e) => setClosingTurnoverDigital(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closingTurnoverBank">Turnover Bank Amount (₱)</Label>
                        <Input
                          id="closingTurnoverBank"
                          type="number"
                          placeholder="0.00"
                          value={closingTurnoverBank}
                          onChange={(e) => setClosingTurnoverBank(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="closingImage">Upload Closing Image</Label>
                        <Input
                          id="closingImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setClosingImage(e.target.files ? e.target.files[0] : null)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Button onClick={handleSubmitFinancialReport} className="flex-1 bg-green-600 hover:bg-green-700">
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Submit Financial Report
                  </Button>
                  <Badge
                    variant={financialStatus === 'approved' ? 'default' : financialStatus === 'rejected' ? 'destructive' : 'outline'}
                    className={`${financialStatus === 'approved' ? 'bg-green-600' : ''} px-4 py-2`}
                  >
                    Status: {financialStatus.charAt(0).toUpperCase() + financialStatus.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* APEPO Report */}
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>APEPO Report</CardTitle>
                <CardDescription>Audit, People, Equipment, Product, Others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apepoAudit">A - Audit</Label>
                  <Textarea
                    id="apepoAudit"
                    placeholder="Audit findings and observations..."
                    value={apepoAudit}
                    onChange={(e) => setApepoAudit(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apepoPeople">P - People (Employees and Roles)</Label>
                  <Select value={apepoPeople} onValueChange={setApepoPeople}>
                    <SelectTrigger id="apepoPeople">
                      <SelectValue placeholder="Select employee and role" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={`${emp.name} - ${emp.position}`}>
                          {emp.name} - {emp.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apepoEquipment">E - Equipment Check</Label>
                  <Textarea
                    id="apepoEquipment"
                    placeholder="Equipment status and maintenance notes..."
                    value={apepoEquipment}
                    onChange={(e) => setApepoEquipment(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apepoProduct">P - Product</Label>
                  <Textarea
                    id="apepoProduct"
                    placeholder="Product quality and inventory notes..."
                    value={apepoProduct}
                    onChange={(e) => setApepoProduct(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apepoOthers">O - Others</Label>
                  <Textarea
                    id="apepoOthers"
                    placeholder="Additional notes and observations..."
                    value={apepoOthers}
                    onChange={(e) => setApepoOthers(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmitApepo} className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <FileBarChart className="w-4 h-4 mr-2" />
                  Submit APEPO Report
                </Button>
              </CardContent>
            </Card>

            {/* Manager Fund */}
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Manager Fund</CardTitle>
                <CardDescription>Daily manager fund tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="managerFundAmount">Amount (₱)</Label>
                  <Input
                    id="managerFundAmount"
                    type="number"
                    placeholder="Enter daily manager fund amount..."
                    value={managerFundAmount}
                    onChange={(e) => setManagerFundAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerFundImage">Upload Photo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="managerFundImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setManagerFundImage(e.target.files ? e.target.files[0] : null)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSubmitManagerFund}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                  {managerFundImage && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      Image attached: {managerFundImage.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>Record daily expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expenses">Expense Details</Label>
                  <Textarea
                    id="expenses"
                    placeholder="Enter detailed expenses information (no character limit)..."
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    rows={6}
                    className="resize-y min-h-[150px]"
                  />
                </div>

                <Button onClick={handleSubmitExpenses} className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <FileBarChart className="w-4 h-4 mr-2" />
                  Submit Expenses
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Tabs defaultValue="kitchen" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-cyan-100">
                <TabsTrigger value="kitchen" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                  <Package className="w-4 h-4 mr-2" />
                  Kitchen
                </TabsTrigger>
                <TabsTrigger value="coffee-bar" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                  <Package className="w-4 h-4 mr-2" />
                  Coffee Bar
                </TabsTrigger>
              </TabsList>

              {/* Kitchen Inventory */}
              <TabsContent value="kitchen">
                <Card className="border-cyan-100">
                  <CardHeader>
                    <CardTitle>Kitchen Inventory Overview</CardTitle>
                    <CardDescription>View kitchen inventory updates from employees</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Inventory Table - View Only */}
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-center">Sealed</TableHead>
                            <TableHead className="text-center">Loose</TableHead>
                            <TableHead className="text-center">Delivered</TableHead>
                            <TableHead>Last Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory
                            .filter(item => item.station === 'kitchen')
                            .filter(item => item.productName && item.productName.trim().length > 0)
                            .map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell className="text-center">
                                  <span className="text-gray-700">{item.sealed}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-gray-700">{item.loose}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-gray-700">{item.sealed + item.loose}</span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {item.lastUpdated.toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Coffee Bar Inventory */}
              <TabsContent value="coffee-bar">
                <Card className="border-cyan-100">
                  <CardHeader>
                    <CardTitle>Coffee Bar Inventory Overview</CardTitle>
                    <CardDescription>View coffee bar inventory updates from employees</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Inventory Table - View Only */}
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-center">Sealed</TableHead>
                            <TableHead className="text-center">Loose</TableHead>
                            <TableHead className="text-center">Delivered</TableHead>
                            <TableHead>Last Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory
                            .filter(item => item.station === 'coffee-bar')
                            .filter(item => item.productName && item.productName.trim().length > 0)
                            .map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell className="text-center">
                                  <span className="text-gray-700">{item.sealed}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-gray-700">{item.loose}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-gray-700">{item.sealed + item.loose}</span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {item.lastUpdated.toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Submit Shop Request</CardTitle>
                <CardDescription>Request items needed for the shop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requestItem">Item Name</Label>
                    <Input
                      id="requestItem"
                      placeholder="e.g., Coffee beans, trash bags"
                      value={requestItemName}
                      onChange={(e) => setRequestItemName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requestQty">Quantity</Label>
                    <Input
                      id="requestQty"
                      type="number"
                      placeholder="e.g., 5"
                      value={requestQuantity}
                      onChange={(e) => setRequestQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestPriority">Priority</Label>
                  <Select value={requestPriority} onValueChange={(v: 'low' | 'medium' | 'high') => setRequestPriority(v)}>
                    <SelectTrigger id="requestPriority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestRemarks">Remarks</Label>
                  <Textarea
                    id="requestRemarks"
                    placeholder="Additional notes or specifications..."
                    value={requestRemarks}
                    onChange={(e) => setRequestRemarks(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmitRequest} className="w-full bg-orange-600 hover:bg-orange-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Submit Request to Owner
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Payroll Entry</CardTitle>
                <CardDescription>Submit employee payroll information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="payrollEmployee">Employee Name</Label>
                  <Select value={payrollEmployeeName} onValueChange={setPayrollEmployeeName}>
                    <SelectTrigger id="payrollEmployee">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.length > 0 ? (
                        employees
                          .filter(emp => emp.isActive && emp.name && emp.name.trim().length > 0)
                          .map((emp) => (
                            <SelectItem key={emp.id} value={emp.name}>
                              {emp.name}
                            </SelectItem>
                          ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No employees available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {employees.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      Please add employees first in the Employees tab.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daysWorked">Days Worked</Label>
                    <Input
                      id="daysWorked"
                      type="number"
                      placeholder="e.g., 5"
                      value={payrollDaysWorked}
                      onChange={(e) => setPayrollDaysWorked(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payRate">Pay Rate (₱/day)</Label>
                    <Input
                      id="payRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 600.00"
                      value={payrollPayRate}
                      onChange={(e) => setPayrollPayRate(e.target.value)}
                    />
                  </div>
                </div>

                {payrollDaysWorked && payrollPayRate && !isNaN(parseInt(payrollDaysWorked)) && !isNaN(parseFloat(payrollPayRate)) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Pay</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₱{(parseInt(payrollDaysWorked) * parseFloat(payrollPayRate)).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSubmitPayroll}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={employees.length === 0}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Submit Payroll Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>View and manage employee information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Birthday</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>
                            {employee.birthday && employee.birthday.trim().length > 0
                              ? new Date(employee.birthday).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={employee.status === 'full-time' ? 'default' : 'outline'} className={employee.status === 'full-time' ? 'bg-cyan-600' : ''}>
                              {employee.status === 'full-time' ? 'Full-time' : 'Part-time'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{employee.email}</TableCell>
                          <TableCell className="text-sm text-gray-600">{employee.contactNumber}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditEmployee(employee)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteEmployee(employee.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Employee Form */}
                {showEmployeeForm && (
                  <Card className="mt-4 border-indigo-200">
                    <CardHeader>
                      <CardTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-name">Name *</Label>
                          <Input
                            id="emp-name"
                            type="text"
                            value={employeeFormData.name}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                            placeholder="Employee name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-email">Email *</Label>
                          <Input
                            id="emp-email"
                            type="email"
                            value={employeeFormData.email}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                            placeholder="employee@bluemoon.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-contact">Contact Number</Label>
                          <Input
                            id="emp-contact"
                            type="text"
                            value={employeeFormData.contactNumber}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, contactNumber: e.target.value })}
                            placeholder="555-0123"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-position">Position</Label>
                          <Input
                            id="emp-position"
                            type="text"
                            value={employeeFormData.position}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, position: e.target.value })}
                            placeholder="e.g., Barista, Cashier"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-status">Status</Label>
                          <Select value={employeeFormData.status} onValueChange={(value) => setEmployeeFormData({ ...employeeFormData, status: value as 'full-time' | 'part-time' })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-birthday">Birthday</Label>
                          <Input
                            id="emp-birthday"
                            type="date"
                            value={employeeFormData.birthday}
                            onChange={(e) => setEmployeeFormData({ ...employeeFormData, birthday: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEmployee} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                          {editingEmployee ? 'Update Employee' : 'Add Employee'}
                        </Button>
                        <Button onClick={handleCancelEmployeeForm} variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button onClick={handleAddEmployee} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Employee
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}