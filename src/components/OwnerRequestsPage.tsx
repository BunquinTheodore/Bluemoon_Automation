import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, LogOut, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface OwnerRequestsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

const mockRequests = [
  {
    id: '1',
    itemName: 'Espresso Beans (Premium Blend)',
    quantity: 10,
    unit: 'lbs',
    priority: 'high' as const,
    remarks: 'Running low, need for weekend rush',
    manager: 'John Smith',
    submittedAt: 'Oct 22, 2025 - 2:30 PM',
  },
  {
    id: '2',
    itemName: 'Trash Bags (Large)',
    quantity: 5,
    unit: 'boxes',
    priority: 'high' as const,
    remarks: 'Almost out, critical for daily operations',
    manager: 'John Smith',
    submittedAt: 'Oct 22, 2025 - 1:15 PM',
  },
  {
    id: '3',
    itemName: 'Vanilla Syrup',
    quantity: 6,
    unit: 'bottles',
    priority: 'medium' as const,
    remarks: 'Popular flavor, stock getting low',
    manager: 'John Smith',
    submittedAt: 'Oct 21, 2025 - 4:00 PM',
  },
  {
    id: '4',
    itemName: 'Paper Towels',
    quantity: 3,
    unit: 'cases',
    priority: 'low' as const,
    remarks: 'Still have some in stock but good to reorder',
    manager: 'John Smith',
    submittedAt: 'Oct 21, 2025 - 11:00 AM',
  },
  {
    id: '5',
    itemName: 'Almond Milk',
    quantity: 12,
    unit: 'cartons',
    priority: 'medium' as const,
    remarks: 'Customer demand increasing',
    manager: 'John Smith',
    submittedAt: 'Oct 20, 2025 - 3:30 PM',
  },
];

export function OwnerRequestsPage({ onBack, onLogout }: OwnerRequestsPageProps) {
  const highPriorityCount = mockRequests.filter(r => r.priority === 'high').length;

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
                    <p className="text-2xl text-cyan-700">{mockRequests.length}</p>
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
        <div className="space-y-4">
          {mockRequests.map((request, index) => (
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
                        By {request.manager} • {request.submittedAt}
                      </p>
                    </div>
                    <Badge className={
                      request.priority === 'high' ? 'bg-red-600' :
                      request.priority === 'medium' ? 'bg-orange-500' :
                      'bg-cyan-500'
                    }>
                      {request.priority.toUpperCase()}
                    </Badge>
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
