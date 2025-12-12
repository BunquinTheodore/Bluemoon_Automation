import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Task } from '../App';
import { ArrowLeft, MapPin, QrCode, Clock, User, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskDetailPageProps {
  task: Task;
  onBack: () => void;
}

const mockTaskSubmissions = [
  {
    id: '1',
    employeeName: 'Sarah Johnson',
    photoUrl: 'https://images.unsplash.com/photo-1714479120969-436c216a3cd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGNsZWFuaW5nfGVufDF8fHx8MTc2MTA0MTQzMHww&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: new Date('2025-10-22T08:30:00'),
  },
  {
    id: '2',
    employeeName: 'Mike Chen',
    photoUrl: 'https://images.unsplash.com/photo-1664382953403-fc1ac77073a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnl8ZW58MXx8fHwxNzYxMTAzODA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: new Date('2025-10-22T14:15:00'),
  },
  {
    id: '3',
    employeeName: 'Emma Davis',
    photoUrl: 'https://images.unsplash.com/photo-1589109807644-924edf14ee09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NjEwNjQzMDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: new Date('2025-10-21T16:45:00'),
  },
];

export function TaskDetailPage({ task, onBack }: TaskDetailPageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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
                  <p className="text-sm pl-6">{task.location}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">QR Code ID</span>
                  </div>
                  <Badge variant="outline" className="pl-6 ml-0">
                    {task.qrCodeId}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Description</span>
                  </div>
                  <p className="text-sm pl-6 text-gray-700">{task.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Branch</p>
                  <Badge className="bg-blue-600">{task.branch}</Badge>
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
                  {/* Mock QR Code */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">{task.qrCodeId}</p>
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
                Recent photo submissions for this task ({mockTaskSubmissions.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTaskSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="border-blue-100 hover:shadow-lg transition-all overflow-hidden">
                      {/* Photo */}
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={submission.photoUrl}
                          alt={`Submission by ${submission.employeeName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Info */}
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {submission.employeeName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm">{submission.employeeName}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            Verified
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

              {mockTaskSubmissions.length === 0 && (
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
