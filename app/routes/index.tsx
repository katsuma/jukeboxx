import { useState } from "react";
import { useNavigate } from "react-router";

import { AuthGate } from "@/components/AuthGate";
import { AuthStatus } from "@/components/AuthStatus";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { firebaseDB } from "@/utils/firebase";

export function meta() {
  const title = "Jukeboxx - Create a new queue";
  const description = "Create a new queue for your YouTube Jukebox";
  const ogpImageUrl = "https://jukeboxx.club/ogp.png";
  const url = "https://jukeboxx.club/";

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

export default function Index() {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
}

function IndexContent() {
  const navigate = useNavigate();
  const [queueName, setQueueName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Queue creation must run on the client so the write carries the
  // signed-in user's Firebase Auth token. A server action cannot
  // authenticate against the secured Realtime Database rules.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!queueName.trim()) {
      setError("Please enter a queue name");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const queueId = await firebaseDB.createQueue(queueName.trim());
      console.log("Created queue:", queueId);
      navigate(`/${queueId}`);
    } catch (err) {
      console.error("Error creating queue:", err);
      setError("Failed to create queue. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <AuthGate headerChildren="Create a queue and share it with your friends">
      <div className="container mx-auto px-4 py-8">
        <AuthStatus />
        <Header>Create a queue and share it with your friends</Header>

        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Create a New Queue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="queueName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Queue Name
              </label>
              <input
                type="text"
                id="queueName"
                name="queueName"
                placeholder="Enter a name for your queue"
                value={queueName}
                onChange={(event) => setQueueName(event.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isCreating}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create Queue"}
            </button>
          </form>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Create a queue, add YouTube videos, and share the URL with friends.
              Everyone with the link who is signed in with Google can add songs
              and enjoy the music together!
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGate>
  );
}
