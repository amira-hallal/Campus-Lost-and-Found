/**
 * Fill the database with the frontend's mock data.
 *   npm run seed              only works on an empty database
 *   npm run seed -- --reset   deletes the current data first
 */
/* global process */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { initialClaims, initialItems, initialLocations, initialUsers } from "../../../src/data/mockData.js";
import { Claim } from "../models/Claim.js";
import { Counter } from "../models/Counter.js";
import { Item } from "../models/Item.js";
import { Location } from "../models/Location.js";
import { User } from "../models/User.js";
import { connectDatabase } from "./connect.js";

async function seed() {
  await connectDatabase();
  const models = [User, Location, Item, Claim];
  const reset = process.argv.includes("--reset");

  const counts = await Promise.all(models.map((model) => model.countDocuments()));
  if (!reset && counts.some((count) => count > 0)) {
    throw new Error("The database already has data. Run 'npm run seed -- --reset' to replace it.");
  }

  await Promise.all(models.map((model) => model.init())); // create indexes
  await Promise.all([...models, Counter].map((model) => model.deleteMany({})));

  // Demo passwords are stored only as bcrypt hashes.
  const users = await Promise.all(initialUsers.map(async ({ password, ...user }) => (
    { ...user, passwordHash: await bcrypt.hash(password, 10) }
  )));

  const data = [users, initialLocations, initialItems, initialClaims];
  for (const [index, model] of models.entries()) {
    await model.insertMany(data[index]);
    // New records continue after the highest seeded id.
    await Counter.create({ _id: model.modelName, value: Math.max(...data[index].map((row) => row.id)) });
    process.stdout.write(`${model.modelName}: ${data[index].length} records\n`);
  }
}

try {
  await seed();
} catch (error) {
  process.stderr.write(`Seeding failed: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
