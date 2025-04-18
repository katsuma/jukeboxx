import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { extractYouTubeVideoId } from "../utils/youtube";
import { fetchYouTubeVideoInfo } from "../utils/youtube-api";

// プレイリストアイテムの型定義
export interface PlaylistItem {
  id: string;
  url: string;
  videoId: string;
  title: string;
  thumbnail: string;
  addedAt: Date;
}

// プレイリストコンテキストの型定義
interface PlaylistContextType {
  // キュー関連
  queue: PlaylistItem[];
  addToQueue: (url: string) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;

  // 現在再生中の曲
  currentItem: PlaylistItem | null;
  playNext: () => void;
  updateCurrentItemInfo: (title: string) => void;

  // 再生履歴
  history: PlaylistItem[];
  recentHistory: PlaylistItem[]; // 直近3曲
}

// コンテキストの作成
const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

// プロバイダーコンポーネント
export function PlaylistProvider({ children }: { children: ReactNode }) {
  // キュー
  const [queue, setQueue] = useState<PlaylistItem[]>([]);
  // 現在再生中の曲
  const [currentItem, setCurrentItem] = useState<PlaylistItem | null>(null);
  // 再生履歴
  const [history, setHistory] = useState<PlaylistItem[]>([]);

  // 直近の再生履歴（最大3曲）
  const recentHistory = history.slice(0, 3);

  // キューに曲を追加
  const addToQueue = async (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return;

    // 一時的なデフォルト値でアイテムを作成
    const tempItem: PlaylistItem = {
      id: crypto.randomUUID(),
      url,
      videoId,
      title: `動画を読み込み中... (${videoId})`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      addedAt: new Date(),
    };

    // キューに追加
    setQueue((prev) => [...prev, tempItem]);

    try {
      // 動画情報を非同期で取得
      const videoInfo = await fetchYouTubeVideoInfo(videoId);

      // 取得した情報で更新
      setQueue((prev) =>
        prev.map(item =>
          item.id === tempItem.id
            ? { ...item, title: videoInfo.title, thumbnail: videoInfo.thumbnail }
            : item
        )
      );
    } catch (error) {
      console.error('動画情報の取得に失敗しました:', error);
      // エラー時は何もしない（デフォルト値のまま）
    }
  };

  // キューから曲を削除
  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // キューをクリア
  const clearQueue = () => {
    setQueue([]);
  };

  // 次の曲を再生
  const playNext = () => {
    // 現在再生中の曲がある場合は履歴に追加
    if (currentItem) {
      setHistory((prev) => [currentItem, ...prev]);
    }

    // キューから次の曲を取得
    if (queue.length > 0) {
      const nextItem = queue[0];
      setCurrentItem(nextItem);
      setQueue((prev) => prev.slice(1));
    } else {
      setCurrentItem(null);
    }
  };

  // 現在再生中の曲の情報を更新
  const updateCurrentItemInfo = (title: string) => {
    if (currentItem) {
      setCurrentItem({
        ...currentItem,
        title: title || currentItem.title,
      });
    }
  };

  // 初期化時に最初の曲を再生
  useEffect(() => {
    if (queue.length > 0 && !currentItem) {
      playNext();
    }
  }, [queue, currentItem]);

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
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

// カスタムフック
export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
