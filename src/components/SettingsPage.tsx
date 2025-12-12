import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  QrCode, 
  MapPin, 
  Trash2, 
  Edit, 
  Users,
  Building2,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface SettingsPageProps {
  onBack: () => void;
}

const mockTasks = [
  { id: '1', name: 'Clean Restroom', qrCodeId: 'QR-001', location: 'Floor 1 - Restroom A', description: 'Clean and sanitize restroom', branch: 'Downtown Branch' },
  { id: '2', name: 'Stock Inventory', qrCodeId: 'QR-002', location: 'Stockroom', description: 'Check and restock inventory', branch: 'Downtown Branch' },
  { id: '3', name: 'Kitchen Maintenance', qrCodeId: 'QR-003', location: 'Kitchen Area', description: 'Clean kitchen and equipment', branch: 'Uptown Branch' },
  { id: '4', name: 'Floor Cleaning', qrCodeId: 'QR-004', location: 'Main Floor', description: 'Mop and clean main floor', branch: 'Downtown Branch' },
];

const mockEmployees = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'employee', branch: 'Downtown Branch', tasksCompleted: 45 },
  { id: '2', name: 'Mike Chen', email: 'mike@example.com', role: 'employee', branch: 'Downtown Branch', tasksCompleted: 38 },
  { id: '3', name: 'Emma Davis', email: 'emma@example.com', role: 'employee', branch: 'Uptown Branch', tasksCompleted: 52 },
  { id: '4', name: 'James Wilson', email: 'james@example.com', role: 'employee', branch: 'Downtown Branch', tasksCompleted: 41 },
];

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'branches'>('tasks');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    location: '',
    description: '',
    branch: 'Downtown Branch',
  });

  const handleAddTask = () => {
    if (!newTask.name || !newTask.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Task added successfully!', {
      description: `${newTask.name} has been added to your task list.`,
    });

    setNewTask({ name: '', location: '', description: '', branch: 'Downtown Branch' });
    setIsAddingTask(false);
  };

  const handleDeleteTask = (taskName: string) => {
    toast.success('Task deleted', {
      description: `${taskName} has been removed.`,
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
              <h1 className="text-2xl text-blue-900">Settings</h1>
              <p className="text-sm text-gray-500">Manage tasks, employees, and branches</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4 inline mr-2" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'employees'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Employees
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'branches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Branches
          </button>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-blue-900">Manage Tasks</h2>
                <p className="text-sm text-gray-500">Add, edit, or remove tasks and their QR codes</p>
              </div>
              <Button
                onClick={() => setIsAddingTask(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Add Task Form */}
            <AnimatePresence>
              {isAddingTask && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>New Task</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsAddingTask(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="task-name">Task Name *</Label>
                          <Input
                            id="task-name"
                            placeholder="e.g., Clean Restroom"
                            value={newTask.name}
                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-location">Location *</Label>
                          <Input
                            id="task-location"
                            placeholder="e.g., Floor 1 - Restroom A"
                            value={newTask.location}
                            onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                          id="task-description"
                          placeholder="Describe the task..."
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-branch">Branch</Label>
                        <Input
                          id="task-branch"
                          placeholder="e.g., Downtown Branch"
                          value={newTask.branch}
                          onChange={(e) => setNewTask({ ...newTask, branch: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddTask}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Task
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingTask(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tasks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-blue-100 hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <QrCode className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm mb-1">{task.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {task.qrCodeId}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteTask(task.name)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {task.location}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {task.branch}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{task.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-blue-900">Manage Employees</h2>
                <p className="text-sm text-gray-500">View and manage your team members</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>

            <Card className="border-blue-100">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {mockEmployees.map((employee, index) => (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-sm">{employee.name}</h3>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {employee.branch}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {employee.tasksCompleted} tasks completed
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-blue-900">Manage Branches</h2>
                <p className="text-sm text-gray-500">Organize your business locations</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Branch
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Downtown Branch', 'Uptown Branch'].map((branch, index) => (
                <motion.div
                  key={branch}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-blue-100 hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">{branch}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Active Tasks</p>
                          <p className="text-2xl text-blue-900">
                            {mockTasks.filter(t => t.branch === branch).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Employees</p>
                          <p className="text-2xl text-blue-900">
                            {mockEmployees.filter(e => e.branch === branch).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
