import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { openApiDocument } from "./openapi.js";
import itemsRoutes from "./routes/itemsRoutes.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(requestLogger);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "mars-campus-lost-found-api" });
});

app.get("/api-docs.json", (_req, res) => res.json(openApiDocument));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: "M.A.R.S API Docs",
  swaggerOptions: { persistAuthorization: false },
}));

app.use("/api/items", itemsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
