/**
 * Card for one item from the shared mock data (mockData.js / useData).
 * Used by the Item List and Location Details pages.
 * Props:
 *   item     - the item object
 *   location - the building object the item belongs to (optional)
 * The whole card opens Item Details; the building name links to Location Details.
 */
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getCategoryImage } from "../data/mockData";
import { timeAgo } from "../utils/format";

export default function ItemTile({ item, location }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-brand-600 dark:border-night-700 dark:bg-night-900">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50 dark:bg-night-800">
        <img
          src={item.image || getCategoryImage(item.category)}
          alt={item.title}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <StatusBadge status={item.type} onImage className="absolute left-2.5 top-2.5" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase dark:text-stone-400">
          {item.category}
        </p>
        <h3 className="mt-1.5 font-semibold leading-snug text-ink dark:text-stone-50">
          {/* Stretched link: covers the whole card so any click opens the item */}
          <Link to={`/items/${item.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {item.title}
          </Link>
        </h3>
        {location && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted dark:text-stone-400">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">Location: </span>
            <Link
              to={`/locations/${location.id}`}
              className="relative z-10 hover:text-brand-700 hover:underline dark:hover:text-brand-300"
            >
              {location.name}
            </Link>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted dark:text-stone-400">
          <span className="flex items-center gap-2">
            <time dateTime={item.date}>
              {item.type === "found" ? "Found" : "Lost"} {timeAgo(item.date)}
            </time>
            {item.status !== "open" && <StatusBadge status={item.status} />}
          </span>
          <ArrowUpRight
            className="size-4 text-brand-700 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-brand-300"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}
