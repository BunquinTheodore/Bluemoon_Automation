import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Screen } from '../App';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, LogOut, X } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskCalendarProps {
  onNavigate?: (screen: Screen) => void;
  onBack: () => void;
  onLogout?: () => void;
}

interface TaskSubmission {
  id: string;
  taskName: string;
  employeeName: string;
  time: string;
  location: string;
  photoUrl: string;
}

// Local-date key (YYYY-MM-DD). Avoids the UTC shift of toISOString() for non-UTC users.
const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const mockSubmissionsByDate: Record<string, TaskSubmission[]> = {
  '2025-10-22': [
    {
      id: '1',
      taskName: 'Clean Restroom',
      employeeName: 'Sarah Johnson',
      time: '8:30 AM',
      location: 'Floor 1 - Restroom A',
      photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    },
    {
      id: '2',
      taskName: 'Stock Inventory',
      employeeName: 'Mike Chen',
      time: '10:15 AM',
      location: 'Stockroom',
      photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
    },
    {
      id: '3',
      taskName: 'Kitchen Maintenance',
      employeeName: 'Emma Davis',
      time: '2:45 PM',
      location: 'Kitchen Area',
      photoUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
    },
  ],
  '2025-10-21': [
    {
      id: '4',
      taskName: 'Floor Cleaning',
      employeeName: 'James Wilson',
      time: '9:00 AM',
      location: 'Main Floor',
      photoUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    },
    {
      id: '5',
      taskName: 'Clean Restroom',
      employeeName: 'Sarah Johnson',
      time: '11:30 AM',
      location: 'Floor 2 - Restroom B',
      photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    },
  ],
};

export function TaskCalendar({ onBack, onLogout }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 9, 22)); // Oct 22, 2025
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);

  // Close the photo modal on Escape
  useEffect(() => {
    if (!selectedSubmission) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedSubmission(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSubmission]);

  const getSubmissionsForDate = (date: Date | undefined): TaskSubmission[] => {
    if (!date) return [];
    return mockSubmissionsByDate[toDateKey(date)] || [];
  };

  const submissions = getSubmissionsForDate(selectedDate);

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
              <div>
                <h1 className="text-2xl text-blue-900">Task Calendar</h1>
                <p className="text-sm text-gray-500">View task submissions by date</p>
              </div>
            </div>
            {onLogout && (
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
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="border-blue-100 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Select Date
              </CardTitle>
              <CardDescription>Click a date to view submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => setSelectedDate(date)}
                className="rounded-md border border-blue-100"
                modifiers={{
                  hasSubmissions: (date: Date) => Boolean(mockSubmissionsByDate[toDateKey(date)]),
                }}
                modifiersStyles={{
                  hasSubmissions: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    color: '#2563eb',
                  },
                }}
              />
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>Tip:</strong> Dates with submissions are highlighted in blue
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <Card className="border-blue-100 lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Submissions for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {submissions.length} task{submissions.length !== 1 ? 's' : ''} completed on this day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-4 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSubmission(submission)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedSubmission(submission);
                        }
                      }}
                    >
                      {/* Photo Thumbnail */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={submission.photoUrl}
                          alt={submission.taskName}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm mb-1">{submission.taskName}</h3>
                            <p className="text-xs text-gray-500">{submission.location}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Completed
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {submission.employeeName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">{submission.employeeName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {submission.time}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-gray-600 mb-2">No submissions on this date</h3>
                  <p className="text-sm text-gray-500">
                    Select a different date to view task submissions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Photo Detail Modal */}
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSubmission(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selectedSubmission.taskName}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl text-blue-900">{selectedSubmission.taskName}</h2>
                    <p className="text-sm text-gray-500">{selectedSubmission.location}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSubmission(null)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedSubmission.photoUrl}
                    alt={selectedSubmission.taskName}
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Employee</p>
                      <p className="text-sm">{selectedSubmission.employeeName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-sm">{selectedSubmission.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
