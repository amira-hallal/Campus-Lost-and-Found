import { ApiError } from "../errors/ApiError.js";

export function parsePositiveInteger(value, field, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, "INVALID_QUERY", `${field} must be a positive integer.`);
  }
  return parsed;
}

export function parsePagination(query) {
  return {
    page: parsePositiveInteger(query.page, "page", 1),
    limit: Math.min(parsePositiveInteger(query.limit, "limit", 20), 100),
  };
}
