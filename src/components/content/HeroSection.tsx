
import { useState, useEffect } from "react";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { ContentItem } from "@/types/content";

interface HeroSectionProps {
  content: ContentItem[];
}

export const HeroSection = ({ content }: HeroSectionProps) => {
  const [featuredContent, setFeaturedContent] = useState<ContentItem | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (content.length > 0) {
      const randomIndex = Math.floor(Math.random() * content.length);
      setFeaturedContent(content[randomIndex]);
    }
  }, [content]);

  const extractVideoSrc = (embedCode: string): string => {
    const srcMatch = embedCode.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : embedCode;
  };

  const handlePlayVideo = () => {
    console.log('=== HERO PLAY BUTTON CLICKED ===');
    console.log('Featured content:', featuredContent?.title);
    console.log('Video URL:', featuredContent?.video_url);
    
    if (!featuredContent?.video_url) {
      console.error('No video URL found for featured content');
      return;
    }
    
    setIsPlaying(true);
  };

  const handleCloseVideo = () => {
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (featuredContent) {
      const downloadUrl = featuredContent.download_url || extractVideoSrc(featuredContent.video_url);
      window.open(downloadUrl, '_blank');
    }
  };

  if (!featuredContent) {
    return (
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">🎬</div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white">
            FILOFLIX
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover amazing movies, series, and trailers from around the world
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-screen">
        {/* Background Image/Video */}
        <div className="absolute inset-0">
          {featuredContent?.thumbnail ? (
            <img 
              src={featuredContent.thumbnail} 
              alt={featuredContent.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {featuredContent?.title}
            </h1>
            
            {featuredContent?.subtitle && (
              <p className="text-2xl text-gray-300 mb-4 font-medium">
                {featuredContent.subtitle}
              </p>
            )}
            
            <div className="flex items-center gap-4 mb-4 text-white">
              <span className="text-green-400 font-semibold">
                {featuredContent?.rating ? `${featuredContent.rating * 10}% Match` : 'New'}
              </span>
              <span>{featuredContent?.year}</span>
              <span className="px-2 py-1 border border-gray-500 text-xs">
                {featuredContent?.type.toUpperCase()}
              </span>
              <span>{featuredContent?.genre}</span>
            </div>

            {featuredContent?.description && (
              <p className="text-lg text-gray-300 mb-8 line-clamp-3">
                {featuredContent.description}
              </p>
            )}

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-200 font-semibold px-8"
                onClick={(e) => {
                  console.log('Hero play button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlayVideo();
                }}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Play
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-500 text-white hover:bg-white/10 font-semibold px-8"
              >
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </div>
          </div>
        </div>

        {/* Mute Button */}
        <div className="absolute bottom-24 right-8 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="border-gray-500 text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <VideoPlayer
        isOpen={isPlaying}
        videoSrc={featuredContent ? extractVideoSrc(featuredContent.video_url) : ''}
        title={featuredContent?.title}
        subtitle={featuredContent?.subtitle || undefined}
        onClose={handleCloseVideo}
        onDownload={handleDownload}
      />
    </>
  );
};
