import React from "react";
import { usePlaylist, type PlaylistItem } from "../contexts/PlaylistContext";

interface PlaylistQueueProps {
  className?: string;
}

export function PlaylistQueue({ className = "" }: PlaylistQueueProps) {
  const { queue, recentHistory, removeFromQueue, currentItem } = usePlaylist();

  // Function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Function to render queue item
  const renderQueueItem = (item: PlaylistItem, index: number, isHistory = false) => {
    // Use thumbnail URL
    const thumbnailUrl = item.thumbnail;

    return (
      <div
        key={item.id}
        className={`flex items-center p-2 rounded-lg ${
          isHistory
            ? "bg-gray-100 dark:bg-gray-800"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="flex-shrink-0 w-16 h-12 mr-3">
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            {isHistory ? "Played: " : `${index + 1}. `}
            {item.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(item.addedAt)}
          </p>
        </div>
        {!isHistory && (
          <button
            onClick={() => removeFromQueue(item.id)}
            className="ml-2 p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            aria-label="Remove from queue"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Now Playing */}
      {currentItem && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
            {renderQueueItem(currentItem, 0)}
          </div>
        </div>
      )}

      {/* Recently Played */}
      {recentHistory.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Recently Played</h3>
          <div className="space-y-2">
            {recentHistory.map((item) => renderQueueItem(item, 0, true))}
          </div>
        </div>
      )}

      {/* Queue */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Play Queue</h3>
        {queue.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 p-2">
            No videos in queue
          </p>
        ) : (
          <div className="space-y-2">
            {queue.map((item, index) => renderQueueItem(item, index))}
          </div>
        )}
      </div>
    </div>
  );
}
