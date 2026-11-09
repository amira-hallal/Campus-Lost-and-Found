import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-white/60 px-6 py-14 text-center dark:border-night-700 dark:bg-night-900/60">
        <div className="mb-4 rounded-full bg-brand-100 p-3 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <Construction className="size-6" aria-hidden="true" />
        </div>
        <h1 className="display text-2xl">{title}</h1>
        <p className="mt-1.5 text-sm">This page is coming soon.</p>
      </div>
    </main>
  );
}
