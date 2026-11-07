/**
 * Item List page (/items) - M2
 * Shows every lost/found report as a card grid with search, filters and sorting.
 *
 * Filters are kept in React state. Other pages can open the list already filtered
 * with a link like /items?search=keys or /items?type=found&location=2
 * (used by the Homepage quick search and Location Details).
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HandHeart, LayoutGrid, MapPin, Plus, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import ItemCard from "../components/ItemCard";
import EmptyState from "../components/EmptyState";
import { useData } from "../context/DataContext";
import { CATEGORIES, ITEM_STATUSES } from "../data/mockData";
import { formatDate } from "../utils/format";

// Query string names for each filter
const FILTER_KEYS = ["search", "type", "category", "location", "status", "from", "to"];
// Filters inside the "More filters" panel (counted on its button)
const PANEL_KEYS = ["status", "from", "to"];

const TYPE_TABS = [
  { value: "", label: "All reports", short: "All", icon: LayoutGrid },
  { value: "lost", label: "Lost items", short: "Lost", icon: Search },
  { value: "found", label: "Found items", short: "Found", icon: HandHeart },
];

const STATUS_LABELS = { open: "Open", claimed: "Claimed", closed: "Closed" };

const SORT_OPTIONS = {
  newest: { label: "Newest first", compare: (a, b) => b.date.localeCompare(a.date) || b.id - a.id },
  oldest: { label: "Oldest first", compare: (a, b) => a.date.localeCompare(b.date) || a.id - b.id },
  title: { label: "Title (A to Z)", compare: (a, b) => a.title.localeCompare(b.title) },
};

const readFilters = (params) => Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? ""]));

// Returns true if the item passes every active filter.
// ignoreType lets us count lost/found results for the tabs.
function matchesFilters(item, filters, ignoreType = false) {
  const query = filters.search.trim().toLowerCase();
  if (query && !`${item.title} ${item.description}`.toLowerCase().includes(query)) return false;
  if (!ignoreType && filters.type && item.type !== filters.type) return false;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.location && item.locationId !== Number(filters.location)) return false;
  if (filters.status && item.status !== filters.status) return false;
  if (filters.from && item.date < filters.from) return false;
  if (filters.to && item.date > filters.to) return false;
  return true;
}

export default function ItemList() {
  const { items, locations, getLocation } = useData();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const [sortBy, setSortBy] = useState("newest");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    document.title = "Browse items | Campus Lost & Found";
  }, []);

  // If a link changes the query string while this page is open (e.g. navbar "Browse items"),
  // load those filters. Done during render, as the React docs recommend, instead of in an effect.
  const queryString = searchParams.toString();
  const [loadedQuery, setLoadedQuery] = useState(queryString);
  if (queryString !== loadedQuery) {
    setLoadedQuery(queryString);
    setFilters(readFilters(searchParams));
  }

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(readFilters(new URLSearchParams()));

  const results = items
    .filter((item) => matchesFilters(item, filters))
    .sort(SORT_OPTIONS[sortBy].compare);

  const typeCounts = items
    .filter((item) => matchesFilters(item, filters, true))
    .reduce((counts, item) => ({ ...counts, [item.type]: counts[item.type] + 1, "": counts[""] + 1 }), {
      "": 0,
      lost: 0,
      found: 0,
    });

  const panelFilterCount = PANEL_KEYS.filter((key) => filters[key]).length;
  const dateError = filters.from && filters.to && filters.from > filters.to;

  // Chips that show (and remove) the active filters
  const activeChips = [
    filters.search && { key: "search", label: `"${filters.search}"` },
    filters.category && { key: "category", label: filters.category },
    filters.location && { key: "location", label: getLocation(filters.location)?.name ?? "Unknown building" },
    filters.status && { key: "status", label: STATUS_LABELS[filters.status] ?? filters.status },
    filters.from && { key: "from", label: `From ${formatDate(filters.from)}` },
    filters.to && { key: "to", label: `Until ${formatDate(filters.to)}` },
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">The campus noticeboard</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Found on campus. Maybe yours?</h1>
          <p className="mt-3 max-w-xl">
            Everything reported across campus buildings. Search, filter, and open an item to see the details or
            claim it.
          </p>
        </div>
        <Link to="/items/new" className="btn-secondary shrink-0 self-start md:self-auto">
          Report an item
          <Plus className="size-4" aria-hidden="true" />
        </Link>
      </header>

      {/* Lost / found tabs */}
      <div role="group" aria-label="Show lost or found items" className="mt-10 flex gap-6 border-b border-line dark:border-night-700">
        {TYPE_TABS.map((tab) => {
          const active = filters.type === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => updateFilter("type", tab.value)}
              aria-pressed={active}
              className={`-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm whitespace-nowrap transition ${
                active
                  ? "border-brand-600 font-medium text-brand-700 dark:border-brand-400 dark:text-brand-300"
                  : "border-transparent text-body hover:text-ink dark:text-stone-400 dark:hover:text-stone-100"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-xs text-muted">{typeCounts[tab.value]}</span>
            </button>
          );
        })}
      </div>

      {/* Search box (same style as the template's hero search) */}
      <div className="card mt-4 flex flex-col p-1.5 shadow-sm shadow-brand-900/5 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 focus-within:bg-cream dark:focus-within:bg-night-800">
          <Search className="size-4 shrink-0 text-ink dark:text-stone-300" aria-hidden="true" />
          <div className="flex-1">
            <label htmlFor="item-search" className="block text-[10px] font-semibold tracking-[0.12em] text-ink uppercase dark:text-stone-200">
              What are you looking for?
            </label>
            <input
              id="item-search"
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Keys, bag, phone..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none dark:text-stone-100"
            />
          </div>
        </div>
        <div className="mx-3 h-px bg-line sm:mx-0 sm:my-2 sm:h-auto sm:w-px dark:bg-night-700" aria-hidden="true" />
        <div className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 focus-within:bg-cream dark:focus-within:bg-night-800">
          <MapPin className="size-4 shrink-0 text-ink dark:text-stone-300" aria-hidden="true" />
          <div className="flex-1">
            <label htmlFor="filter-location" className="block text-[10px] font-semibold tracking-[0.12em] text-ink uppercase dark:text-stone-200">
              Where?
            </label>
            <select
              id="filter-location"
              value={filters.location}
              onChange={(event) => updateFilter("location", event.target.value)}
              className="w-full cursor-pointer bg-transparent text-sm text-ink focus:outline-none dark:bg-night-900 dark:text-stone-100"
            >
              <option value="">All campus buildings</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div role="group" aria-label="Filter by category" className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {["", ...CATEGORIES].map((category) => (
          <button
            key={category || "all"}
            type="button"
            onClick={() => updateFilter("category", category)}
            aria-pressed={filters.category === category}
            className={`shrink-0 ${filters.category === category ? "pill-active" : "pill"}`}
          >
            {category || "All items"}
          </button>
        ))}
      </div>

      {/* Result count, more filters, sort */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm">
          Showing <strong className="font-medium text-ink dark:text-stone-50">{results.length}</strong> of{" "}
          {items.length} items
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowMoreFilters((open) => !open)}
            aria-expanded={showMoreFilters}
            aria-controls="more-filters"
            className="btn-secondary py-2"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {showMoreFilters ? "Hide filters" : "More filters"}
            {panelFilterCount > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{panelFilterCount}</span>
            )}
          </button>
          <label htmlFor="sort-by" className="sr-only">
            Sort items
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="form-input w-auto py-2"
          >
            {Object.entries(SORT_OPTIONS).map(([value, option]) => (
              <option key={value} value={value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* More filters panel (show/hide) */}
      {showMoreFilters && (
        <section id="more-filters" aria-label="More filters" className="card mt-4 grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <label htmlFor="filter-status" className="form-label">
              Status
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="form-input"
            >
              <option value="">Any status</option>
              {ITEM_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-from" className="form-label">
              Lost or found from
            </label>
            <input
              id="filter-from"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => updateFilter("from", event.target.value)}
              aria-invalid={dateError || undefined}
              aria-describedby={dateError ? "date-error" : undefined}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="filter-to" className="form-label">
              Until
            </label>
            <input
              id="filter-to"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => updateFilter("to", event.target.value)}
              aria-invalid={dateError || undefined}
              aria-describedby={dateError ? "date-error" : undefined}
              className="form-input"
            />
          </div>
          {dateError && (
            <p id="date-error" className="text-sm text-rose-700 sm:col-span-3 dark:text-rose-300">
              The start date must be before the end date.
            </p>
          )}
        </section>
      )}

      {activeChips.length > 0 && (
        <ul aria-label="Active filters" className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => updateFilter(chip.key, "")}
                className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800 hover:bg-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25"
              >
                {chip.label}
                <X className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(remove filter)</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={clearFilters}
              className="px-2 text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              Clear all
            </button>
          </li>
        </ul>
      )}

      {/* Results */}
      <section aria-labelledby="results-heading" className="mt-6">
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>
        {results.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} location={getLocation(item.locationId)} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No items found"
            message="Nothing matches your search and filters. Try different words or clear some filters."
          >
            <button type="button" onClick={clearFilters} className="btn-secondary">
              Clear all filters
            </button>
            <Link to="/items/new" className="btn-primary">
              Report an item
            </Link>
          </EmptyState>
        )}
      </section>

      {/* Call to action banner (same as the template's green strip) */}
      <aside className="mt-10 flex flex-col gap-4 rounded-xl bg-brand-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-brand-900/50">
        <div className="flex items-center gap-3">
          <HandHeart className="size-6 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden="true" />
          <div>
            <p className="font-medium text-ink dark:text-stone-50">Found something? Someone's looking for it.</p>
            <p className="text-sm">A quick report with a few details could make their day.</p>
          </div>
        </div>
        <Link to="/items/new" className="btn-secondary shrink-0">
          Report a found item
          <Plus className="size-4" aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
