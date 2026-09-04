import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp, DocumentData } from 'firebase/firestore';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../App';
import { db } from '../lib/firebase';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface EmployeeTaskHistoryProps {
  employee: User;
  onBack: () => void;
}

interface HistoryEntry {
  id: string;
  taskName: string;
  location: string;
  photoUrl: string;
  timestamp: Date;
  verified: boolean;
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month';

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function mapSubmission(id: string, data: DocumentData): HistoryEntry | null {
  const timestamp = toDate(data.timestamp) ?? toDate(data.date);
  if (!timestamp) return null;
  const station = data.station === 'coffee-bar' ? 'Coffee Bar' : data.station === 'kitchen' ? 'Kitchen' : '';
  return {
    id: data.submissionId || id,
    taskName: data.taskName || 'Task',
    location: data.location || station || 'Unknown location',
    photoUrl: data.photoUrl || '',
    timestamp,
    verified: data.verified === true,
  };
}

export function EmployeeTaskHistory({ employee, onBack }: EmployeeTaskHistoryProps) {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'taskSubmissions'), where('employeeId', '==', employee.id));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs
          .map((docSnap) => mapSubmission(docSnap.id, docSnap.data()))
          .filter((entry): entry is HistoryEntry => entry !== null)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setHistory(entries);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading task history', err);
        setError('Failed to load task history.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [employee.id]);

  const formatTime = (date: Date) =>
    date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const weekAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, [history]);

  const thisWeekCount = history.filter((t) => t.timestamp > weekAgo).length;

  const filteredHistory = useMemo(() => {
    if (filterPeriod === 'all') return history;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return history.filter((t) => {
      if (filterPeriod === 'today') return t.timestamp >= startOfToday;
      if (filterPeriod === 'week') return t.timestamp > weekAgo;
      return t.timestamp >= startOfMonth;
    });
  }, [history, filterPeriod, weekAgo]);

  // Group tasks by date (already sorted newest first)
  const groupedTasks = filteredHistory.reduce((acc, task) => {
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
  }, {} as Record<string, HistoryEntry[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Back">
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
                <p className="text-2xl text-blue-900">{history.length}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl text-blue-900">{thisWeekCount}</p>
              </CardContent>
            </Card>
          </div>

          <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as FilterPeriod)}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Filter period">
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

        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading task history...
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12 text-red-600 text-sm">{error}</div>
        )}

        {/* Task History Timeline */}
        {!loading && !error && (
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
                            {task.photoUrl ? (
                              <img
                                src={task.photoUrl}
                                alt={task.taskName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
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
                              <Badge
                                variant="secondary"
                                className={`ml-2 flex-shrink-0 ${task.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                                title={task.verified ? 'Verified' : 'Pending verification'}
                              >
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
        )}

        {!loading && !error && filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-600 mb-2">
              {history.length === 0 ? 'No task history yet' : 'No tasks in this period'}
            </h3>
            <p className="text-sm text-gray-500">
              {history.length === 0 ? 'Complete tasks to build your history' : 'Try a different time filter'}
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
          role="dialog"
          aria-modal="true"
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
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPhoto(null)}
                  aria-label="Close"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {selectedPhoto.photoUrl && (
                <div className="rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedPhoto.photoUrl}
                    alt={selectedPhoto.taskName}
                    className="w-full h-auto"
                  />
                </div>
              )}

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
