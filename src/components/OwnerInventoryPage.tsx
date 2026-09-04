import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, LogOut, Package, AlertTriangle, Trash2, Coffee, ChefHat, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  ownerDelivered: number;
  ownerDateDelivered: string;
  station: 'kitchen' | 'coffee-bar';
}

interface InventorySubmission {
  historyId: string;
  productName: string;
  unit: string;
  station: 'kitchen' | 'coffee-bar';
  sealed: number;
  loose: number;
  delivered: number;    // sealed + loose
  submittedBy: string;
  submittedByName: string;
  timestamp: Date;
  notes: string;
}

const DEFAULT_LOW_STOCK_THRESHOLD = 15;
const DEFAULT_CRITICAL_THRESHOLD = 5;

const toNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// Calculate inventory status from total quantity, honouring per-item thresholds when present
const calculateStatus = (
  total: number,
  lowThreshold = DEFAULT_LOW_STOCK_THRESHOLD,
  criticalThreshold = DEFAULT_CRITICAL_THRESHOLD,
): 'good' | 'low' | 'critical' => {
  const critical = Math.max(0, criticalThreshold);
  const low = Math.max(critical, lowThreshold);
  if (total <= critical) return 'critical';
  if (total <= low) return 'low';
  return 'good';
};

const formatDate = (value: unknown): string => {
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return '—';
};

