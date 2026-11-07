/**
 * Mock data for Phase 1 (no backend yet).
 * These arrays are the starting state for DataContext. Any add, edit or delete
 * changes the copy in React state only, so everything resets on page refresh.
 *
 * Entities: Items, Locations, Claims, Users
 */

// Shared option lists so forms, filters and badges all use the same values
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

export const initialUsers = [
  {
    id: 1,
    name: "Sara Abdo",
    email: "sara.abdo@lau.edu",
    password: "password123",
    studentId: "202102345",
    role: "student",
    joinedAt: "2026-09-01",
  },
  {
    id: 2,
    name: "Mariam Abadi",
    email: "mariam.abadi@lau.edu",
    password: "password123",
    studentId: "202104567",
    role: "student",
    joinedAt: "2026-09-03",
  },
  {
    id: 3,
    name: "Amira Hallal",
    email: "amira.hallal@lau.edu",
    password: "password123",
    studentId: "202201234",
    role: "student",
    joinedAt: "2026-09-10",
  },
  {
    id: 4,
    name: "Roua Youness",
    email: "roua.youness@lau.edu",
    password: "password123",
    studentId: "202203456",
    role: "student",
    joinedAt: "2026-09-15",
  },
];

export const initialLocations = [
  {
    id: 1,
    name: "Main Library",
    code: "LIB",
    description:
      "Four floors of study spaces, computer labs and group rooms. Most reports here are chargers, bottles and clothing left at study desks.",
    hours: "Mon to Fri 8:00 to 22:00, Sat 9:00 to 17:00",
    dropOffPoint: "Front desk, ground floor",
    image: "/images/locations/library.svg",
  },
  {
    id: 2,
    name: "Engineering Building",
    code: "ENG",
    description:
      "Classrooms, workshops and engineering labs. Check the lab assistants' office for items left after lab sessions.",
    hours: "Mon to Fri 7:30 to 20:00",
    dropOffPoint: "Lab assistants' office, room 104",
    image: "/images/locations/engineering.svg",
  },
  {
    id: 3,
    name: "Science Building",
    code: "SCI",
    description:
      "Biology, chemistry and physics labs plus large lecture halls. Lab coats and textbooks are reported here often.",
    hours: "Mon to Fri 7:30 to 19:00",
    dropOffPoint: "Department secretary, 2nd floor",
    image: "/images/locations/science.svg",
  },
  {
    id: 4,
    name: "Student Center & Cafeteria",
    code: "CAF",
    description:
      "The busiest spot on campus: cafeteria, lounges and club offices. ID cards and wallets are usually handed to the info desk.",
    hours: "Mon to Sat 7:00 to 21:00",
    dropOffPoint: "Information desk, main entrance",
    image: "/images/locations/cafeteria.svg",
  },
  {
    id: 5,
    name: "Sports Complex",
    code: "GYM",
    description:
      "Gym, indoor courts and locker rooms. Keys, bottles and towels are often found in the locker area.",
    hours: "Mon to Sat 6:30 to 22:00",
    dropOffPoint: "Reception, gym entrance",
    image: "/images/locations/sports.svg",
  },
  {
    id: 6,
    name: "Business School",
    code: "BUS",
    description:
      "Classrooms, the trading room and faculty offices. Phones and calculators are the most common reports.",
    hours: "Mon to Fri 8:00 to 19:00",
    dropOffPoint: "Dean's office reception, 1st floor",
    image: "/images/locations/business.svg",
  },
];

