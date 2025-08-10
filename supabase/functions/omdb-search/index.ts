import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery, type = 'movie' } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Searching OMDB for: ${searchQuery}, type: ${type}`);

    // OMDB API call (free tier - no API key needed for basic searches)
    const omdbUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&type=${type}&apikey=trilogy`;
    
    const response = await fetch(omdbUrl);
    const data = await response.json();

    if (data.Response === "False") {
      return new Response(
        JSON.stringify({ results: [], total: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Transform OMDB results to match our ContentItem interface
    const transformedResults = data.Search?.map((item: any) => ({
      id: `omdb_${item.imdbID}`,
      title: item.Title,
      type: item.Type === 'series' ? 'series' : 'movie',
      thumbnail: item.Poster !== 'N/A' ? item.Poster : null,
      video_url: '', // OMDB doesn't provide video URLs
      rating: null,
      year: parseInt(item.Year) || null,
      genre: null,
      description: null,
      download_url: null,
      subtitle: null,
      category: item.Type,
      age_rating: null,
      imdb_id: item.imdbID,
      source: 'omdb'
    })) || [];

    console.log(`Found ${transformedResults.length} results from OMDB`);

    return new Response(
      JSON.stringify({
        results: transformedResults,
        total: transformedResults.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in OMDB search:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search OMDB' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});