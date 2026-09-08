// ============================================
// FUCK A DRESS CODE - PRODUCT CATALOG
// Edit this file or use the Admin panel to add/edit shirts
// ============================================

const DEFAULT_PRODUCTS = [
  {
    id: "rr-001",
    name: "Richard Ramirez Tee",
    price: 45,
    originalPrice: null, // set if on sale
    description: "Hand-painted one-of-one. Night stalker energy. Edgy as fuck. Each piece is unique — no two are the same.",
    image: "https://placehold.co/600x750/111/fff?text=Richard+Ramirez+Tee",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 2, M: 3, L: 2, XL: 1, XXL: 0 },
    category: "tees",
    tags: ["hand-painted", "diy", "punk"],
    featured: true,
    soldOut: false
  },
  {
    id: "placeholder-001",
    name: "DIY Chaos Tee",
    price: 40,
    originalPrice: null,
    description: "Raw hand-painted punk energy. Made to order / one-of-one.",
    image: "https://placehold.co/600x750/111/fff?text=DIY+Chaos+Tee",
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 1, M: 2, L: 1, XL: 1 },
    category: "tees",
    tags: ["hand-painted", "diy"],
    featured: true,
    soldOut: false
  },
  {
    id: "placeholder-002",
    name: "No Rules Longsleeve",
    price: 55,
    originalPrice: null,
    description: "Heavyweight hand-painted longsleeve. Wear it until it falls apart.",
    image: "https://placehold.co/600x750/111/fff?text=No+Rules+LS",
    sizes: ["M", "L", "XL"],
    stock: { M: 1, L: 2, XL: 1 },
    category: "longsleeves",
    tags: ["hand-painted", "diy"],
    featured: false,
    soldOut: false
  },
  {
    id: "mystery-free",
    name: "Mystery Shirt (Free Gift)",
    price: 0,
    originalPrice: null,
    description: "Surprise hand-painted piece. Only available as a free gift when you spend $75+.",
    image: "https://placehold.co/600x750/111/fff?text=Mystery+Shirt",
    sizes: ["One Size"],
    stock: { "One Size": 999 },
    category: "gift",
    tags: ["free", "mystery"],
    featured: false,
    soldOut: false,
    isGift: true
  }
];

// Load products from localStorage if admin has made changes, otherwise use defaults
function getProducts() {
  const saved = localStorage.getItem("fad_products");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse saved products, using defaults");
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
}

function saveProducts(products) {
  localStorage.setItem("fad_products", JSON.stringify(products));
}

// Discount codes - edit these or manage in admin later
const DISCOUNT_CODES = {
  "PUNK10": { type: "percent", value: 10, description: "10% off" },
  "DRESSCODE": { type: "fixed", value: 15, description: "$15 off" },
  "FREE PATCH": { type: "free_item", value: "patch", description: "Free patch" }
};