import React, { useState } from "react";
import { usePlaylist } from "../contexts/PlaylistContext";
import { isValidYouTubeUrl } from "../utils/youtube";

interface AddToQueueFormProps {
  className?: string;
}

export function AddToQueueForm({ className = "" }: AddToQueueFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { addToQueue } = usePlaylist();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // URLの検証
    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError("有効なYouTube URLを入力してください");
      return;
    }

    // キューに追加
    addToQueue(url);

    // フォームをリセット
    setUrl("");
    setError(null);
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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
    </div>
  );
}
