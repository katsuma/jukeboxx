import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';
import type { PlaylistItem } from '../contexts/PlaylistContext';

// 環境変数が設定されているか確認
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

// Firebase設定
let app: any;
let database: any;
let queueRef: any;
let currentItemRef: any;
let historyRef: any;
let isFirebaseInitialized = false;

// 環境変数が設定されている場合のみFirebaseを初期化
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

    // Firebaseの初期化
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);

    // データベースの参照を作成
    queueRef = ref(database, 'queue');
    currentItemRef = ref(database, 'currentItem');
    historyRef = ref(database, 'history');

    isFirebaseInitialized = true;
    console.log('Firebase initialized successfully with config:', {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      databaseURL: firebaseConfig.databaseURL,
      projectId: firebaseConfig.projectId
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // エラーの詳細を表示
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
} else {
  console.warn('Firebase is not initialized due to missing environment variables. Using local state only.');
}

// ダミーの関数（Firebaseが初期化されていない場合に使用）
const dummyUnsubscribe = () => {};

// キューの操作関数
export const firebaseDB = {
  // キューを監視する関数
  onQueueChanged: (callback: (items: PlaylistItem[]) => void) => {
    if (!isFirebaseInitialized) {
      callback([]);
      return dummyUnsubscribe;
    }

    return onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      const items: PlaylistItem[] = data ? Object.values(data) : [];
      console.log('Queue updated from Firebase:', items.length, 'items');
      callback(items);
    });
  },

  // 現在再生中のアイテムを監視する関数
  onCurrentItemChanged: (callback: (item: PlaylistItem | null) => void) => {
    if (!isFirebaseInitialized) {
      callback(null);
      return dummyUnsubscribe;
    }

    return onValue(currentItemRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Current item updated from Firebase:', data?.title || 'none');
      callback(data || null);
    });
  },

  // 履歴を監視する関数
  onHistoryChanged: (callback: (items: PlaylistItem[]) => void) => {
    if (!isFirebaseInitialized) {
      callback([]);
      return dummyUnsubscribe;
    }

    return onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      const items: PlaylistItem[] = data ? Object.values(data) : [];
      console.log('History updated from Firebase:', items.length, 'items');
      callback(items);
    });
  },

  // キューにアイテムを追加する関数
  addToQueue: async (item: PlaylistItem) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot add to queue.');
      return;
    }

    try {
      console.log('Adding to Firebase queue:', item.title);
      await push(queueRef, item);
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  },

  // キューからアイテムを削除する関数
  removeFromQueue: async (id: string) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot remove from queue.');
      return;
    }

    try {
      console.log('Removing from Firebase queue:', id);
      // 一度だけデータを取得
      return new Promise<void>((resolve) => {
        onValue(queueRef, (snapshot) => {
          const data = snapshot.val();

          if (data) {
            // idに一致するキーを探す
            Object.entries(data).forEach(([key, value]) => {
              if ((value as PlaylistItem).id === id) {
                remove(ref(database, `queue/${key}`));
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

  // 現在再生中のアイテムを更新する関数
  updateCurrentItem: async (item: PlaylistItem | null) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot update current item.');
      return;
    }

    try {
      console.log('Updating current item in Firebase:', item?.title || 'null');
      await set(currentItemRef, item);
    } catch (error) {
      console.error('Error updating current item:', error);
      throw error;
    }
  },

  // 履歴にアイテムを追加する関数
  addToHistory: async (item: PlaylistItem) => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot add to history.');
      return;
    }

    try {
      console.log('Adding to Firebase history:', item.title);
      // 履歴の先頭に追加
      return new Promise<void>((resolve) => {
        onValue(historyRef, (snapshot) => {
          const data = snapshot.val() || {};

          // 新しいオブジェクトを作成（最大10件まで保持）
          const newData = { [item.id]: item, ...data };
          const keys = Object.keys(newData);

          // 10件を超える場合は古いものを削除
          if (keys.length > 10) {
            const keysToRemove = keys.slice(10);
            keysToRemove.forEach(key => {
              delete newData[key];
            });
          }

          set(historyRef, newData).then(() => resolve());
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Error adding to history:', error);
      throw error;
    }
  },

  // キューをクリアする関数
  clearQueue: async () => {
    if (!isFirebaseInitialized) {
      console.warn('Firebase not initialized. Cannot clear queue.');
      return;
    }

    try {
      console.log('Clearing Firebase queue');
      await set(queueRef, null);
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  },

  // Firebaseが初期化されているかどうか
  isInitialized: () => isFirebaseInitialized
};
