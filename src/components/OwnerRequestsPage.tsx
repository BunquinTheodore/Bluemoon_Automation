import { Timestamp, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, FileText, LogOut, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface OwnerRequestsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

interface ShopRequest {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  priority: 'low' | 'medium' | 'high';
  remarks: string;
  manager: string;
  submittedAt: Date;
}

export function OwnerRequestsPage({ onBack, onLogout }: OwnerRequestsPageProps) {
  const [requests, setRequests] = useState<ShopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const requestsCollection = collection(db, 'requests');

    const unsubscribe = onSnapshot(
      requestsCollection,
      (snapshot) => {
        const loadedRequests: ShopRequest[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const submittedAtRaw = data.submittedAt;
            const submittedAt: Date =
              submittedAtRaw instanceof Timestamp
                ? submittedAtRaw.toDate()
                : typeof submittedAtRaw === 'string' && !Number.isNaN(new Date(submittedAtRaw).getTime())
                ? new Date(submittedAtRaw)
                : new Date(0);

            const quantityRaw = typeof data.quantity === 'string' ? Number(data.quantity) : data.quantity;
            const quantity =
              typeof quantityRaw === 'number' && Number.isFinite(quantityRaw) && quantityRaw > 0
                ? quantityRaw
                : 0;

            return {
              id: docSnap.id,
              itemName: typeof data.itemName === 'string' ? data.itemName : '',
              quantity,
              unit: typeof data.unit === 'string' && data.unit ? data.unit : 'units',
              priority:
                (data.priority === 'high'
                  ? 'high'
                  : data.priority === 'medium'
                  ? 'medium'
                  : 'low') as 'low' | 'medium' | 'high',
              remarks: typeof data.remarks === 'string' ? data.remarks : '',
              manager: typeof data.managerName === 'string' && data.managerName ? data.managerName : 'Manager',
              submittedAt,
            };
          })
          .filter((request) => request.itemName.trim().length > 0 && request.quantity > 0);

        loadedRequests.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
        setRequests(loadedRequests);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading requests', error);
        toast.error('Failed to load requests.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const totalRequests = requests.length;
  const highPriorityCount = requests.filter((r) => r.priority === 'high').length;

  const handleDeleteRequest = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this request? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'requests', id));
      toast.success('Request deleted');
    } catch (error) {
      console.error('Error deleting request', error);
      toast.error('Failed to delete request. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

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
                <div className="bg-orange-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl text-cyan-900">Shop Requests</h1>
                  <p className="text-sm text-gray-500">Manager-submitted requests</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-cyan-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="text-2xl text-cyan-700">{totalRequests}</p>
                  </div>
                  <FileText className="w-8 h-8 text-cyan-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-red-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-2xl text-red-700">{highPriorityCount}</p>
                  </div>
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center items-center py-12" role="status" aria-label="Loading requests">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No shop requests yet</p>
          </div>
        ) : null}
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border ${
                request.priority === 'high' ? 'border-red-200 bg-red-50/50' :
                request.priority === 'medium' ? 'border-orange-200 bg-orange-50/50' :
                'border-gray-200'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-1">{request.itemName}</h3>
                      <p className="text-sm text-gray-500">
                        By {request.manager} • {request.submittedAt.getTime() > 0 ? request.submittedAt.toLocaleString() : 'Pending sync'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        request.priority === 'high' ? 'bg-red-600' :
                        request.priority === 'medium' ? 'bg-orange-500' :
                        'bg-cyan-500'
                      }>
                        {request.priority.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteRequest(request.id)}
                        disabled={deletingId === request.id}
                        title="Delete request"
                        aria-label="Delete request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Quantity</p>
                      <p className="text-gray-900">{request.quantity} {request.unit}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Priority</p>
                      <p className="text-gray-900 capitalize">{request.priority}</p>
                    </div>
                  </div>

                  {request.remarks && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Remarks</p>
                      <p className="text-sm text-gray-700">{request.remarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
