import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

import { firebaseDB } from "../utils/firebase";
import { extractYouTubeVideoId } from "../utils/youtube";
import { fetchYouTubeVideoInfo } from "../utils/youtube-api";

export interface PlaylistItem {
  id: string;
  url: string;
  videoId: string;
  title: string;
  thumbnail: string;
  addedAt: number; // Timestamp in milliseconds
}

interface PlaylistContextType {
  queue: PlaylistItem[];
  addToQueue: (_url: string) => void;
  removeFromQueue: (_id: string) => void;
  clearQueue: () => void;

  currentItem: PlaylistItem | null;
  playNext: () => void;
  updateCurrentItemInfo: (_title: string) => void;

  history: PlaylistItem[];
  recentHistory: PlaylistItem[];
  showAllHistory: boolean;
  toggleShowAllHistory: () => void;

  queueId: string;
  queueName: string;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children, queueId }: { children: ReactNode, queueId: string }) {
  const [queueName, setQueueName] = useState<string>("");
  const [queue, setQueue] = useState<PlaylistItem[]>([]);
  const [currentItem, setCurrentItem] = useState<PlaylistItem | null>(null);
  const [history, setHistory] = useState<PlaylistItem[]>([]);
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);

  // Sort history by addedAt (newest first), handling both number and legacy formats
  const sortedHistory = [...history].sort((a, b) => {
    // Only compare if both are numbers
    if (typeof a.addedAt === 'number' && typeof b.addedAt === 'number') {
      return b.addedAt - a.addedAt;
    }
    // If only one is a number, prioritize the number (newer format)
    if (typeof a.addedAt === 'number') return -1;
    if (typeof b.addedAt === 'number') return 1;
    // If neither is a number, don't change order
    return 0;
  });

  // Get all or just the first 3 items based on showAllHistory
  const recentHistory = showAllHistory ? sortedHistory : sortedHistory.slice(0, 3);

  // Fetch queue metadata when queueId changes
  useEffect(() => {
    const fetchQueueMetadata = async () => {
      if (!firebaseDB.isInitialized()) {
        console.log('Firebase is not initialized. Using local state only.');
        return;
      }

      try {
        const metadata = await firebaseDB.getQueueMetadata(queueId);
        if (metadata) {
          setQueueName(metadata.name);
        } else {
          console.warn(`No metadata found for queue ${queueId}`);
          setQueueName("Unnamed Queue");
        }
      } catch (error) {
        console.error('Error fetching queue metadata:', error);
        setQueueName("Unnamed Queue");
      }
    };

    fetchQueueMetadata();
  }, [queueId]);

  useEffect(() => {
    if (!firebaseDB.isInitialized()) {
      console.log('Firebase is not initialized. Using local state only.');
      return;
    }

    console.log(`Setting up Firebase listeners for queue ${queueId}...`);

    try {
      const unsubscribeQueue = firebaseDB.onQueueChanged(queueId, (items) => {
        setQueue(items);
      });

      const unsubscribeCurrent = firebaseDB.onCurrentItemChanged(queueId, (item) => {
        setCurrentItem(item);
      });

      const unsubscribeHistory = firebaseDB.onHistoryChanged(queueId, (items) => {
        setHistory(items);
      });

      return () => {
        console.log(`Cleaning up Firebase listeners for queue ${queueId}`);
        unsubscribeQueue();
        unsubscribeCurrent();
        unsubscribeHistory();
      };
    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      console.log('Falling back to local state management');
      return () => {};
    }
  }, [queueId]);

  const addToQueue = async (url: string) => {
    console.log('Adding to queue:', url);
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      console.error('Invalid YouTube URL, could not extract video ID:', url);
      return;
    }

    console.log('Extracted video ID:', videoId);

    const tempItem: PlaylistItem = {
      id: crypto.randomUUID(),
      url,
      videoId,
      title: `Loading video... (${videoId})`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      addedAt: Date.now(), // Current timestamp in milliseconds
    };

    try {
      console.log('Fetching video info for:', videoId);
      const videoInfo = await fetchYouTubeVideoInfo(videoId);
      console.log('Video info received:', videoInfo);

      const updatedItem = {
        ...tempItem,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail
      };

      if (firebaseDB.isInitialized()) {
        try {
          console.log(`Adding to Firebase queue ${queueId}:`, updatedItem.title);
          await firebaseDB.addToQueue(queueId, updatedItem);
        } catch (error) {
          console.error('Firebase addToQueue failed, falling back to local state:', error);
          setQueue((prev) => [...prev, updatedItem]);
        }
      } else {
        console.log('Adding to local queue:', updatedItem.title);
        setQueue((prev) => [...prev, updatedItem]);
      }
    } catch (error) {
      console.error('Failed to fetch video information:', error);

      if (firebaseDB.isInitialized()) {
        try {
          console.log(`Adding default item to Firebase queue ${queueId}`);
          await firebaseDB.addToQueue(queueId, tempItem);
        } catch (firebaseError) {
          console.error('Firebase addToQueue failed, falling back to local state:', firebaseError);
          setQueue((prev) => [...prev, tempItem]);
        }
      } else {
        console.log('Adding default item to local queue');
        setQueue((prev) => [...prev, tempItem]);
      }
    }
  };

  const removeFromQueue = (id: string) => {
    if (firebaseDB.isInitialized()) {
      try {
        console.log(`Removing from Firebase queue ${queueId}:`, id);
        firebaseDB.removeFromQueue(queueId, id).catch(error => {
          console.error('Firebase removeFromQueue failed, falling back to local state:', error);
          setQueue((prev) => prev.filter((item) => item.id !== id));
        });
      } catch (error) {
        console.error('Error removing from queue:', error);
        setQueue((prev) => prev.filter((item) => item.id !== id));
      }
    } else {
      console.log('Removing from local queue:', id);
      setQueue((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const clearQueue = () => {
    if (firebaseDB.isInitialized()) {
      try {
        console.log(`Clearing Firebase queue ${queueId}`);
        firebaseDB.clearQueue(queueId).catch(error => {
          console.error('Firebase clearQueue failed, falling back to local state:', error);
          setQueue([]);
        });
      } catch (error) {
        console.error('Error clearing queue:', error);
        setQueue([]);
      }
    } else {
      console.log('Clearing local queue');
      setQueue([]);
    }
  };

  const playNext = useCallback(() => {
    console.log('Playing next song');

    if (currentItem) {
      // Create a copy of currentItem with updated addedAt timestamp for history
      const historyItem = {
        ...currentItem,
        addedAt: Date.now() // Current timestamp in milliseconds
      };

      if (firebaseDB.isInitialized()) {
        try {
          console.log(`Adding current item to Firebase history for queue ${queueId}:`, historyItem.title);
          firebaseDB.addToHistory(queueId, historyItem).catch(error => {
            console.error('Firebase addToHistory failed, falling back to local state:', error);
            setHistory((prev) => [historyItem, ...prev]);
          });
        } catch (error) {
          console.error('Error adding to history:', error);
          setHistory((prev) => [historyItem, ...prev]);
        }
      } else {
        console.log('Adding current item to local history:', historyItem.title);
        setHistory((prev) => [historyItem, ...prev]);
      }
    }

    if (queue.length > 0) {
      const nextItem = queue[0];
      console.log('Next item from queue:', nextItem.title);

      if (firebaseDB.isInitialized()) {
        try {
          console.log(`Updating current item in Firebase for queue ${queueId}:`, nextItem.title);
          firebaseDB.updateCurrentItem(queueId, nextItem).catch(error => {
            console.error('Firebase updateCurrentItem failed, falling back to local state:', error);
            setCurrentItem(nextItem);
          });

          console.log(`Removing item from Firebase queue ${queueId}:`, nextItem.id);
          firebaseDB.removeFromQueue(queueId, nextItem.id).catch(error => {
            console.error('Firebase removeFromQueue failed, falling back to local state:', error);
            setQueue((prev) => prev.slice(1));
          });
        } catch (error) {
          console.error('Error updating current item:', error);
          setCurrentItem(nextItem);
          setQueue((prev) => prev.slice(1));
        }
      } else {
        console.log('Updating local current item and removing from queue');
        setCurrentItem(nextItem);
        setQueue((prev) => prev.slice(1));
      }
    } else {
      console.log('No items in queue, setting current item to null');
      if (firebaseDB.isInitialized()) {
        try {
          firebaseDB.updateCurrentItem(queueId, null).catch(error => {
            console.error('Firebase updateCurrentItem(null) failed, falling back to local state:', error);
            setCurrentItem(null);
          });
        } catch (error) {
          console.error('Error setting current item to null:', error);
          setCurrentItem(null);
        }
      } else {
        setCurrentItem(null);
      }
    }
  }, [currentItem, queue, queueId, setCurrentItem, setQueue, setHistory]);

  const updateCurrentItemInfo = (title: string) => {
    if (currentItem) {
      console.log('Updating current item info:', title);
      const updatedItem = {
        ...currentItem,
        title: title || currentItem.title,
      };

      if (firebaseDB.isInitialized()) {
        try {
          console.log(`Updating current item in Firebase for queue ${queueId} with new title`);
          firebaseDB.updateCurrentItem(queueId, updatedItem).catch(error => {
            console.error('Firebase updateCurrentItem failed, falling back to local state:', error);
            setCurrentItem(updatedItem);
          });
        } catch (error) {
          console.error('Error updating current item info:', error);
          setCurrentItem(updatedItem);
        }
      } else {
        console.log('Updating local current item with new title');
        setCurrentItem(updatedItem);
      }
    }
  };

  useEffect(() => {
    if (queue.length > 0 && !currentItem) {
      playNext();
    }
  }, [queue, currentItem, playNext]);

  const toggleShowAllHistory = () => {
    setShowAllHistory(prev => !prev);
  };

  const value = {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    currentItem,
    playNext,
    updateCurrentItemInfo,
    history,
    recentHistory,
    showAllHistory,
    toggleShowAllHistory,
    queueId,
    queueName
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
