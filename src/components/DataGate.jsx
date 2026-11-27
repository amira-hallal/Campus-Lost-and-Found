import { useEffect } from "react";
import { Loader2, RefreshCw, ServerCrash } from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export default function DataGate({ children }) {
  const { status, loadError, reload } = useData();
  const { authChecking, sessionEnded, clearSessionEnded } = useAuth();
  const { notify } = useFeedback();

  useEffect(() => {
    if (!sessionEnded) return;
    notify("Your session ended. Please log in again.", "error");
    clearSessionEnded();
  }, [sessionEnded, clearSessionEnded, notify]);

  if (status === "error") {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto inline-flex rounded-full bg-rose-50 p-4 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <ServerCrash className="size-8" aria-hidden="true" />
        </div>
        <h1 className="display mt-6 text-2xl">We couldn't load the lost &amp; found board</h1>
        <p className="mt-3" role="alert">
          {loadError}
        </p>
        <button type="button" onClick={reload} className="btn-primary mt-8">
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </main>
    );
  }

  if (status === "loading" || authChecking) {
    return (
      <main className="flex flex-col items-center px-4 py-32 text-center" aria-busy="true">
        <Loader2 className="size-8 animate-spin text-brand-600 dark:text-brand-300" aria-hidden="true" />
        <p className="mt-4 text-sm" role="status">
          Loading the latest reports...
        </p>
      </main>
    );
  }

  return children;
}
