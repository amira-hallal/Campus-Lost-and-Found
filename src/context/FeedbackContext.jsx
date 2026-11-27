import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

const FeedbackContext = createContext(null);
const SHOW_FOR_MS = 5000;

export function FeedbackProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setMessages((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const notify = useCallback(
    (text, type = "success") => {
      const id = nextId.current++;
      setMessages((current) => [...current.slice(-2), { id, text, type }]);
      setTimeout(() => dismiss(id), SHOW_FOR_MS);
    },
    [dismiss],
  );

  return (
    <FeedbackContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {messages.map((entry) => {
          const isError = entry.type === "error";
          const Icon = isError ? XCircle : CheckCircle2;
          return (
            <div
              key={entry.id}
              role={isError ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
                isError
                  ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950 dark:text-rose-100"
                  : "border-brand-200 bg-white text-ink dark:border-night-700 dark:bg-night-800 dark:text-stone-100"
              }`}
            >
              <Icon
                className={`mt-0.5 size-5 shrink-0 ${isError ? "text-rose-600 dark:text-rose-300" : "text-brand-600 dark:text-brand-300"}`}
                aria-hidden="true"
              />
              <p className="flex-1">{entry.text}</p>
              <button
                type="button"
                onClick={() => dismiss(entry.id)}
                aria-label="Dismiss message"
                className="-mr-1 rounded p-0.5 opacity-70 hover:opacity-100"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </FeedbackContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return context;
}
