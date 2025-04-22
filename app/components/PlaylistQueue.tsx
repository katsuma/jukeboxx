import { usePlaylist, type PlaylistItem } from "../contexts/PlaylistContext";
import { FaPlus, FaTimes } from "react-icons/fa";

interface PlaylistQueueProps {
  className?: string;
}

export function PlaylistQueue({ className = "" }: PlaylistQueueProps) {
  const { queue, recentHistory, removeFromQueue, addToQueue, currentItem, showAllHistory, toggleShowAllHistory } = usePlaylist();

  // Function to format timestamp - only handles number format, ignores legacy formats
  const formatDate = (timestamp: any) => {
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

  // Function to re-add history item to queue
  const reAddToQueue = (item: PlaylistItem) => {
    addToQueue(item.url);
  };

  // Function to render queue item
  const renderQueueItem = (item: PlaylistItem, index: number, isHistory = false) => {
    // Use thumbnail URL
    const thumbnailUrl = item.thumbnail;
    // Create YouTube video URL
    const youtubeUrl = `https://www.youtube.com/watch?v=${item.videoId}`;

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
        {isHistory ? (
          <button
            onClick={() => reAddToQueue(item)}
            className="ml-2 p-1 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
            aria-label="Add to queue again"
          >
            <FaPlus className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => removeFromQueue(item.id)}
            className="ml-2 p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            aria-label="Remove from queue"
          >
            <FaTimes className="h-5 w-5" />
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Recently Played</h3>
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={showAllHistory}
                onChange={toggleShowAllHistory}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show all history
            </label>
          </div>
          <div className="space-y-2">
            {/* recentHistory is already sorted in PlaylistContext */}
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
