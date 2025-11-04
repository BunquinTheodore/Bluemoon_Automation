import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Recipe, Screen } from '../App';
import { Search, Moon, LogOut, Play, Clock, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

interface RecipesListPageProps {
  onNavigate: (screen: Screen, task?: any, recipe?: Recipe) => void;
  onLogout: () => void;
  onBack: () => void;
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Iced Latte',
    description: '3-step espresso-based cold drink',
    imageUrl: 'https://images.unsplash.com/photo-1684548856346-041e1a90d630?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VkJTIwbGF0dGUlMjBjb2ZmZWV8ZW58MXx8fHwxNzYxMTE2MDAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    videoDuration: '2:30',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ingredients: ['2 shots of espresso', '8 oz cold milk', 'Ice cubes', 'Simple syrup (optional)'],
    steps: [
      'Fill a tall glass with ice cubes',
      'Pour 2 shots of freshly brewed espresso over the ice',
      'Add cold milk slowly to create layers',
      'Stir gently and add sweetener if desired'
    ],
    tools: ['Espresso machine', 'Tall glass', 'Ice scoop', 'Stirring spoon'],
    category: 'Cold Drinks'
  },
  {
    id: '2',
    name: 'Cappuccino',
    description: 'Classic Italian espresso with foam',
    imageUrl: 'https://images.unsplash.com/photo-1708430651927-20e2e1f1e8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwY29mZmVlfGVufDF8fHx8MTc2MTA3NTQxMHww&ixlib=rb-4.1.0&q=80&w=1080',
    videoDuration: '3:00',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ingredients: ['2 shots of espresso', '4 oz steamed milk', 'Milk foam', 'Cocoa powder (optional)'],
    steps: [
      'Brew 2 shots of espresso into a cappuccino cup',
      'Steam milk to create microfoam texture',
      'Pour steamed milk over espresso',
      'Top with thick layer of foam',
      'Dust with cocoa powder if desired'
    ],
    tools: ['Espresso machine', 'Steam wand', 'Cappuccino cup', 'Thermometer'],
    category: 'Hot Drinks'
  },
  {
    id: '3',
    name: 'Espresso Shot',
    description: 'Perfect single or double shot',
    imageUrl: 'https://images.unsplash.com/photo-1705952285570-113e76f63fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMHNob3R8ZW58MXx8fHwxNzYxMDE3NTg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    videoDuration: '1:45',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ingredients: ['18-20g fresh coffee beans', 'Filtered water'],
    steps: [
      'Grind 18-20g of coffee beans to fine consistency',
      'Distribute grounds evenly in portafilter',
      'Tamp with 30 lbs of pressure',
      'Lock portafilter into group head',
      'Extract for 25-30 seconds',
      'Should yield 1.5-2 oz of espresso'
    ],
    tools: ['Espresso machine', 'Grinder', 'Tamper', 'Portafilter', 'Scale'],
    category: 'Hot Drinks'
  },
  {
    id: '4',
    name: 'Latte Art Basics',
    description: 'Master the heart and rosetta',
    imageUrl: 'https://images.unsplash.com/photo-1680489809506-d8def0e1631f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZXxlbnwxfHx8fDE3NjEwMzg0MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    videoDuration: '4:15',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ingredients: ['2 shots of espresso', '8 oz whole milk'],
    steps: [
      'Brew espresso into a wide latte cup',
      'Steam milk to create silky microfoam (140-150°F)',
      'Tap pitcher to remove large bubbles',
      'Pour milk from higher position to mix',
      'Lower pitcher close to surface',
      'Create design by controlling flow and movement'
    ],
    tools: ['Espresso machine', 'Steam pitcher', 'Wide latte cup', 'Thermometer'],
    category: 'Techniques'
  },
  {
    id: '5',
    name: 'Mocha',
    description: 'Chocolate espresso indulgence',
    imageUrl: 'https://images.unsplash.com/photo-1649023384041-555d35454897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2NoYSUyMGNvZmZlZSUyMGRyaW5rfGVufDF8fHx8MTc2MTAyMDM5NXww&ixlib=rb-4.1.0&q=80&w=1080',
    videoDuration: '2:45',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ingredients: ['2 shots of espresso', '1 oz chocolate syrup', '8 oz steamed milk', 'Whipped cream', 'Chocolate shavings'],
    steps: [
      'Add chocolate syrup to cup',
      'Brew 2 shots of espresso over syrup',
      'Stir to combine chocolate and espresso',
      'Steam milk to 150°F',
      'Pour steamed milk over espresso mixture',
      'Top with whipped cream and chocolate shavings'
    ],
    tools: ['Espresso machine', 'Steam wand', 'Spoon', 'Cup'],
    category: 'Hot Drinks'
  },
  {
    id: '6',
    name: 'Matcha Latte',
    description: 'Smooth green tea latte',
    imageUrl: 'https://images.unsplash.com/photo-1582785513054-8d1bf9d69c1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBsYXR0ZXxlbnwxfHx8fDE3NjExMjEwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    videoDuration: '2:00',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ingredients: ['2 tsp matcha powder', '2 oz hot water', '8 oz steamed milk', 'Sweetener (optional)'],
    steps: [
      'Sift matcha powder into a bowl to remove clumps',
      'Add hot water (not boiling)',
      'Whisk vigorously in M or W pattern until frothy',
      'Pour matcha into serving cup',
      'Steam milk to desired temperature',
      'Pour steamed milk over matcha',
      'Create latte art if desired'
    ],
    tools: ['Matcha whisk (chasen)', 'Bowl', 'Sifter', 'Steam wand', 'Cup'],
    category: 'Hot Drinks'
  },
];

export function RecipesListPage({ onNavigate, onLogout, onBack }: RecipesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = mockRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
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
              type="text"
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
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-amber-100 border-amber-300"
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
              onClick={() => onNavigate('recipe-detail', undefined, recipe)}
            >
              <Card className="overflow-hidden border-amber-100 hover:shadow-2xl transition-all h-full">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-xs text-white">{recipe.videoDuration}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
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