import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/types/content';

export const useOMDBSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOMDB = async (query: string, type: 'movie' | 'series' = 'movie'): Promise<ContentItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('omdb-search', {
        body: { searchQuery: query, type }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data?.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search OMDB';
      setError(errorMessage);
      console.error('OMDB search error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchOMDB,
    isLoading,
    error
  };
};