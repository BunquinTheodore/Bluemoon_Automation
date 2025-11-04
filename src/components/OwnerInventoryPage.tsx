import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, LogOut, Package, AlertTriangle, Trash2, Coffee, ChefHat } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface OwnerInventoryPageProps {
  onBack: () => void;
  onLogout: () => void;
}

interface InventoryItem {
  id: string;
  productName: string;
  sealed: number;
  loose: number;
  unit: string;
  status: 'good' | 'low' | 'critical';
  dateDelivered: string;
  lastUpdated: string;
  ownerDelivered: string;
  ownerDateDelivered: string;
  station: 'kitchen' | 'coffee-bar';
}

const mockInventoryData: InventoryItem[] = [
  { id: '1', productName: 'Espresso Beans', sealed: 20, loose: 5, unit: 'kg', status: 'good', dateDelivered: 'Oct 20', lastUpdated: 'Oct 20', ownerDelivered: '', ownerDateDelivered: '', station: 'coffee-bar' },
  { id: '2', productName: 'Whole Milk', sealed: 10, loose: 2, unit: 'no. of package', status: 'good', dateDelivered: 'Oct 21', lastUpdated: 'Oct 21', ownerDelivered: '', ownerDateDelivered: '', station: 'coffee-bar' },
  { id: '3', productName: 'Almond Milk', sealed: 6, loose: 2, unit: 'no. of package', status: 'good', dateDelivered: 'Oct 21', lastUpdated: 'Oct 21', ownerDelivered: '', ownerDateDelivered: '', station: 'coffee-bar' },
  { id: '4', productName: 'Vanilla Syrup', sealed: 4, loose: 1, unit: 'bottle', status: 'low', dateDelivered: 'Oct 20', lastUpdated: 'Oct 20', ownerDelivered: '', ownerDateDelivered: '', station: 'coffee-bar' },
  { id: '5', productName: 'Caramel Syrup', sealed: 5, loose: 1, unit: 'bottle', status: 'good', dateDelivered: 'Oct 20', lastUpdated: 'Oct 20', ownerDelivered: '', ownerDateDelivered: '', station: 'coffee-bar' },
  { id: '6', productName: 'Paper Cups (16oz)', sealed: 180, loose: 20, unit: 'pcs', status: 'good', dateDelivered: 'Oct 19', lastUpdated: 'Oct 19', ownerDelivered: '', ownerDateDelivered: '', station: 'coffee-bar' },
  { id: '7', productName: 'Rice', sealed: 50, loose: 5, unit: 'kg', status: 'good', dateDelivered: 'Oct 21', lastUpdated: 'Oct 21', ownerDelivered: '', ownerDateDelivered: '', station: 'kitchen' },
  { id: '8', productName: 'Cooking Oil', sealed: 8, loose: 2, unit: 'bottle', status: 'good', dateDelivered: 'Oct 20', lastUpdated: 'Oct 20', ownerDelivered: '', ownerDateDelivered: '', station: 'kitchen' },
  { id: '9', productName: 'Salt', sealed: 2, loose: 1, unit: 'kg', status: 'critical', dateDelivered: 'Oct 20', lastUpdated: 'Oct 20', ownerDelivered: '', ownerDateDelivered: '', station: 'kitchen' },
  { id: '10', productName: 'Pepper', sealed: 6, loose: 2, unit: 'kg', status: 'low', dateDelivered: 'Oct 19', lastUpdated: 'Oct 19', ownerDelivered: '', ownerDateDelivered: '', station: 'kitchen' },
  { id: '11', productName: 'Garlic', sealed: 12, loose: 3, unit: 'kg', status: 'good', dateDelivered: 'Oct 21', lastUpdated: 'Oct 21', ownerDelivered: '', ownerDateDelivered: '', station: 'kitchen' },
  { id: '12', productName: 'Onion', sealed: 15, loose: 2, unit: 'kg', status: 'good', dateDelivered: 'Oct 20', lastUpdated: 'Oct 20', ownerDelivered: '', ownerDateDelivered: '', station: 'kitchen' },
];

