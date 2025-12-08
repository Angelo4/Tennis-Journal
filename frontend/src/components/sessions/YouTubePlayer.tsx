"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface YouTubePlayerProps {
  videoUrl: string;
  className?: string;
}

export interface YouTubePlayerHandle {
  getCurrentTime: () => Promise<number>;
  seekTo: (seconds: number) => void;
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  // youtube.com/watch?v=VIDEO_ID
  const watchRegex = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
  const watchMatch = url.match(watchRegex);
  if (watchMatch) return watchMatch[1];

  // youtu.be/VIDEO_ID
  const shortRegex = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const shortMatch = url.match(shortRegex);
  if (shortMatch) return shortMatch[1];

  return null;
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoUrl, className = "" }, ref) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoId = extractVideoId(videoUrl);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      getCurrentTime: async (): Promise<number> => {
        if (!playerRef.current) return 0;
        return new Promise((resolve) => {
          if (playerRef.current?.getCurrentTime) {
            resolve(playerRef.current.getCurrentTime());
          } else {
            resolve(0);
          }
        });
      },
      seekTo: (seconds: number) => {
        if (playerRef.current?.seekTo) {
          playerRef.current.seekTo(seconds, true);
        }
      },
    }));

    useEffect(() => {
      if (!videoId) return;

      // Load YouTube IFrame API
      const loadYouTubeAPI = () => {
        if ((window as any).YT && (window as any).YT.Player) {
          initializePlayer();
          return;
        }

        // Create script tag if not already loaded
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName("script")[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        // Set callback for when API is ready
        (window as any).onYouTubeIframeAPIReady = initializePlayer;
      };

      const initializePlayer = () => {
        if (!containerRef.current || playerRef.current) return;

        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            rel: 0, // Don't show related videos from other channels
            modestbranding: 1, // Minimal YouTube branding
          },
          events: {
            onReady: () => {
              // Player is ready
            },
          },
        });
      };

      loadYouTubeAPI();

      return () => {
        if (playerRef.current?.destroy) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }, [videoId]);

    if (!videoId) {
      return (
        <div className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}>
          <p className="text-gray-500">Invalid YouTube URL</p>
        </div>
      );
    }

    return (
      <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }
);

YouTubePlayer.displayName = "YouTubePlayer";
