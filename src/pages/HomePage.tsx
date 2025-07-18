
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/content/HeroSection";
import { ContentRow } from "@/components/content/ContentRow";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ContentItem } from "@/types/content";

const HomePage = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter content based on search query and age rating
  const filterContent = (items: ContentItem[]) => {
    let filtered = items;

    // If searching, show all content (including adult content)
    if (searchQuery.trim()) {
      filtered = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // If not searching, hide adult content
      filtered = items.filter(item => 
        !item.age_rating || !['R', 'NC-17', '18+'].includes(item.age_rating)
      );
    }

    return filtered;
  };

  const filteredContent = filterContent(content);
  const movies = filteredContent.filter(item => item.type === 'movie');
  const series = filteredContent.filter(item => item.type === 'series');
  const trailers = filteredContent.filter(item => item.type === 'trailer');

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
      <HeroSection content={filteredContent} />
      <main className="py-8">
        {movies.length > 0 && (
          <ContentRow title="Popular Movies" items={movies} />
        )}
        {series.length > 0 && (
          <ContentRow title="TV Series" items={series} />
        )}
        {trailers.length > 0 && (
          <ContentRow title="Latest Trailers" items={trailers} />
        )}
        {searchQuery.trim() && filteredContent.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
            <p className="text-gray-500 text-sm mt-2">Try searching with different keywords</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
