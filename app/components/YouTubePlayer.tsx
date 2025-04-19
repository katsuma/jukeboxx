import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "react-youtube";
import { usePlaylist } from "../contexts/PlaylistContext";

// Type definition for retrieving video data from YouTube player
interface YouTubePlayerData {
  title?: string;
  author?: string;
  videoId?: string;
}

interface YouTubePlayerProps {
  className?: string;
}

export function YouTubePlayer({ className = "" }: YouTubePlayerProps) {
  const { currentItem, playNext, updateCurrentItemInfo } = usePlaylist();
  const playerRef = useRef<YTPlayer | null>(null);

  // YouTube player options
  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  // When player is ready
  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;

    // Get and update video information
    if (currentItem) {
      try {
        // Get video title from YouTube player
        const videoData = event.target.getVideoData() as YouTubePlayerData;
        if (videoData && videoData.title) {
          // Update title if available
          updateCurrentItemInfo(videoData.title);
        }
      } catch (error) {
        console.error('Failed to get video information:', error);
      }
    }
  };

  // When video playback ends
  const onEnd = () => {
    playNext();
  };

  // When an error occurs
  const onError = () => {
    console.error("YouTube player error occurred");
    playNext(); // Move to next video even if an error occurs
  };

  // Reset player when current item changes
  useEffect(() => {
    if (playerRef.current && !currentItem) {
      playerRef.current.stopVideo();
    }
  }, [currentItem]);

  if (!currentItem) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className} relative`} style={{ paddingBottom: "75%" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Please add videos to the queue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`} style={{ paddingBottom: "56.2%" }}>
      <div className="absolute inset-0">
        <YouTube
          videoId={currentItem.videoId}
          opts={opts}
          onReady={onReady}
          onEnd={onEnd}
          onError={onError}
          className="rounded-lg overflow-hidden w-full h-full"
        />
      </div>
    </div>
  );
}
