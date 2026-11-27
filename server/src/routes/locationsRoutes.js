import { Router } from "express";
import { getLocation, listLocations } from "../controllers/locationsController.js";

const router = Router();

// Buildings are fixed reference data, so the API only reads them.
router.get("/", listLocations);
router.get("/:id", getLocation);

export default router;
