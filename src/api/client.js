/**
 * Small helper for calling the M.A.R.S API.
 *
 *   const { data } = await api.get("/api/items?type=found");
 *   const { data } = await api.post("/api/claims", { itemId: 3, message: "..." });
 *
 * - The API address comes from VITE_API_URL (see .env.example). Locally it
 *   defaults to http://localhost:4000.
 * - If the user is signed in, their token is sent as "Authorization: Bearer ...".
 * - Every failure throws an ApiError with a message that is safe to show on screen.
 */

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const TOKEN_KEY = "mars-token";

/* ---------- Saved sign-in token ---------- */

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // storage blocked (private mode)
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore: the user just stays signed in until the tab closes
  }
}

// AuthContext registers a function here so an expired token signs the user out
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/* ---------- Errors ---------- */

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status; // HTTP status, or 0 when the server could not be reached
    this.code = code; // e.g. VALIDATION_ERROR, DUPLICATE_CLAIM
    this.details = details; // e.g. { title: "title is required." }
  }
}

/* ---------- Requests ---------- */

async function request(method, path, body) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return null;

  // The API answers in JSON ({ data, meta } or { error }); anything else is unexpected
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;
    if (response.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new ApiError(
      response.status,
      error?.code ?? "HTTP_ERROR",
      error?.message ?? `The server answered with an error (${response.status}). Please try again.`,
      error?.details,
    );
  }

  return payload ?? {};
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body ?? {}),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

/**
 * Load every page of a list endpoint (the API returns at most 100 per page).
 *   const items = await getAllPages("/api/items");
 */
export async function getAllPages(path) {
  const separator = path.includes("?") ? "&" : "?";
  const rows = [];
  for (let page = 1; ; page += 1) {
    const { data = [], meta } = await api.get(`${path}${separator}limit=100&page=${page}`);
    rows.push(...data);
    if (page >= (meta?.totalPages ?? 1)) return rows;
  }
}
