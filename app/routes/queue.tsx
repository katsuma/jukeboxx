import type { Route } from "./+types/queue";
import { PlaylistProvider } from "../contexts/PlaylistContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { AddToQueueForm } from "../components/AddToQueueForm";
import { PlaylistQueue } from "../components/PlaylistQueue";
import { useEffect, useState } from "react";
import { firebaseDB } from "../utils/firebase";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "YouTube Jukebox" },
    { name: "description", content: "A jukebox application that manages and plays YouTube videos in a queue" },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  return { queueId: params.queueId };
}

export default function Queue() {
  const [queueName, setQueueName] = useState<string>("Loading...");
  const [queueId, setQueueId] = useState<string>("");

  useEffect(() => {
    // Client-side only code
    if (typeof window !== 'undefined') {
      // Get queueId from URL in client-side only
      const pathQueueId = window.location.pathname.substring(1);
      setQueueId(pathQueueId);

      if (!pathQueueId || pathQueueId === "") return;

      const fetchQueueMetadata = async () => {
        try {
          const metadata = await firebaseDB.getQueueMetadata(pathQueueId);
          if (metadata) {
            setQueueName(metadata.name);
            if (typeof document !== 'undefined') {
              document.title = `${metadata.name} - YouTube Jukebox`;
            }
          } else {
            setQueueName("Unnamed Queue");
          }
        } catch (error) {
          console.error('Error fetching queue metadata:', error);
          setQueueName("Unnamed Queue");
        }
      };

      fetchQueueMetadata();
    }
  }, []); // Empty dependency array to run only once

  if (!queueId) {
    return <div>Invalid queue ID</div>;
  }

  return (
    <PlaylistProvider queueId={queueId}>
      <div className="container mx-auto px-4 py-8">
        <Header>
          {queueName}
        </Header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <YouTubePlayer className="w-full" />
            <AddToQueueForm className="w-full" />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <PlaylistQueue className="w-full" />

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Share This Queue</h3>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg mr-2 bg-gray-50 dark:bg-gray-900 text-sm"
                />
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href)
                        .then(() => {
                          alert('URL copied to clipboard!');
                        })
                        .catch(err => {
                          console.error('Could not copy URL: ', err);
                        });
                    }
                  }}
                  className="px-3 py-2 text-black dark:text-white border-1 border-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                >
                  Copy URL
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Share this URL with friends to collaborate on the same queue
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PlaylistProvider>
  );
}
