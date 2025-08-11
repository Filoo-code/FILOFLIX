
export interface ContentItem {
  id: string;
  title: string;
  type: string;
  thumbnail: string | null;
  video_url: string;
  rating: number | null;
  year: number | null;
  genre: string | null;
  description: string | null;
  download_url?: string | null;
  subtitle?: string | null;
  category?: string | null;
  age_rating?: string | null;
  imdb_id?: string | null;
  
}

export interface Episode {
  id?: string;
  episode_number: number;
  title: string;
  embed_code: string; // Standardized to embed_code
  video_url?: string; // Keep as optional for backward compatibility
  download_url?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  duration?: string | null;
}
