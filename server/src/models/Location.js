import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  hours: String,
  dropOffPoint: String,
  image: String,
}, { versionKey: false });

export const Location = mongoose.model("Location", locationSchema);
