import { randomUUID } from "node:crypto";

/** Log request metadata only; never log bodies, cookies, or query values. */
export function requestLogger(req, res, next) {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    process.stdout.write(`${JSON.stringify({
      level: "info",
      event: "http_request",
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      at: new Date().toISOString(),
    })}\n`);
  });

  next();
}
