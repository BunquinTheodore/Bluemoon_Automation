import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Clock, User, MapPin, ChefHat, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

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

interface PhotoViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1574269910960-eafffb97cdb7?w=400',
    verified: true,
  },
];

export function PhotoViewerModal({ open, onOpenChange, isOwner = false }: PhotoViewerModalProps) {
  const [selectedStation, setSelectedStation] = useState<'all' | 'kitchen' | 'coffee-bar'>('all');

  const filteredPhotos = selectedStation === 'all' 
    ? mockPhotoSubmissions 
    : mockPhotoSubmissions.filter(photo => photo.station === selectedStation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            {isOwner ? 'All Photo Submissions' : 'Employee Photo Submissions'}
          </DialogTitle>
          <DialogDescription>
            {isOwner 
              ? 'View all photos submitted by employees across the system'
              : 'View photos submitted by employees for task verification'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
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
        </div>

        <ScrollArea className="h-[60vh] px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video">
                    <img
                      src={photo.imageUrl}
                      alt={photo.taskName}
                      className="w-full h-full object-cover"
                    />
                    {photo.verified && (
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        Verified
                      </Badge>
                    )}
                    <Badge 
                      className={`absolute top-2 left-2 ${
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
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm line-clamp-1">{photo.taskName}</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{photo.employeeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <Badge variant="outline" className="text-xs">
                          {photo.category === 'opening' ? 'Opening' : 'Closing'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{photo.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(photo.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No photo submissions found</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
