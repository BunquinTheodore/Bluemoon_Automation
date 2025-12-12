import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Screen } from '../App';
import { 
  Store,
  DollarSign,
  Package,
  FileText,
  Receipt,
  Users,
  LogOut,
  UserCog,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import logo from 'figma:asset/2ea8e337c311dd84e6a339fac104593b92115d60.png';

interface OwnerDashboardProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const dashboardSections = [
  {
    id: 'owner-store' as Screen,
    title: 'Store',
    description: 'Opening & Closing Tasks',
    icon: Store,
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'owner-sales' as Screen,
    title: 'Sales',
    description: 'Reports & Performance',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'owner-inventory' as Screen,
    title: 'Inventory',
    description: 'Stock Levels',
    icon: Package,
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'owner-requests' as Screen,
    title: 'Requests',
    description: 'Shop Needs',
    icon: FileText,
    color: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    id: 'owner-payroll' as Screen,
    title: 'Audit / Payroll',
    description: 'Employee Payments',
    icon: Receipt,
    color: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'owner-employees' as Screen,
    title: 'Employees',
    description: 'Staff Management',
    icon: Users,
    color: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
];

export function OwnerDashboard({ user, onNavigate, onLogout }: OwnerDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Bluemoon" className="h-8" />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('photo-viewer')}
                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                title="View All Photo Submissions"
              >
                <Camera className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('owner-manager-tasks')}
                title="Manager Tasks"
              >
                <UserCog className="w-5 h-5 text-cyan-600" />
              </Button>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-cyan-600 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl text-cyan-900 mb-2">Welcome back, {user.name}</h2>
          <p className="text-gray-600">Choose a section to view details</p>
        </motion.div>

        {/* Icon Grid - 3x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {dashboardSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="border-gray-200 hover:border-cyan-300 cursor-pointer overflow-hidden transition-all hover:shadow-2xl h-full"
                onClick={() => onNavigate(section.id)}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon Circle */}
                    <div className={`${section.iconBg} p-6 rounded-full`}>
                      <section.icon className={`w-12 h-12 ${section.iconColor}`} />
                    </div>
                    
                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl mb-1 text-gray-900">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}