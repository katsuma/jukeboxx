import { useState } from "react";
import { Footer } from "../components/Footer";
import { firebaseDB } from "../utils/firebase";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Jukeboxx - Create Queue" },
    { name: "description", content: "Create a new queue for your YouTube Jukebox" },
  ];
}

export default function Index() {
  const [queueName, setQueueName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!queueName.trim()) {
      setError("Please enter a queue name");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const queueId = await firebaseDB.createQueue(queueName.trim());
      console.log("Created queue:", queueId);

      // Redirect to the queue page (client-side only)
      if (typeof window !== 'undefined') {
        window.location.href = `/${queueId}`;
      }
    } catch (error) {
      console.error("Error creating queue:", error);
      setError("Failed to create queue. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <img src="/logo.png" alt="Jukeboxx" className="h-24 w-24 inline-block mr-2" />
        <h1 className="text-4xl font-bold mb-4">
          Jukeboxx
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Create a queue and share it with your friends
        </p>
      </header>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Create a New Queue</h2>

        <form onSubmit={handleCreateQueue} className="space-y-4">
          <div>
            <label htmlFor="queueName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Queue Name
            </label>
            <input
              type="text"
              id="queueName"
              value={queueName}
              onChange={(e) => setQueueName(e.target.value)}
              placeholder="Enter a name for your queue"
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

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Create a queue, add YouTube videos, and share the URL with friends.</p>
          <p>Everyone with the link can add songs and enjoy the music together!</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
