
import { useState } from "react";
import { Play, Plus, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { EpisodeSelector } from "@/components/content/EpisodeSelector";
import { ContentItem, Episode } from "@/types/content";

interface ContentRowProps {
  title: string;
  items: ContentItem[];
}

export const ContentRow = ({ title, items }: ContentRowProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  const parseEpisodes = (videoUrl: string): Episode[] => {
    try {
      if (!videoUrl) {
        console.log('No video URL provided for parsing episodes');
        return [];
      }
      const parsed = JSON.parse(videoUrl);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      console.log('Failed to parse episodes, treating as single video');
      return [];
    }
  };

  const extractVideoSrc = (embedCode: string | undefined | null): string => {
    if (!embedCode) {
      console.log('No embed code provided to extractVideoSrc');
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

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`row-${title.replace(/\s+/g, '-')}`);
    if (container) {
      const scrollAmount = 400;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const handlePlayVideo = (item: ContentItem) => {
    console.log('=== PLAY BUTTON CLICKED ===');
    console.log('Item ID:', item.id);
    console.log('Item Title:', item.title);
    console.log('Item Type:', item.type);
    console.log('Item Video URL:', item.video_url);
    console.log('Raw video_url length:', item.video_url?.length || 0);
    
    if (!item.video_url) {
      console.error('No video URL found for item:', item.title);
      return;
    }

    if (item.type === 'series') {
      const episodes = parseEpisodes(item.video_url);
      console.log('Parsed episodes for series:', episodes.length);
      if (episodes.length > 0) {
        console.log('Opening episode selector for series');
        setShowEpisodeSelector(item.id);
        return;
      } else {
        console.log('No episodes found, treating series as single video');
      }
    }
    
    console.log('Setting playing video to:', item.id);
    setPlayingVideo(item.id);
    setSelectedEpisode(null);
  };

  const handleEpisodeSelect = (episode: Episode, itemId: string) => {
    setSelectedEpisode(episode);
    setShowEpisodeSelector(null);
    setPlayingVideo(itemId);
  };

  const handleCloseVideo = () => {
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
      console.log('Getting embed code for selected episode:', selectedEpisode);
      return extractVideoSrc(selectedEpisode.embed_code);
    }
    
    const episodes = parseEpisodes(item.video_url);
    if (episodes.length > 0) {
      console.log('Getting first episode embed code from series');
      return extractVideoSrc(episodes[0].embed_code);
    }
    
    console.log('Getting direct embed code for movie/trailer');
    return extractVideoSrc(item.video_url);
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
      // Fallback to video URL if no download URL is available
      else {
        downloadUrl = getCurrentVideoContent(currentItem);
      }
      
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        console.log('No download URL available');
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

  return (
    <>
      <div className="mb-8 group">
        <h2 className="text-2xl font-bold text-white mb-4 px-4 sm:px-6 lg:px-8">
          {title}
        </h2>
        
        <div className="relative">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full w-12 h-12 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Content Scroll Container */}
          <div 
            id={`row-${title.replace(/\s+/g, '-')}`}
            className="flex overflow-x-auto scrollbar-hide gap-2 px-4 sm:px-6 lg:px-8 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <div 
                key={item.id}
                className="flex-none w-48 md:w-64 transition-transform duration-300 hover:scale-105 cursor-pointer"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-200 rounded-full w-12 h-12 p-0"
                      onClick={(e) => {
                        console.log('Play button clicked - overlay');
                        e.preventDefault();
                        e.stopPropagation();
                        handlePlayVideo(item);
                      }}
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </Button>
                  </div>

                  {/* Rating Badge */}
                  {item.rating && item.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      {item.rating}
                    </div>
                  )}
                </div>

                {/* Expanded Info Card */}
                {hoveredItem === item.id && (
                  <div className="absolute z-20 bg-gray-900 rounded-lg p-4 mt-2 w-80 shadow-2xl border border-gray-700">
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-sm text-gray-300 mb-2">{item.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <span className="text-green-400">
                        {item.rating ? `${item.rating * 10}% Match` : 'New'}
                      </span>
                      <span>{item.year}</span>
                      <span className="px-1 border border-gray-500 text-xs">
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                        {item.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={(e) => {
                          console.log('Play button clicked - info card');
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlayVideo(item);
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-500 text-white hover:bg-white/10">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full w-12 h-12 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <EpisodeSelector
        isOpen={!!showEpisodeSelector}
        episodes={showEpisodeSelector ? parseEpisodes(items.find(item => item.id === showEpisodeSelector)?.video_url || '') : []}
        onEpisodeSelect={(episode) => handleEpisodeSelect(episode, showEpisodeSelector!)}
        onClose={() => setShowEpisodeSelector(null)}
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
