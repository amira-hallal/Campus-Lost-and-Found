import { ApiError } from "../errors/ApiError.js";

/**
 * Placeholder until sign-in (M3) is connected. The JWT middleware must run
 * first and set req.user = { id: <numeric user id> }. Without it every
 * protected request is rejected, so nothing can be changed anonymously.
 */
export function requireAuth(req, _res, next) {
  if (!Number.isInteger(req.user?.id)) {
    throw new ApiError(401, "UNAUTHORIZED", "Sign in to perform this action.");
  }
  next();
}
