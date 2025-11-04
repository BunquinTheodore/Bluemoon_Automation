import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Recipe } from '../App';
import { ArrowLeft, LogOut, Check, ChevronDown, ChevronUp, Coffee, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface RecipeDetailPageProps {
  recipe: Recipe;
  onBack: () => void;
  onLogout: () => void;
}

export function RecipeDetailPage({ recipe, onBack, onLogout }: RecipeDetailPageProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleMarkAsWatched = () => {
    setIsWatched(true);
    toast.success('Recipe marked as watched!', {
      description: `You've completed "${recipe.name}"`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-2 rounded-xl">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl text-amber-900">{recipe.name}</h1>
                  <p className="text-sm text-gray-500">Preparation guide</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Video Player */}
          <Card className="border-amber-100 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
                {/* Video Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-amber-700 transition-colors">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white text-lg mb-2">Video Tutorial</p>
                    <p className="text-gray-400 text-sm">Duration: {recipe.videoDuration}</p>
                  </div>
                </div>
                
                {/* Actual video embed would go here */}
                {/* <iframe 
                  className="w-full h-full"
                  src={recipe.videoUrl}
                  title={recipe.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                /> */}
              </div>
            </CardContent>
          </Card>

          {/* Recipe Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ingredients */}
            <Card className="border-amber-100 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{ingredient}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="border-amber-100 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  Preparation Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Tools Needed - Collapsible */}
          <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
            <Card className="border-amber-100">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-amber-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                      Tools & Equipment Needed
                    </CardTitle>
                    <motion.div
                      animate={{ rotate: toolsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recipe.tools.map((tool, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-amber-600 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{tool}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Additional Info */}
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-amber-600 text-sm px-4 py-2">
                  {recipe.category}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Play className="w-4 h-4" />
                  <span>Video: {recipe.videoDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{recipe.ingredients.length} ingredients</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{recipe.steps.length} steps</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleMarkAsWatched}
              disabled={isWatched}
              className={`flex-1 ${
                isWatched
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isWatched ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Marked as Watched
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Mark as Watched
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onBack}
              className="flex-1 border-amber-300 hover:bg-amber-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Recipes
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
