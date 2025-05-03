import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "react-youtube";

import { usePlaylist, type PlaylistItem } from "@/contexts/PlaylistContext";

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
  const onError = (event: YouTubeEvent) => {
    console.error("YouTube player error occurred", event);
    // Only call playNext if there is a current item
    if (currentItem) {
      console.log("Moving to next video due to error");
      playNext();
    }
  };

  // Track previous currentItem to detect changes
  const prevItemRef = useRef<PlaylistItem | null>(null);

  // Reset player when current item changes to null
  useEffect(() => {
    // Only take action if we're transitioning from having an item to not having one
    const hadItemBefore = prevItemRef.current !== null;
    const hasItemNow = currentItem !== null;

    // Update our ref to track the current state
    prevItemRef.current = currentItem;

    // Only stop video if we had an item before but don't have one now
    if (hadItemBefore && !hasItemNow && playerRef.current) {
      try {
        console.log("Stopping video because we transitioned from having an item to not having one");
        // Check if player is in a state where stopVideo can be called
        const playerState = playerRef.current.getPlayerState?.();
        // Only call stopVideo if player is in a valid state (not -1 which is unstarted)
        if (playerState !== undefined && playerState !== -1) {
          playerRef.current.stopVideo();
        }
      } catch (error) {
        console.error("Error stopping video:", error);
      }
    }
  }, [currentItem]);

  if (!currentItem) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className} relative`} style={{ paddingBottom: "56.2%" }}>
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
