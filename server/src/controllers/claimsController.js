/**
 * Claims API. The rules match the frontend (DataContext, ItemDetail and
 * ClaimDetail). The signed-in user always comes from req.user, never the body.
 */
import mongoose from "mongoose";
import { CLAIM_STATUSES } from "../../../src/data/mockData.js";
import { todayISO } from "../../../src/utils/format.js";
import { ApiError } from "../errors/ApiError.js";
import { Claim } from "../models/Claim.js";
import { nextId } from "../models/Counter.js";
import { Item } from "../models/Item.js";
import { parsePagination, parsePositiveInteger } from "./requestParsers.js";

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;
const NOTE_MAX = 200;

function readBody(req, allowed) {
  const body = req.body ?? {};
  if (Array.isArray(body) || typeof body !== "object") {
    throw new ApiError(400, "VALIDATION_ERROR", "Request body must be a JSON object.");
  }
  const unsupported = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unsupported.length) {
    throw new ApiError(400, "UNSUPPORTED_FIELDS", "One or more fields cannot be set.", { fields: unsupported });
  }
  return body;
}

function validateMessage(value) {
  const message = typeof value === "string" ? value.trim() : "";
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    throw new ApiError(400, "VALIDATION_ERROR", `message must be ${MESSAGE_MIN} to ${MESSAGE_MAX} characters.`);
  }
  return message;
}

async function findClaim(id, session = null) {
  const claim = await Claim.findOne({ id }).select("-_id").session(session).lean();
  if (!claim) throw new ApiError(404, "CLAIM_NOT_FOUND", "No claim was found with that id.");
  return claim;
}

function notPending() {
  return new ApiError(409, "CLAIM_NOT_PENDING", "Only a pending claim can be changed.");
}

// Load a claim that the signed-in user made and that is still pending.
async function findOwnPendingClaim(req) {
  const claim = await findClaim(parsePositiveInteger(req.params.id, "id"));
  if (claim.claimantId !== req.user.id) {
    throw new ApiError(403, "FORBIDDEN", "Only the person who made this claim can do that.");
  }
  if (claim.status !== "pending") throw notPending();
  return claim;
}

export async function listClaims(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { status } = req.query;
  if (status !== undefined && !CLAIM_STATUSES.includes(status)) {
    throw new ApiError(400, "INVALID_QUERY", "status is not recognized.");
  }
  const filter = status ? { status } : {};
  for (const field of ["itemId", "claimantId"]) {
    if (req.query[field] !== undefined) filter[field] = parsePositiveInteger(req.query[field], field);
  }
  const [data, total] = await Promise.all([
    Claim.find(filter).select("-_id").sort({ date: -1, id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Claim.countDocuments(filter),
  ]);
  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function getClaim(req, res) {
  res.json({ data: await findClaim(parsePositiveInteger(req.params.id, "id")) });
}

export async function createClaim(req, res) {
  const body = readBody(req, ["itemId", "message"]);
  const itemId = Number(body.itemId);
  if (!Number.isInteger(itemId) || itemId < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "itemId must be a positive integer.");
  }
  const message = validateMessage(body.message);
  const claimantId = req.user.id;
  let id;

  try {
    await mongoose.connection.transaction(async (session) => {
      // Writing to the item makes this conflict with a simultaneous approval.
      const item = await Item.findOneAndUpdate(
        { id: itemId },
        { $inc: { claimRevision: 1 } },
        { session, returnDocument: "after" },
      ).lean();
      if (!item) throw new ApiError(404, "ITEM_NOT_FOUND", "No item report was found with that id.");
      if (item.postedBy === claimantId) {
        throw new ApiError(403, "FORBIDDEN", "You cannot claim your own report.");
      }
      if (item.status !== "open") throw new ApiError(409, "ITEM_NOT_OPEN", "This item can no longer be claimed.");
      id = await nextId(Claim.modelName); // only after the checks pass
      await Claim.create([{ id, itemId, claimantId, message, date: todayISO() }], { session });
    });
  } catch (error) {
    // 11000 = the unique (itemId, claimantId) index rejected a second claim.
    if (error.code === 11000) throw new ApiError(409, "DUPLICATE_CLAIM", "You already have a claim on this item.");
    throw error;
  }

  res.status(201).json({ data: await findClaim(id) });
}

export async function updateClaim(req, res) {
  const claim = await findOwnPendingClaim(req);
  const message = validateMessage(readBody(req, ["message"]).message);
  // The status filter stops an edit that arrives just after a decision.
  const updated = await Claim.findOneAndUpdate(
    { id: claim.id, status: "pending" },
    { $set: { message } },
    { returnDocument: "after" },
  ).select("-_id").lean();
  if (!updated) throw notPending();
  res.json({ data: updated });
}

// Used by both DELETE and /withdraw: withdrawing removes the claim.
export async function withdrawClaim(req, res) {
  const claim = await findOwnPendingClaim(req);
  const { deletedCount } = await Claim.deleteOne({ id: claim.id, status: "pending" });
  if (!deletedCount) throw notPending();
  res.status(204).end();
}

/**
 * Approve or reject a pending claim (item reporter only). Approving also marks
 * the item as claimed and rejects its other pending claims. The transaction
 * saves all of these changes or none of them.
 */
function decideClaim(status) {
  return async (req, res) => {
    const id = parsePositiveInteger(req.params.id, "id");
    const { ownerNote = "" } = readBody(req, ["ownerNote"]);
    if (typeof ownerNote !== "string" || ownerNote.trim().length > NOTE_MAX) {
      throw new ApiError(400, "VALIDATION_ERROR", `ownerNote must be text of ${NOTE_MAX} characters or fewer.`);
    }

    const decided = await mongoose.connection.transaction(async (session) => {
      const claim = await findClaim(id, session);
      const item = await Item.findOne({ id: claim.itemId }).session(session).lean();
      if (item?.postedBy !== req.user.id) {
        throw new ApiError(403, "FORBIDDEN", "Only the person who reported this item can decide its claims.");
      }
      if (claim.status !== "pending") throw notPending();

      const decidedAt = todayISO();
      if (status === "approved") {
        const { modifiedCount } = await Item.updateOne(
          { id: item.id, status: "open" },
          { $set: { status: "claimed" } },
          { session },
        );
        if (!modifiedCount) throw new ApiError(409, "ITEM_NOT_OPEN", "This item is no longer open.");
        await Claim.updateMany(
          { itemId: item.id, status: "pending", id: { $ne: id } },
          { $set: { status: "rejected", ownerNote: "Another claim for this item was approved.", decidedAt } },
          { session },
        );
      }

      return Claim.findOneAndUpdate(
        { id },
        { $set: { status, ownerNote: ownerNote.trim(), decidedAt } },
        { session, returnDocument: "after" },
      ).select("-_id").lean();
    });

    res.json({ data: decided });
  };
}

export const approveClaim = decideClaim("approved");
export const rejectClaim = decideClaim("rejected");
