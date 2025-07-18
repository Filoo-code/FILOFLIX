
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Play, Loader2 } from "lucide-react";

interface VideoPlayerProps {
  isOpen: boolean;
  videoSrc: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onDownload: () => void;
}

export const VideoPlayer = ({ 
  isOpen, 
  videoSrc, 
  title, 
  subtitle, 
  onClose, 
  onDownload 
}: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  useEffect(() => {
    if (isOpen && videoSrc) {
      setIsLoading(true);
      setHasError(false);
      setShowPlayButton(true);
      console.log('VideoPlayer: Opening with video source:', videoSrc);
      
      // Set a timeout to automatically hide loading after 5 seconds
      const loadingTimeout = setTimeout(() => {
        console.log('VideoPlayer: Loading timeout reached, hiding loading state');
        setIsLoading(false);
      }, 5000);
      
      return () => clearTimeout(loadingTimeout);
    }
  }, [isOpen, videoSrc]);

  if (!isOpen) return null;

  const renderVideoContent = () => {
    if (!videoSrc) {
      console.log('VideoPlayer: No video source provided');
      return (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-xl mb-4">No video available</p>
            <Button onClick={onClose} variant="outline" className="text-white border-white">
              Close
            </Button>
          </div>
        </div>
      );
    }

    console.log('VideoPlayer: Processing video source:', videoSrc);

    // Check if videoSrc is a direct link to external websites that should be blocked
    const blockedDomains = ['pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com'];
    const isBlockedDomain = blockedDomains.some(domain => videoSrc.includes(domain));
    
    if (isBlockedDomain) {
      console.log('VideoPlayer: Blocked external domain detected');
      return (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-xl mb-4">This video cannot be played</p>
            <p className="text-sm text-gray-400 mb-4">External links are not supported</p>
            <Button onClick={onClose} variant="outline" className="text-white border-white">
              Close
            </Button>
          </div>
        </div>
      );
    }

    // If videoSrc contains iframe HTML, render it directly
    if (videoSrc.includes('<iframe')) {
      console.log('VideoPlayer: Processing iframe embed code');
      let modifiedIframe = videoSrc;
      
      // Remove restrictive sandbox attributes that might block video playback
      modifiedIframe = modifiedIframe.replace(/sandbox="[^"]*"/g, '');
      
      // Ensure width and height are 100%
      modifiedIframe = modifiedIframe.replace(/width="\d+"/g, 'width="100%"');
      modifiedIframe = modifiedIframe.replace(/height="\d+"/g, 'height="100%"');
      
      // Add style for full size and remove borders
      if (modifiedIframe.includes('style=')) {
        modifiedIframe = modifiedIframe.replace(
          /style="[^"]*"/g,
          'style="width: 100%; height: 100%; border: none; background: black;"'
        );
      } else {
        modifiedIframe = modifiedIframe.replace(
          /(<iframe[^>]*?)>/g,
          '$1 style="width: 100%; height: 100%; border: none; background: black;">'
        );
      }

      // Remove frameborder
      modifiedIframe = modifiedIframe.replace(/frameborder="\d+"/g, '');
      
      // Add allowfullscreen if not present
      if (!modifiedIframe.includes('allowfullscreen')) {
        modifiedIframe = modifiedIframe.replace(
          /(<iframe[^>]*?)>/g,
          '$1 allowfullscreen>'
        );
      }

      console.log('VideoPlayer: Final iframe:', modifiedIframe);

      return (
        <div className="w-full h-full relative bg-black">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading video...</p>
                <Button
                  onClick={() => setIsLoading(false)}
                  variant="outline"
                  size="sm"
                  className="text-white border-white mt-4"
                >
                  Skip Loading
                </Button>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {hasError && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
              <div className="text-center text-white">
                <p className="text-xl mb-4">Video failed to load</p>
                <Button 
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                    // Try to reload
                    const iframe = document.querySelector('#video-iframe') as HTMLIFrameElement;
                    if (iframe) {
                      iframe.src = iframe.src;
                    }
                  }} 
                  variant="outline" 
                  className="text-white border-white mr-2"
                >
                  Retry
                </Button>
                <Button onClick={onClose} variant="outline" className="text-white border-white">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Manual play button overlay */}
          {showPlayButton && !isLoading && !hasError && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <Button
                size="lg"
                onClick={() => {
                  console.log('Manual play button clicked');
                  setShowPlayButton(false);
                  // Try to focus and interact with the iframe
                  const iframe = document.querySelector('#video-iframe') as HTMLIFrameElement;
                  if (iframe) {
                    iframe.focus();
                  }
                }}
                className="bg-white/90 text-black hover:bg-white rounded-full w-20 h-20 p-0"
              >
                <Play className="w-8 h-8 fill-current" />
              </Button>
            </div>
          )}
          
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ 
              __html: modifiedIframe.replace('<iframe', '<iframe id="video-iframe"')
            }}
          />
        </div>
      );
    }

    // Otherwise, render as iframe with src
    console.log('VideoPlayer: Processing direct URL:', videoSrc);
    return (
      <div className="w-full h-full relative bg-black">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading video...</p>
              <Button
                onClick={() => setIsLoading(false)}
                variant="outline"
                size="sm"
                className="text-white border-white mt-4"
              >
                Skip Loading
              </Button>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="text-center text-white">
              <p className="text-xl mb-4">Video failed to load</p>
              <Button 
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                }} 
                variant="outline" 
                className="text-white border-white mr-2"
              >
                Retry
              </Button>
              <Button onClick={onClose} variant="outline" className="text-white border-white">
                Close
              </Button>
            </div>
          </div>
        )}

        <iframe
          id="video-iframe"
          src={videoSrc}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          style={{ border: 'none', background: 'black' }}
          onLoad={() => {
            console.log('VideoPlayer: Direct iframe loaded successfully');
            setIsLoading(false);
            setHasError(false);
          }}
          onError={(e) => {
            console.error('VideoPlayer: Direct iframe failed to load:', e);
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header with FILOFLIX */}
      <div className="h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-center relative">
        <div className="absolute left-6">
          {title && (
            <div className="text-white">
              <h3 className="font-semibold">{title}</h3>
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
          )}
        </div>
        <span className="text-2xl font-bold text-red-600">FILOFLIX</span>
      </div>

      {/* Download Button */}
      <div className="absolute top-20 right-6 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="text-white border-white hover:bg-white hover:text-black"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full h-full max-w-6xl max-h-[calc(100vh-160px)]">
          {renderVideoContent()}
        </div>
      </div>

      {/* Close Button */}
      <div className="h-16 flex items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-white border-white hover:bg-white hover:text-black"
        >
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  );
};
