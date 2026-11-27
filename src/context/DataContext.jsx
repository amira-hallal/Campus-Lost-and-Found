/**
 * Shared app data (items, locations, claims, users), loaded from the M.A.R.S API.
 * Every page reads and changes data through useData(), so a change on one page
 * shows up on every other page right away.
 *
 * Reading:  items, locations, claims, getItem(id), getLocation(id), getUser(id),
 *           getClaim(id), getClaimsForItem(itemId)
 * Loading:  status ("loading" | "ready" | "error"), loadError, reload()
 * Changing: addItem, updateItem, deleteItem, addClaim, updateClaimStatus,
 *           withdrawClaim. These return Promises: await them, and catch the
 *           ApiError they throw to show the message to the user.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, getAllPages } from "../api/client";

const DataContext = createContext(null);

const ITEM_FIELDS = [
  "title", "type", "category", "locationId", "date", "description",
  "image", "postedBy", "color", "brand", "marks",
];

// Keep only the fields the API accepts, so extra form fields don't cause a 400
const pick = (source, fields) =>
  Object.fromEntries(fields.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState({}); // { [id]: { id, name, ... } }
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  /* ---------- First load (and Retry) ---------- */
  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllPages("/api/items"), getAllPages("/api/claims"), getAllPages("/api/locations")])
      .then(([loadedItems, loadedClaims, loadedLocations]) => {
        if (cancelled) return;
        setItems(loadedItems);
        setClaims(loadedClaims);
        setLocations(loadedLocations);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const reload = useCallback(() => {
    setStatus("loading");
    setLoadError("");
    setReloadCount((count) => count + 1);
  }, []);

  /* ---------- User names ----------
   * Items and claims only store user ids. Names come from GET /api/users/:id
   * (public profile). Each id is asked for once; if the route doesn't exist yet,
   * pages show "Unknown user" instead of a name. */
  const requestedUsers = useRef(new Set());
  const usersRouteMissing = useRef(false);

  const rememberUser = useCallback((user) => {
    if (user?.id) setUsers((current) => ({ ...current, [user.id]: { ...current[user.id], ...user } }));
  }, []);

  useEffect(() => {
    if (usersRouteMissing.current) return;
    const ids = new Set([...items.map((item) => item.postedBy), ...claims.map((claim) => claim.claimantId)]);
    const missing = [...ids].filter((id) => Number.isInteger(id) && !requestedUsers.current.has(id));
    missing.forEach((id) => {
      requestedUsers.current.add(id);
      api
        .get(`/api/users/${id}`)
        .then(({ data }) => rememberUser(data))
        .catch((error) => {
          if (error.code === "ROUTE_NOT_FOUND") usersRouteMissing.current = true;
        });
    });
  }, [items, claims, rememberUser]);

  /* ---------- Lookups (ids from the URL are strings, so convert them) ---------- */
  const getItem = (id) => items.find((item) => item.id === Number(id));
  const getLocation = (id) => locations.find((location) => location.id === Number(id));
  const getUser = (id) => users[Number(id)];
  const getClaim = (id) => claims.find((claim) => claim.id === Number(id));
  const getClaimsForItem = (itemId) => claims.filter((claim) => claim.itemId === Number(itemId));

  const replaceItem = (saved) =>
    setItems((current) => current.map((item) => (item.id === saved.id ? saved : item)));

  /* ---------- Items ---------- */
  const addItem = async (data) => {
    const body = pick({ ...data, locationId: Number(data.locationId) }, ITEM_FIELDS);
    const { data: saved } = await api.post("/api/items", body);
    setItems((current) => [saved, ...current]);
    return saved;
  };

  const updateItem = async (id, changes) => {
    const allowed = ITEM_FIELDS.filter((field) => field !== "postedBy").concat("status");
    const { data: saved } = await api.patch(`/api/items/${Number(id)}`, pick(changes, allowed));
    replaceItem(saved);
    return saved;
  };

  // Deleting an item also removes its claims (the API does the same)
  const deleteItem = async (id) => {
    await api.delete(`/api/items/${Number(id)}`);
    setItems((current) => current.filter((item) => item.id !== Number(id)));
    setClaims((current) => current.filter((claim) => claim.itemId !== Number(id)));
  };

  /* ---------- Claims ---------- */
  // The claimant is the signed-in user (from the token), so only itemId and message are sent
  const addClaim = async ({ itemId, message }) => {
    const { data: saved } = await api.post("/api/claims", { itemId: Number(itemId), message });
    setClaims((current) => [...current, saved]);
    return saved;
  };

  // Approving also marks the item as claimed and rejects its other pending claims,
  // so the item and all its claims are loaded again afterwards.
  const updateClaimStatus = async (claimId, newStatus, ownerNote = "") => {
    const action = newStatus === "approved" ? "approve" : "reject";
    const { data: saved } = await api.post(`/api/claims/${Number(claimId)}/${action}`, { ownerNote });

    if (newStatus === "approved") {
      const [{ data: item }, itemClaims] = await Promise.all([
        api.get(`/api/items/${saved.itemId}`),
        getAllPages(`/api/claims?itemId=${saved.itemId}`),
      ]);
      replaceItem(item);
      setClaims((current) => [...current.filter((claim) => claim.itemId !== saved.itemId), ...itemClaims]);
    } else {
      setClaims((current) => current.map((claim) => (claim.id === saved.id ? saved : claim)));
    }
    return saved;
  };

  const withdrawClaim = async (claimId) => {
    await api.delete(`/api/claims/${Number(claimId)}`);
    setClaims((current) => current.filter((claim) => claim.id !== Number(claimId)));
  };

  const value = {
    status,
    loadError,
    reload,
    items,
    locations,
    claims,
    getItem,
    getLocation,
    getUser,
    getClaim,
    getClaimsForItem,
    rememberUser,
    addItem,
    updateItem,
    deleteItem,
    addClaim,
    updateClaimStatus,
    withdrawClaim,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside <DataProvider>");
  return context;
}
