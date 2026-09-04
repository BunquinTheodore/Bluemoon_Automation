import { Timestamp, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowLeft, Calendar, CalendarDays, CheckCircle2, Clock, LogOut, Plus, Trash2, UserCog } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface OwnerManagerTasksPageProps {
  onBack: () => void;
  onLogout: () => void;
}

interface ManagerTask {
  id: string;
  name: string;
  description: string;
  taskType: 'daily' | 'weekly';
  assignedDate: Date;
  status: 'pending' | 'completed';
}

export function OwnerManagerTasksPage({ onBack, onLogout }: OwnerManagerTasksPageProps) {
  const [tasks, setTasks] = useState<ManagerTask[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tasksCollection = collection(db, 'managerTasks');

    const unsubscribe = onSnapshot(
      tasksCollection,
      (snapshot) => {
        const loadedTasks: ManagerTask[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const assignedDateRaw = data.assignedDate;
            const assignedDate: Date =
              assignedDateRaw instanceof Timestamp ? assignedDateRaw.toDate() : new Date();

            return {
              id: docSnap.id,
              name: typeof data.name === 'string' ? data.name : '',
              description: typeof data.description === 'string' ? data.description : '',
              taskType: (data.type === 'weekly' ? 'weekly' : 'daily') as 'daily' | 'weekly',
              assignedDate,
              status: (data.status === 'completed' ? 'completed' : 'pending') as 'pending' | 'completed',
            };
          })
          .filter((task) => task.name.trim().length > 0);

        loadedTasks.sort((a, b) => b.assignedDate.getTime() - a.assignedDate.getTime());
        setTasks(loadedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading manager tasks', error);
        toast.error('Failed to load manager tasks.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      toast.error('Please enter a task name');
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      const tasksCollection = collection(db, 'managerTasks');
      const taskDocRef = doc(tasksCollection);

      await setDoc(taskDocRef, {
        taskId: taskDocRef.id,
        name: newTaskName.trim(),
        type: taskType,
        status: 'pending',
        assignedDate: serverTimestamp(),
        createdByRole: 'owner',
        assignedToRole: 'manager',
      });

      toast.success(`${taskType === 'daily' ? 'Daily' : 'Weekly'} task assigned to manager!`);
      setNewTaskName('');
      setTaskType('daily');
    } catch (error) {
      console.error('Error assigning manager task', error);
      toast.error('Failed to assign task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string, taskName: string) => {
    if (!window.confirm(`Are you sure you want to delete the task "${taskName}"?`)) {
      return;
    }

    try {
      const taskDocRef = doc(db, 'managerTasks', taskId);
      await deleteDoc(taskDocRef);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

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
                <div className="bg-purple-100 p-2 rounded-lg">
                  <UserCog className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl text-cyan-900">Manager Tasks</h1>
                  <p className="text-sm text-gray-500">Assign and track manager tasks</p>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Task */}
        <Card className="mb-6 border-cyan-100">
          <CardHeader>
            <CardTitle>Assign New Task to Manager</CardTitle>
            <CardDescription>Create a new task for the manager to complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                placeholder="Enter task name..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Task Frequency</Label>
              <RadioGroup value={taskType} onValueChange={(value: 'daily' | 'weekly') => setTaskType(value)}>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                      Daily
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="flex items-center gap-2 cursor-pointer">
                      <CalendarDays className="w-4 h-4 text-purple-600" />
                      Weekly
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button type="button" onClick={handleAddTask} disabled={saving} className="w-full bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Adding...' : 'Add Task'}
            </Button>
          </CardContent>
        </Card>

        {/* Tasks Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-cyan-100">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Tasks awaiting completion by the manager</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8" role="status" aria-label="Loading tasks">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
                  </div>
                ) : pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending tasks</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border border-orange-200 bg-orange-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mt-1.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-gray-900">{task.name}</p>
                                <Badge 
                                  variant="outline" 
                                  className={task.taskType === 'daily' ? 'border-cyan-400 text-cyan-700 bg-cyan-50' : 'border-purple-400 text-purple-700 bg-purple-50'}
                                >
                                  {task.taskType === 'daily' ? (
                                    <><Calendar className="w-3 h-3 mr-1" />Daily</>
                                  ) : (
                                    <><CalendarDays className="w-3 h-3 mr-1" />Weekly</>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{task.description}</p>
                              <p className="text-xs text-gray-500">
                                Assigned: {task.assignedDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge variant="outline" className="border-orange-400 text-orange-700">
                              Pending
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task.id, task.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              title="Delete task"
                              aria-label="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card className="border-cyan-100">
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>Tasks successfully completed by the manager</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8" role="status" aria-label="Loading tasks">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
                  </div>
                ) : completedTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No completed tasks</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border border-green-200 bg-green-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-gray-900 line-through">{task.name}</p>
                                <Badge 
                                  variant="outline" 
                                  className={task.taskType === 'daily' ? 'border-cyan-400 text-cyan-700 bg-cyan-50' : 'border-purple-400 text-purple-700 bg-purple-50'}
                                >
                                  {task.taskType === 'daily' ? (
                                    <><Calendar className="w-3 h-3 mr-1" />Daily</>
                                  ) : (
                                    <><CalendarDays className="w-3 h-3 mr-1" />Weekly</>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 opacity-75 mb-1">{task.description}</p>
                              <p className="text-xs text-gray-500">
                                Assigned: {task.assignedDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge className="bg-green-600">
                              Completed
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task.id, task.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              title="Delete task"
                              aria-label="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
