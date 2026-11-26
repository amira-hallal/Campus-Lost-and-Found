/**
 * Development storage. Replace these methods with database calls when
 * persistence is ready, keeping the same method signatures for the routes.
 */
import { initialItems } from "../../../src/data/mockData.js";

let rows = structuredClone(initialItems);
let nextId = Math.max(0, ...rows.map((item) => Number(item.id))) + 1;

const clone = (value) => structuredClone(value);

export const itemRepository = {
  async findAll() {
    return clone(rows);
  },

  async findById(id) {
    const item = rows.find((row) => Number(row.id) === Number(id));
    return item ? clone(item) : null;
  },

  async create(data) {
    const item = {
      ...data,
      id: nextId++,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    rows = [item, ...rows];
    return clone(item);
  },

  async update(id, changes) {
    const index = rows.findIndex((row) => Number(row.id) === Number(id));
    if (index < 0) return null;
    rows[index] = { ...rows[index], ...changes };
    return clone(rows[index]);
  },

  async remove(id) {
    const index = rows.findIndex((row) => Number(row.id) === Number(id));
    if (index < 0) return false;
    rows = rows.filter((row) => Number(row.id) !== Number(id));
    return true;
  },
};
