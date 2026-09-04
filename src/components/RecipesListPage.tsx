import { ArrowLeft, Clock, Coffee, Play, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Recipe, Screen, Task } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';

interface RecipesListPageProps {
  onNavigate: (screen: Screen, task?: Task, recipe?: Recipe) => void;
  onLogout: () => void;
  onBack: () => void;
}

const mockRecipes: Recipe[] = [
  {
    id: 'coffee-amber-iced',
    name: 'Amber (Iced Coffee)',
    description: 'Video tutorial for Amber iced coffee recipe.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1sblIZmL_P3g_Dbluh_-g1Hmn4IYrk1bW/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Coffee (Iced)',
  },
  {
    id: 'coffee-americano-iced',
    name: 'Americano (Iced Coffee)',
    description: 'Video tutorial for Iced Americano recipe.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1e5eLhSfafVQRSCPY1YpCn7LQOJO3hNkY/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Coffee (Iced)',
  },
  {
    id: 'coffee-la-creme-cloud-iced',
    name: 'La Creme Cloud (Iced Coffee)',
    description: 'Video tutorial for La Creme Cloud iced coffee recipe.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1gzSFci5EebZk5DrGPLgwtoj4fAeyQT_i/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Coffee (Iced)',
  },
  {
    id: 'coffee-latte-iced',
    name: 'Latte (Iced Coffee)',
    description: 'Video tutorial for Iced Latte recipe.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1YgY4knW9Su3t6Co0F8FUQXuY5v5nPpzO/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Coffee (Iced)',
  },
  {
    id: 'coffee-sbb-latte-iced',
    name: 'SBB Latte (Iced Coffee)',
    description: 'Video tutorial for SBB Latte iced coffee recipe.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1VxcBTcN1NVdOk_sfHIqavbA0yDRgZvi5/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Coffee (Iced)',
  },
  {
    id: 'coffee-spanish-latte-iced',
    name: 'Spanish Latte (Iced Coffee)',
    description: 'Video tutorial for Spanish Latte iced coffee recipe.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1peMDqUJ8Zpho7k1Rc7sXlUpSvn__7BWk/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Coffee (Iced)',
  },
  {
    id: 'coffee-spiced-latte-iced',
    name: 'Spiced Latte (Iced Coffee)',
    description: 'Video tutorial for Spiced Latte iced coffee recipe.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1ldT-EtlES9PS9GaTzQ43bD3JgRoraLIY/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Coffee (Iced)',
  },
  {
    id: 'noncoffee-biscoff-cloud-iced',
    name: 'Biscoff Cloud (Non-Coffee, Iced)',
    description: 'Video tutorial for Biscoff Cloud non-coffee iced drink.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1nb13UWfpQXMqD7cWJ2_7rn6Ypb1bu4d-/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Non-Coffee (Iced)',
  },
  {
    id: 'noncoffee-matcha-iced',
    name: 'Matcha (Non-Coffee, Iced)',
    description: 'Video tutorial for Matcha non-coffee iced drink.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1ffWkTTIAe46Hnh97UnvyHrzmvMGAgrO0/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Non-Coffee (Iced)',
  },
  {
    id: 'noncoffee-signature-chocolate-iced',
    name: 'Signature Chocolate (Non-Coffee, Iced)',
    description: 'Video tutorial for Signature Chocolate non-coffee iced drink.',
    imageUrl: '',
    videoDuration: 'N/A',
    videoUrl: 'https://drive.google.com/file/d/1_rMcwUTzxhG_t60ubYubXWkzdnjA8xnB/preview',
    ingredients: ['See training video for full recipe details.'],
    steps: [
      'Press play on the video tutorial.',
      'Follow the preparation steps shown in the video.',
    ],
    tools: ['Tools and equipment as shown in the video.'],
    category: 'Non-Coffee (Iced)',
  },
];

export function RecipesListPage({ onNavigate, onBack }: RecipesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecipes = mockRecipes
    .filter(recipe =>
      !normalizedQuery ||
      recipe.name.toLowerCase().includes(normalizedQuery) ||
      recipe.category.toLowerCase().includes(normalizedQuery) ||
      recipe.description.toLowerCase().includes(normalizedQuery) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(normalizedQuery))
    )
    .filter(recipe => !activeCategory || recipe.category === activeCategory);

  const categories = Array.from(new Set(mockRecipes.map(r => r.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 p-2 rounded-xl">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-cyan-900">Recipes & Preparation Guide</h1>
                <p className="text-sm text-gray-500">Learn to prepare our signature drinks</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              aria-label="Search recipes"
              placeholder="Search recipes by name, category, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-amber-200 focus:border-amber-400"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map((category) => (
            <Badge
              key={category}
              role="button"
              tabIndex={0}
              aria-pressed={activeCategory === category}
              variant={activeCategory === category ? 'default' : 'outline'}
              onClick={() =>
                setActiveCategory(activeCategory === category ? null : category)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCategory(activeCategory === category ? null : category);
                }
              }}
              className={
                activeCategory === category
                  ? 'px-4 py-2 cursor-pointer bg-amber-600 text-white border-amber-600'
                  : 'px-4 py-2 cursor-pointer hover:bg-amber-100 border-amber-300'
              }
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Open recipe: ${recipe.name}`}
              onClick={() => onNavigate('recipe-detail', undefined, recipe)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate('recipe-detail', undefined, recipe);
                }
              }}
            >
              <Card className="overflow-hidden border-amber-100 hover:shadow-2xl transition-all h-full">
                {/* Video Preview (no photo thumbnail, gradient background only) */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-xs text-white">{recipe.videoDuration}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full">
                      <Play className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg text-amber-900">{recipe.name}</h3>
                    <Badge className="bg-amber-600 ml-2 flex-shrink-0">
                      {recipe.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Play className="w-3 h-3" />
                    <span>Video tutorial included</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-gray-600 mb-2">No recipes found</h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
