import { Form, useActionData, useNavigation, redirect } from "react-router";

import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { firebaseDB } from "../utils/firebase";

import type { Route } from "./+types/index";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const queueName = formData.get("queueName") as string;

  if (!queueName || !queueName.trim()) {
    return { success: false, error: "Please enter a queue name" };
  }

  try {
    const queueId = await firebaseDB.createQueue(queueName.trim());
    console.log("Created queue:", queueId);

    return redirect(`/${queueId}`);
  } catch (error) {
    console.error("Error creating queue:", error);
    return {
      success: false,
      error: "Failed to create queue. Please try again."
    };
  }
}

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
  const actionData = useActionData();
  const navigation = useNavigation();
  const isCreating = navigation.state === "submitting";

  return (
    <div className="container mx-auto px-4 py-8">
      <Header>Create a queue and share it with your friends</Header>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Create a New Queue</h2>

        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="queueName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Queue Name
            </label>
            <input
              type="text"
              id="queueName"
              name="queueName"
              placeholder="Enter a name for your queue"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isCreating}
            />
          </div>

          {actionData?.error && (
            <p className="text-red-500 text-sm">{actionData.error}</p>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Queue"}
          </button>
        </Form>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Create a queue, add YouTube videos, and share the URL with friends.
            Everyone with the link can add songs and enjoy the music together!
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
