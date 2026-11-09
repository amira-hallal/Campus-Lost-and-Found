import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found | Campus Lost & Found";
  }, []);

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="rounded-full bg-brand-100 p-4 text-brand-800 dark:bg-brand-500/15 dark:text-brand-300">
        <MapPinOff className="size-8" aria-hidden="true" />
      </div>
      <p className="mt-6 text-6xl font-extrabold text-brand-800 dark:text-brand-300">404</p>
      <h1 className="display mt-3 text-3xl">This page got lost too</h1>
      <p className="mt-3">
        We looked everywhere, even under the library desks, but this page isn't in our lost and found.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/items" className="btn-secondary">Browse items</Link>
      </div>
    </main>
  );
}
