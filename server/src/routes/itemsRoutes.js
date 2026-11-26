import { Router } from "express";
import { createItem, deleteItem, getItem, listItems, updateItem } from "../controllers/itemsController.js";

const router = Router();

// Add authentication and reporter ownership checks to writes before deployment.
router.get("/", listItems);
router.get("/:id", getItem);
router.post("/", createItem);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
