import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Screen, Task } from '../App';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  LogOut,
  Coffee,
  Camera,
  CheckCircle2,
  ChefHat,
  Package,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import logo from 'figma:asset/2ea8e337c311dd84e6a339fac104593b92115d60.png';

interface EmployeeDashboardProps {
  user: User;
  onNavigate: (screen: Screen, task?: Task) => void;
  onLogout: () => void;
}

const mockTasks: Task[] = [
  // Kitchen Opening Tasks
  { id: '1', name: 'Wear proper gear/uniform', qrCodeId: 'QR-K-O-001', station: 'kitchen', category: 'opening', description: 'Put on chef coat, hat, and apron', status: 'pending' },
  { id: '2', name: 'Turn on all equipment', qrCodeId: 'QR-K-O-002', station: 'kitchen', category: 'opening', description: 'Turn on ovens, stoves, and fryers', status: 'pending' },
  { id: '3', name: 'Sanitize tables, sinks, cutting boards', qrCodeId: 'QR-K-O-003', station: 'kitchen', category: 'opening', description: 'Clean all surfaces with sanitizer', status: 'pending' },
  { id: '4', name: 'Check dishwashing area', qrCodeId: 'QR-K-O-004', station: 'kitchen', category: 'opening', description: 'Ensure dishwasher is clean and ready', status: 'pending' },
  { id: '5', name: 'Label and date open items', qrCodeId: 'QR-K-O-005', station: 'kitchen', category: 'opening', description: 'Label all opened ingredients with date', status: 'pending' },
  { id: '6', name: 'Bring out ingredients from storage', qrCodeId: 'QR-K-O-006', station: 'kitchen', category: 'opening', description: 'Get ingredients from walk-in cooler', status: 'pending' },
  { id: '7', name: 'Restock condiments and kitchen supplies', qrCodeId: 'QR-K-O-007', station: 'kitchen', category: 'opening', description: 'Refill salt, pepper, oils, etc.', status: 'pending' },
  { id: '8', name: 'Sharpen knives and utensils', qrCodeId: 'QR-K-O-008', station: 'kitchen', category: 'opening', description: 'Sharpen all kitchen knives', status: 'pending' },
  { id: '9', name: 'Check freezer temperature logs', qrCodeId: 'QR-K-O-009', station: 'kitchen', category: 'opening', description: 'Record freezer temperatures', status: 'pending' },
  { id: '10', name: 'Smile Task', qrCodeId: 'QR-K-O-010', station: 'kitchen', category: 'opening', description: 'Greet team members with a smile', status: 'pending' },
  
  // Kitchen Closing Tasks
  { id: '11', name: 'Clean all cooking equipment', qrCodeId: 'QR-K-C-001', station: 'kitchen', category: 'closing', description: 'Clean ovens, stoves, and fryers', status: 'pending' },
  { id: '12', name: 'Sanitize all work surfaces', qrCodeId: 'QR-K-C-002', station: 'kitchen', category: 'closing', description: 'Wipe down all counters and tables', status: 'pending' },
  { id: '13', name: 'Store perishables properly', qrCodeId: 'QR-K-C-003', station: 'kitchen', category: 'closing', description: 'Put all food in proper storage', status: 'pending' },
  { id: '14', name: 'Sweep and mop kitchen floor', qrCodeId: 'QR-K-C-004', station: 'kitchen', category: 'closing', description: 'Clean entire kitchen floor', status: 'pending' },
  { id: '15', name: 'Take out trash and recycling', qrCodeId: 'QR-K-C-005', station: 'kitchen', category: 'closing', description: 'Empty all trash bins', status: 'pending' },
  { id: '16', name: 'Turn off all equipment', qrCodeId: 'QR-K-C-006', station: 'kitchen', category: 'closing', description: 'Power down all appliances', status: 'pending' },
  { id: '17', name: 'Smile Task', qrCodeId: 'QR-K-C-007', station: 'kitchen', category: 'closing', description: 'Thank team members for their hard work', status: 'pending' },
  
  // Coffee Bar Opening Tasks
  { id: '18', name: 'Turn on espresso machine', qrCodeId: 'QR-C-O-001', station: 'coffee-bar', category: 'opening', description: 'Power on and warm up espresso machine', status: 'pending' },
  { id: '19', name: 'Clean group heads and portafilters', qrCodeId: 'QR-C-O-002', station: 'coffee-bar', category: 'opening', description: 'Backflush espresso machine', status: 'pending' },
  { id: '20', name: 'Grind fresh coffee beans', qrCodeId: 'QR-C-O-003', station: 'coffee-bar', category: 'opening', description: 'Fill grinder with fresh beans', status: 'pending' },
  { id: '21', name: 'Stock milk and dairy products', qrCodeId: 'QR-C-O-004', station: 'coffee-bar', category: 'opening', description: 'Fill milk fridges', status: 'pending' },
  { id: '22', name: 'Restock cups, lids, and napkins', qrCodeId: 'QR-C-O-005', station: 'coffee-bar', category: 'opening', description: 'Refill all serving supplies', status: 'pending' },
  { id: '23', name: 'Fill syrup pumps and toppings', qrCodeId: 'QR-C-O-006', station: 'coffee-bar', category: 'opening', description: 'Check and refill all flavor syrups', status: 'pending' },
  { id: '24', name: 'Sanitize steam wands', qrCodeId: 'QR-C-O-007', station: 'coffee-bar', category: 'opening', description: 'Clean and purge steam wands', status: 'pending' },
  { id: '25', name: 'Smile Task', qrCodeId: 'QR-C-O-008', station: 'coffee-bar', category: 'opening', description: 'Start the day with positive energy', status: 'pending' },
  
  // Coffee Bar Closing Tasks
  { id: '26', name: 'Backflush espresso machine', qrCodeId: 'QR-C-C-001', station: 'coffee-bar', category: 'closing', description: 'Clean group heads thoroughly', status: 'pending' },
  { id: '27', name: 'Clean drip trays and portafilters', qrCodeId: 'QR-C-C-002', station: 'coffee-bar', category: 'closing', description: 'Soak and clean all parts', status: 'pending' },
  { id: '28', name: 'Wipe counters and equipment', qrCodeId: 'QR-C-C-003', station: 'coffee-bar', category: 'closing', description: 'Clean all surfaces and equipment', status: 'pending' },
  { id: '29', name: 'Clean blenders and grinders', qrCodeId: 'QR-C-C-004', station: 'coffee-bar', category: 'closing', description: 'Disassemble and clean', status: 'pending' },
  { id: '30', name: 'Sanitize steam wands', qrCodeId: 'QR-C-C-005', station: 'coffee-bar', category: 'closing', description: 'Clean and purge with steam', status: 'pending' },
  { id: '31', name: 'Store milk and syrups', qrCodeId: 'QR-C-C-006', station: 'coffee-bar', category: 'closing', description: 'Properly store all perishables', status: 'pending' },
  { id: '32', name: 'Discard expired items', qrCodeId: 'QR-C-C-007', station: 'coffee-bar', category: 'closing', description: 'Check dates and discard old milk', status: 'pending' },
  { id: '33', name: 'Restock for tomorrow', qrCodeId: 'QR-C-C-008', station: 'coffee-bar', category: 'closing', description: 'Prepare cups, lids, napkins for next day', status: 'pending' },
  { id: '34', name: 'Sweep and mop bar area', qrCodeId: 'QR-C-C-009', station: 'coffee-bar', category: 'closing', description: 'Clean entire coffee bar floor', status: 'pending' },
  { id: '35', name: 'Take out trash', qrCodeId: 'QR-C-C-010', station: 'coffee-bar', category: 'closing', description: 'Empty all trash bins', status: 'pending' },
  { id: '36', name: 'Turn off all equipment', qrCodeId: 'QR-C-C-011', station: 'coffee-bar', category: 'closing', description: 'Power down espresso machine, grinders, brewers', status: 'pending' },
  { id: '37', name: 'Smile Task', qrCodeId: 'QR-C-C-012', station: 'coffee-bar', category: 'closing', description: 'End the day with gratitude', status: 'pending' },
];