export function OwnerInventoryPage({ onBack, onLogout }: OwnerInventoryPageProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventoryData);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const criticalItems = inventory.filter(item => item.status === 'critical');
  const lowItems = inventory.filter(item => item.status === 'low');

  const handleOwnerDeliveredChange = (id: string, value: string) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, ownerDelivered: value } : item
    ));
  };

  const handleOwnerDateDeliveredChange = (id: string, value: string) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, ownerDateDelivered: value } : item
    ));
  };

  const handleSaveInventory = () => {
    toast.success('Inventory data saved successfully!');
  };

  const handleToggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedItems([]);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (station: 'kitchen' | 'coffee-bar') => {
    const stationItems = inventory.filter(item => item.station === station);
    const allSelected = stationItems.every(item => selectedItems.includes(item.id));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !stationItems.find(item => item.id === id)));
    } else {
      const newSelections = stationItems.map(item => item.id);
      setSelectedItems(prev => [...new Set([...prev, ...newSelections])]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    
    setInventory(inventory.filter(item => !selectedItems.includes(item.id)));
    toast.success(`${selectedItems.length} item(s) deleted successfully!`);
    setSelectedItems([]);
    setDeleteMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl text-blue-900">Inventory</h1>
                  <p className="text-sm text-gray-500">Current stock levels</p>
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
        {/* Alert Cards */}
        {(criticalItems.length > 0 || lowItems.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {criticalItems.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-red-900">{criticalItems.length} Critical Items</p>
                        <p className="text-sm text-red-700">Immediate restocking needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {lowItems.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                      <div>
                        <p className="text-orange-900">{lowItems.length} Low Stock Items</p>
                        <p className="text-sm text-orange-700">Plan to restock soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}

        {/* Delete Mode Controls */}
        <div className="flex justify-end gap-2 mb-4">
          {deleteMode && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              disabled={selectedItems.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedItems.length})
            </Button>
          )}
          <Button
            onClick={handleToggleDeleteMode}
            variant={deleteMode ? 'outline' : 'default'}
            className={deleteMode ? '' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {deleteMode ? 'Cancel' : 'Delete Mode'}
          </Button>
        </div>

        {/* Inventory Tabs */}
        <Tabs defaultValue="kitchen" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-blue-100">
            <TabsTrigger value="kitchen" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              <ChefHat className="w-4 h-4 mr-2" />
              Kitchen
            </TabsTrigger>
            <TabsTrigger value="coffee-bar" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              <Coffee className="w-4 h-4 mr-2" />
              Coffee Bar
            </TabsTrigger>
          </TabsList>

          {/* Kitchen Inventory */}
          <TabsContent value="kitchen">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-purple-600" />
                  Kitchen Inventory
                </CardTitle>
                <CardDescription>Complete kitchen inventory overview with delivery tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {deleteMode && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={inventory.filter(item => item.station === 'kitchen').every(item => selectedItems.includes(item.id))}
                              onCheckedChange={() => handleSelectAll('kitchen')}
                            />
                          </TableHead>
                        )}
                        <TableHead>Product Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-center">Sealed</TableHead>
                        <TableHead className="text-center">Loose</TableHead>
                        <TableHead className="text-center">Delivered</TableHead>
                        <TableHead>Date Delivered</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-center bg-blue-50">Total Delivered</TableHead>
                        <TableHead className="text-center bg-blue-50">Owner Date Delivered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.filter(item => item.station === 'kitchen').map((item) => (
                        <TableRow 
                          key={item.id}
                          className={
                            item.status === 'critical' ? 'bg-red-50' :
                            item.status === 'low' ? 'bg-orange-50' : ''
                          }
                        >
                          {deleteMode && (
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={() => handleSelectItem(item.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(item.status === 'critical' || item.status === 'low') && (
                                <AlertTriangle className={`w-4 h-4 ${
                                  item.status === 'critical' ? 'text-red-600' : 'text-orange-600'
                                }`} />
                              )}
                              <span>{item.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              value={item.unit}
                              className="w-24"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={item.sealed}
                              className="w-20 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={item.loose}
                              className="w-20 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-gray-700">{item.sealed + item.loose}</span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {item.dateDelivered}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                item.status === 'critical' ? 'bg-red-600' :
                                item.status === 'low' ? 'bg-orange-500' :
                                'bg-green-600'
                              }
                            >
                              {item.status === 'critical' ? 'Critical' :
                               item.status === 'low' ? 'Low Stock' : 'Good'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {item.lastUpdated}
                          </TableCell>
                          <TableCell className="text-center bg-blue-50">
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={item.ownerDelivered}
                              onChange={(e) => handleOwnerDeliveredChange(item.id, e.target.value)}
                              className="w-24 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center bg-blue-50">
                            <Input
                              type="date"
                              value={item.ownerDateDelivered}
                              onChange={(e) => handleOwnerDateDeliveredChange(item.id, e.target.value)}
                              className="w-40 mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {!deleteMode && (
                  <Button onClick={handleSaveInventory} className="w-full bg-blue-600 hover:bg-blue-700">
                    Save Kitchen Inventory
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coffee Bar Inventory */}
          <TabsContent value="coffee-bar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-purple-600" />
                  Coffee Bar Inventory
                </CardTitle>
                <CardDescription>Complete coffee bar inventory overview with delivery tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {deleteMode && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={inventory.filter(item => item.station === 'coffee-bar').every(item => selectedItems.includes(item.id))}
                              onCheckedChange={() => handleSelectAll('coffee-bar')}
                            />
                          </TableHead>
                        )}
                        <TableHead>Product Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-center">Sealed</TableHead>
                        <TableHead className="text-center">Loose</TableHead>
                        <TableHead className="text-center">Delivered</TableHead>
                        <TableHead>Date Delivered</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-center bg-blue-50">Total Delivered</TableHead>
                        <TableHead className="text-center bg-blue-50">Owner Date Delivered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.filter(item => item.station === 'coffee-bar').map((item) => (
                        <TableRow 
                          key={item.id}
                          className={
                            item.status === 'critical' ? 'bg-red-50' :
                            item.status === 'low' ? 'bg-orange-50' : ''
                          }
                        >
                          {deleteMode && (
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={() => handleSelectItem(item.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(item.status === 'critical' || item.status === 'low') && (
                                <AlertTriangle className={`w-4 h-4 ${
                                  item.status === 'critical' ? 'text-red-600' : 'text-orange-600'
                                }`} />
                              )}
                              <span>{item.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              value={item.unit}
                              className="w-24"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={item.sealed}
                              className="w-20 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={item.loose}
                              className="w-20 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-gray-700">{item.sealed + item.loose}</span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {item.dateDelivered}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                item.status === 'critical' ? 'bg-red-600' :
                                item.status === 'low' ? 'bg-orange-500' :
                                'bg-green-600'
                              }
                            >
                              {item.status === 'critical' ? 'Critical' :
                               item.status === 'low' ? 'Low Stock' : 'Good'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {item.lastUpdated}
                          </TableCell>
                          <TableCell className="text-center bg-blue-50">
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={item.ownerDelivered}
                              onChange={(e) => handleOwnerDeliveredChange(item.id, e.target.value)}
                              className="w-24 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center bg-blue-50">
                            <Input
                              type="date"
                              value={item.ownerDateDelivered}
                              onChange={(e) => handleOwnerDateDeliveredChange(item.id, e.target.value)}
                              className="w-40 mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {!deleteMode && (
                  <Button onClick={handleSaveInventory} className="w-full bg-blue-600 hover:bg-blue-700">
                    Save Coffee Bar Inventory
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
