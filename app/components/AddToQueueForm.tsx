import React, { useRef, useState } from "react";
import { usePlaylist } from "../contexts/PlaylistContext";
import { isValidYouTubeUrl } from "../utils/youtube";

interface AddToQueueFormProps {
  className?: string;
}

export function AddToQueueForm({ className = "" }: AddToQueueFormProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToQueue } = usePlaylist();

  const addTestVideo = () => {
    const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    console.log("テスト動画を追加します:", testUrl);
    addToQueue(testUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inputValue = inputRef.current?.value || '';
    console.log("フォーム送信: URL =", inputValue);

    if (!inputValue.trim()) {
      console.log("エラー: URLが空です");
      setError("URLを入力してください");
      return;
    }

    if (!isValidYouTubeUrl(inputValue)) {
      console.log("エラー: 無効なYouTube URL");
      setError("有効なYouTube URLを入力してください");
      return;
    }

    console.log("URLは有効です。キューに追加します:", inputValue);

    addToQueue(inputValue);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setError(null);
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="YouTube URL を入力"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            キューに追加
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </form>

      <button
        onClick={addTestVideo}
        className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        テスト動画を追加
      </button>
    </div>
  );
}
