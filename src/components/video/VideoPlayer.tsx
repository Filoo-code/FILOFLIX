
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

  // Preload Mega.nz domains for faster connection
  useEffect(() => {
    const preloadDomains = () => {
      const domains = ['mega.nz', 'g.api.mega.co.nz', 'eu.api.mega.co.nz', 'us.api.mega.co.nz'];
      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `https://${domain}`;
        document.head.appendChild(link);
        
        // Also add preconnect for faster handshake
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = `https://${domain}`;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      });
      console.log('VideoPlayer: Preloaded Mega.nz domains for faster connection');
    };
    
    preloadDomains();
  }, []);

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
    
    // Set up timer to auto-hide loading after reasonable time (reduced from 8s to 3s)
    const loadingTimer = setTimeout(() => {
      if (isLoading) {
        console.log('VideoPlayer: Auto-hiding loading indicator after timeout');
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      document.removeEventListener('iframe-error', handleIframeError);
      clearTimeout(loadingTimer);
    };
  }, [isLoading]);

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
      
      // Extract the Mega.nz URL and optimize for immediate playback (no poster/thumbnail delay)
      const urlMatch = modifiedIframe.match(/src="([^"]*mega\.nz[^"]*)"/);
      if (urlMatch) {
        const originalUrl = urlMatch[1];
        let enhancedUrl = originalUrl;
        
        // Force immediate playback without showing poster/thumbnail
        const separator = enhancedUrl.includes('?') ? '&' : '?';
        const optimizations = [
          'autoplay=1', // Force autoplay
          'preload=auto', // Preload everything for immediate start
          'poster=0', // Disable poster/thumbnail display
          'controls=1', // Ensure controls are available
          'muted=0' // Ensure audio works
        ];
        
        // Add quality setting only if specified
        if (connectionSpeed === 'slow') {
          optimizations.push('quality=low');
        } else if (selectedQuality !== 'auto') {
          optimizations.push('quality=' + selectedQuality);
        }
        
        enhancedUrl = `${enhancedUrl}${separator}${optimizations.join('&')}`;
        modifiedIframe = modifiedIframe.replace(originalUrl, enhancedUrl);
        
        console.log('VideoPlayer: Optimized Mega.nz URL for immediate playback (no poster delay):', enhancedUrl);
      }
      
      // Remove restrictive sandbox attributes that might block video playback
      modifiedIframe = modifiedIframe.replace(/sandbox="[^"]*"/g, '');
      
      // Ensure width and height are 100%
      modifiedIframe = modifiedIframe.replace(/width="\d+"/g, 'width="100%"');
      modifiedIframe = modifiedIframe.replace(/height="\d+"/g, 'height="100%"');
      
      // Add TV browser and connection optimizations
      const tvOptimizedStyle = isTVBrowser 
        ? 'width: 100%; height: 100%; border: none; background: black; image-rendering: optimizeQuality; image-rendering: -webkit-optimize-contrast; will-change: transform;'
        : 'width: 100%; height: 100%; border: none; background: black; will-change: transform;';
      
      // Add style for full size and remove borders
      if (modifiedIframe.includes('style=')) {
        modifiedIframe = modifiedIframe.replace(
          /style="[^"]*"/g,
          `style="${tvOptimizedStyle}"`
        );
      } else {
        modifiedIframe = modifiedIframe.replace(
          /(<iframe[^>]*?)>/g,
          `$1 style="${tvOptimizedStyle}">`
        );
      }

      // Remove frameborder
      modifiedIframe = modifiedIframe.replace(/frameborder="\d+"/g, '');
      
      // Add comprehensive iframe attributes for optimal performance
      const performanceAttrs = [
        'allowfullscreen',
        'loading="eager"',
        'importance="high"',
        'referrerpolicy="strict-origin-when-cross-origin"',
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; cross-origin-isolated"'
      ];
      
      if (isTVBrowser) {
        performanceAttrs.push('data-tv-optimized="true"');
      }
      
      const attrsString = performanceAttrs.join(' ');
      
      if (!modifiedIframe.includes('allowfullscreen')) {
        modifiedIframe = modifiedIframe.replace(
          /(<iframe[^>]*?)>/g,
          `$1 ${attrsString}>`
        );
      }

      console.log('VideoPlayer: Final optimized iframe:', modifiedIframe);

      return (
        <div className="w-full h-full relative bg-black">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
                <p className="text-lg">Connecting to Mega.nz...</p>
                <p className="text-sm text-gray-400">Optimizing for {isTVBrowser ? 'TV' : connectionSpeed} connection</p>
              </div>
            </div>
          )}

          {/* Error overlay with enhanced retry */}
          {hasError && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
              <div className="text-center text-white">
               <p className="text-xl mb-4">Connection failed</p>
               <p className="text-sm text-gray-400 mb-4">
                 {retryCount > 0 ? `Retry attempt ${retryCount}/3` : 'Optimizing connection to Mega.nz...'}
               </p>
                <Button 
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                    setRetryCount(prev => prev + 1);
                    
                    // Enhanced retry with exponential backoff
                    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                    setTimeout(() => {
                      const iframe = document.querySelector('#video-iframe') as HTMLIFrameElement;
                      if (iframe) {
                        // Refresh the iframe with cache busting
                        const timestamp = Date.now();
                        const originalSrc = iframe.src;
                        const cacheBuster = originalSrc.includes('?') ? `&_t=${timestamp}` : `?_t=${timestamp}`;
                        iframe.src = originalSrc + cacheBuster;
                        console.log('VideoPlayer: Retrying connection with cache bust:', iframe.src);
                      }
                      setIsLoading(false);
                    }, retryDelay);
                  }} 
                  variant="outline" 
                  className="text-white border-white mr-2"
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3 ? 'Max retries reached' : 'Retry'}
                </Button>
                <Button onClick={onClose} variant="outline" className="text-white border-white">
                  Close
                </Button>
              </div>
            </div>
          )}
          
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ 
              __html: modifiedIframe.replace('<iframe', `<iframe id="video-iframe" onload="console.log('Mega.nz iframe loaded successfully'); document.dispatchEvent(new CustomEvent('iframe-loaded'));" onerror="console.error('Mega.nz iframe failed to load'); document.dispatchEvent(new CustomEvent('iframe-error'));"`)
            }}
          />
        </div>
      );
    }

    // Otherwise, render as iframe with src
    console.log('VideoPlayer: Processing direct URL:', videoSrc);
    return (
      <div className="w-full h-full relative bg-black">
        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="text-center text-white">
               <p className="text-xl mb-4">Video failed to load</p>
               <p className="text-sm text-gray-400 mb-4">This may be due to the video being played on another device</p>
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
            setHasError(false);
          }}
          onError={(e) => {
            console.error('VideoPlayer: Direct iframe failed to load (possibly due to multi-device access):', e);
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
