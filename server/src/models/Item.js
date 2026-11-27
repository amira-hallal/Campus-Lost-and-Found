import mongoose from "mongoose";
import "./Location.js"; // registers the models that populate() uses
import "./User.js";
import { CATEGORIES, ITEM_STATUSES, ITEM_TYPES } from "../../../src/data/mockData.js";

const itemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  type: { type: String, required: true, enum: ITEM_TYPES },
  title: { type: String, required: true },
  category: { type: String, required: true, enum: CATEGORIES },
  locationId: { type: Number, required: true, index: true }, // -> Location.id
  date: { type: String, required: true }, // YYYY-MM-DD
  description: { type: String, required: true },
  image: String,
  status: { type: String, enum: ITEM_STATUSES, default: "open" },
  postedBy: { type: Number, required: true, index: true }, // -> User.id
  color: String,
  brand: String,
  marks: String,
  createdAt: String,
  // Internal: bumped when a claim is added, so it cannot overlap an approval.
  claimRevision: { type: Number, select: false },
}, { versionKey: false });

// Relationships by numeric id, usable with .populate("poster location")
itemSchema.virtual("poster", { ref: "User", localField: "postedBy", foreignField: "id", justOne: true });
itemSchema.virtual("location", { ref: "Location", localField: "locationId", foreignField: "id", justOne: true });

export const Item = mongoose.model("Item", itemSchema);
