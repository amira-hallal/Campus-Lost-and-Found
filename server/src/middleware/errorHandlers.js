import { ApiError } from "../errors/ApiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, "ROUTE_NOT_FOUND", `No route for ${req.method} ${req.path}`));
}

// Express error middleware must keep all four parameters, including `next`.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const isBadJson = error?.type === "entity.parse.failed";
  const status = error instanceof ApiError ? error.status : isBadJson ? 400 : 500;
  const code = error instanceof ApiError ? error.code : isBadJson ? "INVALID_JSON" : "INTERNAL_ERROR";
  const message = error instanceof ApiError
    ? error.message
    : isBadJson
      ? "Request body must contain valid JSON."
      : "An unexpected server error occurred.";

  if (status >= 500) {
    process.stderr.write(`${JSON.stringify({
      level: "error",
      event: "request_error",
      requestId: req.requestId,
      message: error?.message ?? "Unknown error",
      at: new Date().toISOString(),
    })}\n`);
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(error instanceof ApiError && error.details ? { details: error.details } : {}),
      requestId: req.requestId,
    },
  });
}
