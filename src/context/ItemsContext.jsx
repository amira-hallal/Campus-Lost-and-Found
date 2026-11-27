/**
 * Compatibility hook for the older list and report form. Item state itself
 * belongs to DataContext so the dashboard, list, details, and locations share it.
 */
import { useMemo } from "react";
import { useData } from "./DataContext";

const statusToType = (status) => (String(status).toLowerCase() === "lost" ? "lost" : "found");

export function useItems() {
  const data = useData();
  const items = useMemo(() => data.items.map((item) => ({
    ...item,
    name: item.title,
    status: item.type === "lost" ? "Lost" : "Found",
    building: data.locations.find((location) => location.id === item.locationId)?.name ?? "Campus",
  })), [data.items, data.locations]);

  const addItem = (form) => {
    const location = data.locations.find((entry) => entry.name === form.building);
    return data.addItem({
      title: form.name.trim(),
      type: statusToType(form.status),
      category: form.category,
      locationId: location?.id ?? data.locations[0]?.id,
      date: form.date,
      description: form.description.trim(),
      image: form.image.trim(),
      postedBy: form.postedBy,
      color: form.color ?? "",
      brand: form.brand ?? "",
      marks: form.marks ?? "",
    });
  };

  const updateItem = (id, form) => {
    const location = data.locations.find((entry) => entry.name === form.building);
        return data.updateItem(id, {
      title: form.name.trim(),
      type: statusToType(form.status),
      category: form.category,
      locationId: location?.id ?? data.getItem(id)?.locationId,
      date: form.date,
      description: form.description.trim(),
      image: form.image.trim(),
    });
  };

  return { items, addItem, updateItem, deleteItem: data.deleteItem };
}
