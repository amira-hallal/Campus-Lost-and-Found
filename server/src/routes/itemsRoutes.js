import { Router } from "express";
import { createItem, deleteItem, getItem, listItems, updateItem } from "../controllers/itemsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Add authentication and reporter ownership checks to writes before deployment.
router.get("/", listItems);
router.get("/:id", getItem);
router.post("/", requireAuth, createItem);
router.patch("/:id", requireAuth, updateItem);
router.delete("/:id", requireAuth, deleteItem);

export default router;
