import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

import { firebaseDB } from "@/utils/firebase";
import { extractYouTubeVideoId } from "@/utils/youtube";
import { fetchYouTubeVideoInfo } from "@/utils/youtube-api";

export interface PlaylistItem {
  id: string;
  url: string;
  videoId: string;
  title: string;
  thumbnail: string;
  addedAt: number; // Timestamp in milliseconds
}

interface PlaylistContextType {
  playQueue: PlaylistItem[];
  addToPlayQueue: (_url: string) => void;
  removeFromPlayQueue: (_id: string) => void;
  clearPlayQueue: () => void;

  currentItem: PlaylistItem | null;
  playNext: () => void;
  updateCurrentItemInfo: (_title: string) => void;

  playedQueue: PlaylistItem[];
  removeFromPlayedQueue: (_id: string) => void;
  moveFromPlayedToPlayQueue: (_id: string) => void;

  queueId: string;
  queueName: string;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children, queueId }: { children: ReactNode, queueId: string }) {
  const [queueName, setQueueName] = useState<string>("");
  const [playQueue, setPlayQueue] = useState<PlaylistItem[]>([]);
  const [currentItem, setCurrentItem] = useState<PlaylistItem | null>(null);
  const [playedQueue, setPlayedQueue] = useState<PlaylistItem[]>([]);

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
        setPlayQueue(items);
      });

      const unsubscribeCurrent = firebaseDB.onCurrentItemChanged(queueId, (item) => {
        setCurrentItem(item);
      });

      const unsubscribeHistory = firebaseDB.onHistoryChanged(queueId, (items) => {
        setPlayedQueue(items);
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

  const addToPlayQueue = async (url: string) => {
    console.log('Adding to play queue:', url);
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
          setPlayQueue((prev: PlaylistItem[]) => [...prev, updatedItem]);
        }
      } else {
        console.log('Adding to local play queue:', updatedItem.title);
        setPlayQueue((prev: PlaylistItem[]) => [...prev, updatedItem]);
      }
    } catch (error) {
      console.error('Failed to fetch video information:', error);

      if (firebaseDB.isInitialized()) {
        try {
          console.log(`Adding default item to Firebase queue ${queueId}`);
          await firebaseDB.addToQueue(queueId, tempItem);
        } catch (firebaseError) {
          console.error('Firebase addToQueue failed, falling back to local state:', firebaseError);
          setPlayQueue((prev: PlaylistItem[]) => [...prev, tempItem]);
        }
      } else {
        console.log('Adding default item to local play queue');
        setPlayQueue((prev: PlaylistItem[]) => [...prev, tempItem]);
      }
    }
  };

  const removeFromPlayQueue = (id: string) => {
    if (firebaseDB.isInitialized()) {
      try {
        console.log(`Removing from Firebase queue ${queueId}:`, id);
        firebaseDB.removeFromQueue(queueId, id).catch(error => {
          console.error('Firebase removeFromQueue failed, falling back to local state:', error);
          setPlayQueue((prev: PlaylistItem[]) => prev.filter((item) => item.id !== id));
        });
      } catch (error) {
        console.error('Error removing from play queue:', error);
        setPlayQueue((prev: PlaylistItem[]) => prev.filter((item) => item.id !== id));
      }
    } else {
      console.log('Removing from local play queue:', id);
      setPlayQueue((prev: PlaylistItem[]) => prev.filter((item) => item.id !== id));
    }
  };

  const clearPlayQueue = () => {
    if (firebaseDB.isInitialized()) {
      try {
        console.log(`Clearing Firebase queue ${queueId}`);
        firebaseDB.clearQueue(queueId).catch(error => {
          console.error('Firebase clearQueue failed, falling back to local state:', error);
          setPlayQueue([]);
        });
      } catch (error) {
        console.error('Error clearing play queue:', error);
        setPlayQueue([]);
      }
    } else {
      console.log('Clearing local play queue');
      setPlayQueue([]);
    }
  };

  const playNext = useCallback(() => {
    if (currentItem) {
      const playedItem = {
        ...currentItem,
        addedAt: Date.now() // Current timestamp in milliseconds
      };

      if (firebaseDB.isInitialized()) {
        try {
          firebaseDB.addToHistory(queueId, playedItem).catch(error => {
            console.error('Firebase addToHistory failed, falling back to local state:', error);
            setPlayedQueue((prev: PlaylistItem[]) => [playedItem, ...prev]);
          });
        } catch (error) {
          console.error('Error adding to played queue:', error);
          setPlayedQueue((prev: PlaylistItem[]) => [playedItem, ...prev]);
        }
      } else {
        console.log('Adding current item to local played queue:', playedItem.title);
        setPlayedQueue((prev: PlaylistItem[]) => [playedItem, ...prev]);
      }

      const currentItemInQueue = playQueue.find(item => item.videoId === currentItem.videoId);
      if (currentItemInQueue) {
        if (firebaseDB.isInitialized()) {
          try {
            console.log(`Removing from Firebase queue ${queueId}:`, currentItemInQueue.id);
            setPlayQueue((prev: PlaylistItem[]) => prev.filter((item) => item.videoId !== currentItem.videoId));

            firebaseDB.removeFromQueue(queueId, currentItemInQueue.id).catch(error => {
              console.error('Firebase removeFromQueue failed:', error);
            });
          } catch (error) {
            console.error('Error removing from play queue:', error);
            setPlayQueue((prev: PlaylistItem[]) => prev.filter((item) => item.videoId !== currentItem.videoId));
          }
        } else {
          console.log('Removing from local play queue:', currentItemInQueue.id);
          setPlayQueue((prev: PlaylistItem[]) => prev.filter((item) => item.videoId !== currentItem.videoId));
        }
      }
    }

    const updatedPlayQueue = playQueue.filter(item => item.videoId !== currentItem?.videoId);
    console.log('更新後のPlay Queue:', updatedPlayQueue.map(item => item.title));

    if (updatedPlayQueue.length > 0) {
      const nextItem = updatedPlayQueue[0];
      console.log('Next item:', nextItem.title);

      if (firebaseDB.isInitialized()) {
        try {
          console.log(`Updating current item in Firebase for queue ${queueId}:`, nextItem.title);
          setCurrentItem(nextItem);

          firebaseDB.updateCurrentItem(queueId, nextItem)
            .then(() => {
              console.log('Firebase updateCurrentItem成功:', nextItem.title);
            })
            .catch(error => {
              console.error('Firebase updateCurrentItem failed:', error);
            });
        } catch (error) {
          console.error('Error updating current item:', error);
          setCurrentItem(nextItem);
        }
      } else {
        setCurrentItem(nextItem);
      }

      console.log('Play Queue（after played）:', updatedPlayQueue.map(item => item.title));
    } else {
      console.log('No items in play queue, setting current item to null');
      if (firebaseDB.isInitialized()) {
        try {
          setCurrentItem(null);

          firebaseDB.updateCurrentItem(queueId, null)
            .then(() => {
              console.log('Firebase updateCurrentItem(null) success');
            })
            .catch(error => {
              console.error('Firebase updateCurrentItem(null) failed:', error);
            });
        } catch (error) {
          console.error('Error setting current item to null:', error);
          setCurrentItem(null);
        }
      } else {
        setCurrentItem(null);
      }
    }
  }, [currentItem, playQueue, queueId]);

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
    if (playQueue.length > 0 && !currentItem) {
      playNext();
    }
  }, [playQueue, currentItem, playNext]);

  const removeFromPlayedQueue = (id: string) => {
    if (firebaseDB.isInitialized()) {
      try {
        console.log(`Removing from Firebase history for queue ${queueId}:`, id);
        firebaseDB.removeFromHistory(queueId, id).catch(error => {
          console.error('Firebase removeFromHistory failed, falling back to local state:', error);
          setPlayedQueue((prev: PlaylistItem[]) => prev.filter((item) => item.id !== id));
        });
      } catch (error) {
        console.error('Error removing from played queue:', error);
        setPlayedQueue((prev: PlaylistItem[]) => prev.filter((item) => item.id !== id));
      }
    } else {
      console.log('Removing from local played queue:', id);
      setPlayedQueue((prev: PlaylistItem[]) => prev.filter((item) => item.id !== id));
    }
  };

  const moveFromPlayedToPlayQueue = (id: string) => {
    const item = playedQueue.find(item => item.id === id);
    if (!item) return;

    addToPlayQueue(item.url);
    removeFromPlayedQueue(id);
  };

  const value = {
    playQueue,
    addToPlayQueue,
    removeFromPlayQueue,
    clearPlayQueue,
    currentItem,
    playNext,
    updateCurrentItemInfo,
    playedQueue,
    removeFromPlayedQueue,
    moveFromPlayedToPlayQueue,
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