export function OwnerInventoryPage({ onBack, onLogout }: OwnerInventoryPageProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dailySubmissions, setDailySubmissions] = useState<InventorySubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Unsaved owner edits, keyed by inventory doc id, so live snapshots don't clobber them
  const pendingEdits = useRef<Map<string, { ownerDelivered: number; ownerDateDelivered: string }>>(new Map());
  // Guards against out-of-order responses when the user changes dates quickly
  const submissionsRequestId = useRef(0);

  // Fetch inventory from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items: InventoryItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const sealed = Math.max(0, toNumber(data.sealed));
        const loose = Math.max(0, toNumber(data.loose));
        const total = sealed + loose;

        const status = calculateStatus(
          total,
          toNumber(data.lowStockThreshold, DEFAULT_LOW_STOCK_THRESHOLD),
          toNumber(data.criticalThreshold, DEFAULT_CRITICAL_THRESHOLD),
        );

        const pending = pendingEdits.current.get(docSnap.id);

        return {
          id: docSnap.id,
          productName: data.productName || '',
          sealed,
          loose,
          unit: data.unit || '',
          status,
          dateDelivered: data.dateDelivered || '',
          lastUpdated: formatDate(data.lastUpdated),
          ownerDelivered: pending ? pending.ownerDelivered : Math.max(0, toNumber(data.ownerDelivered)),
          ownerDateDelivered: pending ? pending.ownerDateDelivered : (data.ownerDateDelivered || ''),
          station: data.station === 'coffee-bar' ? 'coffee-bar' : 'kitchen',
        };
      });

      setInventory(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const criticalItems = inventory.filter(item => item.status === 'critical');
  const lowItems = inventory.filter(item => item.status === 'low');

  const applyOwnerEdit = (id: string, patch: Partial<Pick<InventoryItem, 'ownerDelivered' | 'ownerDateDelivered'>>) => {
    setInventory(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, ...patch };
      pendingEdits.current.set(id, {
        ownerDelivered: next.ownerDelivered,
        ownerDateDelivered: next.ownerDateDelivered,
      });
      return next;
    }));
  };

  const handleOwnerDeliveredChange = (id: string, value: string) => {
    applyOwnerEdit(id, { ownerDelivered: Math.max(0, toNumber(value)) });
  };

  const handleOwnerDateDeliveredChange = (id: string, value: string) => {
    applyOwnerEdit(id, { ownerDateDelivered: value });
  };

  const handleSaveInventory = async () => {
    const edits = Array.from(pendingEdits.current.entries());
    if (edits.length === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        edits.map(([id, edit]) =>
          updateDoc(doc(db, 'inventory', id), {
            ownerDelivered: edit.ownerDelivered,
            ownerDateDelivered: edit.ownerDateDelivered,
          })
        )
      );
      pendingEdits.current.clear();
      toast.success('Inventory data saved successfully!');
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast.error('Failed to save inventory data');
    } finally {
      setSaving(false);
    }
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

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    setDeleting(true);
    try {
      await Promise.all(selectedItems.map((itemId) => deleteDoc(doc(db, 'inventory', itemId))));
      selectedItems.forEach((itemId) => pendingEdits.current.delete(itemId));
      toast.success(`${selectedItems.length} item(s) deleted successfully!`);
      setSelectedItems([]);
      setDeleteMode(false);
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
    } finally {
      setDeleting(false);
    }
  };

  const fetchSubmissionsForDate = async (date: Date) => {
    const requestId = ++submissionsRequestId.current;
    setLoadingSubmissions(true);
    try {
      // Define date range for the selected day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch all inventory items
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const allSubmissions: InventorySubmission[] = [];

      // Query each item's history subcollection for the selected day, in parallel
      await Promise.all(inventorySnapshot.docs.map(async (inventoryDoc) => {
        const inventoryData = inventoryDoc.data();
        const historyQuery = query(
          collection(db, 'inventory', inventoryDoc.id, 'history'),
          where('timestamp', '>=', startOfDay),
          where('timestamp', '<=', endOfDay),
          orderBy('timestamp', 'desc')
        );

        const historySnapshot = await getDocs(historyQuery);

        historySnapshot.docs.forEach((historyDoc) => {
          const data = historyDoc.data();
          const sealed = Math.max(0, toNumber(data.sealed));
          const loose = Math.max(0, toNumber(data.loose));
          const timestamp = data.timestamp && typeof data.timestamp.toDate === 'function'
            ? data.timestamp.toDate()
            : startOfDay;
          allSubmissions.push({
            historyId: `${inventoryDoc.id}_${historyDoc.id}`,
            productName: inventoryData.productName || '[Deleted Product]',
            unit: inventoryData.unit || '',
            station: inventoryData.station === 'coffee-bar' ? 'coffee-bar' : 'kitchen',
            sealed,
            loose,
            delivered: toNumber(data.total, sealed + loose),
            submittedBy: data.changedBy || '',
            submittedByName: data.changedByName || 'Unknown',
            timestamp,
            notes: data.notes || ''
          });
        });
      }));

      if (requestId !== submissionsRequestId.current) return;

      // Sort by timestamp (most recent first)
      allSubmissions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setDailySubmissions(allSubmissions);
    } catch (error) {
      if (requestId !== submissionsRequestId.current) return;
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load inventory submissions');
    } finally {
      if (requestId === submissionsRequestId.current) {
        setLoadingSubmissions(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
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
              type="button"
              variant="ghost"
              onClick={onLogout}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
              title="Logout"
              aria-label="Logout"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
        {/* Date Filter and History Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Date Selector Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Filter by Date
              </CardTitle>
              <CardDescription>View inventory changes history</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => {
                  setSelectedDate(date);
                  if (date) {
                    void fetchSubmissionsForDate(date);
                  } else {
                    submissionsRequestId.current += 1;
                    setDailySubmissions([]);
                    setLoadingSubmissions(false);
                  }
                }}
                className="rounded-lg border shadow-sm"
              />
              {selectedDate && (
                <Button
                  type="button"
                  onClick={() => {
                    submissionsRequestId.current += 1;
                    setSelectedDate(undefined);
                    setDailySubmissions([]);
                    setLoadingSubmissions(false);
                  }}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Clear Filter
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Submissions Display Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inventory Submissions</CardTitle>
              <CardDescription>
                {selectedDate
                  ? `Submissions for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${dailySubmissions.length} submission${dailySubmissions.length !== 1 ? 's' : ''}`
                  : 'Select a date to view inventory submissions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : !selectedDate ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Select a date from the calendar to view</p>
                  <p className="text-sm mt-1">inventory submissions for that day</p>
                </div>
              ) : dailySubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">No inventory submissions for this date</p>
                </div>
              ) : (
                <Tabs defaultValue="kitchen" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-blue-100">
                    <TabsTrigger value="kitchen" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                      <ChefHat className="w-4 h-4 mr-2" />
                      Kitchen ({dailySubmissions.filter(s => s.station === 'kitchen').length})
                    </TabsTrigger>
                    <TabsTrigger value="coffee-bar" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                      <Coffee className="w-4 h-4 mr-2" />
                      Coffee Bar ({dailySubmissions.filter(s => s.station === 'coffee-bar').length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Kitchen Submissions */}
                  <TabsContent value="kitchen">
                    {dailySubmissions.filter(s => s.station === 'kitchen').length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No kitchen submissions for this date</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="text-center">Sealed</TableHead>
                              <TableHead className="text-center">Loose</TableHead>
                              <TableHead className="text-center">Delivered</TableHead>
                              <TableHead>Submitted By</TableHead>
                              <TableHead>Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dailySubmissions
                              .filter(s => s.station === 'kitchen')
                              .map((submission, index) => (
                                <motion.tr
                                  key={submission.historyId}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="border-b"
                                >
                                  <TableCell>{submission.productName}</TableCell>
                                  <TableCell>{submission.unit}</TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-gray-700">{submission.sealed}</span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-gray-700">{submission.loose}</span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="font-semibold text-gray-900">{submission.delivered}</span>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {submission.submittedByName}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-500">
                                    {submission.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </TableCell>
                                </motion.tr>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  {/* Coffee Bar Submissions */}
                  <TabsContent value="coffee-bar">
                    {dailySubmissions.filter(s => s.station === 'coffee-bar').length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No coffee bar submissions for this date</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="text-center">Sealed</TableHead>
                              <TableHead className="text-center">Loose</TableHead>
                              <TableHead className="text-center">Delivered</TableHead>
                              <TableHead>Submitted By</TableHead>
                              <TableHead>Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dailySubmissions
                              .filter(s => s.station === 'coffee-bar')
                              .map((submission, index) => (
                                <motion.tr
                                  key={submission.historyId}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="border-b"
                                >
                                  <TableCell>{submission.productName}</TableCell>
                                  <TableCell>{submission.unit}</TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-gray-700">{submission.sealed}</span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-gray-700">{submission.loose}</span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="font-semibold text-gray-900">{submission.delivered}</span>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {submission.submittedByName}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-500">
                                    {submission.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </TableCell>
                                </motion.tr>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

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
              type="button"
              onClick={handleDeleteSelected}
              variant="destructive"
              disabled={selectedItems.length === 0 || deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : `Delete Selected (${selectedItems.length})`}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleToggleDeleteMode}
            disabled={deleting}
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
                              aria-label="Select all kitchen items"
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
                      {inventory.filter(item => item.station === 'kitchen').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={deleteMode ? 11 : 10} className="text-center py-8 text-gray-500">
                            No kitchen inventory items yet
                          </TableCell>
                        </TableRow>
                      )}
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
                                aria-label={`Select ${item.productName}`}
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
                            <span className="text-gray-700">{item.unit}</span>
                          </TableCell>
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
                              min={0}
                              placeholder="Qty"
                              aria-label={`Total delivered for ${item.productName}`}
                              value={item.ownerDelivered}
                              onChange={(e) => handleOwnerDeliveredChange(item.id, e.target.value)}
                              className="w-24 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center bg-blue-50">
                            <Input
                              type="date"
                              aria-label={`Owner date delivered for ${item.productName}`}
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
                  <Button type="button" onClick={handleSaveInventory} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
                    {saving ? 'Saving...' : 'Save Kitchen Inventory'}
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
                              aria-label="Select all coffee bar items"
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
                      {inventory.filter(item => item.station === 'coffee-bar').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={deleteMode ? 11 : 10} className="text-center py-8 text-gray-500">
                            No coffee bar inventory items yet
                          </TableCell>
                        </TableRow>
                      )}
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
                                aria-label={`Select ${item.productName}`}
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
                            <span className="text-gray-700">{item.unit}</span>
                          </TableCell>
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
                              min={0}
                              placeholder="Qty"
                              aria-label={`Total delivered for ${item.productName}`}
                              value={item.ownerDelivered}
                              onChange={(e) => handleOwnerDeliveredChange(item.id, e.target.value)}
                              className="w-24 text-center mx-auto"
                              disabled={deleteMode}
                            />
                          </TableCell>
                          <TableCell className="text-center bg-blue-50">
                            <Input
                              type="date"
                              aria-label={`Owner date delivered for ${item.productName}`}
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
                  <Button type="button" onClick={handleSaveInventory} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
                    {saving ? 'Saving...' : 'Save Coffee Bar Inventory'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
