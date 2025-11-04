import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../App';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface EmployeeTaskHistoryProps {
  employee: User;
  onBack: () => void;
}

const mockHistory = [
  {
    id: '1',
    taskName: 'Clean Restroom',
    location: 'Floor 1 - Restroom A',
    photoUrl: 'https://images.unsplash.com/photo-1714479120969-436c216a3cd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGNsZWFuaW5nfGVufDF8fHx8MTc2MTA0MTQzMHww&ixlib=rb-4.1.0&q=80&w=400',
    timestamp: new Date('2025-10-22T08:30:00'),
    status: 'completed',
  },
  {
    id: '2',
    taskName: 'Stock Inventory',
    location: 'Stockroom',
    photoUrl: 'https://images.unsplash.com/photo-1664382953403-fc1ac77073a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnl8ZW58MXx8fHwxNzYxMTAzODA2fDA&ixlib=rb-4.1.0&q=80&w=400',
    timestamp: new Date('2025-10-22T10:15:00'),
    status: 'completed',
  },
  {
    id: '3',
    taskName: 'Kitchen Maintenance',
    location: 'Kitchen Area',
    photoUrl: 'https://images.unsplash.com/photo-1589109807644-924edf14ee09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NjEwNjQzMDR8MA&ixlib=rb-4.1.0&q=80&w=400',
    timestamp: new Date('2025-10-21T14:30:00'),
    status: 'completed',
  },
  {
    id: '4',
    taskName: 'Floor Cleaning',
    location: 'Main Floor',
    photoUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    timestamp: new Date('2025-10-21T16:00:00'),
    status: 'completed',
  },
  {
    id: '5',
    taskName: 'Clean Restroom',
    location: 'Floor 2 - Restroom B',
    photoUrl: 'https://images.unsplash.com/photo-1714479120969-436c216a3cd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGNsZWFuaW5nfGVufDF8fHx8MTc2MTA0MTQzMHww&ixlib=rb-4.1.0&q=80&w=400',
    timestamp: new Date('2025-10-20T09:00:00'),
    status: 'completed',
  },
  {
    id: '6',
    taskName: 'Stock Inventory',
    location: 'Stockroom',
    photoUrl: 'https://images.unsplash.com/photo-1664382953403-fc1ac77073a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnl8ZW58MXx8fHwxNzYxMTAzODA2fDA&ixlib=rb-4.1.0&q=80&w=400',
    timestamp: new Date('2025-10-20T11:30:00'),
    status: 'completed',
  },
];

export function EmployeeTaskHistory({ employee, onBack }: EmployeeTaskHistoryProps) {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group tasks by date
  const groupedTasks = mockHistory.reduce((acc, task) => {
    const dateKey = task.timestamp.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, typeof mockHistory>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl text-blue-900">Task History</h1>
              <p className="text-sm text-gray-500">Your completed tasks</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-blue-100">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-gray-600 mb-1">Total Completed</p>
                <p className="text-2xl text-blue-900">{mockHistory.length}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl text-blue-900">
                  {mockHistory.filter(t => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return t.timestamp > weekAgo;
                  }).length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task History Timeline */}
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([date, tasks], groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg text-blue-900">{date}</h2>
                <div className="flex-1 h-px bg-blue-100"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                  >
                    <Card 
                      className="border-blue-100 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                      onClick={() => setSelectedPhoto(task)}
                    >
                      <div className="flex gap-3 p-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={task.photoUrl}
                            alt={task.taskName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm truncate">{task.taskName}</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <p className="text-xs text-gray-500 truncate">{task.location}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 ml-2 flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <Clock className="w-3 h-3" />
                            {task.timestamp.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {mockHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-600 mb-2">No task history yet</h3>
            <p className="text-sm text-gray-500">
              Complete tasks to build your history
            </p>
          </div>
        )}
      </main>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-blue-900">{selectedPhoto.taskName}</h2>
                  <p className="text-sm text-gray-500">{formatDate(selectedPhoto.timestamp)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.taskName}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm">{selectedPhoto.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Completed At</p>
                    <p className="text-sm">{formatTime(selectedPhoto.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
