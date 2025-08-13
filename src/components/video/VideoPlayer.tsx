
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Settings, Wifi, WifiOff } from "lucide-react";

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
  const [hasError, setHasError] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [isTVBrowser, setIsTVBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Optimized preloading with cleanup
  useEffect(() => {
    if (!isOpen) return;
    
    const preloadDomains = () => {
      const domains = ['mega.nz'];
      const elements: HTMLElement[] = [];
      
      domains.forEach(domain => {
        // DNS prefetch only
        const prefetch = document.createElement('link');
        prefetch.rel = 'dns-prefetch';
        prefetch.href = `https://${domain}`;
        document.head.appendChild(prefetch);
        elements.push(prefetch);
      });
      
      return elements;
    };
    
    const elements = preloadDomains();
    return () => {
      elements.forEach(el => el.remove());
    };
  }, [isOpen]);

  // Detect TV browser and connection speed
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTV = userAgent.includes('smart-tv') || 
                 userAgent.includes('tizen') || 
                 userAgent.includes('webos') || 
                 userAgent.includes('roku') || 
                 userAgent.includes('hbbtv') ||
                 window.innerWidth > 1920 || // Large screen assumption
                 /tv|television/i.test(userAgent);
    
    setIsTVBrowser(isTV);
    
    // Test connection speed
    const testConnectionSpeed = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        const speed = connection.downlink || connection.bandwidth;
        if (speed < 2) setConnectionSpeed('slow');
        else if (speed < 10) setConnectionSpeed('medium');
        else setConnectionSpeed('fast');
      }
    };

    testConnectionSpeed();
    console.log('VideoPlayer: TV Browser detected:', isTV, 'Connection speed:', connectionSpeed);
  }, []);

  useEffect(() => {
    if (isOpen && videoSrc) {
      setHasError(false);
      setRetryCount(0);
      console.log('VideoPlayer: Opening with video source:', videoSrc);
      
      // Set loading state when video starts loading
      if (videoSrc.includes('<iframe')) {
        setIsLoading(true);
      }
      
      // Auto-adjust quality for TV browsers and slow connections
      if (isTVBrowser || connectionSpeed === 'slow') {
        setSelectedQuality('low');
        console.log('VideoPlayer: Auto-setting low quality for TV/slow connection');
      }
    }
  }, [isOpen, videoSrc, isTVBrowser, connectionSpeed]);

  // Handle iframe errors and loading states
  useEffect(() => {
    const handleIframeError = () => {
      console.error('VideoPlayer: Iframe connection failed');
      setIsLoading(false);
      setHasError(true);
    };

    const handleIframeLoad = () => {
      console.log('VideoPlayer: Iframe loaded successfully');
      setIsLoading(false);
      setHasError(false);
    };

    document.addEventListener('iframe-error', handleIframeError);
    
    // Ultra-fast loading timeout (800ms for immediate feedback)
    const loadingTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 800);

    return () => {
      document.removeEventListener('iframe-error', handleIframeError);
      clearTimeout(loadingTimer);
    };
  }, [isLoading]);

  if (!isOpen) return null;

  const getStreamingUrl = (videoSrc: string): string => {
    // Extract URL from embed code
    const srcMatch = videoSrc.match(/src=["']([^"']+)["']/);
    let url = srcMatch ? srcMatch[1] : videoSrc;
    
    // If it's a Mega.nz URL, we can't stream directly - return empty for now
    // In production, you'd want to have separate streaming URLs stored
    if (url.includes('mega.nz')) {
      console.log('Mega.nz detected - used for storage only, no streaming available');
      return '';
    }
    
    // Return direct video URLs for streaming (mp4, webm, etc.)
    return url;
  };

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

    const streamingUrl = getStreamingUrl(videoSrc);
    
    if (!streamingUrl) {
      console.log('No streaming URL available - Mega.nz is storage only');
      return (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-xl mb-4">Streaming not available</p>
            <p className="text-sm text-gray-400 mb-4">Mega.nz is used for storage only</p>
            <Button onClick={onClose} variant="outline" className="text-white border-white">
              Close
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative bg-black">
        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="text-center text-white">
               <p className="text-xl mb-4">Video failed to load</p>
               <p className="text-sm text-gray-400 mb-4">Check your internet connection</p>
              <Button 
                onClick={() => {
                  setHasError(false);
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

        <video
          className="w-full h-full object-cover"
          controls
          autoPlay
          muted
          onError={() => {
            console.error('HTML5 video failed to load');
            setHasError(true);
          }}
          onLoadedData={() => {
            console.log('HTML5 video loaded successfully');
            setHasError(false);
          }}
        >
          <source src={streamingUrl} type="video/mp4" />
          <source src={streamingUrl} type="video/webm" />
          <source src={streamingUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
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

      {/* Control Buttons */}
      <div className="absolute top-20 right-6 z-30 flex gap-2">
        {/* Connection Status */}
        <div className="flex items-center bg-black/50 rounded px-2 py-1">
          {connectionSpeed === 'slow' ? (
            <WifiOff className="w-4 h-4 text-red-400" />
          ) : (
            <Wifi className="w-4 h-4 text-green-400" />
          )}
          <span className="text-xs text-white ml-1">
            {connectionSpeed} {isTVBrowser && '(TV)'}
          </span>
        </div>

        {/* Quality Settings */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <Settings className="w-4 h-4 mr-2" />
            {selectedQuality}
          </Button>
          
          {showQualityMenu && (
            <div className="absolute top-full right-0 mt-2 bg-black/90 border border-white/20 rounded p-2 min-w-32">
              {['auto', 'high', 'medium', 'low'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => {
                    setSelectedQuality(quality);
                    setShowQualityMenu(false);
                    console.log('VideoPlayer: Quality changed to:', quality);
                  }}
                  className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/10 ${
                    selectedQuality === quality ? 'text-red-400' : 'text-white'
                  }`}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

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
