/**
 * Shared app data (items, locations, claims, users) kept in React state.
 * Every page reads and changes data through useData(), so an add or delete
 * on one page shows up on every other page right away.
 * Nothing is saved: a page refresh resets everything to mockData.js.
 */
import { createContext, useContext, useState } from "react";
import {
  initialClaims,
  initialItems,
  initialLocations,
  initialUsers,
} from "../data/mockData";
import { todayISO } from "../utils/format";

const DataContext = createContext(null);

const nextId = (list) => Math.max(0, ...list.map((entry) => entry.id)) + 1;

export function DataProvider({ children }) {
  const [items, setItems] = useState(initialItems);
  const [claims, setClaims] = useState(initialClaims);
  const [users, setUsers] = useState(initialUsers);
  const locations = initialLocations; // buildings don't change in Phase 1

  /* ---------- Lookups (ids from the URL are strings, so convert them) ---------- */
  const getItem = (id) => items.find((item) => item.id === Number(id));
  const getLocation = (id) => locations.find((location) => location.id === Number(id));
  const getUser = (id) => users.find((user) => user.id === Number(id));
  const getClaim = (id) => claims.find((claim) => claim.id === Number(id));
  const getClaimsForItem = (itemId) => claims.filter((claim) => claim.itemId === Number(itemId));

  /* ---------- Items ---------- */
  const addItem = (data) => {
    const newItem = {
      ...data,
      id: nextId(items),
      locationId: Number(data.locationId),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (id, changes) => {
    setItems((prev) =>
      prev.map((item) => (item.id === Number(id) ? { ...item, ...changes } : item)),
    );
  };

  // Deleting an item also removes the claims made on it
  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== Number(id)));
    setClaims((prev) => prev.filter((claim) => claim.itemId !== Number(id)));
  };

  /* ---------- Claims ---------- */
  const addClaim = ({ itemId, claimantId, message }) => {
    const newClaim = {
      id: nextId(claims),
      itemId: Number(itemId),
      claimantId: Number(claimantId),
      message,
      date: todayISO(),
      status: "pending",
      ownerNote: "",
      decidedAt: "",
    };
    setClaims((prev) => [...prev, newClaim]);
    return newClaim;
  };

  // Approving one claim marks the item as claimed and rejects the other pending claims on it
  const updateClaimStatus = (claimId, status, ownerNote = "") => {
    const claim = getClaim(claimId);
    if (!claim) return;
    const decidedAt = todayISO();

    setClaims((prev) =>
      prev.map((entry) => {
        if (entry.id === claim.id) return { ...entry, status, ownerNote, decidedAt };
        if (status === "approved" && entry.itemId === claim.itemId && entry.status === "pending") {
          return {
            ...entry,
            status: "rejected",
            ownerNote: "Another claim for this item was approved.",
            decidedAt,
          };
        }
        return entry;
      }),
    );

    if (status === "approved") updateItem(claim.itemId, { status: "claimed" });
  };

  const withdrawClaim = (claimId) => {
    setClaims((prev) => prev.filter((claim) => claim.id !== Number(claimId)));
  };

  /* ---------- Users ---------- */
  const addUser = (data) => {
    const newUser = { ...data, id: nextId(users), role: data.role || "student", joinedAt: todayISO() };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const value = {
    items,
    locations,
    claims,
    users,
    getItem,
    getLocation,
    getUser,
    getClaim,
    getClaimsForItem,
    addItem,
    updateItem,
    deleteItem,
    addClaim,
    updateClaimStatus,
    withdrawClaim,
    addUser,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside <DataProvider>");
  return context;
}
