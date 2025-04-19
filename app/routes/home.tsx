import type { Route } from "./+types/home";
import { PlaylistProvider } from "../contexts/PlaylistContext";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { AddToQueueForm } from "../components/AddToQueueForm";
import { PlaylistQueue } from "../components/PlaylistQueue";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "YouTube Jukebox" },
    { name: "description", content: "A jukebox application that manages and plays YouTube videos in a queue" },
  ];
}

export default function Home() {
  return (
    <PlaylistProvider>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">YouTube Jukebox</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Queue-based YouTube Music Player
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <YouTubePlayer className="w-full" />
            <AddToQueueForm className="w-full" />
          </div>

          <div className="lg:col-span-1">
            <PlaylistQueue className="w-full" />
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-4 py-2">
          &copy; {new Date().getFullYear()} Ryo Katsuma. All rights reserved.
        </div>
      </div>
    </PlaylistProvider>
  );
}
