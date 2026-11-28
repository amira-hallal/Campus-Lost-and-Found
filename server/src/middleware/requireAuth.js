import jwt from "jsonwebtoken";
import { ApiError } from "../errors/ApiError.js";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "Please sign in first.");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ApiError(500, "SERVER_CONFIG_ERROR", "JWT_SECRET is not set.");
  }

  let payload;

  try {
    payload = jwt.verify(token, secret);
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "Your sign-in token is invalid or expired.");
  }

  if (!payload || typeof payload !== "object" || !Number.isInteger(payload.id)) {
    throw new ApiError(401, "UNAUTHORIZED", "Your sign-in token is invalid.");
  }

  req.user = { id: payload.id };
  next();
}