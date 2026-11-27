import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: String,
  value: { type: Number, required: true },
}, { versionKey: false });

export const Counter = mongoose.model("Counter", counterSchema);

/**
 * Return the next numeric id for a collection. Records use numeric ids (like
 * the mock data) and $inc is atomic, so two requests never get the same one.
 */
export async function nextId(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return counter.value;
}
