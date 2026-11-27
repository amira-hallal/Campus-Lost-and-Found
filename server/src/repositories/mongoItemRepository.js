/** Database storage for items, with the same methods as the in-memory repository. */
import mongoose from "mongoose";
import { Claim } from "../models/Claim.js";
import { nextId } from "../models/Counter.js";
import { Item } from "../models/Item.js";

const hidden = "-_id -claimRevision";

export const itemRepository = {
  async findAll() {
    return Item.find().select(hidden).lean();
  },

  async findById(id) {
    return Item.findOne({ id: Number(id) }).select(hidden).lean();
  },

  async create(data) {
    const id = await nextId(Item.modelName);
    await Item.create({ ...data, id, status: "open", createdAt: new Date().toISOString() });
    return this.findById(id);
  },

  async update(id, changes) {
    return Item.findOneAndUpdate(
      { id: Number(id) },
      { $set: changes },
      { returnDocument: "after", runValidators: true },
    ).select(hidden).lean();
  },

  // Deleting an item also removes the claims made on it (both or neither).
  async remove(id) {
    return mongoose.connection.transaction(async (session) => {
      const { deletedCount } = await Item.deleteOne({ id: Number(id) }, { session });
      if (deletedCount) await Claim.deleteMany({ itemId: Number(id) }, { session });
      return deletedCount > 0;
    });
  },
};
