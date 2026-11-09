/**
 * Small label for item type (lost/found), item status (open/claimed/closed)
 * and claim status (pending/approved/rejected).
 *   <StatusBadge status="found" />
 *   <StatusBadge status="found" onImage />   (white version for on top of a picture)
 */
import { Check, Clock, Search, X } from "lucide-react";

const STYLES = {
  lost: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  found: "bg-brand-100 text-brand-800 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30",
  open: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/30",
  claimed: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  closed: "bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-500/15 dark:text-stone-300 dark:ring-stone-500/30",
  pending: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  approved: "bg-brand-100 text-brand-800 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
};

const LABELS = {
  lost: "Lost",
  found: "Found",
  open: "Open",
  claimed: "Claimed",
  closed: "Closed",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const ICONS = { found: Check, lost: Search, approved: Check, rejected: X, pending: Clock };
const ON_IMAGE_ICON_COLOR = { found: "text-brand-600", lost: "text-rose-600" };

export default function StatusBadge({ status, className = "", onImage = false }) {
  const Icon = ICONS[status];
  const colors = onImage
    ? "bg-white text-ink ring-black/5 shadow-sm"
    : (STYLES[status] ?? STYLES.closed);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${colors} ${className}`}
    >
      {Icon && (
        <Icon
          className={`size-3 ${onImage ? (ON_IMAGE_ICON_COLOR[status] ?? "") : ""}`}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}
      {LABELS[status] ?? status}
    </span>
  );
}
