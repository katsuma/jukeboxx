import { useAuth } from "@/contexts/AuthContext";

export function AuthStatus() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const label = user.displayName || user.email || "Signed in";

  return (
    <div className="flex items-center justify-end gap-3 mb-4">
      <div className="flex items-center gap-2 min-w-0">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt=""
            className="h-8 w-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {label}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          signOut().catch((error) => {
            console.error("Failed to sign out:", error);
          });
        }}
        className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Sign out
      </button>
    </div>
  );
}
