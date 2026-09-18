// ============================================
// FUCK A DRESS CODE - PRODUCT CATALOG (Firestore-backed)
// Edit products through the Admin panel, not this file.
// ============================================

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, setDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Starter catalog — only used when you click "Seed Starter Catalog" in admin
export const DEFAULT_PRODUCTS = [
  {
    id: "rr-001",
    title: "Richard Ramirez Tee",
    price: 45,
    originalPrice: null,
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
    title: "DIY Chaos Tee",
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
    title: "No Rules Longsleeve",
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
  }
];

// Fetch all products live from Firestore — every visitor sees the same list
export async function getProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Create or update a product (used by admin panel)
export async function saveProduct(product) {
  const id = product.id || ("diy-" + Date.now());
  const { id: _drop, ...data } = product;
  await setDoc(doc(db, "products", id), data);
  return id;
}

export async function deleteProductById(id) {
  await deleteDoc(doc(db, "products", id));
}

// One-time helper — pushes the starter catalog into the live database
export async function seedDefaultProducts() {
  for (const p of DEFAULT_PRODUCTS) {
    const { id, ...data } = p;
    await setDoc(doc(db, "products", id), data);
  }
}

// Discount codes — static, edit directly here
export const DISCOUNT_CODES = {
  "PUNK10": { type: "percent", value: 10, description: "10% off" },
  "DRESSCODE": { type: "fixed", value: 15, description: "$15 off" },
  "WELCOME15": { type: "percent", value: 15, description: "15% off — mailing list" },
  "FREE PATCH": { type: "free_item", value: "patch", description: "Free patch" }
};
