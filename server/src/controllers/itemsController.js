import { ApiError } from "../errors/ApiError.js";
import { itemRepository } from "../repositories/mongoItemRepository.js";

const itemTypes = new Set(["lost", "found"]);
const itemStatuses = new Set(["open", "claimed", "closed"]);
const itemCategories = new Set([
  "Electronics",
  "Bags",
  "Keys",
  "ID & Cards",
  "Clothing",
  "Books & Notes",
  "Bottles",
  "Accessories",
  "Other",
]);

function validateItem(data, { partial = false } = {}) {
  const errors = {};

  const checkString = (field, { min = 1, max, required = true } = {}) => {
    if (partial && !(field in data)) return;

    const value = data[field];

    if (typeof value !== "string" || (required && !value.trim())) {
      errors[field] = `${field} is required.`;
      return;
    }

    if (typeof value === "string" && value.trim().length < min) {
      errors[field] = `${field} must be at least ${min} characters.`;
    }

    if (typeof value === "string" && max && value.trim().length > max) {
      errors[field] = `${field} must be ${max} characters or fewer.`;
    }
  };

  checkString("title", { min: 2, max: 120 });

  if (!partial || "type" in data) {
    if (!itemTypes.has(data.type)) {
      errors.type = "type must be either 'lost' or 'found'.";
    }
  }

  if (!partial || "category" in data) {
    if (!itemCategories.has(data.category)) {
      errors.category = "Choose a valid item category.";
    }
  }

  if (!partial || "locationId" in data) {
    if (!Number.isInteger(Number(data.locationId)) || Number(data.locationId) < 1) {
      errors.locationId = "locationId must be a positive integer.";
    }
  }

  if (!partial || "date" in data) {
    if (
      typeof data.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      Number.isNaN(Date.parse(`${data.date}T00:00:00Z`))
    ) {
      errors.date = "date must use YYYY-MM-DD format.";
    }
  }

  checkString("description", { min: 10, max: 1000 });

  if (!partial || "postedBy" in data) {
    if (!Number.isInteger(Number(data.postedBy)) || Number(data.postedBy) < 1) {
      errors.postedBy = "postedBy must be a positive user id.";
    }
  }

  for (const field of ["image", "color", "brand", "marks"]) {
    if (partial && !(field in data)) continue;

    const value = data[field];

    if (value !== undefined && value !== null && typeof value !== "string") {
      errors[field] = `${field} must be text.`;
    }

    if (typeof value === "string" && value.length > 500) {
      errors[field] = `${field} must be 500 characters or fewer.`;
    }
  }

  if ("status" in data && !itemStatuses.has(data.status)) {
    errors.status = "status must be open, claimed, or closed.";
  }

  if (Object.keys(errors).length) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Check the item fields and try again.",
      errors,
    );
  }
}

function parsePositiveInteger(value, field, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, "INVALID_QUERY", `${field} must be a positive integer.`);
  }

  return parsed;
}

function parseItemId(value) {
  return parsePositiveInteger(value, "id");
}

