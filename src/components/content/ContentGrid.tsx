
import { Play, Star, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { EpisodeSelector } from "@/components/content/EpisodeSelector";
import { ContentItem, Episode } from "@/types/content";

interface ContentGridProps {
  items: ContentItem[];
  title: string;
  isAdmin?: boolean;
  onEdit?: (item: ContentItem) => void;
}

export const ContentGrid = ({ items, title, isAdmin = false, onEdit }: ContentGridProps) => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-20">🎬</div>
        <h3 className="text-2xl font-semibold text-white mb-2">No {title.toLowerCase()} available yet</h3>
        <p className="text-gray-400 mb-6">Check back later for new content updates</p>
      </div>
    );
  }

  const parseEpisodes = (videoUrl: string): Episode[] => {
    console.log('Parsing episodes from video URL:', videoUrl);
    
    if (!videoUrl) {
      console.log('No video URL provided');
      return [];
    }

    try {
      const parsed = JSON.parse(videoUrl);
      console.log('Successfully parsed JSON:', parsed);
      
      if (Array.isArray(parsed)) {
        console.log('Episodes array found with length:', parsed.length);
        return parsed;
      } else {
        console.log('Parsed data is not an array:', typeof parsed);
        return [];
      }
    } catch (error) {
      console.log('Failed to parse JSON, treating as single video URL:', error);
      return [];
    }
  };

  const extractVideoSrc = (embedCode: string | undefined | null): string => {
    if (!embedCode) {
      console.log('No embed code provided');
      return '';
    }
    
    console.log('Processing embed code:', embedCode);
    
    // If it's an iframe, return the full iframe HTML for embedding
    if (embedCode.includes('<iframe')) {
      console.log('Found iframe embed code, returning as-is for iframe rendering');
      return embedCode;
    }
    
    // If it's a direct URL that should be embedded, wrap it in iframe
    if (embedCode.startsWith('http')) {
      console.log('Found direct URL, wrapping in iframe');
      // Check if it's a known embeddable service
      if (embedCode.includes('youtube.com') || embedCode.includes('youtu.be')) {
        // Convert YouTube URLs to embed format
        const videoId = embedCode.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (videoId) {
          return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
      }
      
      if (embedCode.includes('mega.nz/embed') || embedCode.includes('mega.nz/file')) {
        // For Mega.nz, convert file links to embed links
        if (embedCode.includes('mega.nz/file')) {
          const embedUrl = embedCode.replace('mega.nz/file', 'mega.nz/embed');
          return `<iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
        }
        // If already embed URL, wrap in iframe
        return `<iframe width="100%" height="100%" src="${embedCode}" frameborder="0" allowfullscreen></iframe>`;
      }
      
      // For other URLs, attempt to embed directly
      return `<iframe width="100%" height="100%" src="${embedCode}" frameborder="0" allowfullscreen></iframe>`;
    }
    
    // Try to extract src from existing iframe
    const srcMatch = embedCode.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      console.log('Extracted src from iframe:', srcMatch[1]);
      // Return the full iframe with extracted src
      return embedCode;
    }
    
    console.log('Returning embed code as-is');
    return embedCode;
  };

  const handlePlayVideo = (item: ContentItem) => {
    console.log('=== PLAY BUTTON CLICKED (GRID) ===');
    console.log('Item ID:', item.id);
    console.log('Item Title:', item.title);
    console.log('Item Type:', item.type);
    console.log('Item Video URL:', item.video_url);
    console.log('Item Source:', item.source);
    console.log('Raw video_url length:', item.video_url?.length || 0);
    
    // Check if this is an OMDB result without video content
    if (item.source === 'omdb') {
      console.log('OMDB result detected - no video content available');
      alert('This is a search result from OMDB. Video content is not available - only movie information is provided.');
      return;
    }
    
    if (!item.video_url || item.video_url.trim() === '') {
      console.error('No video URL found for item:', item.title);
      alert('No video content is available for this item.');
      return;
    }
    
    if (item.type === 'series') {
      console.log('This is a series, attempting to parse episodes...');
      const episodes = parseEpisodes(item.video_url);
      console.log('Parsed episodes result:', episodes);
      
      if (episodes.length > 0) {
        console.log('Episodes found! Opening episode selector for', episodes.length, 'episodes');
        setShowEpisodeSelector(item.id);
        return;
      } else {
        console.log('No episodes found, treating as single video');
      }
    }
    
    console.log('Playing single video directly');
    setPlayingVideo(item.id);
    setSelectedEpisode(null);
  };

  const handleEpisodeSelect = (episode: Episode, itemId: string) => {
    console.log('=== EPISODE SELECTED ===');
    console.log('Selected episode:', episode);
    setSelectedEpisode(episode);
    setShowEpisodeSelector(null);
    setPlayingVideo(itemId);
  };

  const handleCloseVideo = () => {
    console.log('Closing video player');
    setPlayingVideo(null);
    setSelectedEpisode(null);
    setShowEpisodeSelector(null);
  };

  const getCurrentVideoContent = (item: ContentItem) => {
    console.log('=== GETTING CURRENT VIDEO CONTENT ===');
    console.log('Item:', item?.title, 'Type:', item?.type);
    
    if (!item) {
      console.log('No item provided to getCurrentVideoContent');
      return '';
    }
    
    if (item.type === 'series' && selectedEpisode) {
      console.log('Series with selected episode:', selectedEpisode);
      const videoSrc = extractVideoSrc(selectedEpisode.embed_code);
      console.log('Final embed code for selected episode:', videoSrc);
      return videoSrc;
    }
    
    if (item.type === 'series') {
      console.log('Series without selected episode, getting first episode');
      const episodes = parseEpisodes(item.video_url);
      console.log('Available episodes:', episodes);
      if (episodes.length > 0) {
        const videoSrc = extractVideoSrc(episodes[0].embed_code);
        console.log('First episode embed code:', videoSrc);
        return videoSrc;
      }
    }
    
    // For movies and trailers
    console.log('Getting direct embed code for movie/trailer');
    const videoSrc = extractVideoSrc(item.video_url);
    console.log('Direct embed code:', videoSrc);
    return videoSrc;
  };

  const handleEdit = (item: ContentItem) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDownload = () => {
    const currentItem = items.find(item => item.id === playingVideo);
    if (currentItem) {
      let downloadUrl = '';
      
      // For series with selected episode, use episode's download URL
      if (currentItem.type === 'series' && selectedEpisode && selectedEpisode.download_url) {
        downloadUrl = selectedEpisode.download_url;
      } 
      // Otherwise use the item's download URL
      else if (currentItem.download_url) {
        downloadUrl = currentItem.download_url;
      }
      // No fallback to embed code for downloads - only use dedicated download URLs
      
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        console.log('No download URL available');
        // Could show a toast message here indicating no download is available
      }
    }
  };

  const getCurrentTitle = () => {
    if (selectedEpisode) {
      return `Episode ${selectedEpisode.episode_number}`;
    }
    const currentItem = items.find(item => item.id === playingVideo);
    return currentItem?.title;
  };

  const getCurrentSubtitle = () => {
    if (selectedEpisode) {
      return selectedEpisode.title;
    }
    const currentItem = items.find(item => item.id === playingVideo);
    return currentItem?.subtitle;
  };

  // Convert episodes to the format expected by EpisodeSelector
  const convertEpisodesForSelector = (episodes: Episode[]) => {
    console.log('Converting episodes for selector:', episodes);
    const converted = episodes.map(ep => ({
      episode_number: ep.episode_number,
      title: ep.title,
      embed_code: ep.embed_code
    }));
    console.log('Converted episodes:', converted);
    return converted;
  };

  // Get episodes for the episode selector
  const getEpisodesForSelector = () => {
    if (!showEpisodeSelector) return [];
    
    const item = items.find(item => item.id === showEpisodeSelector);
    if (!item) return [];
    
    const episodes = parseEpisodes(item.video_url);
    console.log('Getting episodes for selector, found:', episodes.length, 'episodes');
    return convertEpisodesForSelector(episodes);
  };

  return (
    <>
      {/* Content Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load image:', item.thumbnail);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Fallback when image fails to load */}
              <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${item.thumbnail ? 'hidden' : ''}`}>
                <Play className="w-12 h-12 text-gray-400" />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <Button
                    size="sm"
                    className={`rounded-full w-12 h-12 p-0 mb-2 ${
                      item.source === 'omdb' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      console.log('Play button clicked - grid overlay');
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayVideo(item);
                    }}
                  >
                    {item.source === 'omdb' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <Play className="w-5 h-5 fill-current" />
                    )}
                  </Button>
                  <p className="text-white text-sm">
                    {item.source === 'omdb' ? 'View Info' : 'Watch Now'}
                  </p>
                </div>
              </div>

              {/* Rating Badge */}
              {item.rating && item.rating > 0 && (
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  {item.rating}
                </div>
              )}

              {/* Age Rating Badge */}
              {item.age_rating && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-orange-600 text-white">
                    {item.age_rating}
                  </Badge>
                </div>
              )}

              {/* Type Badge */}
              <div className={`absolute ${item.age_rating ? 'top-8' : 'top-2'} left-2`}>
                <Badge variant="secondary" className="text-xs bg-red-600 text-white">
                  {item.type}
                </Badge>
              </div>
            </div>

            {/* Content Info */}
            <div className="mt-3">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-white">{item.title}</h3>
              {item.subtitle && (
                <p className="text-xs text-gray-400 mb-1 line-clamp-1">{item.subtitle}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>{item.year}</span>
                {item.category && (
                  <>
                    <span>•</span>
                    <span>{item.category}</span>
                  </>
                )}
                {item.genre && (
                  <>
                    <span>•</span>
                    <span>{item.genre}</span>
                  </>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-2 flex gap-2">
                <Button 
                  size="sm" 
                  className={`flex-1 text-white ${
                    item.source === 'omdb' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={(e) => {
                    console.log('Play button clicked - grid action button');
                    e.preventDefault();
                    e.stopPropagation();
                    handlePlayVideo(item);
                  }}
                >
                  {item.source === 'omdb' ? (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Info
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Watch
                    </>
                  )}
                </Button>
                {isAdmin && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <EpisodeSelector
        isOpen={!!showEpisodeSelector}
        episodes={getEpisodesForSelector()}
        onEpisodeSelect={(episode) => {
          console.log('Episode selector callback triggered:', episode);
          const episodeData: Episode = {
            episode_number: episode.episode_number,
            title: episode.title,
            embed_code: episode.embed_code
          };
          handleEpisodeSelect(episodeData, showEpisodeSelector!);
        }}
        onClose={() => {
          console.log('Closing episode selector');
          setShowEpisodeSelector(null);
        }}
      />

      <VideoPlayer
        isOpen={!!playingVideo}
        videoSrc={playingVideo ? getCurrentVideoContent(items.find(item => item.id === playingVideo)!) : ''}
        title={getCurrentTitle()}
        subtitle={getCurrentSubtitle()}
        onClose={handleCloseVideo}
        onDownload={handleDownload}
      />
    </>
  );
};
