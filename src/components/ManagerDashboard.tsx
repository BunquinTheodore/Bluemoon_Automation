import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Screen } from '../App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Calendar } from './ui/calendar';
import {
  LogOut,
  ClipboardList,
  FileBarChart,
  Package,
  ShoppingCart,
  Wallet,
  Users,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Upload,
  AlertTriangle,
  Calendar as CalendarIcon,
  Image,
  Camera,
  ShoppingBag,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import logo from 'figma:asset/2ea8e337c311dd84e6a339fac104593b92115d60.png';

interface ManagerDashboardProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

// Mock Data
const mockEmployees = [
  { id: '1', name: 'Sarah Johnson', role: 'Cashier', status: 'full-time' as const, email: 'sarah@bluemoon.com', contactNumber: '555-0101', birthday: '1995-03-15' },
  { id: '2', name: 'Mike Chen', role: 'Barista', status: 'full-time' as const, email: 'mike@bluemoon.com', contactNumber: '555-0102', birthday: '1998-07-22' },
  { id: '3', name: 'Emma Davis', role: 'Kitchen', status: 'part-time' as const, email: 'emma@bluemoon.com', contactNumber: '555-0103', birthday: '2000-11-08' },
  { id: '4', name: 'James Wilson', role: 'Cashier', status: 'part-time' as const, email: 'james@bluemoon.com', contactNumber: '555-0104', birthday: '1997-05-30' },
];

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
  // Manager's Own Tasks
  const [managerTasks, setManagerTasks] = useState<ManagerTask[]>([
    // Daily Tasks
    { id: '1', name: 'Review daily sales report', completed: false, type: 'daily' },
    { id: '2', name: 'Check equipment maintenance', completed: true, type: 'daily' },
    { id: '3', name: 'Update employee schedule', completed: false, type: 'daily' },
    { id: '4', name: 'Monitor inventory levels', completed: false, type: 'daily' },
    
    // Weekly Tasks
    { id: '5', name: 'Order stocks', completed: false, type: 'weekly', day: 'Friday', icon: ShoppingBag },
    { id: '6', name: 'Shopee orders', completed: false, type: 'weekly', day: 'Friday', icon: ShoppingCart },
    { id: '7', name: 'Finance meeting', completed: false, type: 'weekly', day: 'Monday', icon: DollarSign },
    { id: '8', name: 'Sweep the floor', completed: false, type: 'weekly', day: 'Thursday', icon: Sparkles },
  ]);

  // Employee Task Assignment
  const [employeeTaskName, setEmployeeTaskName] = useState('');
  const [employeeTaskAssignee, setEmployeeTaskAssignee] = useState('');
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
  const [inventory, setInventory] = useState(mockInventory);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSealed, setNewProductSealed] = useState('');
  const [newProductLoose, setNewProductLoose] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('kg');
  const [wastedInventoryImage, setWastedInventoryImage] = useState<File | null>(null);

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
  const [employees, setEmployees] = useState(mockEmployees);

  const handleToggleManagerTask = (id: string) => {
    setManagerTasks(managerTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleAssignEmployeeTask = () => {
    if (!employeeTaskName.trim() || !employeeTaskAssignee) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Task assigned to employee!', {
      description: `${employeeTaskName} assigned to ${employeeTaskAssignee}`,
    });
    setEmployeeTaskName('');
    setEmployeeTaskAssignee('');
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

  const handleSubmitFinancialReport = () => {
    if (!startingCash || !startingDigital || !startingBank || !turnoverCash || !turnoverDigital || !turnoverBank || !closingStartCash || !closingStartDigital || !closingStartBank || !closingTurnoverCash || !closingTurnoverDigital || !closingTurnoverBank) {
      toast.error('Please fill in all financial fields');
      return;
    }
    toast.success('Financial report submitted!');
    setFinancialStatus('pending');
  };

  const handleAddInventoryItem = () => {
    if (!newProductName.trim() || !newProductSealed || !newProductLoose) {
      toast.error('Please fill in all product fields');
      return;
    }

    const newItem: InventoryItemExtended = {
      id: Date.now().toString(),
      productName: newProductName,
      sealed: parseInt(newProductSealed),
      loose: parseInt(newProductLoose),
      unit: newProductUnit,
      lastUpdated: new Date(),
    };

    setInventory([...inventory, newItem]);
    toast.success('Product added to inventory');
    setNewProductName('');
    setNewProductSealed('');
    setNewProductLoose('');
  };

  const handleUpdateInventory = (id: string, field: 'sealed' | 'loose', change: number) => {
    setInventory(inventory.map(item =>
      item.id === id
        ? { ...item, [field]: Math.max(0, item[field] + change), lastUpdated: new Date() }
        : item
    ));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast.success('Product removed from inventory');
  };

  const handleSubmitInventory = () => {
    toast.success('Inventory submitted to owner!');
  };

  const handleSubmitRequest = () => {
    if (!requestItemName.trim() || !requestQuantity) {
      toast.error('Please fill in item name and quantity');
      return;
    }

    toast.success('Request submitted to owner!', {
      description: `${requestItemName} (Qty: ${requestQuantity}) - Priority: ${requestPriority}`,
    });

    setRequestItemName('');
    setRequestQuantity('');
    setRequestRemarks('');
  };

  const handleSubmitPayroll = () => {
    if (!payrollEmployeeName || !payrollDaysWorked || !payrollPayRate) {
      toast.error('Please fill in all payroll fields');
      return;
    }

    const totalPay = parseInt(payrollDaysWorked) * parseFloat(payrollPayRate);
    toast.success('Payroll entry submitted!', {
      description: `${payrollEmployeeName} - Total: ₱${totalPay.toFixed(2)}`,
    });

    setPayrollEmployeeName('');
    setPayrollDaysWorked('');
    setPayrollPayRate('');
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label htmlFor="employeeTaskAssignee">Assign To</Label>
                        <Select value={employeeTaskAssignee} onValueChange={setEmployeeTaskAssignee}>
                          <SelectTrigger id="employeeTaskAssignee">
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockEmployees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.name}>
                                {emp.name} - {emp.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      Assign Task to Employee
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
                  onSelect={setSelectedDate}
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
                      {mockEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={`${emp.name} - ${emp.role}`}>
                          {emp.name} - {emp.role}
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
                          {inventory.filter(item => item.station === 'kitchen').map((item) => (
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
                          {inventory.filter(item => item.station === 'coffee-bar').map((item) => (
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
          <TabsContent value="payroll">
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
                      {mockEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.name}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {payrollDaysWorked && payrollPayRate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Pay</p>
                    <p className="text-2xl text-green-700">
                      ₱{(parseInt(payrollDaysWorked) * parseFloat(payrollPayRate)).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button onClick={handleSubmitPayroll} className="w-full bg-amber-600 hover:bg-amber-700">
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
                        <TableHead>Role</TableHead>
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
                          <TableCell>{employee.role}</TableCell>
                          <TableCell>{new Date(employee.birthday).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={employee.status === 'full-time' ? 'default' : 'outline'} className={employee.status === 'full-time' ? 'bg-cyan-600' : ''}>
                              {employee.status === 'full-time' ? 'Full-time' : 'Part-time'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{employee.email}</TableCell>
                          <TableCell className="text-sm text-gray-600">{employee.contactNumber}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
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