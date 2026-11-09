/**
 * Claim Details page (/claims/:id) - M2
 * Shows one claim: who made it, their message, its status and the linked item.
 *  - The person who reported the item can approve or reject a pending claim.
 *  - The person who made the claim can withdraw it while it is pending.
 * Changes update the shared state in DataContext (no backend in Phase 1).
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileQuestion,
  Inbox,
  Lock,
  ShieldCheck,
  Tag,
  X,
  XCircle,
} from "lucide-react";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import ItemCard from "../components/ItemCard";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { formatDate, getInitials } from "../utils/format";

const NOTE_MAX_LENGTH = 200;

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClaim, getItem, getUser, getLocation, getClaimsForItem, updateClaimStatus, withdrawClaim } =
    useData();
  const { currentUser } = useAuth();

  const [decision, setDecision] = useState(null); // "approved" | "rejected" while the confirm modal is open
  const [ownerNote, setOwnerNote] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showOtherClaims, setShowOtherClaims] = useState(false);
  const statusRef = useRef(null);

  const claim = getClaim(id);
  const item = claim ? getItem(claim.itemId) : undefined;

  const pageTitle = claim ? `Claim #${claim.id}` : "Claim not found";
  useEffect(() => {
    document.title = `${pageTitle} | Campus Lost & Found`;
  }, [pageTitle]);

  if (!claim || !item) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={FileQuestion}
          title="Claim not found"
          message="This claim doesn't exist. It may have been withdrawn, or the link is wrong."
        >
          <Link to="/dashboard" className="btn-secondary">
            Go to my dashboard
          </Link>
          <Link to="/items" className="btn-primary">
            Browse items
          </Link>
        </EmptyState>
      </section>
    );
  }

  const claimant = getUser(claim.claimantId);
  const owner = getUser(item.postedBy);
  const location = getLocation(item.locationId);
  const otherClaims = getClaimsForItem(item.id).filter((entry) => entry.id !== claim.id);
  const otherPendingCount = otherClaims.filter((entry) => entry.status === "pending").length;

  const isOwner = currentUser?.id === item.postedBy;
  const isClaimant = currentUser?.id === claim.claimantId;
  const isPending = claim.status === "pending";
  const isFoundItem = item.type === "found";
  const claimantFirstName = claimant?.name.split(" ")[0] ?? "the claimant";
  const ownerFirstName = owner?.name.split(" ")[0] ?? "the reporter";

  const closeDecisionModal = () => {
    setDecision(null);
    setOwnerNote("");
  };

  const confirmDecision = () => {
    updateClaimStatus(claim.id, decision, ownerNote.trim());
    closeDecisionModal();
    // Move keyboard/screen reader focus to the new status message
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const confirmWithdraw = () => {
    withdrawClaim(claim.id);
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted dark:text-stone-400">
          <li>
            <Link to="/items" className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">
              Items
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={`/items/${item.id}`} className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">
              {item.title}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink dark:text-stone-200">
            Claim #{claim.id}
          </li>
        </ol>
      </nav>

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <p className="eyebrow">Claim #{claim.id}</p>
          <StatusBadge status={claim.status} />
        </div>
        <h1 className="display mt-3 text-3xl sm:text-4xl">
          {isFoundItem ? `Is this ${claimantFirstName}'s?` : `Did ${claimantFirstName} find it?`}
        </h1>
        <p className="mt-2">
          {claimant?.name ?? "Someone"} {isFoundItem ? "says this item belongs to them" : "says they found this item"}.
          Sent on <time dateTime={claim.date}>{formatDate(claim.date)}</time>.
        </p>
      </header>

      {/* Status message (focus moves here after approve/reject) */}
      <div ref={statusRef} tabIndex={-1} className="mt-6 outline-none">
        <StatusMessage
          claim={claim}
          isOwner={isOwner}
          isFoundItem={isFoundItem}
          ownerName={owner?.name ?? "the reporter"}
          claimantFirstName={claimantFirstName}
          location={location}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Claim conversation and details */}
        <section aria-labelledby="claim-info-heading" className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand-100 p-2 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="claim-info-heading" className="font-medium text-ink dark:text-stone-50">
                A connection, not an exposure
              </h2>
              <p className="text-xs text-muted dark:text-stone-400">
                Emails are only shared between the reporter and the claimant.
              </p>
            </div>
          </div>

          {/* Messages shown as chat bubbles */}
          <ol className="mt-5 space-y-4 rounded-xl bg-cream p-4 sm:p-5 dark:bg-night-950">
            <ChatBubble
              name={claimant?.name ?? "Claimant"}
              label={isClaimant ? "You" : isFoundItem ? "Claimant" : "Finder"}
              date={claim.date}
              text={claim.message}
            />
            {claim.ownerNote ? (
              <ChatBubble
                name={owner?.name ?? "Reporter"}
                label={isOwner ? "You" : "Reporter"}
                date={claim.decidedAt}
                text={claim.ownerNote}
                reply
              />
            ) : (
              <li className="flex items-center justify-end gap-1.5 text-xs text-muted dark:text-stone-400">
                {isPending ? (
                  <>
                    <Clock className="size-3.5" aria-hidden="true" />
                    {isOwner ? "Your reply will show here" : `Waiting for ${ownerFirstName} to reply`}
                  </>
                ) : (
                  `${ownerFirstName} ${claim.status} the claim without a message`
                )}
              </li>
            )}
            <li className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted dark:text-stone-500">
              <Lock className="size-3" aria-hidden="true" />
              No personal contact details shown publicly.
            </li>
          </ol>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted dark:text-stone-400">Contact email</dt>
              <dd className="mt-1">
                {isOwner || isClaimant ? (
                  <a
                    href={`mailto:${claimant?.email}`}
                    className="text-brand-700 hover:underline dark:text-brand-300"
                  >
                    {claimant?.email}
                  </a>
                ) : (
                  <span className="text-ink dark:text-stone-200">Only visible to the reporter</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted dark:text-stone-400">Item reported by</dt>
              <dd className="mt-1 text-ink dark:text-stone-200">
                {owner?.name ?? "Unknown user"}
                {isOwner && <span className="ml-1 text-xs text-muted">(you)</span>}
              </dd>
            </div>
          </dl>

          {/* Timeline */}
          <h3 className="eyebrow mt-8">Timeline</h3>
          <ol className="mt-4 space-y-4 border-l border-line pl-6 text-sm dark:border-night-700">
            <TimelineStep
              icon={Tag}
              text={`Item reported as ${item.type} by ${owner?.name ?? "a user"}`}
              date={item.createdAt?.slice(0, 10) || item.date}
            />
            <TimelineStep icon={Inbox} text={`Claim sent by ${claimant?.name ?? "a user"}`} date={claim.date} />
            {isPending ? (
              <TimelineStep icon={Clock} text="Waiting for the reporter to review" muted />
            ) : (
              <TimelineStep
                icon={claim.status === "approved" ? CheckCircle2 : XCircle}
                text={`Claim ${claim.status}`}
                date={claim.decidedAt}
              />
            )}
          </ol>

          {/* Actions depend on who is looking at the claim */}
          <div className="mt-8 border-t border-line pt-5 text-sm dark:border-night-700">
            {isOwner && isPending && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setDecision("approved")} className="btn-primary">
                  <Check className="size-4" aria-hidden="true" />
                  Approve claim
                </button>
                <button type="button" onClick={() => setDecision("rejected")} className="btn-danger-outline">
                  <X className="size-4" aria-hidden="true" />
                  Reject claim
                </button>
              </div>
            )}

            {isClaimant && isPending && (
              <button type="button" onClick={() => setShowWithdraw(true)} className="btn-secondary">
                Withdraw my claim
              </button>
            )}

            {!currentUser && isPending && (
              <p>
                <Link to="/login" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                  Log in
                </Link>{" "}
                to respond to this claim.
              </p>
            )}

            {currentUser && !isOwner && !isClaimant && (
              <p>Only the person who reported this item can approve or reject claims.</p>
            )}

            {!isPending && (isOwner || isClaimant) && <p>This claim has been decided. No more actions.</p>}
          </div>

          {/* Other claims on the same item (only the reporter sees these) */}
          {isOwner && otherClaims.length > 0 && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowOtherClaims((open) => !open)}
                aria-expanded={showOtherClaims}
                aria-controls="other-claims"
                className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                {showOtherClaims ? "Hide" : "Show"} {otherClaims.length} other claim
                {otherClaims.length > 1 ? "s" : ""} on this item
                <ChevronDown className={`size-4 transition ${showOtherClaims ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {showOtherClaims && (
                <ul
                  id="other-claims"
                  className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line dark:divide-night-700 dark:border-night-700"
                >
                  {otherClaims.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        to={`/claims/${entry.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-cream dark:hover:bg-night-800"
                      >
                        <span>
                          <span className="font-medium text-ink dark:text-stone-100">Claim #{entry.id}</span>{" "}
                          by {getUser(entry.claimantId)?.name ?? "Unknown user"}, {formatDate(entry.date)}
                        </span>
                        <StatusBadge status={entry.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Linked item + pick-up info */}
        <aside className="space-y-4 lg:self-start" aria-label="Claimed item">
          <p className="eyebrow">The item</p>
          <ItemCard item={item} location={location} />
          {isFoundItem && location && claim.status !== "rejected" && (
            <div className="rounded-xl bg-brand-100 p-4 text-sm dark:bg-brand-900/50">
              <p className="flex items-center gap-2 font-medium text-ink dark:text-stone-50">
                <Inbox className="size-4 text-brand-700 dark:text-brand-300" aria-hidden="true" />
                Pick-up point
              </p>
              <p className="mt-1">
                {location.dropOffPoint}, {location.name}
              </p>
              <p className="mt-1 text-xs text-muted dark:text-stone-400">{location.hours}</p>
            </div>
          )}
        </aside>
      </div>

      {/* Approve / reject confirmation */}
      <Modal
        isOpen={decision !== null}
        onClose={closeDecisionModal}
        title={decision === "approved" ? "Approve this claim?" : "Reject this claim?"}
        description={
          decision === "approved"
            ? `${claimantFirstName} will be told the claim was approved.${
                otherPendingCount === 1
                  ? " The other pending claim on this item will be rejected."
                  : otherPendingCount > 1
                    ? ` The other ${otherPendingCount} pending claims on this item will be rejected.`
                    : ""
              }`
            : `${claimantFirstName} will see that the claim was rejected.`
        }
        footer={
          <>
            <button type="button" onClick={closeDecisionModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDecision}
              className={decision === "approved" ? "btn-primary" : "btn-danger"}
            >
              {decision === "approved" ? "Yes, approve" : "Yes, reject"}
            </button>
          </>
        }
      >
        <label htmlFor="owner-note" className="form-label">
          Message to {claimantFirstName} <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="owner-note"
          rows={3}
          maxLength={NOTE_MAX_LENGTH}
          value={ownerNote}
          onChange={(event) => setOwnerNote(event.target.value)}
          placeholder={
            decision === "approved"
              ? "e.g. You can pick it up from the drop-off point. Bring your student ID."
              : "e.g. The details you gave don't match the item."
          }
          aria-describedby="owner-note-count"
          className="form-input resize-none"
        />
        <p id="owner-note-count" className="mt-1 text-right text-xs text-muted">
          {ownerNote.length}/{NOTE_MAX_LENGTH}
        </p>
      </Modal>

      {/* Withdraw confirmation */}
      <Modal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        title="Withdraw your claim?"
        description={`This removes your claim on "${item.title}". You can send a new claim later from the item page.`}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setShowWithdraw(false)} className="btn-secondary">
              Keep my claim
            </button>
            <button type="button" onClick={confirmWithdraw} className="btn-danger">
              Withdraw
            </button>
          </>
        }
      />
    </div>
  );
}

