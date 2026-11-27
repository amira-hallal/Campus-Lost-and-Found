import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  // bcrypt hash only, never the password. Left out of queries unless requested.
  passwordHash: { type: String, required: true, select: false },
  studentId: String,
  role: { type: String, default: "student" },
  joinedAt: String, // YYYY-MM-DD
}, { versionKey: false });

export const User = mongoose.model("User", userSchema);
