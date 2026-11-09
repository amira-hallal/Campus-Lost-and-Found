import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  FileQuestion,
  HandHeart,
  MapPin,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { getCategoryImage } from "../data/mockData";
import { formatDate, getInitials, timeAgo } from "../utils/format";

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;

function BackLink() {
  return (
    <Link
      to="/items"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to list
    </Link>
  );
}

// key={id} gives each item a fresh page, so open popups or details don't carry over
export default function ItemDetailPage() {
  const { id } = useParams();
  return <ItemDetail key={id} id={id} />;
}

function ItemDetail({ id }) {
  const navigate = useNavigate();
  const { getItem, getUser, getLocation, getClaimsForItem, addClaim, deleteItem } = useData();
  const { currentUser } = useAuth();

  const [showDetails, setShowDetails] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sentClaim, setSentClaim] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const item = getItem(id);

  const pageTitle = item ? item.title : "Item not found";
  useEffect(() => {
    document.title = `${pageTitle} | Campus Lost & Found`;
  }, [pageTitle]);

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackLink />
        <div className="mt-6">
          <EmptyState
            icon={FileQuestion}
            title="Item not found"
            message={`We couldn't find an item with ID "${id}". It may have been deleted, or the link is wrong.`}
          >
            <Link to="/items" className="btn-primary">
              Back to list
            </Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  const poster = getUser(item.postedBy);
  const location = getLocation(item.locationId);
  const isOwner = currentUser?.id === item.postedBy;
  const isFoundItem = item.type === "found";
  const canBeClaimed = item.status === "open";
  const myClaim = currentUser
    ? getClaimsForItem(item.id).find((claim) => claim.claimantId === currentUser.id)
    : undefined;

  const openClaim = () => {
    setMessage("");
    setMessageError("");
    setSentClaim(null);
    setClaimOpen(true);
  };

  const submitClaim = (event) => {
    event.preventDefault();
    if (message.trim().length < MESSAGE_MIN) {
      setMessageError(`Please write at least ${MESSAGE_MIN} characters so the poster can check it's a match.`);
      return;
    }
    setSentClaim(addClaim({ itemId: item.id, claimantId: currentUser.id, message: message.trim() }));
  };

  const confirmDelete = () => {
    deleteItem(item.id);
    navigate("/items");
  };

  // Footer buttons of the claim modal change with its state
  let claimFooter;
  if (!currentUser) {
    claimFooter = (
      <>
        <Link to="/login" className="btn-secondary">Log in</Link>
        <Link to="/register" className="btn-primary">Create an account</Link>
      </>
    );
  } else if (sentClaim) {
    claimFooter = (
      <>
        <button type="button" onClick={() => setClaimOpen(false)} className="btn-secondary">Close</button>
        <Link to={`/claims/${sentClaim.id}`} className="btn-primary">View my claim</Link>
      </>
    );
  } else {
    claimFooter = (
      <>
        <button type="button" onClick={() => setClaimOpen(false)} className="btn-secondary">Cancel</button>
        <button type="submit" form="claim-form" className="btn-primary">Send claim</button>
      </>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <BackLink />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Large picture */}
        <div className="self-start overflow-hidden rounded-2xl border border-line bg-brand-100 dark:border-night-700 dark:bg-night-800">
          <img
            src={item.image || getCategoryImage(item.category)}
            alt={`${item.title}, ${item.type} item${location ? ` at ${location.name}` : ""}`}
            onError={(event) => {
              event.currentTarget.src = getCategoryImage(item.category);
            }}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.type} />
            <StatusBadge status={item.status} />
          </div>
          <h1 className="display mt-3 text-3xl sm:text-4xl">{item.title}</h1>

          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Tag className="size-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <dt className="w-20 text-muted dark:text-stone-400">Category</dt>
              <dd className="font-medium text-body dark:text-stone-100">{item.category}</dd>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <dt className="w-20 text-muted dark:text-stone-400">Location</dt>
              <dd className="font-medium text-body dark:text-stone-100">
                {location ? (
                  <Link to={`/locations/${location.id}`} className="hover:underline">
                    {location.name}
                  </Link>
                ) : (
                  "Unknown location"
                )}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <dt className="w-20 text-muted dark:text-stone-400">{isFoundItem ? "Found on" : "Lost on"}</dt>
              <dd className="font-medium text-body dark:text-stone-100">
                <time dateTime={item.date}>{formatDate(item.date)}</time>
              </dd>
            </div>
          </dl>

          <p className="mt-6 leading-relaxed">{item.description}</p>

          {/* Posted by */}
          <section aria-label="Posted by" className="card mt-6 flex items-center gap-4 p-4">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-800 font-bold text-white dark:bg-brand-500 dark:text-night-950"
              aria-hidden="true"
            >
              {poster ? getInitials(poster.name) : "?"}
            </span>
            <div className="min-w-0">
              <p className="eyebrow">Posted by</p>
              <p className="font-semibold text-ink dark:text-stone-50">
                {poster?.name ?? "Unknown user"}
                {isOwner && <span className="ml-1.5 text-xs font-normal text-muted">(you)</span>}
              </p>
              <p className="text-xs text-muted dark:text-stone-400">
                Reported {timeAgo(item.createdAt || item.date)}
              </p>
            </div>
          </section>

          {/* Show / hide extra details */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowDetails((open) => !open)}
              aria-expanded={showDetails}
              aria-controls="extra-details"
              className="flex items-center gap-1 text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
            >
              {showDetails ? "Hide extra details" : "Show extra details"}
              <ChevronDown className={`size-4 transition ${showDetails ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {showDetails && (
              <dl
                id="extra-details"
                className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 rounded-xl bg-brand-50 p-4 text-sm dark:bg-night-900"
              >
                <dt className="text-muted dark:text-stone-400">Color</dt>
                <dd>{item.color || "Not given"}</dd>
                <dt className="text-muted dark:text-stone-400">Brand</dt>
                <dd>{item.brand || "Not given"}</dd>
                <dt className="text-muted dark:text-stone-400">Marks</dt>
                <dd>{item.marks || "None"}</dd>
                {isFoundItem && location && (
                  <>
                    <dt className="text-muted dark:text-stone-400">Pick-up point</dt>
                    <dd>
                      {location.dropOffPoint}
                      <span className="block text-xs text-muted dark:text-stone-400">{location.hours}</span>
                    </dd>
                  </>
                )}
                <dt className="text-muted dark:text-stone-400">Item ID</dt>
                <dd>#{item.id}</dd>
              </dl>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6 dark:border-night-700">
            {isOwner ? (
              <>
                <Link to={`/items/${item.id}/edit`} className="btn-secondary">
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit
                </Link>
                <button type="button" onClick={() => setDeleteOpen(true)} className="btn-danger-outline">
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </button>
              </>
            ) : myClaim ? (
              <p className="text-sm">
                You already sent a claim for this item.{" "}
                <Link to={`/claims/${myClaim.id}`} className="font-semibold text-brand-800 hover:underline dark:text-brand-300">
                  View my claim
                </Link>
              </p>
            ) : canBeClaimed ? (
              <button type="button" onClick={openClaim} className="btn-primary">
                <HandHeart className="size-4" aria-hidden="true" />
                {isFoundItem ? "Claim this item" : "I found this item"}
              </button>
            ) : (
              <p className="text-sm text-muted dark:text-stone-400">
                This item is {item.status} and can't be claimed anymore.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Claim modal */}
      <Modal
        isOpen={claimOpen}
        onClose={() => setClaimOpen(false)}
        title={sentClaim ? "Claim sent!" : `Claim "${item.title}"`}
        description={
          !currentUser
            ? "You need an account to send a claim."
            : sentClaim
              ? `${poster?.name ?? "The poster"} will review your message and reply on the claim page.`
              : `Tell ${poster?.name.split(" ")[0] ?? "the poster"} why this is a match. Mention details only the real owner would know.`
        }
        footer={claimFooter}
      >
        {currentUser && !sentClaim && (
          <form id="claim-form" onSubmit={submitClaim} noValidate>
            <label htmlFor="claim-message" className="form-label">
              Message
            </label>
            <textarea
              id="claim-message"
              rows={4}
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setMessageError("");
              }}
              placeholder="e.g. It has a scratch on the right side and my initials inside."
              aria-invalid={messageError ? true : undefined}
              aria-describedby={messageError ? "claim-error claim-count" : "claim-count"}
              className="form-input resize-none"
            />
            <div className="flex justify-between gap-4">
              {messageError ? (
                <p id="claim-error" className="form-error">{messageError}</p>
              ) : (
                <span />
              )}
              <p id="claim-count" className="mt-1.5 shrink-0 text-xs text-muted">
                {message.length}/{MESSAGE_MAX}
              </p>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this item?"
        description={`"${item.title}" and any claims on it will be removed. This can't be undone.`}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setDeleteOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={confirmDelete} className="btn-danger">
              Yes, delete
            </button>
          </>
        }
      />
    </main>
  );
}
