import type { Route } from "./+types/home";
import { PlaylistProvider } from "../contexts/PlaylistContext";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { AddToQueueForm } from "../components/AddToQueueForm";
import { PlaylistQueue } from "../components/PlaylistQueue";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "YouTube Jukebox" },
    { name: "description", content: "YouTubeの曲をキューで管理して再生するジュークボックス" },
  ];
}

export default function Home() {
  return (
    <PlaylistProvider>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">YouTube Jukebox</h1>
          <p className="text-gray-600 dark:text-gray-400">
            YouTubeの曲をキューで管理して再生するジュークボックス
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* プレーヤーとフォーム */}
          <div className="lg:col-span-2 space-y-6">
            <YouTubePlayer className="w-full" />
            <AddToQueueForm className="w-full" />
          </div>

          {/* キューと再生履歴 */}
          <div className="lg:col-span-1">
            <PlaylistQueue className="w-full" />
          </div>
        </div>
      </div>
    </PlaylistProvider>
  );
}
