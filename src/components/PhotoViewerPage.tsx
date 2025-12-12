import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
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

export function PhotoViewerPage({ onNavigate, isOwner = false }: PhotoViewerPageProps) {
  const [selectedStation, setSelectedStation] = useState<'all' | 'kitchen' | 'coffee-bar'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'opening' | 'closing'>('all');
  const [photoSubmissions, setPhotoSubmissions] = useState<PhotoSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from Firestore
  useEffect(() => {
    // Build query with station filter if not 'all'
    let q;
    if (selectedStation === 'all') {
      q = query(
        collection(db, 'taskSubmissions'),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        collection(db, 'taskSubmissions'),
        where('station', '==', selectedStation),
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPhotos: PhotoSubmission[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.();

        return {
          id: doc.id,
          employeeName: data.employeeName || '',
          taskName: data.taskName || '',
          station: data.station,
          category: data.category,
          timestamp: timestamp ? timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          }) : '',
          date: data.date || '',
          imageUrl: data.photoUrl || '',
          verified: data.verified || false,
        };
      });

      setPhotoSubmissions(loadedPhotos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedStation]);

  // Client-side category filtering
  const filteredPhotos = photoSubmissions.filter(photo => {
    const categoryMatch = selectedCategory === 'all' || photo.category === selectedCategory;
    return categoryMatch;
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
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
                    loading="lazy"
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
        )}

        {!loading && filteredPhotos.length === 0 && (
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
