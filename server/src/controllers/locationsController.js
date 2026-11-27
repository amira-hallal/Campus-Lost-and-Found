import { ApiError } from "../errors/ApiError.js";
import { Location } from "../models/Location.js";
import { parsePagination, parsePositiveInteger } from "./requestParsers.js";

export async function listLocations(req, res) {
  const { page, limit } = parsePagination(req.query);
  const [data, total] = await Promise.all([
    Location.find().select("-_id").sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Location.countDocuments(),
  ]);
  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function getLocation(req, res) {
  const id = parsePositiveInteger(req.params.id, "id");
  const location = await Location.findOne({ id }).select("-_id").lean();
  if (!location) throw new ApiError(404, "LOCATION_NOT_FOUND", "No location was found with that id.");
  res.json({ data: location });
}
