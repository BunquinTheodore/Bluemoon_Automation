import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Screen, Task } from '../App';
import { ArrowLeft, Bell, CheckCircle2, Clock, Image as ImageIcon, Trash2, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type MouseEvent } from 'react';

interface NotificationsPageProps {
  onBack: () => void;
  onNavigate: (screen: Screen, task?: Task) => void;
  onLogout?: () => void;
}

const mockNotifications = [
  {
    id: '1',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'Sarah Johnson completed "Clean Restroom"',
    taskId: '1',
    taskName: 'Clean Restroom',
    employeeName: 'Sarah Johnson',
    timestamp: new Date('2025-10-22T08:30:00'),
    read: false,
  },
  {
    id: '2',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'Mike Chen completed "Stock Inventory"',
    taskId: '2',
    taskName: 'Stock Inventory',
    employeeName: 'Mike Chen',
    timestamp: new Date('2025-10-22T10:15:00'),
    read: false,
  },
  {
    id: '3',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'Emma Davis completed "Kitchen Maintenance"',
    taskId: '3',
    taskName: 'Kitchen Maintenance',
    employeeName: 'Emma Davis',
    timestamp: new Date('2025-10-22T14:30:00'),
    read: true,
  },
  {
    id: '4',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'James Wilson completed "Floor Cleaning"',
    taskId: '4',
    taskName: 'Floor Cleaning',
    employeeName: 'James Wilson',
    timestamp: new Date('2025-10-22T16:00:00'),
    read: true,
  },
  {
    id: '5',
    type: 'task_overdue',
    title: 'Task Overdue',
    message: 'Task "Restock Supplies" is overdue',
    taskId: '5',
    taskName: 'Restock Supplies',
    timestamp: new Date('2025-10-22T09:00:00'),
    read: true,
  },
];

export function NotificationsPage({ onBack, onNavigate, onLogout }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));

    // Navigate to task detail if applicable
    if (notification.taskId) {
      const mockTask: Task = {
        id: notification.taskId,
        name: notification.taskName,
        qrCodeId: `QR-${notification.taskId.padStart(3, '0')}`,
        location: 'Location',
        description: 'Task description',
        branch: 'Downtown Branch',
      };
      onNavigate('task-detail', mockTask);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
              <div>
                <h1 className="text-2xl text-blue-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="hidden sm:flex"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
              {onLogout && (
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl text-blue-900">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl text-blue-900">{unreadCount}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl text-blue-900">
                    {notifications.filter(n => {
                      const today = new Date();
                      return n.timestamp.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                      notification.read
                        ? 'border-gray-200 hover:border-blue-200 bg-white'
                        : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-full ${
                      notification.type === 'task_completed'
                        ? 'bg-green-100'
                        : 'bg-orange-100'
                    }`}>
                      {notification.type === 'task_completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <Badge className="bg-blue-600 text-xs px-2 py-0">New</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e: MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-gray-400" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center gap-4">
                        {notification.employeeName && (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {notification.employeeName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">{notification.employeeName}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">{formatTimeAgo(notification.timestamp)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-gray-600 mb-2">No notifications yet</h3>
                <p className="text-sm text-gray-500">
                  You'll see updates here when your team completes tasks
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