// Colored box at the top that explains where the claim stands
function StatusMessage({ claim, isOwner, isFoundItem, ownerName, claimantFirstName, location }) {
  if (claim.status === "pending") {
    return (
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <Clock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>
          {isOwner
            ? `This claim needs your review. Check that ${claimantFirstName}'s details match the item before approving.`
            : `Waiting for ${ownerName} to review this claim.`}
        </p>
      </div>
    );
  }

  const approved = claim.status === "approved";
  const Icon = approved ? CheckCircle2 : XCircle;
  return (
    <div
      className={`flex gap-3 rounded-xl border p-4 text-sm ${
        approved
          ? "border-brand-200 bg-brand-100 text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200"
          : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
      }`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">
          {approved ? "A happy reunion!" : "Not a match."} Claim {claim.status} on {formatDate(claim.decidedAt)}.
        </p>
        {approved && isFoundItem && location && (
          <p className="mt-1">
            Pick-up point: {location.dropOffPoint}, {location.name}.
          </p>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ name, label, date, text, reply = false }) {
  return (
    <li className={`flex items-end gap-2.5 ${reply ? "flex-row-reverse" : ""}`}>
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-brand-700 ring-1 ring-line dark:bg-night-800 dark:text-brand-300 dark:ring-night-700"
        aria-hidden="true"
      >
        {getInitials(name)}
      </span>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          reply
            ? "rounded-br-sm bg-brand-100 text-ink dark:bg-brand-900/60 dark:text-stone-100"
            : "rounded-bl-sm bg-white text-ink shadow-sm dark:bg-night-800 dark:text-stone-100"
        }`}
      >
        <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase dark:text-stone-400">
          {label} · {name}
          {date && (
            <>
              {" · "}
              <time dateTime={date}>{formatDate(date)}</time>
            </>
          )}
        </p>
        <p className="mt-1 leading-relaxed">{text}</p>
      </div>
    </li>
  );
}

function TimelineStep({ icon: Icon, text, date, muted = false }) {
  return (
    <li className="relative">
      <span
        className={`absolute -left-[2.3rem] top-0 flex size-7 items-center justify-center rounded-full ring-4 ring-white dark:ring-night-900 ${
          muted
            ? "bg-stone-100 text-muted dark:bg-night-800"
            : "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
        }`}
        aria-hidden="true"
      >
        <Icon className="size-3.5" />
      </span>
      <p className={muted ? "text-muted dark:text-stone-400" : "text-ink dark:text-stone-200"}>{text}</p>
      {date && (
        <p className="text-xs text-muted dark:text-stone-500">
          <time dateTime={date}>{formatDate(date)}</time>
        </p>
      )}
    </li>
  );
}
