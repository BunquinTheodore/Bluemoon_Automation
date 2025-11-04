import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowLeft, LogOut, UserCog, Plus, CheckCircle2, Clock, Calendar, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
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

const mockManagerTasks: ManagerTask[] = [
  { id: '1', name: 'Review weekly sales report', description: 'Analyze sales data and prepare summary for owner review', taskType: 'weekly', assignedDate: new Date('2025-10-23'), status: 'pending' },
  { id: '2', name: 'Check equipment maintenance', description: 'Inspect all kitchen and coffee bar equipment for maintenance needs', taskType: 'daily', assignedDate: new Date('2025-10-22'), status: 'completed' },
  { id: '3', name: 'Update employee schedule', description: 'Review and finalize next week\'s work schedule', taskType: 'weekly', assignedDate: new Date('2025-10-23'), status: 'pending' },
  { id: '4', name: 'Inventory audit completion', description: 'Complete full inventory count and update system', taskType: 'weekly', assignedDate: new Date('2025-10-21'), status: 'completed' },
];

export function OwnerManagerTasksPage({ onBack, onLogout }: OwnerManagerTasksPageProps) {
  const [tasks, setTasks] = useState<ManagerTask[]>(mockManagerTasks);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'weekly'>('daily');

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    if (!newTaskDescription.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    const newTask: ManagerTask = {
      id: Date.now().toString(),
      name: newTaskName,
      description: newTaskDescription,
      taskType: taskType,
      assignedDate: new Date(),
      status: 'pending',
    };

    setTasks([newTask, ...tasks]);
    toast.success(`${taskType === 'daily' ? 'Daily' : 'Weekly'} task assigned to manager!`);
    setNewTaskName('');
    setNewTaskDescription('');
    setTaskType('daily');
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Task Description</Label>
              <Textarea
                id="taskDescription"
                placeholder="Enter detailed task description..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
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

            <Button onClick={handleAddTask} className="w-full bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
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
                {pendingTasks.length === 0 ? (
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
                          <Badge variant="outline" className="border-orange-400 text-orange-700 ml-2">
                            Pending
                          </Badge>
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
                {completedTasks.length === 0 ? (
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
                          <Badge className="bg-green-600 ml-2">
                            Completed
                          </Badge>
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
