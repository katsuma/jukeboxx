import type { Route } from "./+types/queue";
import { PlaylistProvider } from "../contexts/PlaylistContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { AddToQueueForm } from "../components/AddToQueueForm";
import { PlaylistQueue } from "../components/PlaylistQueue";
import { useEffect, useState } from "react";
import { firebaseDB } from "../utils/firebase";

export function meta({ params, data }: Route.MetaArgs) {
  const queueName = data?.queueName || "Queue";
  const title = `${queueName} | Jukeboxx - Create a new queue`;
  const description = "A jukebox application that manages and plays YouTube videos in a queue";
  const baseUrl = "https://jukeboxx.club";
  const ogpImageUrl = `${baseUrl}/ogp.png`;
  const url = `${baseUrl}/${params.queueId}`;

  return [
    { title },
    { name: "description", content: description },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogpImageUrl },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogpImageUrl },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const queueId = params.queueId;
  let queueName = "Queue";

  try {
    const metadata = await firebaseDB.getQueueMetadata(queueId);
    if (metadata && metadata.name) {
      queueName = metadata.name;
    }
  } catch (error) {
    console.error('Error fetching queue metadata in loader:', error);
  }

  return { queueId, queueName };
}

export default function Queue() {
  const [queueName, setQueueName] = useState<string>("Loading...");
  const [queueId, setQueueId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathQueueId = window.location.pathname.substring(1);
      setQueueId(pathQueueId);

      if (!pathQueueId || pathQueueId === "") return;

      const fetchQueueMetadata = async () => {
        try {
          const metadata = await firebaseDB.getQueueMetadata(pathQueueId);
          if (metadata) {
            setQueueName(metadata.name);
            if (typeof document !== 'undefined') {
              document.title = `${metadata.name} | Jukeboxx - Create a new queue`;
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
  }, []);

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
