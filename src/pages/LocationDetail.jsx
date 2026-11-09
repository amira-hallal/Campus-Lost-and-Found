/**
 * Location Details page (/locations/:id)
 * Shows one campus building: description, opening hours, where to drop off
 * found items, report counts, and every item reported in that building.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Clock, Inbox, MapPinOff, PackageSearch, Plus, Tag } from "lucide-react";
import ItemTile from "../components/ItemTile";
import EmptyState from "../components/EmptyState";
import { useData } from "../context/DataContext";

const TABS = [
  { value: "all", label: "All reports" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export default function LocationDetail() {
  const { id } = useParams();
  const { getLocation, items, locations } = useData();
  const [activeTab, setActiveTab] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const location = getLocation(id);

  const pageTitle = location ? location.name : "Location not found";
  useEffect(() => {
    document.title = `${pageTitle} | Campus Lost & Found`;
  }, [pageTitle]);

  if (!location) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState icon={MapPinOff} title="Location not found" message="We couldn't find this building. The link may be wrong.">
          <Link to="/items" className="btn-primary">
            Browse all items
          </Link>
        </EmptyState>
      </section>
    );
  }

  const itemsHere = items.filter((item) => item.locationId === location.id);
  const stats = [
    { label: "Reports", value: itemsHere.length },
    { label: "Lost", value: itemsHere.filter((item) => item.type === "lost").length },
    { label: "Found", value: itemsHere.filter((item) => item.type === "found").length },
    { label: "Still open", value: itemsHere.filter((item) => item.status === "open").length },
  ];

  const visibleItems = itemsHere
    .filter((item) => activeTab === "all" || item.type === activeTab)
    .filter((item) => !onlyOpen || item.status === "open")
    .sort((a, b) => b.date.localeCompare(a.date));

  const otherLocations = locations.filter((entry) => entry.id !== location.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted dark:text-stone-400">
          <li>
            <Link to="/items" className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">
              Items
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink dark:text-stone-200">
            {location.name}
          </li>
        </ol>
      </nav>

      {/* Hero: building info on the left, picture on the right */}
      <section aria-labelledby="location-heading" className="mt-6 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            Campus building · {location.code}
          </p>
          <h1 id="location-heading" className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
            {location.name}
          </h1>
          <p className="mt-4 max-w-lg text-base">{location.description}</p>

          <dl className="mt-8 grid max-w-lg grid-cols-4 divide-x divide-line border-y border-line dark:divide-night-700 dark:border-night-700">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse px-3 py-4 first:pl-0">
                <dt className="text-xs text-muted dark:text-stone-400">{stat.label}</dt>
                <dd className="display text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/items/new" className="btn-primary">
              Report an item here
              <Plus className="size-4" aria-hidden="true" />
            </Link>
            <Link to={`/items?location=${location.id}`} className="btn-secondary">
              Open in item list
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative">
          <img
            src={location.image}
            alt={`Illustration for ${location.name}`}
            className="aspect-[4/3] w-full rounded-2xl object-cover sm:aspect-[12/7]"
          />
          {/* Floating card like the template's "Small things. Big relief." */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white/95 p-3.5 shadow-lg shadow-brand-950/10 backdrop-blur sm:right-auto sm:max-w-xs dark:bg-night-900/95">
            <span className="rounded-full bg-brand-100 p-2 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              <Inbox className="size-4" aria-hidden="true" />
            </span>
            <div className="text-sm">
              <p className="font-medium text-ink dark:text-stone-50">Found something here?</p>
              <p className="text-xs">Hand it in at the {location.dropOffPoint.toLowerCase()}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Practical info strip */}
      <ul className="mt-12 grid gap-4 border-y border-line py-4 text-sm sm:grid-cols-3 dark:border-night-700">
        <li className="flex items-center gap-2.5">
          <Clock className="size-4 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden="true" />
          <span>
            <span className="sr-only">Opening hours: </span>
            {location.hours}
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <Inbox className="size-4 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden="true" />
          <span>Drop-off: {location.dropOffPoint}</span>
        </li>
        <li className="flex items-center gap-2.5">
          <Tag className="size-4 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden="true" />
          <span>Building code {location.code}</span>
        </li>
      </ul>

      {/* Items reported in this building */}
      <section aria-labelledby="items-here-heading" className="mt-14">
        <p className="eyebrow">Reported in this building</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 id="items-here-heading" className="display text-3xl sm:text-4xl">
            Left behind at {location.code}.
          </h2>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(event) => setOnlyOpen(event.target.checked)}
              className="size-4 rounded accent-brand-600"
            />
            Only show open reports
          </label>
        </div>

        <div role="group" aria-label="Show lost or found items" className="mt-5 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              aria-pressed={activeTab === tab.value}
              className={activeTab === tab.value ? "pill-active" : "pill"}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visibleItems.length > 0 ? (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <ItemTile item={item} location={location} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={PackageSearch}
              title="No items to show"
              message={`No ${activeTab === "all" ? "" : `${activeTab} `}${onlyOpen ? "open " : ""}reports in ${
                location.name
              } right now.`}
            >
              <Link to="/items/new" className="btn-primary">
                <Plus className="size-4" aria-hidden="true" />
                Report an item
              </Link>
            </EmptyState>
          </div>
        )}
      </section>

      {/* Other buildings */}
      <section aria-labelledby="other-buildings-heading" className="mt-14">
        <p className="eyebrow">Keep looking</p>
        <h2 id="other-buildings-heading" className="display mt-3 text-2xl sm:text-3xl">
          Other buildings on campus
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {otherLocations.map((entry) => {
            const count = items.filter((item) => item.locationId === entry.id).length;
            return (
              <li key={entry.id}>
                <Link
                  to={`/locations/${entry.id}`}
                  className="group flex h-full items-start justify-between gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50 dark:border-night-700 dark:bg-night-900 dark:hover:bg-night-800"
                >
                  <span>
                    <span className="block font-medium text-ink dark:text-stone-50">{entry.name}</span>
                    <span className="mt-1 block text-xs text-muted dark:text-stone-400">
                      {count} {count === 1 ? "report" : "reports"}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-brand-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-brand-300"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