export async function listItems(req, res) {
  const page = parsePositiveInteger(req.query.page, "page", 1);
  const limit = Math.min(parsePositiveInteger(req.query.limit, "limit", 20), 100);
  const { type, category, status, q, from, to, sort = "newest" } = req.query;

  const locationId =
    req.query.locationId === undefined
      ? undefined
      : parsePositiveInteger(req.query.locationId, "locationId");

  if (type && !itemTypes.has(type)) {
    throw new ApiError(400, "INVALID_QUERY", "type must be 'lost' or 'found'.");
  }

  if (category && !itemCategories.has(category)) {
    throw new ApiError(400, "INVALID_QUERY", "category is not recognized.");
  }

  if (status && !itemStatuses.has(status)) {
    throw new ApiError(400, "INVALID_QUERY", "status is not recognized.");
  }

  if (sort !== "newest" && sort !== "oldest") {
    throw new ApiError(400, "INVALID_QUERY", "sort must be 'newest' or 'oldest'.");
  }

  if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    throw new ApiError(400, "INVALID_QUERY", "from must use YYYY-MM-DD format.");
  }

  if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    throw new ApiError(400, "INVALID_QUERY", "to must use YYYY-MM-DD format.");
  }

  if (from && to && from > to) {
    throw new ApiError(400, "INVALID_QUERY", "from must be on or before to.");
  }

  const query = typeof q === "string" ? q.trim().toLowerCase() : "";
  const allItems = await itemRepository.findAll();

  const filtered = allItems
    .filter((item) => !type || item.type === type)
    .filter((item) => !category || item.category === category)
    .filter((item) => !status || item.status === status)
    .filter(
      (item) =>
        locationId === undefined || Number(item.locationId) === locationId,
    )
    .filter(
      (item) =>
        !query ||
        `${item.title} ${item.description}`.toLowerCase().includes(query),
    )
    .filter((item) => !from || item.date >= from)
    .filter((item) => !to || item.date <= to)
    .sort(
      (a, b) =>
        (sort === "newest"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date)) || b.id - a.id,
    );

  const total = filtered.length;
  const data = filtered.slice((page - 1) * limit, page * limit);

  res.json({
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getItem(req, res) {
  const item = await itemRepository.findById(parseItemId(req.params.id));

  if (!item) {
    throw new ApiError(404, "ITEM_NOT_FOUND", "No item report was found with that id.");
  }

  res.json({ data: item });
}

export async function createItem(req, res) {
  const body = req.body;

  if (!body || Array.isArray(body) || typeof body !== "object") {
    throw new ApiError(400, "VALIDATION_ERROR", "Request body must be a JSON object.");
  }

  // The owner ID comes from the verified token, not from the request body.
  validateItem({ ...body, postedBy: req.user.id });

  const fields = [
    "title",
    "type",
    "category",
    "locationId",
    "date",
    "description",
    "image",
    "color",
    "brand",
    "marks",
  ];

  const payload = Object.fromEntries(
    fields
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  );

  payload.title = payload.title.trim();
  payload.description = payload.description.trim();
  payload.locationId = Number(payload.locationId);
  payload.postedBy = req.user.id;

  const item = await itemRepository.create(payload);
  res.status(201).json({ data: item });
}

export async function updateItem(req, res) {
  const id = parseItemId(req.params.id);
  const existing = await itemRepository.findById(id);

  if (!existing) {
    throw new ApiError(404, "ITEM_NOT_FOUND", "No item report was found with that id.");
  }

  if (existing.postedBy !== req.user.id) {
    throw new ApiError(403, "FORBIDDEN", "You can only edit your own item reports.");
  }

  const body = req.body;

  if (
    !body ||
    Array.isArray(body) ||
    typeof body !== "object" ||
    Object.keys(body).length === 0
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "Provide at least one item field to update.");
  }

  const allowed = new Set([
    "title",
    "type",
    "category",
    "locationId",
    "date",
    "description",
    "image",
    "status",
    "color",
    "brand",
    "marks",
  ]);

  const unsupported = Object.keys(body).filter((key) => !allowed.has(key));

  if (unsupported.length) {
    throw new ApiError(
      400,
      "UNSUPPORTED_FIELDS",
      "One or more fields cannot be changed.",
      { fields: unsupported },
    );
  }

  validateItem({ ...existing, ...body }, { partial: false });

  const changes = { ...body };

  if (typeof changes.title === "string") {
    changes.title = changes.title.trim();
  }

  if (typeof changes.description === "string") {
    changes.description = changes.description.trim();
  }

  if (changes.locationId !== undefined) {
    changes.locationId = Number(changes.locationId);
  }

  const item = await itemRepository.update(id, changes);
  res.json({ data: item });
}

export async function deleteItem(req, res) {
  const id = parseItemId(req.params.id);
  const existing = await itemRepository.findById(id);

  if (!existing) {
    throw new ApiError(404, "ITEM_NOT_FOUND", "No item report was found with that id.");
  }

  if (existing.postedBy !== req.user.id) {
    throw new ApiError(403, "FORBIDDEN", "You can only delete your own item reports.");
  }

  const removed = await itemRepository.remove(id);

  if (!removed) {
    throw new ApiError(404, "ITEM_NOT_FOUND", "No item report was found with that id.");
  }

  res.status(204).end();
}