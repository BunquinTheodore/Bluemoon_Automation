import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Task } from '../App';
import { db } from '../lib/firebase';
import { ArrowLeft, MapPin, QrCode, Clock, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskDetailPageProps {
  task: Task;
  onBack: () => void;
}

interface Submission {
  id: string;
  employeeName: string;
  photoUrl: string;
  timestamp: Date;
  verified: boolean;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function mapSubmission(id: string, data: DocumentData): Submission | null {
  const timestamp = toDate(data.timestamp) ?? toDate(data.date);
  if (!timestamp) return null;
  return {
    id: data.submissionId || id,
    employeeName: data.employeeName || data.confirmedName || 'Unknown',
    photoUrl: data.photoUrl || '',
    timestamp,
    verified: data.verified === true,
  };
}

const stationLabel = (station?: Task['station']) =>
  station === 'coffee-bar' ? 'Coffee Bar' : station === 'kitchen' ? 'Kitchen' : '';

export function TaskDetailPage({ task, onBack }: TaskDetailPageProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'taskSubmissions'), where('taskId', '==', task.id));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((docSnap) => mapSubmission(docSnap.id, docSnap.data()))
          .filter((s): s is Submission => s !== null)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setSubmissions(items);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading task submissions', err);
        setError('Failed to load submissions.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [task?.id]);

  const formatTime = (date: Date) =>
    date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const location = task.location || stationLabel(task.station) || 'Not specified';

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
              <h1 className="text-2xl text-blue-900">Task Details</h1>
              <p className="text-sm text-gray-500">View task information and submissions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle>{task.name}</CardTitle>
                <CardDescription>Task Information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Location</span>
                  </div>
                  <p className="text-sm pl-6">{location}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">QR Code ID</span>
                  </div>
                  <Badge variant="outline" className="ml-6">
                    {task.qrCodeId || 'N/A'}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Description</span>
                  </div>
                  <p className="text-sm pl-6 text-gray-700">{task.description || 'No description'}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                  {task.branch && <Badge className="bg-blue-600">{task.branch}</Badge>}
                  {task.category && (
                    <Badge variant="outline" className="capitalize">{task.category}</Badge>
                  )}
                  {task.status && (
                    <Badge
                      variant="secondary"
                      className={task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                    >
                      {task.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Display */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-lg">QR Code</CardTitle>
                <CardDescription>Scan to submit task</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">{task.qrCodeId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Employees scan this code to submit task completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Submission History */}
          <Card className="border-blue-100 lg:col-span-2">
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>
                Recent photo submissions for this task ({submissions.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading submissions...
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-12 text-red-600 text-sm">{error}</div>
              )}

              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissions.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <Card className="border-blue-100 hover:shadow-lg transition-all overflow-hidden">
                        {/* Photo */}
                        <div className="aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
                          {submission.photoUrl ? (
                            <img
                              src={submission.photoUrl}
                              alt={`Submission by ${submission.employeeName}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-gray-300" />
                          )}
                        </div>

                        {/* Info */}
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                  {submission.employeeName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm">{submission.employeeName}</p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${submission.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                            >
                              {submission.verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(submission.timestamp)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && !error && submissions.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-gray-600 mb-2">No submissions yet</h3>
                  <p className="text-sm text-gray-500">
                    Submissions will appear here once employees complete this task
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
