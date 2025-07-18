
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ContentGrid } from "@/components/content/ContentGrid";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentItem } from "@/types/content";

const ContentPage = () => {
  const location = useLocation();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Determine content type from pathname
  const getTypeFromPath = () => {
    const path = location.pathname;
    if (path === '/movies') return 'movie';
    if (path === '/series') return 'series';
    if (path === '/trailers') return 'trailer';
    // Check for query parameter as fallback
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('type') || 'all';
  };

  const type = getTypeFromPath();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter content based on type, search query, and age rating
  const filterContent = (items: ContentItem[]) => {
    let filtered = type === 'all' ? items : items.filter(item => item.type === type);

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // If not searching, hide adult content
      filtered = filtered.filter(item => 
        !item.age_rating || !['R', 'NC-17', '18+'].includes(item.age_rating)
      );
    }

    return filtered;
  };

  const filteredContent = filterContent(content);

  const getTitle = () => {
    switch (type) {
      case 'movie': return 'Movies';
      case 'series': return 'TV Series';
      case 'trailer': return 'Trailers';
      default: return 'All Content';
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-3xl">
              {getTitle()}
              {searchQuery && (
                <span className="text-lg text-gray-400 font-normal ml-2">
                  - Search results for "{searchQuery}"
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContent.length > 0 ? (
              <ContentGrid items={filteredContent} title={getTitle()} />
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">
                  {searchQuery 
                    ? `No results found for "${searchQuery}" in ${getTitle().toLowerCase()}`
                    : `No ${getTitle().toLowerCase()} available`
                  }
                </p>
                {searchQuery && (
                  <p className="text-gray-500 text-sm mt-2">Try searching with different keywords</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ContentPage;
