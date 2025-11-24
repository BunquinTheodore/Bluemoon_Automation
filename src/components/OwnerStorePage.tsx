import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, LogOut, Store, CheckCircle2, Clock, ChefHat, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface OwnerStorePageProps {
  onBack: () => void;
  onLogout: () => void;
}

interface TaskData {
  id: string;
  name: string;
  station: 'Kitchen' | 'Coffee Bar';
  category: 'Opening' | 'Closing';
  status: 'completed' | 'pending';
  completedBy?: string;
  completedAt?: string;
}

export function OwnerStorePage({ onBack, onLogout }: OwnerStorePageProps) {
  const [selectedStation, setSelectedStation] = useState<'all' | 'Kitchen' | 'Coffee Bar'>('all');
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasksAndSubmissions = async () => {
      try {
        setLoading(true);

        // Fetch all tasks
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        const tasksData: { [key: string]: any } = {};

        tasksSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          tasksData[data.taskId || doc.id] = {
            id: data.taskId || doc.id,
            name: data.name || '',
            station: data.station === 'coffee-bar' ? 'Coffee Bar' : 'Kitchen',
            category: data.category === 'opening' ? 'Opening' : 'Closing',
            status: 'pending' as 'pending' | 'completed',
          };
        });

        // Fetch all task submissions (completed tasks)
        const submissionsSnapshot = await getDocs(collection(db, 'taskSubmissions'));
        const today = new Date().toISOString().split('T')[0];

        // Create a map to track the latest submission for each task today
        const latestSubmissions: { [key: string]: any } = {};

        submissionsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const submissionDate = data.date || data.timestamp?.toDate().toISOString().split('T')[0];

          // Only include today's submissions
          if (submissionDate === today) {
            const taskId = data.taskId;

            // Keep only the latest submission for each task
            if (!latestSubmissions[taskId] ||
                (data.timestamp && data.timestamp.toMillis() > latestSubmissions[taskId].timestamp?.toMillis())) {
              latestSubmissions[taskId] = data;
            }
          }
        });

        // Merge tasks with their submission data
        const mergedTasks: TaskData[] = Object.values(tasksData).map((task: any) => {
          const submission = latestSubmissions[task.id];

          if (submission) {
            const completedTime = submission.timestamp?.toDate();
            const timeString = completedTime
              ? completedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              : 'N/A';

            return {
              ...task,
              status: 'completed' as 'completed' | 'pending',
              completedBy: submission.employeeName || 'Unknown',
              completedAt: timeString,
            };
          }

          return task;
        });

        setTasks(mergedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndSubmissions();
  }, []);

  const filteredTasks = selectedStation === 'all'
    ? tasks
    : tasks.filter(task => task.station === selectedStation);

  const openingTasks = filteredTasks.filter(t => t.category === 'Opening');
  const closingTasks = filteredTasks.filter(t => t.category === 'Closing');

  const completedOpening = openingTasks.filter(t => t.status === 'completed').length;
  const completedClosing = closingTasks.filter(t => t.status === 'completed').length;

  // Dashboard stats (using all tasks, not filtered)
  const allOpeningTasks = tasks.filter(t => t.category === 'Opening');
  const allClosingTasks = tasks.filter(t => t.category === 'Closing');
  const allKitchenTasks = tasks.filter(t => t.station === 'Kitchen');
  const allCoffeeBarTasks = tasks.filter(t => t.station === 'Coffee Bar');

  const dashboardOpeningCompleted = allOpeningTasks.filter(t => t.status === 'completed').length;
  const dashboardClosingCompleted = allClosingTasks.filter(t => t.status === 'completed').length;

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
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl text-blue-900">Store Tasks</h1>
                  <p className="text-sm text-gray-500">Opening & Closing Tasks Overview</p>
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
        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-green-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Opening Completed</p>
                      <p className="text-2xl text-green-700">{dashboardOpeningCompleted}/{allOpeningTasks.length}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-orange-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Closing Completed</p>
                      <p className="text-2xl text-orange-700">{dashboardClosingCompleted}/{allClosingTasks.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Kitchen Tasks</p>
                      <p className="text-2xl text-blue-700">{allKitchenTasks.length}</p>
                    </div>
                    <ChefHat className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-amber-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Coffee Bar Tasks</p>
                      <p className="text-2xl text-amber-700">{allCoffeeBarTasks.length}</p>
                    </div>
                    <Coffee className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Station Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedStation === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStation('all')}
          >
            All Stations
          </Button>
          <Button
            variant={selectedStation === 'Kitchen' ? 'default' : 'outline'}
            onClick={() => setSelectedStation('Kitchen')}
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Kitchen
          </Button>
          <Button
            variant={selectedStation === 'Coffee Bar' ? 'default' : 'outline'}
            onClick={() => setSelectedStation('Coffee Bar')}
          >
            <Coffee className="w-4 h-4 mr-2" />
            Coffee Bar
          </Button>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="opening">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="opening">Opening Tasks</TabsTrigger>
            <TabsTrigger value="closing">Closing Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="opening" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Opening Tasks</CardTitle>
                <CardDescription>
                  {completedOpening} of {openingTasks.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {openingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        task.status === 'completed'
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={task.status === 'completed' ? 'text-green-700' : 'text-gray-900'}>
                              {task.name}
                            </p>
                            {task.status === 'completed' && task.completedBy && (
                              <p className="text-sm text-gray-600 mt-1">
                                By {task.completedBy} at {task.completedAt}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.station}</Badge>
                          <Badge className={task.status === 'completed' ? 'bg-green-600' : 'bg-gray-500'}>
                            {task.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Closing Tasks</CardTitle>
                <CardDescription>
                  {completedClosing} of {closingTasks.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {closingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        task.status === 'completed'
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={task.status === 'completed' ? 'text-green-700' : 'text-gray-900'}>
                              {task.name}
                            </p>
                            {task.status === 'completed' && task.completedBy && (
                              <p className="text-sm text-gray-600 mt-1">
                                By {task.completedBy} at {task.completedAt}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.station}</Badge>
                          <Badge className={task.status === 'completed' ? 'bg-green-600' : 'bg-gray-500'}>
                            {task.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
