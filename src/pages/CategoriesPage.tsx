import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ContentGrid } from '@/components/content/ContentGrid';
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/types/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Film, Tv, Play, Star } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  icon: React.ReactNode;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard = ({ name, icon, count, isSelected, onClick }: CategoryCardProps) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="lg"
      onClick={onClick}
      className={`h-auto p-6 flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105 ${
        isSelected 
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
          : 'bg-gray-800/50 hover:bg-gray-700/70 text-white border-gray-600'
      }`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm opacity-80">{count} items</p>
      </div>
    </Button>
  );
};

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  // Predefined categories with icons and colors
  const categories = [
    { name: 'All', key: 'all', icon: <Star className="w-8 h-8" />, description: 'All content' },
    { name: 'Action', key: 'action', icon: '🔥', description: 'High-octane thrills' },
    { name: 'Comedy', key: 'comedy', icon: '😂', description: 'Laugh-out-loud moments' },
    { name: 'Drama', key: 'drama', icon: '🎭', description: 'Emotional storytelling' },
    { name: 'Horror', key: 'horror', icon: '👻', description: 'Spine-chilling scares' },
    { name: 'Sci-Fi', key: 'sci-fi', icon: '🚀', description: 'Future possibilities' },
    { name: 'Romance', key: 'romance', icon: '💕', description: 'Love stories' },
    { name: 'Thriller', key: 'thriller', icon: '⚡', description: 'Edge-of-seat suspense' },
    { name: 'Animation', key: 'animation', icon: '🎨', description: 'Animated adventures' },
    { name: 'Documentary', key: 'documentary', icon: '📽️', description: 'Real-world stories' },
    { name: 'Fantasy', key: 'fantasy', icon: '🧙', description: 'Magical worlds' },
    { name: 'Crime', key: 'crime', icon: '🕵️', description: 'Criminal underworld' },
  ];

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    let filtered = content;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        // Check both category and genre fields for flexibility
        const itemCategory = item.category?.toLowerCase() || '';
        const itemGenre = item.genre?.toLowerCase() || '';
        const categoryKey = selectedCategory.toLowerCase();
        
        return itemCategory.includes(categoryKey) || 
               itemGenre.includes(categoryKey) ||
               item.title.toLowerCase().includes(categoryKey);
      });
    }

    setFilteredContent(filtered);
  }, [content, searchQuery, selectedCategory]);

  const getCategoryCount = (categoryKey: string) => {
    if (categoryKey === 'all') return content.length;
    
    return content.filter(item => {
      const itemCategory = item.category?.toLowerCase() || '';
      const itemGenre = item.genre?.toLowerCase() || '';
      
      return itemCategory.includes(categoryKey) || 
             itemGenre.includes(categoryKey) ||
             item.title.toLowerCase().includes(categoryKey);
    }).length;
  };

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setSearchParams(categoryKey === 'all' ? {} : { category: categoryKey });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-xl">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Hero Section */}
      <div className="pt-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Browse by Category
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover your favorite content organized by genre and category. 
              From action-packed adventures to heartwarming comedies, find exactly what you're looking for.
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-16">
            {categories.map((category) => (
              <CategoryCard
                key={category.key}
                name={category.name}
                icon={category.icon}
                count={getCategoryCount(category.key)}
                isSelected={selectedCategory === category.key}
                onClick={() => handleCategorySelect(category.key)}
              />
            ))}
          </div>

          {/* Selected Category Info */}
          {selectedCategory !== 'all' && (
            <div className="text-center mb-8">
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-red-600 text-white">
                {categories.find(cat => cat.key === selectedCategory)?.name} Category
              </Badge>
              <p className="text-gray-400 mt-2">
                {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'} found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredContent.length > 0 ? (
          <ContentGrid
            items={filteredContent}
            title={selectedCategory === 'all' ? 'All Content' : `${categories.find(cat => cat.key === selectedCategory)?.name} Content`}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-20">🎬</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No content found {selectedCategory !== 'all' && `in ${categories.find(cat => cat.key === selectedCategory)?.name}`}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? `Try adjusting your search or browse other categories`
                : `This category doesn't have any content yet`
              }
            </p>
            <Button 
              onClick={() => {
                setSelectedCategory('all');
                setSearchParams({});
                setSearchQuery('');
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Browse All Content
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}