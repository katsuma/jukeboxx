import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { Database } from 'firebase/database';
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';

import type { PlaylistItem } from '../contexts/PlaylistContext';

const checkEnvVars = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID'
  ];

  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  return true;
};

let app: FirebaseApp | null = null;
let database: Database | null = null;
let isFirebaseInitialized = false;

if (checkEnvVars()) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };

    app = initializeApp(firebaseConfig);
    database = getDatabase(app);

    isFirebaseInitialized = true;
    console.log('Firebase initialized successfully with config:', {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      databaseURL: firebaseConfig.databaseURL,
      projectId: firebaseConfig.projectId
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
} else {
  console.warn('Firebase is not initialized due to missing environment variables. Using local state only.');
}

// Helper function to get references for a specific queue
const getQueueRefs = (queueId: string) => {
  if (!isFirebaseInitialized || !database) {
    return null;
  }

  return {
    queueRef: ref(database, `queues/${queueId}/queue`),
    currentItemRef: ref(database, `queues/${queueId}/currentItem`),
    historyRef: ref(database, `queues/${queueId}/history`),
    metaRef: ref(database, `queues/${queueId}/meta`)
  };
};

const dummyUnsubscribe = () => {};

// Interface for queue metadata
export interface QueueMetadata {
  name: string;
  createdAt: Date;
}

export const firebaseDB = {
  // Create a new queue with the given name
  createQueue: async (name: string): Promise<string> => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot create queue.');
      return crypto.randomUUID();
    }

    try {
      const queueId = crypto.randomUUID();
      const refs = getQueueRefs(queueId);

      if (!refs) {
        throw new Error('Failed to get queue references');
      }

      const metadata: QueueMetadata = {
        name,
        createdAt: new Date()
      };

      await set(refs.metaRef, metadata);
      console.log('Created new queue:', queueId, 'with name:', name);

      return queueId;
    } catch (error) {
      console.error('Error creating queue:', error);
      throw error;
    }
  },

  // Get queue metadata
  getQueueMetadata: async (queueId: string): Promise<QueueMetadata | null> => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot get queue metadata.');
      return null;
    }

    try {
      const refs = getQueueRefs(queueId);

      if (!refs) {
        throw new Error('Failed to get queue references');
      }

      return new Promise<QueueMetadata | null>((resolve) => {
        onValue(refs.metaRef, (snapshot) => {
          const data = snapshot.val();
          resolve(data);
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Error getting queue metadata:', error);
      return null;
    }
  },

  onQueueChanged: (queueId: string, callback: (_items: PlaylistItem[]) => void) => {
    if (!isFirebaseInitialized) {
      callback([]);
      return dummyUnsubscribe;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      callback([]);
      return dummyUnsubscribe;
    }

    return onValue(refs.queueRef, (snapshot) => {
      const data = snapshot.val();
      const items: PlaylistItem[] = data ? Object.values(data) : [];
      console.log(`Queue ${queueId} updated from Firebase:`, items.length, 'items');
      callback(items);
    });
  },

  onCurrentItemChanged: (queueId: string, callback: (_item: PlaylistItem | null) => void) => {
    if (!isFirebaseInitialized) {
      callback(null);
      return dummyUnsubscribe;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      callback(null);
      return dummyUnsubscribe;
    }

    return onValue(refs.currentItemRef, (snapshot) => {
      const data = snapshot.val();
      console.log(`Current item for queue ${queueId} updated from Firebase:`, data?.title || 'none');
      callback(data || null);
    });
  },

  onHistoryChanged: (queueId: string, callback: (_items: PlaylistItem[]) => void) => {
    if (!isFirebaseInitialized) {
      callback([]);
      return dummyUnsubscribe;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      callback([]);
      return dummyUnsubscribe;
    }

    return onValue(refs.historyRef, (snapshot) => {
      const data = snapshot.val();
      const items: PlaylistItem[] = data ? Object.values(data) : [];
      console.log(`History for queue ${queueId} updated from Firebase:`, items.length, 'items');
      callback(items);
    });
  },

  addToQueue: async (queueId: string, item: PlaylistItem) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot add to queue.');
      return;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      throw new Error('Failed to get queue references');
    }

    try {
      console.log(`Adding to Firebase queue ${queueId}:`, item.title);

      // No need to convert addedAt as it's already a timestamp in milliseconds
      // Just use the item as is

      await push(refs.queueRef, item);
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  },

  removeFromQueue: async (queueId: string, id: string) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot remove from queue.');
      return;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      throw new Error('Failed to get queue references');
    }

    try {
      console.log(`Removing from Firebase queue ${queueId}:`, id);
      return new Promise<void>((resolve) => {
        onValue(refs.queueRef, (snapshot) => {
          const data = snapshot.val();

          if (data) {
            Object.entries(data).forEach(([key, value]) => {
              if ((value as PlaylistItem).id === id && database) {
                remove(ref(database, `queues/${queueId}/queue/${key}`));
              }
            });
          }
          resolve();
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Error removing from queue:', error);
      throw error;
    }
  },

  updateCurrentItem: async (queueId: string, item: PlaylistItem | null) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot update current item.');
      return;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      throw new Error('Failed to get queue references');
    }

    try {
      console.log(`Updating current item in Firebase queue ${queueId}:`, item?.title || 'null');

      // No need to convert addedAt as it's already a timestamp in milliseconds
      const itemToStore = item;

      await set(refs.currentItemRef, itemToStore);
    } catch (error) {
      console.error('Error updating current item:', error);
      throw error;
    }
  },

  addToHistory: async (queueId: string, item: PlaylistItem) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot add to history.');
      return;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      throw new Error('Failed to get queue references');
    }

    try {
      console.log(`Adding to Firebase history for queue ${queueId}:`, item.title);
      return new Promise<void>((resolve) => {
        onValue(refs.historyRef, (snapshot) => {
          const data = snapshot.val() || {};

          // No need to convert addedAt as it's already a timestamp in milliseconds
          const itemWithTimestamp = item;

          // Simply add the new item to history without removing old ones
          // This allows "Show all history" to display all items
          const newData = { [item.id]: itemWithTimestamp, ...data };

          set(refs.historyRef, newData).then(() => resolve());
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Error adding to history:', error);
      throw error;
    }
  },

  clearQueue: async (queueId: string) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot clear queue.');
      return;
    }

    const refs = getQueueRefs(queueId);

    if (!refs) {
      throw new Error('Failed to get queue references');
    }

    try {
      console.log(`Clearing Firebase queue ${queueId}`);
      await set(refs.queueRef, null);
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  },

  isInitialized: () => isFirebaseInitialized
};
