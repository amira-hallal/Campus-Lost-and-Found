import { createContext, useContext, useEffect, useState } from "react";
import initialItems from "../data/items";

const ItemsContext = createContext();

export function ItemsProvider({ children }) {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("mars-items");

    if (savedItems) {
      try {
        return JSON.parse(savedItems);
      } catch {
        return initialItems;
      }
    }

    return initialItems;
  });

  useEffect(() => {
    localStorage.setItem("mars-items", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem) => {
    const itemWithId = {
      ...newItem,
      id: Date.now(),
    };

    setItems((previousItems) => [itemWithId, ...previousItems]);
  };

  const updateItem = (id, updatedItem) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === Number(id) ? { ...item, ...updatedItem } : item
      )
    );
  };

  const deleteItem = (id) => {
    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== Number(id))
    );
  };

  return (
    <ItemsContext.Provider
      value={{ items, addItem, updateItem, deleteItem }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  return useContext(ItemsContext);
}