import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "react-youtube";
import { usePlaylist } from "../contexts/PlaylistContext";

// YouTubeプレーヤーから動画情報を取得するための型定義
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

  // YouTubeプレーヤーのオプション
  const opts = {
    height: "360",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  // プレーヤーの準備完了時
  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;

    // 動画情報を取得して更新
    if (currentItem) {
      try {
        // YouTubeプレーヤーから動画タイトルを取得
        const videoData = event.target.getVideoData() as YouTubePlayerData;
        if (videoData && videoData.title) {
          // タイトルが取得できた場合は更新
          updateCurrentItemInfo(videoData.title);
        }
      } catch (error) {
        console.error('動画情報の取得に失敗しました:', error);
      }
    }
  };

  // 動画再生終了時
  const onEnd = () => {
    playNext();
  };

  // エラー発生時
  const onError = () => {
    console.error("YouTube player error occurred");
    playNext(); // エラーが発生した場合も次の曲に移動
  };

  // 現在のアイテムが変更されたときにプレーヤーをリセット
  useEffect(() => {
    if (playerRef.current && !currentItem) {
      playerRef.current.stopVideo();
    }
  }, [currentItem]);

  if (!currentItem) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`} style={{ height: "360px", width: "640px" }}>
        <p className="text-gray-500 dark:text-gray-400">
          キューに曲を追加してください
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <YouTube
        videoId={currentItem.videoId}
        opts={opts}
        onReady={onReady}
        onEnd={onEnd}
        onError={onError}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
}