interface InventoryItem {
  id: string;
  productName: string;
  unit: string;
  sealed: number;
  loose: number;
  delivered: number;
  dateDelivered: string;
  station: 'kitchen' | 'coffee-bar';
}

export function EmployeeDashboard({ user, onNavigate, onLogout }: EmployeeDashboardProps) {
  const [selectedStation, setSelectedStation] = useState<'kitchen' | 'coffee-bar'>('kitchen');
  const [selectedCategory, setSelectedCategory] = useState<'opening' | 'closing'>('opening');
  const [tasks, setTasks] = useState(mockTasks);

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', productName: 'Espresso Beans', unit: 'kg', sealed: 25, loose: 2, delivered: 27, dateDelivered: '2025-10-20', station: 'coffee-bar' },
    { id: '2', productName: 'Whole Milk', unit: 'no. of package', sealed: 12, loose: 1, delivered: 13, dateDelivered: '2025-10-21', station: 'coffee-bar' },
    { id: '3', productName: 'Vanilla Syrup', unit: 'bottle', sealed: 5, loose: 1, delivered: 6, dateDelivered: '2025-10-20', station: 'coffee-bar' },
    { id: '4', productName: 'Rice', unit: 'kg', sealed: 50, loose: 5, delivered: 55, dateDelivered: '2025-10-21', station: 'kitchen' },
    { id: '5', productName: 'Cooking Oil', unit: 'bottle', sealed: 8, loose: 2, delivered: 10, dateDelivered: '2025-10-20', station: 'kitchen' },
    { id: '6', productName: 'Salt', unit: 'kg', sealed: 10, loose: 1, delivered: 11, dateDelivered: '2025-10-19', station: 'kitchen' },
  ]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('kg');
  const [newProductSealed, setNewProductSealed] = useState('');
  const [newProductLoose, setNewProductLoose] = useState('');
  const [inventoryStation, setInventoryStation] = useState<'kitchen' | 'coffee-bar'>('kitchen');

  const handleScanQR = (task: Task) => {
    onNavigate('qr-scan', task);
  };

  const filteredTasks = tasks.filter(
    task => task.station === selectedStation && task.category === selectedCategory
  );

  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;

  // Inventory Functions
  const handleAddInventoryItem = () => {
    if (!newProductName.trim() || !newProductSealed || !newProductLoose) {
      toast.error('Please fill in all product fields');
      return;
    }

    const sealed = parseInt(newProductSealed);
    const loose = parseInt(newProductLoose);
    const delivered = sealed + loose;

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      productName: newProductName,
      unit: newProductUnit,
      sealed,
      loose,
      delivered,
      dateDelivered: new Date().toISOString().split('T')[0],
      station: inventoryStation,
    };

    setInventory([...inventory, newItem]);
    toast.success('Product added to inventory');
    setNewProductName('');
    setNewProductSealed('');
    setNewProductLoose('');
  };

  const handleUpdateInventory = (id: string, field: 'sealed' | 'loose', value: string) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newValue = parseInt(value) || 0;
        const updatedItem = { ...item, [field]: newValue };
        updatedItem.delivered = updatedItem.sealed + updatedItem.loose;
        updatedItem.dateDelivered = new Date().toISOString().split('T')[0];
        return updatedItem;
      }
      return item;
    }));
  };



  const handleSubmitInventory = () => {
    toast.success('Inventory submitted to manager!');
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
                onClick={() => onNavigate('recipes-list')}
                title="Recipes"
              >
                <Coffee className="w-5 h-5 text-cyan-600" />
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
                  <p className="text-xs text-gray-500">Employee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-cyan-100">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            {/* Station Tabs */}
            <Tabs value={selectedStation} onValueChange={(value: any) => setSelectedStation(value)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-cyan-100">
                <TabsTrigger value="kitchen" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Kitchen
                </TabsTrigger>
                <TabsTrigger value="coffee-bar" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                  <Coffee className="w-4 h-4 mr-2" />
                  Coffee Bar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="kitchen" className="space-y-6">
                {/* Category Selector */}
                <div className="flex gap-3 justify-center">
                  <Button
                    variant={selectedCategory === 'opening' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('opening')}
                    className={selectedCategory === 'opening' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                  >
                    Opening Tasks
                  </Button>
                  <Button
                    variant={selectedCategory === 'closing' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('closing')}
                    className={selectedCategory === 'closing' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                  >
                    Closing Tasks
                  </Button>
                </div>

                {/* Tasks List */}
                <Card className="border-cyan-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-cyan-600" />
                      {selectedCategory === 'opening' ? 'Opening' : 'Closing'} Tasks
                    </CardTitle>
                    <CardDescription>
                      {completedCount} of {filteredTasks.length} completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            task.status === 'completed'
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 hover:border-cyan-300 hover:shadow-md'
                          } transition-all`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                            )}
                            <div>
                              <p className={`${task.status === 'completed' ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                {task.name}
                              </p>
                              <p className="text-xs text-gray-500">{task.description}</p>
                            </div>
                          </div>
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleScanQR(task)}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coffee-bar" className="space-y-6">
                {/* Category Selector */}
                <div className="flex gap-3 justify-center">
                  <Button
                    variant={selectedCategory === 'opening' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('opening')}
                    className={selectedCategory === 'opening' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                  >
                    Opening Tasks
                  </Button>
                  <Button
                    variant={selectedCategory === 'closing' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('closing')}
                    className={selectedCategory === 'closing' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                  >
                    Closing Tasks
                  </Button>
                </div>

                {/* Tasks List */}
                <Card className="border-cyan-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-cyan-600" />
                      {selectedCategory === 'opening' ? 'Opening' : 'Closing'} Tasks
                    </CardTitle>
                    <CardDescription>
                      {completedCount} of {filteredTasks.length} completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            task.status === 'completed'
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 hover:border-cyan-300 hover:shadow-md'
                          } transition-all`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                            )}
                            <div>
                              <p className={`${task.status === 'completed' ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                {task.name}
                              </p>
                              <p className="text-xs text-gray-500">{task.description}</p>
                            </div>
                          </div>
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleScanQR(task)}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Tabs value={inventoryStation} onValueChange={(value: any) => setInventoryStation(value)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-cyan-100">
                <TabsTrigger value="kitchen" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Kitchen
                </TabsTrigger>
                <TabsTrigger value="coffee-bar" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                  <Coffee className="w-4 h-4 mr-2" />
                  Coffee Bar
                </TabsTrigger>
              </TabsList>

              {/* Kitchen Inventory */}
              <TabsContent value="kitchen">
                <Card className="border-cyan-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-cyan-600" />
                      Kitchen Inventory
                    </CardTitle>
                    <CardDescription>Input and track kitchen inventory quantities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add New Product */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <Input
                        placeholder="Product name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                      <Select value={newProductUnit} onValueChange={setNewProductUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="gram">gram</SelectItem>
                          <SelectItem value="no. of package">no. of package</SelectItem>
                          <SelectItem value="no. of can">no. of can</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="bottle">bottle</SelectItem>
                          <SelectItem value="no. of roll">no. of roll</SelectItem>
                          <SelectItem value="sleeve">sleeve</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Sealed qty"
                        value={newProductSealed}
                        onChange={(e) => setNewProductSealed(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Loose qty"
                        value={newProductLoose}
                        onChange={(e) => setNewProductLoose(e.target.value)}
                      />
                      <Button onClick={handleAddInventoryItem} className="bg-cyan-600 hover:bg-cyan-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Inventory Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-center">Sealed</TableHead>
                            <TableHead className="text-center">Loose</TableHead>
                            <TableHead className="text-center">Delivered</TableHead>
                            <TableHead>Date Delivered</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory.filter(item => item.station === 'kitchen').map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={item.sealed}
                                  onChange={(e) => handleUpdateInventory(item.id, 'sealed', e.target.value)}
                                  className="w-20 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={item.loose}
                                  onChange={(e) => handleUpdateInventory(item.id, 'loose', e.target.value)}
                                  className="w-20 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-gray-700">{item.delivered}</span>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(item.dateDelivered).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <Button onClick={handleSubmitInventory} className="w-full bg-cyan-600 hover:bg-cyan-700">
                      Submit Kitchen Inventory to Manager
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Coffee Bar Inventory */}
              <TabsContent value="coffee-bar">
                <Card className="border-cyan-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-cyan-600" />
                      Coffee Bar Inventory
                    </CardTitle>
                    <CardDescription>Input and track coffee bar inventory quantities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add New Product */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <Input
                        placeholder="Product name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                      <Select value={newProductUnit} onValueChange={setNewProductUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="gram">gram</SelectItem>
                          <SelectItem value="no. of package">no. of package</SelectItem>
                          <SelectItem value="no. of can">no. of can</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="bottle">bottle</SelectItem>
                          <SelectItem value="no. of roll">no. of roll</SelectItem>
                          <SelectItem value="sleeve">sleeve</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Sealed qty"
                        value={newProductSealed}
                        onChange={(e) => setNewProductSealed(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Loose qty"
                        value={newProductLoose}
                        onChange={(e) => setNewProductLoose(e.target.value)}
                      />
                      <Button onClick={handleAddInventoryItem} className="bg-cyan-600 hover:bg-cyan-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Inventory Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-center">Sealed</TableHead>
                            <TableHead className="text-center">Loose</TableHead>
                            <TableHead className="text-center">Delivered</TableHead>
                            <TableHead>Date Delivered</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory.filter(item => item.station === 'coffee-bar').map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={item.sealed}
                                  onChange={(e) => handleUpdateInventory(item.id, 'sealed', e.target.value)}
                                  className="w-20 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={item.loose}
                                  onChange={(e) => handleUpdateInventory(item.id, 'loose', e.target.value)}
                                  className="w-20 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-gray-700">{item.delivered}</span>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(item.dateDelivered).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <Button onClick={handleSubmitInventory} className="w-full bg-cyan-600 hover:bg-cyan-700">
                      Submit Coffee Bar Inventory to Manager
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
