import { useEffect, useState } from 'react';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import logo from 'figma:asset/2ea8e337c311dd84e6a339fac104593b92115d60.png';

interface FinancialReportPhotosPageProps {
  reportData: {
    id: string;
    date: string;
    opening?: { imageUrl?: string };
    closing?: { imageUrl?: string };
    managerFund?: { imageUrl?: string };
  };
  onBack: () => void;
}

export function FinancialReportPhotosPage({ reportData, onBack }: FinancialReportPhotosPageProps) {
  const [fullscreenPhoto, setFullscreenPhoto] = useState<{ url: string; title: string } | null>(null);

  // Close the fullscreen viewer on Escape and lock body scroll while it is open
  useEffect(() => {
    if (!fullscreenPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenPhoto(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreenPhoto]);

  const reportDate = (() => {
    const parsed = new Date(reportData.date);
    return Number.isNaN(parsed.getTime()) ? reportData.date || 'Unknown' : parsed.toLocaleDateString();
  })();

  const photos = [
    { url: reportData.opening?.imageUrl, title: 'Opening Shift', color: 'cyan' },
    { url: reportData.closing?.imageUrl, title: 'Closing Shift', color: 'orange' },
    { url: reportData.managerFund?.imageUrl, title: 'Manager Fund', color: 'purple' },
  ].filter((photo): photo is { url: string; title: string; color: string } => !!photo.url);

  const getColorClasses = (color: string) => {
    const colors = {
      cyan: 'border-cyan-200 bg-gradient-to-br from-cyan-50 to-white',
      orange: 'border-orange-200 bg-gradient-to-br from-orange-50 to-white',
      purple: 'border-purple-200 bg-gradient-to-br from-purple-50 to-white'
    };
    return colors[color as keyof typeof colors] || colors.cyan;
  };

  const getBadgeColor = (color: string) => {
    const colors = {
      cyan: 'bg-cyan-600',
      orange: 'bg-orange-600',
      purple: 'bg-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.cyan;
  };

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
                onClick={onBack}
                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logo} alt="Bluemoon" className="h-8" />
              <div>
                <h1 className="text-xl text-gray-900">Financial Report Photos</h1>
                <p className="text-sm text-gray-500">
                  Report Date: {reportDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden hover:shadow-xl transition-shadow ${getColorClasses(photo.color)}`}>
                <div className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <Badge className={`absolute top-3 left-3 ${getBadgeColor(photo.color)} shadow-lg`}>
                    <Camera className="w-3 h-3 mr-1" />
                    {photo.title}
                  </Badge>
                  <button
                    type="button"
                    aria-label={`View ${photo.title} photo fullscreen`}
                    className="group absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 focus-visible:bg-opacity-10 transition-opacity cursor-pointer flex items-center justify-center"
                    onClick={() => setFullscreenPhoto({ url: photo.url, title: photo.title })}
                  >
                    <span className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium text-gray-800 transition-opacity">
                      Click to view fullscreen
                    </span>
                  </button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900">{photo.title}</h3>
                  <p className="text-sm text-gray-600">Financial proof photo</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No photos available for this report</p>
          </div>
        )}
      </main>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {fullscreenPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
            role="dialog"
            aria-modal="true"
            aria-label={`${fullscreenPhoto.title} photo`}
            onClick={() => setFullscreenPhoto(null)}
          >
            {/* Close Button - Top Right, doesn't overlay image */}
            <div className="absolute top-0 right-0 p-6 z-10">
              <Button
                onClick={() => setFullscreenPhoto(null)}
                variant="ghost"
                size="icon"
                className="bg-white hover:bg-gray-100 rounded-full shadow-2xl"
                aria-label="Close fullscreen photo"
                autoFocus
              >
                <X className="w-6 h-6 text-gray-900" />
              </Button>
            </div>

            {/* Photo Title - Top Left */}
            <div className="absolute top-0 left-0 p-6 z-10">
              <Badge className="bg-cyan-600 text-white text-sm px-4 py-2 shadow-lg">
                {fullscreenPhoto.title}
              </Badge>
            </div>

            {/* Centered Photo */}
            <div className="w-full h-full flex items-center justify-center p-16">
              <img
                src={fullscreenPhoto.url}
                alt={fullscreenPhoto.title}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
