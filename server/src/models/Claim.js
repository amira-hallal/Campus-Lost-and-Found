import mongoose from "mongoose";
import "./Item.js"; // registers the models that populate() uses
import "./User.js";
import { CLAIM_STATUSES } from "../../../src/data/mockData.js";

const claimSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  itemId: { type: Number, required: true }, // -> Item.id
  claimantId: { type: Number, required: true, index: true }, // -> User.id
  message: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: CLAIM_STATUSES, default: "pending" },
  ownerNote: { type: String, default: "" },
  decidedAt: { type: String, default: "" },
}, { versionKey: false });

// A user can have only one claim on each item.
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

claimSchema.virtual("item", { ref: "Item", localField: "itemId", foreignField: "id", justOne: true });
claimSchema.virtual("claimant", { ref: "User", localField: "claimantId", foreignField: "id", justOne: true });

export const Claim = mongoose.model("Claim", claimSchema);
