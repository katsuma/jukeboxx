import { FaPlus, FaTimes } from "react-icons/fa";

import { usePlaylist, type PlaylistItem } from "@/contexts/PlaylistContext";

interface PlaylistQueueProps {
  className?: string;
}

export function PlaylistQueue({ className = "" }: PlaylistQueueProps) {
  const {
    playQueue,
    playedQueue,
    removeFromPlayQueue,
    removeFromPlayedQueue,
    moveFromPlayedToPlayQueue,
    currentItem
  } = usePlaylist();

  // Function to format timestamp - only handles number format, ignores legacy formats
  const formatDate = (timestamp: number | unknown) => {
    // Only process if it's a number (milliseconds timestamp)
    if (typeof timestamp === 'number') {
      try {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat("en-US", {
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }).format(date);
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Date error";
      }
    }

    // For all other formats, return Unknown date
    return "Unknown date";
  };

  // Played QueueからPlay Queueに再追加する
  const reAddToPlayQueue = (item: PlaylistItem) => {
    // Play Queueに追加し、Played Queueから削除する
    moveFromPlayedToPlayQueue(item.id);
  };

  // Played Queueから削除し、Play Queueからも同じビデオIDを持つアイテムを削除する
  const removePlayedAndQueueItems = (playedItem: PlaylistItem) => {
    // Played Queueから削除
    removeFromPlayedQueue(playedItem.id);

    // Play Queueから同じビデオIDを持つアイテムを検索して削除
    // ただし、現在再生中のアイテムは削除しない
    const videoId = playedItem.videoId;
    playQueue.forEach((queueItem: PlaylistItem) => {
      if (queueItem.videoId === videoId && queueItem.id !== currentItem?.id) {
        removeFromPlayQueue(queueItem.id);
      }
    });
  };

  // Function to render queue item
  const renderQueueItem = (item: PlaylistItem, index: number, isPlayed = false) => {
    // Use thumbnail URL
    const thumbnailUrl = item.thumbnail;
    // Create YouTube video URL
    const youtubeUrl = `https://www.youtube.com/watch?v=${item.videoId}`;

    return (
      <div
        key={item.id}
        className={`flex items-center p-2 rounded-lg ${
          isPlayed
            ? "bg-gray-100 dark:bg-gray-800"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="flex-shrink-0 w-16 h-12 mr-3">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full transition-opacity hover:opacity-80"
          >
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover rounded"
            />
          </a>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-300 transition-all border-b border-transparent hover:border-gray-500 dark:hover:border-gray-300"
            >
              {item.title}
            </a>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(item.addedAt)}
          </p>
        </div>
        <div className="flex">
          {isPlayed && (
            <button
              onClick={() => reAddToPlayQueue(item)}
              className="ml-2 p-1 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
              aria-label="Add to queue again"
            >
              <FaPlus className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => isPlayed ? removePlayedAndQueueItems(item) : removeFromPlayQueue(item.id)}
            className="ml-2 p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            aria-label="Remove from queue"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Now Playing */}
      {currentItem && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            {renderQueueItem(currentItem, 0)}
          </div>
        </div>
      )}

      {/* Play Queue */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Play Queue</h3>
        {/* 現在再生中のアイテムを除外したPlay Queue */}
        {playQueue.filter(item => item.id !== currentItem?.id).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 p-2">
            No videos in play queue
          </p>
        ) : (
          <div className="space-y-2">
            {playQueue
              .filter(item => item.id !== currentItem?.id)
              .map((item, index) => renderQueueItem(item, index))}
          </div>
        )}
      </div>

      {/* Played Queue */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Played Queue</h3>
        {playedQueue.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 p-2">
            No played videos
          </p>
        ) : (
          <div className="space-y-2">
            {playedQueue.map((item, index) =>
              renderQueueItem(item, index, true)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
