import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Clock, User, MapPin, ChefHat, Coffee, ArrowLeft, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../App';
import logo from 'figma:asset/2ea8e337c311dd84e6a339fac104593b92115d60.png';

interface PhotoSubmission {
  id: string;
  employeeName: string;
  taskName: string;
  station: 'kitchen' | 'coffee-bar';
  category: 'opening' | 'closing';
  timestamp: string;
  date: string;
  imageUrl: string;
  verified: boolean;
}

interface PhotoViewerPageProps {
  onNavigate: (screen: Screen) => void;
  isOwner?: boolean;
}

// Mock photo submissions data
const mockPhotoSubmissions: PhotoSubmission[] = [
  {
    id: '1',
    employeeName: 'Sarah Johnson',
    taskName: 'Turn on espresso machine',
    station: 'coffee-bar',
    category: 'opening',
    timestamp: '8:30 AM',
    date: '2025-11-01',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    verified: true,
  },
  {
    id: '2',
    employeeName: 'Mike Chen',
    taskName: 'Clean group heads and portafilters',
    station: 'coffee-bar',
    category: 'opening',
    timestamp: '8:45 AM',
    date: '2025-11-01',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
    verified: true,
  },
  {
    id: '3',
    employeeName: 'Emma Davis',
    taskName: 'Turn on all equipment',
    station: 'kitchen',
    category: 'opening',
    timestamp: '9:00 AM',
    date: '2025-11-01',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    verified: true,
  },
  {
    id: '4',
    employeeName: 'James Wilson',
    taskName: 'Sanitize tables and cutting boards',
    station: 'kitchen',
    category: 'opening',
    timestamp: '9:15 AM',
    date: '2025-11-01',
    imageUrl: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
    verified: false,
  },
  {
    id: '5',
    employeeName: 'Sarah Johnson',
    taskName: 'Backflush espresso machine',
    station: 'coffee-bar',
    category: 'closing',
    timestamp: '6:30 PM',
    date: '2025-10-31',
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
    verified: true,
  },
  {
    id: '6',
    employeeName: 'Emma Davis',
    taskName: 'Clean all cooking equipment',
    station: 'kitchen',
    category: 'closing',
    timestamp: '6:45 PM',
    date: '2025-10-31',
    imageUrl: 'https://images.unsplash.com/photo-1574269910960-eafffb97cdb7?w=800',
    verified: true,
  },
  {
    id: '7',
    employeeName: 'Mike Chen',
    taskName: 'Wipe down espresso machine',
    station: 'coffee-bar',
    category: 'closing',
    timestamp: '6:50 PM',
    date: '2025-10-31',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
    verified: true,
  },
  {
    id: '8',
    employeeName: 'James Wilson',
    taskName: 'Sweep and mop kitchen floor',
    station: 'kitchen',
    category: 'closing',
    timestamp: '7:00 PM',
    date: '2025-10-31',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    verified: false,
  },
];

export function PhotoViewerPage({ onNavigate, isOwner = false }: PhotoViewerPageProps) {
  const [selectedStation, setSelectedStation] = useState<'all' | 'kitchen' | 'coffee-bar'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'opening' | 'closing'>('all');

  const filteredPhotos = mockPhotoSubmissions.filter(photo => {
    const stationMatch = selectedStation === 'all' || photo.station === selectedStation;
    const categoryMatch = selectedCategory === 'all' || photo.category === selectedCategory;
    return stationMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate(isOwner ? 'owner-dashboard' : 'manager-dashboard')}
                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logo} alt="Bluemoon" className="h-8" />
              <div>
                <h1 className="text-xl text-gray-900">Photo Submissions</h1>
                <p className="text-sm text-gray-500">
                  {isOwner 
                    ? 'View all photos submitted by employees across the system'
                    : 'View photos submitted by employees for task verification'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg text-gray-900">Filter Photos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Station Filter */}
            <Card className="border-cyan-100">
              <CardContent className="pt-6">
                <Label className="text-sm mb-2 block text-gray-700">Filter by Station</Label>
                <Tabs value={selectedStation} onValueChange={(v: any) => setSelectedStation(v)}>
                  <TabsList className="grid w-full grid-cols-3 bg-cyan-100">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                      All Stations
                    </TabsTrigger>
                    <TabsTrigger value="kitchen" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                      <ChefHat className="w-4 h-4 mr-2" />
                      Kitchen
                    </TabsTrigger>
                    <TabsTrigger value="coffee-bar" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                      <Coffee className="w-4 h-4 mr-2" />
                      Coffee Bar
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card className="border-cyan-100">
              <CardContent className="pt-6">
                <Label className="text-sm mb-2 block text-gray-700">Filter by Category</Label>
                <Tabs value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
                  <TabsList className="grid w-full grid-cols-3 bg-cyan-100">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                      All Tasks
                    </TabsTrigger>
                    <TabsTrigger value="opening" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                      Opening
                    </TabsTrigger>
                    <TabsTrigger value="closing" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700">
                      Closing
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-3">
            <p className="text-sm text-cyan-800">
              Showing <span className="font-semibold">{filteredPhotos.length}</span> photo submission{filteredPhotos.length !== 1 ? 's' : ''}
            </p>
            {(selectedStation !== 'all' || selectedCategory !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStation('all');
                  setSelectedCategory('all');
                }}
                className="text-cyan-700 hover:text-cyan-800"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-cyan-100">
                <div className="relative aspect-square">
                  <img
                    src={photo.imageUrl}
                    alt={photo.taskName}
                    className="w-full h-full object-cover"
                  />
                  {photo.verified && (
                    <Badge className="absolute top-3 right-3 bg-green-600 shadow-lg">
                      Verified
                    </Badge>
                  )}
                  <Badge 
                    className={`absolute top-3 left-3 shadow-lg ${
                      photo.station === 'kitchen' 
                        ? 'bg-orange-600' 
                        : 'bg-cyan-600'
                    }`}
                  >
                    {photo.station === 'kitchen' ? (
                      <>
                        <ChefHat className="w-3 h-3 mr-1" />
                        Kitchen
                      </>
                    ) : (
                      <>
                        <Coffee className="w-3 h-3 mr-1" />
                        Coffee Bar
                      </>
                    )}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <h4 className="line-clamp-2 min-h-[2.5rem]">{photo.taskName}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-600" />
                      <span>{photo.employeeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-600" />
                      <Badge variant="outline" className="text-xs">
                        {photo.category === 'opening' ? 'Opening' : 'Closing'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-600" />
                      <span>{photo.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                      <span>{new Date(photo.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No photo submissions found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Import Label separately to avoid issues
import { Label } from './ui/label';
