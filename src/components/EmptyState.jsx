/**
 * Friendly message box for "nothing to show" cases (no results, not found, etc.)
 * Props: icon (lucide component), title, message, children (optional buttons/links)
 */
export default function EmptyState({ icon: Icon, title, message, children }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-white/60 px-6 py-14 text-center dark:border-night-700 dark:bg-night-900/60">
      {Icon && (
        <div className="mb-4 rounded-full bg-brand-100 p-3 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <h2 className="display text-xl">{title}</h2>
      {message && <p className="mt-1.5 max-w-md text-sm">{message}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
