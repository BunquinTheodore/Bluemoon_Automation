import logo from 'figma:asset/2ea8e337c311dd84e6a339fac104593b92115d60.png';
import { collection, doc, getDocs, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import {
    Camera,
    CheckCircle2,
    ChefHat,
    Coffee,
    LogOut,
    Package,
    Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Screen, Task, User } from '../App';
import { db } from '../lib/firebase';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface EmployeeDashboardProps {
  user: User;
  onNavigate: (screen: Screen, task?: Task) => void;
  onLogout: () => void;
}

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
  const [tasks, setTasks] = useState<Task[]>([]);

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

  useEffect(() => {
    // Inventory real-time listener
    const unsubscribeInventory = onSnapshot(
      collection(db, 'inventory'),
      (snapshot) => {
        const items: InventoryItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const sealed = typeof data.sealed === 'number' ? data.sealed : 0;
          const loose = typeof data.loose === 'number' ? data.loose : 0;
          const total = typeof data.total === 'number' ? data.total : sealed + loose;
          return {
            id: data.inventoryId || docSnap.id,
            productName: data.productName || '',
            unit: data.unit || '',
            sealed,
            loose,
            delivered: total,
            dateDelivered: data.dateDelivered || new Date().toISOString().split('T')[0],
            station: data.station === 'coffee-bar' ? 'coffee-bar' : 'kitchen',
          };
        });
        setInventory(items);
      },
      (error) => {
        console.error('Error loading inventory from Firestore', error);
      }
    );

    const fetchTasks = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tasks'));
        if (!snapshot.empty) {
          const loadedTasks: Task[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            const station: 'kitchen' | 'coffee-bar' = data.station === 'coffee-bar' ? 'coffee-bar' : 'kitchen';
            const category: 'opening' | 'closing' = data.category === 'closing' ? 'closing' : 'opening';
            const status: 'pending' | 'completed' = data.status === 'completed' ? 'completed' : 'pending';

            return {
              id: data.taskId || docSnap.id,
              name: data.name || '',
              qrCodeId: data.qrCodeId || '',
              description: data.description || '',
              station,
              category,
              status,
            };
          });
          setTasks(loadedTasks);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error('Error loading tasks from Firestore', error);
      }
    };

    fetchTasks();

    // Cleanup function
    return () => {
      unsubscribeInventory();
    };
  }, []);

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

    const sealed = Number(newProductSealed);
    const loose = Number(newProductLoose);

    const isInvalid =
      !Number.isFinite(sealed) ||
      !Number.isFinite(loose) ||
      !Number.isInteger(sealed) ||
      !Number.isInteger(loose) ||
      sealed < 0 ||
      loose < 0;

    if (isInvalid) {
      toast.error('Invalid Input');
      return;
    }

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
        const numericValue = Number(value);

        const isInvalid =
          !Number.isFinite(numericValue) ||
          !Number.isInteger(numericValue) ||
          numericValue < 0;

        if (isInvalid) {
          toast.error('Invalid Input');
          return item;
        }

        const updatedItem = { ...item, [field]: numericValue };
        updatedItem.delivered = updatedItem.sealed + updatedItem.loose;
        updatedItem.dateDelivered = new Date().toISOString().split('T')[0];
        return updatedItem;
      }
      return item;
    }));
  };



  const handleSubmitInventory = async (station: 'kitchen' | 'coffee-bar') => {
    try {
      const itemsForStation = inventory.filter(item => item.station === station);

      if (itemsForStation.length === 0) {
        toast.error('No inventory items to submit for this station');
        return;
      }

      const writes = itemsForStation.map(async (item) => {
        const invRef = doc(collection(db, 'inventory'), item.id);
        const total = item.sealed + item.loose;
        const dateDelivered = item.dateDelivered || new Date().toISOString().split('T')[0];

        await setDoc(invRef, {
          inventoryId: item.id,
          productName: item.productName,
          unit: item.unit,
          sealed: item.sealed,
          loose: item.loose,
          total,
          station: item.station,
          branch: 'default',
          status: 'good',
          dateDelivered,
          lastUpdated: serverTimestamp(),
          updatedBy: user.id,
        }, { merge: true });

        const historyRef = doc(collection(invRef, 'history'));
        await setDoc(historyRef, {
          historyId: historyRef.id,
          sealed: item.sealed,
          loose: item.loose,
          total,
          action: 'updated',
          changedBy: user.id,
          changedByName: user.name,
          timestamp: serverTimestamp(),
          notes: 'Employee inventory submission',
        });
      });

      await Promise.all(writes);
      toast.success('Inventory submitted to manager!');
    } catch (error) {
      console.error('Error submitting inventory', error);
      toast.error('Failed to submit inventory. Please try again.');
    }
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
                        min={0}
                        placeholder="Sealed qty"
                        value={newProductSealed}
                        onChange={(e) => setNewProductSealed(e.target.value)}
                      />
                      <Input
                        type="number"
                        min={0}
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
                          {inventory
                            .filter(item => item.station === 'kitchen')
                            .filter(item => item.productName && item.productName.trim().length > 0)
                            .map((item) => (
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

                    <Button onClick={() => handleSubmitInventory('kitchen')} className="w-full bg-cyan-600 hover:bg-cyan-700">
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
                        min={0}
                        placeholder="Sealed qty"
                        value={newProductSealed}
                        onChange={(e) => setNewProductSealed(e.target.value)}
                      />
                      <Input
                        type="number"
                        min={0}
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
                          {inventory
                            .filter(item => item.station === 'coffee-bar')
                            .filter(item => item.productName && item.productName.trim().length > 0)
                            .map((item) => (
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

                    <Button onClick={() => handleSubmitInventory('coffee-bar')} className="w-full bg-cyan-600 hover:bg-cyan-700">
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
