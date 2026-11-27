/* global process */
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const envFile = fileURLToPath(new URL("../../.env", import.meta.url));

/** Connect to the hosted MongoDB database named in MONGODB_URI. */
export async function connectDatabase() {
  // Variables already set by the host take priority over the local .env file.
  try {
    process.loadEnvFile(envFile);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy server/.env.example to server/.env and fill it in.");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}
