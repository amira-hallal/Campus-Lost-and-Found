export const ITEM_TYPES = ["lost", "found"];

export const CATEGORIES = [
  "Electronics",
  "Bags",
  "Keys",
  "ID & Cards",
  "Clothing",
  "Books & Notes",
  "Bottles",
  "Accessories",
  "Other",
];

// open = still looking, claimed = a claim was approved, closed = returned / report closed
export const ITEM_STATUSES = ["open", "claimed", "closed"];

export const CLAIM_STATUSES = ["pending", "approved", "rejected"];

// Default picture for items reported without an image
const CATEGORY_IMAGES = {
  Electronics: "/images/categories/electronics.svg",
  Bags: "/images/categories/bags.svg",
  Keys: "/images/categories/keys.svg",
  "ID & Cards": "/images/categories/id-cards.svg",
  Clothing: "/images/categories/clothing.svg",
  "Books & Notes": "/images/categories/books.svg",
  Bottles: "/images/categories/bottles.svg",
  Accessories: "/images/categories/accessories.svg",
  Other: "/images/categories/other.svg",
};

export function getCategoryImage(category) {
  return CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.Other;
}
