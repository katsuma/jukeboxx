import { useState } from "react";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGateProps {
  headerChildren?: ReactNode;
  children: ReactNode;
}

/**
 * Gates page content behind Google sign-in.
 *
 * - While the initial auth state is loading, a simple loading state is shown.
 * - When signed out, the Header branding stays visible and a centered
 *   sign-in card is shown instead of the page content.
 * - When signed in, the page content is rendered unchanged.
 */
export function AuthGate({ headerChildren, children }: AuthGateProps) {
  const { user, loading, signIn } = useAuth();
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header>{headerChildren}</Header>
        <div className="max-w-md mx-auto text-center text-gray-600 dark:text-gray-400">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header>{headerChildren}</Header>

        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to continue</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Jukeboxx queues are private to signed-in users. Sign in with your
            Google account to create a queue or join one shared with you.
          </p>

          <button
            type="button"
            disabled={isSigningIn}
            onClick={() => {
              setSignInError(null);
              setIsSigningIn(true);
              signIn()
                .catch((error) => {
                  console.error("Failed to sign in:", error);
                  setSignInError("Failed to sign in. Please try again.");
                })
                .finally(() => {
                  setIsSigningIn(false);
                });
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
          </button>

          {signInError && (
            <p className="text-red-500 text-sm mt-4">{signInError}</p>
          )}
        </div>

        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