export const initialItems = [
  {
    id: 1,
    type: "found",
    title: "Black JBL Headphones",
    category: "Electronics",
    locationId: 1,
    date: "2026-11-05",
    description:
      "Found on a desk on the 3rd floor of the library, near the windows. Over-ear, foldable.",
    image: "/images/items/item-1.svg",
    status: "open",
    postedBy: 2,
    color: "Black",
    brand: "JBL",
    marks: "Small scratch on the right ear cup",
    createdAt: "2026-11-05T16:20:00",
  },
  {
    id: 2,
    type: "lost",
    title: "LAU Student ID Card",
    category: "ID & Cards",
    locationId: 4,
    date: "2026-11-06",
    description:
      "Lost my student ID somewhere between the cafeteria and the bookstore around lunch time.",
    image: "/images/items/item-2.svg",
    status: "open",
    postedBy: 1,
    color: "White and green",
    brand: "",
    marks: "Name on the card: Sara Abdo",
    createdAt: "2026-11-06T13:05:00",
  },
  {
    id: 3,
    type: "found",
    title: "Car Keys with Blue Keychain",
    category: "Keys",
    locationId: 5,
    date: "2026-11-04",
    description:
      "Found in the women's locker room. Kia car key with a blue rubber keychain shaped like a star.",
    image: "/images/items/item-3.svg",
    status: "claimed",
    postedBy: 3,
    color: "Blue keychain",
    brand: "Kia",
    marks: "Star-shaped keychain",
    createdAt: "2026-11-04T19:45:00",
  },
  {
    id: 4,
    type: "lost",
    title: "Grey North Face Backpack",
    category: "Bags",
    locationId: 2,
    date: "2026-11-03",
    description:
      "Left it in room 210 after the Circuits lecture. Has a laptop sleeve and a red pencil case inside.",
    image: "/images/items/item-4.svg",
    status: "open",
    postedBy: 4,
    color: "Grey",
    brand: "The North Face",
    marks: "Keyring with a small Eiffel Tower on the zip",
    createdAt: "2026-11-03T11:30:00",
  },
  {
    id: 5,
    type: "found",
    title: "Green Hydro Flask Bottle",
    category: "Bottles",
    locationId: 5,
    date: "2026-11-02",
    description:
      "Found next to the treadmills at the gym on Monday evening. 32 oz, wide mouth lid.",
    image: "/images/items/item-5.svg",
    status: "open",
    postedBy: 1,
    color: "Green",
    brand: "Hydro Flask",
    marks: "Stickers near the bottom",
    createdAt: "2026-11-02T20:10:00",
  },
  {
    id: 6,
    type: "found",
    title: "Calculus Textbook (Stewart, 8th ed.)",
    category: "Books & Notes",
    locationId: 3,
    date: "2026-10-30",
    description:
      "Left in lecture hall B after the 9:30 class. Some pages have notes in pencil.",
    image: "/images/items/item-6.svg",
    status: "open",
    postedBy: 1,
    color: "",
    brand: "Stewart",
    marks: "Initials written on the first page",
    createdAt: "2026-10-30T10:55:00",
  },
  {
    id: 7,
    type: "lost",
    title: "iPhone 14 with Clear Case",
    category: "Electronics",
    locationId: 6,
    date: "2026-11-01",
    description:
      "Probably left it in the trading room. Purple iPhone 14, clear case with a photo inside the back.",
    image: "/images/items/item-7.svg",
    status: "open",
    postedBy: 2,
    color: "Purple",
    brand: "Apple",
    marks: "Cracked corner on the screen protector",
    createdAt: "2026-11-01T15:40:00",
  },
  {
    id: 8,
    type: "found",
    title: "Silver Wristwatch",
    category: "Accessories",
    locationId: 4,
    date: "2026-10-29",
    description: "Found on a table in the cafeteria terrace. Metal strap, analog face.",
    image: "/images/items/item-8.svg",
    status: "closed",
    postedBy: 4,
    color: "Silver",
    brand: "Casio",
    marks: "",
    createdAt: "2026-10-29T12:15:00",
  },
  {
    id: 9,
    type: "found",
    title: "Navy LAU Hoodie (Size M)",
    category: "Clothing",
    locationId: 1,
    date: "2026-10-28",
    description: "Left on a chair in group study room 2. Navy blue with the LAU logo.",
    image: "/images/items/item-9.svg",
    status: "open",
    postedBy: 3,
    color: "Navy",
    brand: "LAU Store",
    marks: "Size M",
    createdAt: "2026-10-28T18:00:00",
  },
  {
    id: 10,
    type: "lost",
    title: "Prescription Glasses in Brown Case",
    category: "Accessories",
    locationId: 1,
    date: "2026-10-27",
    description: "Black frame glasses inside a brown leather case. Lost on the 2nd floor.",
    image: "/images/items/item-10.svg",
    status: "closed",
    postedBy: 3,
    color: "Black frame",
    brand: "Ray-Ban",
    marks: "Brown leather case",
    createdAt: "2026-10-27T09:20:00",
  },
  {
    id: 11,
    type: "found",
    title: "USB-C Laptop Charger (65W)",
    category: "Electronics",
    locationId: 2,
    date: "2026-11-06",
    description: "Plugged into the wall in the computer lab, room 118. White Dell charger.",
    image: "/images/items/item-11.svg",
    status: "open",
    postedBy: 2,
    color: "White",
    brand: "Dell",
    marks: "",
    createdAt: "2026-11-06T17:35:00",
  },
  {
    id: 12,
    type: "lost",
    title: "Dorm Room Key",
    category: "Keys",
    locationId: 3,
    date: "2026-11-05",
    description: "Single silver key on a green lanyard. Probably dropped near the chemistry labs.",
    image: "/images/items/item-12.svg",
    status: "open",
    postedBy: 4,
    color: "Silver, green lanyard",
    brand: "",
    marks: "Tag with room number on it",
    createdAt: "2026-11-05T08:50:00",
  },
];

export const initialClaims = [
  {
    id: 1,
    itemId: 5,
    claimantId: 3,
    message:
      "That's my bottle! It has a Lebanese flag sticker near the bottom and a small dent on the lid. I left it at the gym on Monday.",
    date: "2026-11-03",
    status: "pending",
    ownerNote: "",
    decidedAt: "",
  },
  {
    id: 2,
    itemId: 5,
    claimantId: 4,
    message: "I lost a green bottle at the gym this week, I think this might be mine.",
    date: "2026-11-04",
    status: "pending",
    ownerNote: "",
    decidedAt: "",
  },
  {
    id: 3,
    itemId: 3,
    claimantId: 1,
    message:
      "These are my car keys. The keychain is a blue star and the car is a grey Kia Picanto parked in lot B.",
    date: "2026-11-05",
    status: "approved",
    ownerNote: "Keys are with the gym reception, show your ID to pick them up.",
    decidedAt: "2026-11-05",
  },
  {
    id: 4,
    itemId: 6,
    claimantId: 2,
    message: "I think this is my calculus book, I had class in hall B that morning.",
    date: "2026-10-31",
    status: "rejected",
    ownerNote: "The initials inside the book don't match yours, sorry!",
    decidedAt: "2026-11-01",
  },
  {
    id: 5,
    itemId: 1,
    claimantId: 1,
    message:
      "These look like my headphones. There is a scratch on the right side and they are paired to a phone named 'Sara's iPhone'.",
    date: "2026-11-06",
    status: "pending",
    ownerNote: "",
    decidedAt: "",
  },
  {
    id: 6,
    itemId: 2,
    claimantId: 4,
    message:
      "I found an ID card with your name on the cafeteria terrace and gave it to the information desk.",
    date: "2026-11-07",
    status: "pending",
    ownerNote: "",
    decidedAt: "",
  },
];
