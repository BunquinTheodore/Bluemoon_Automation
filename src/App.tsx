import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { TaskCalendar } from './components/TaskCalendar';
import { TaskDetailPage } from './components/TaskDetailPage';
import { QRScanScreen } from './components/QRScanScreen';
import { EmployeeTaskHistory } from './components/EmployeeTaskHistory';
import { NotificationsPage } from './components/NotificationsPage';
import { SettingsPage } from './components/SettingsPage';
import { RecipesListPage } from './components/RecipesListPage';
import { RecipeDetailPage } from './components/RecipeDetailPage';
import { OwnerStorePage } from './components/OwnerStorePage';
import { OwnerSalesPage } from './components/OwnerSalesPage';
import { OwnerInventoryPage } from './components/OwnerInventoryPage';
import { OwnerRequestsPage } from './components/OwnerRequestsPage';
import { OwnerPayrollPage } from './components/OwnerPayrollPage';
import { OwnerEmployeesPage } from './components/OwnerEmployeesPage';
import { OwnerManagerTasksPage } from './components/OwnerManagerTasksPage';
import { PhotoViewerPage } from './components/PhotoViewerPage';
import { Toaster } from './components/ui/sonner';

export type UserRole = 'owner' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Task {
  id: string;
  name: string;
  qrCodeId: string;
  station: 'kitchen' | 'coffee-bar';
  category: 'opening' | 'closing';
  description: string;
  status: 'pending' | 'completed';
  assignedBy?: string;
  repetition?: 'daily' | 'weekly';
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  employeeId: string;
  employeeName: string;
  confirmedName: string;
  photoUrl: string;
  timestamp: Date;
  taskName: string;
  station: string;
}

export interface SalesReport {
  id: string;
  managerId: string;
  totalSales: number;
  performanceNotes: string;
  receiptPhotoUrl: string;
  timestamp: Date;
}

export interface InventoryItem {
  id: string;
  productName: string;
  quantity: number;
  lastUpdated: Date;
}

export interface RequestItem {
  id: string;
  managerId: string;
  itemName: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  remarks: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  daysWorked: number;
  payRate: number;
  totalPay: number;
  period: string;
}

export interface EmployeeInfo {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  status: 'full-time' | 'part-time';
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  videoDuration: string;
  videoUrl: string;
  ingredients: string[];
  steps: string[];
  tools: string[];
  category: string;
}

export type Screen = 
  | 'login' 
  | 'owner-dashboard' 
  | 'manager-dashboard'
  | 'employee-dashboard' 
  | 'calendar' 
  | 'task-detail' 
  | 'qr-scan' 
  | 'task-history' 
  | 'notifications' 
  | 'settings'
  | 'recipes-list'
  | 'recipe-detail'
  | 'owner-store'
  | 'owner-sales'
  | 'owner-inventory'
  | 'owner-requests'
  | 'owner-payroll'
  | 'owner-employees'
  | 'owner-manager-tasks'
  | 'manager-task-management'
  | 'manager-reports'
  | 'manager-inventory'
  | 'manager-requests'
  | 'manager-payroll'
  | 'manager-employees'
  | 'photo-viewer';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskForScan, setSelectedTaskForScan] = useState<Task | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'owner') {
      setCurrentScreen('owner-dashboard');
    } else if (user.role === 'manager') {
      setCurrentScreen('manager-dashboard');
    } else {
      setCurrentScreen('employee-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
    setSelectedTask(null);
    setSelectedTaskForScan(null);
    setSelectedRecipe(null);
  };

  const navigateTo = (screen: Screen, task?: Task, recipe?: Recipe) => {
    if (screen === 'task-detail' && task) {
      setSelectedTask(task);
    }
    if (screen === 'qr-scan' && task) {
      setSelectedTaskForScan(task);
    }
    if (screen === 'recipe-detail' && recipe) {
      setSelectedRecipe(recipe);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'owner-dashboard':
        return (
          <OwnerDashboard 
            user={currentUser!} 
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );
      case 'manager-dashboard':
        return (
          <ManagerDashboard 
            user={currentUser!} 
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );
      case 'employee-dashboard':
        return (
          <EmployeeDashboard 
            user={currentUser!} 
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );
      case 'calendar':
        return (
          <TaskCalendar 
            onNavigate={navigateTo}
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'task-detail':
        return (
          <TaskDetailPage 
            task={selectedTask!}
            onBack={() => navigateTo('owner-dashboard')}
          />
        );
      case 'qr-scan':
        return (
          <QRScanScreen 
            task={selectedTaskForScan!}
            employee={currentUser!}
            onBack={() => navigateTo('employee-dashboard')}
            onComplete={() => navigateTo('employee-dashboard')}
          />
        );
      case 'task-history':
        return (
          <EmployeeTaskHistory 
            employee={currentUser!}
            onBack={() => navigateTo('employee-dashboard')}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage 
            onBack={() => navigateTo('owner-dashboard')}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            onBack={() => navigateTo('owner-dashboard')}
          />
        );
      case 'recipes-list':
        return (
          <RecipesListPage 
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onBack={() => navigateTo('employee-dashboard')}
          />
        );
      case 'recipe-detail':
        return (
          <RecipeDetailPage 
            recipe={selectedRecipe!}
            onBack={() => navigateTo('recipes-list')}
            onLogout={handleLogout}
          />
        );
      case 'owner-store':
        return (
          <OwnerStorePage 
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'owner-sales':
        return (
          <OwnerSalesPage 
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'owner-inventory':
        return (
          <OwnerInventoryPage 
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'owner-requests':
        return (
          <OwnerRequestsPage 
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'owner-payroll':
        return (
          <OwnerPayrollPage 
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'owner-employees':
        return (
          <OwnerEmployeesPage 
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'owner-manager-tasks':
        return (
          <OwnerManagerTasksPage 
            onBack={() => navigateTo('owner-dashboard')}
            onLogout={handleLogout}
          />
        );
      case 'photo-viewer':
        return (
          <PhotoViewerPage 
            onNavigate={navigateTo}
            isOwner={currentUser?.role === 'owner'}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <Toaster />
    </>
  );
}

export default App;