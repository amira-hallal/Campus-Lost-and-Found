import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/format";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { items, claims, getItem, getLocation, getUser, deleteItem } = useData();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const myItems = items.filter((item) => item.postedBy === currentUser.id);
  const myClaims = claims.filter((claim) => claim.claimantId === currentUser.id);
  const claimsOnMyItems = claims.filter(
    (claim) => getItem(claim.itemId)?.postedBy === currentUser.id
  );
  const foundCount = myItems.filter((item) => item.type === "found").length;

  function handleDelete(itemId) {
    if (window.confirm("Delete this item report?")) {
      deleteItem(itemId);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f6f0] px-5 py-10 text-[#213b31] dark:bg-night-900 dark:text-stone-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#39785a]">
          Your account
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Welcome, {currentUser.name}
        </h1>
        <p className="mt-2 text-sm text-[#6d776f] dark:text-stone-400">
          Here are your reports and claims.
        </p>

        <section className="mt-6 rounded-2xl border border-[#e2e6de] bg-white p-5 dark:border-night-700 dark:bg-night-800">
          <h2 className="font-semibold">{currentUser.name}</h2>
          <p className="mt-1 text-sm text-[#6d776f] dark:text-stone-400">
            {currentUser.email}
          </p>
          <p className="mt-1 text-sm text-[#6d776f] dark:text-stone-400">
            Student ID: {currentUser.studentId}
          </p>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <Stat title="My reports" number={myItems.length} />
          <Stat title="Claims I made" number={myClaims.length} />
          <Stat title="Found reports" number={foundCount} />
        </section>

        <section className="mt-8 rounded-2xl border border-[#e2e6de] bg-white p-5 dark:border-night-700 dark:bg-night-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">My reports</h2>
            <Link
              to="/items/new"
              className="rounded-lg bg-[#216747] px-4 py-2 text-sm font-semibold text-white"
            >
              Report an item +
            </Link>
          </div>

          {myItems.length === 0 ? (
            <p className="py-6 text-sm text-[#6d776f] dark:text-stone-400">
              You haven’t reported any items yet.
            </p>
          ) : (
            myItems.map((item) => {
              const location = getLocation(item.locationId);

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e9] py-4 dark:border-night-700"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-[#6d776f] dark:text-stone-400">
                      {item.type} · {location?.name || location?.building || "Campus"} ·{" "}
                      {formatDate(item.date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <Link
                      to={`/items/${item.id}/edit`}
                      className="text-sm text-[#216747] dark:text-brand-300"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-red-700 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#e2e6de] bg-white p-5 dark:border-night-700 dark:bg-night-800">
            <h2 className="text-lg font-semibold">Claims I made</h2>

            {myClaims.length === 0 ? (
              <p className="py-6 text-sm text-[#6d776f] dark:text-stone-400">
                You haven’t made any claims yet.
              </p>
            ) : (
              myClaims.map((claim) => {
                const item = getItem(claim.itemId);

                return (
                  <Link
                    key={claim.id}
                    to={`/claims/${claim.id}`}
                    className="flex items-center justify-between gap-3 border-b border-[#edf0e9] py-4 dark:border-night-700"
                  >
                    <span>{item?.title || `Item #${claim.itemId}`}</span>
                    <StatusBadge status={claim.status} />
                  </Link>
                );
              })
            )}
          </section>

          <section className="rounded-2xl border border-[#e2e6de] bg-white p-5 dark:border-night-700 dark:bg-night-800">
            <h2 className="text-lg font-semibold">Claims on my reports</h2>

            {claimsOnMyItems.length === 0 ? (
              <p className="py-6 text-sm text-[#6d776f] dark:text-stone-400">
                There are no claims on your reports yet.
              </p>
            ) : (
              claimsOnMyItems.map((claim) => {
                const item = getItem(claim.itemId);
                const claimant = getUser(claim.claimantId);

                return (
                  <Link
                    key={claim.id}
                    to={`/claims/${claim.id}`}
                    className="block border-b border-[#edf0e9] py-4 dark:border-night-700"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{item?.title || `Item #${claim.itemId}`}</span>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="mt-1 text-sm text-[#6d776f] dark:text-stone-400">
                      Claim by {claimant?.name || "A student"}
                    </p>
                  </Link>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ title, number }) {
  return (
    <div className="rounded-2xl border border-[#e2e6de] bg-white p-5 dark:border-night-700 dark:bg-night-800">
      <p className="text-sm text-[#6d776f] dark:text-stone-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{number}</p>
    </div>
  );
}