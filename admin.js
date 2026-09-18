// ============================================
// ADMIN PANEL — Firebase Auth + Firestore
// Log in with the email/password you created in
// Firebase Console -> Authentication -> Users
// ============================================

import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getProducts, saveProduct, deleteProductById, seedDefaultProducts
} from "./products.js";

function showLogin() {
  document.getElementById("admin-login").style.display = "block";
  document.getElementById("admin-panel").style.display = "none";
}

function showPanel() {
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  renderAdminProductList();
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const pw = document.getElementById("admin-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pw);
  } catch (err) {
    console.error(err);
    alert("Login failed: " + err.message);
  }
}

async function logout() {
  await signOut(auth);
  location.reload();
}

async function renderAdminProductList() {
  const list = document.getElementById("admin-product-list");
  if (!list) return;
  list.innerHTML = `<p style="color:var(--text-muted);">Loading...</p>`;

  let products = [];
  try {
    products = await getProducts();
  } catch (e) {
    console.error(e);
    list.innerHTML = `<p style="color:var(--accent);">Failed to load products.</p>`;
    return;
  }

  products = products.filter(p => !p.isGift);

  list.innerHTML = products.map(p => {
    const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
    return `
      <div class="admin-product-item">
        <div>
          <h3>${p.title}</h3>
          <div style="font-size:12px;color:var(--text-muted);">$${p.price} · Stock: ${totalStock} · ${p.soldOut ? "SOLD OUT" : "Available"}</div>
        </div>
        <div class="admin-actions">
          <button data-edit="${p.id}">Edit</button>
          <button data-toggle="${p.id}">${p.soldOut ? "Restock" : "Mark Sold Out"}</button>
          <button data-delete="${p.id}" style="color:var(--accent);">Delete</button>
        </div>
      </div>
    `;
  }).join("") || "<p style='color:var(--text-muted);'>No products yet.</p>";

  list.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editProduct(b.dataset.edit)));
  list.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => toggleSoldOut(b.dataset.toggle)));
  list.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => deleteProduct(b.dataset.delete)));
}

async function toggleSoldOut(id) {
  const products = await getProducts();
  const p = products.find(x => x.id === id);
  if (p) {
    p.soldOut = !p.soldOut;
    await saveProduct(p);
    renderAdminProductList();
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product permanently?")) return;
  await deleteProductById(id);
  renderAdminProductList();
}

async function editProduct(id) {
  const products = await getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById("form-id").value = p.id;
  document.getElementById("form-name").value = p.title;
  document.getElementById("form-price").value = p.price;
  document.getElementById("form-desc").value = p.description;
  document.getElementById("form-image").value = p.image;
  document.getElementById("form-sizes").value = (p.sizes || []).join(", ");
  document.getElementById("form-stock").value = Object.entries(p.stock || {}).map(([s, q]) => `${s}:${q}`).join(", ");
  document.getElementById("form-featured").checked = !!p.featured;

  document.getElementById("form-title").textContent = "Edit Product";
  document.getElementById("product-form").scrollIntoView({ behavior: "smooth" });
}

async function handleProductForm(e) {
  e.preventDefault();

  const id = document.getElementById("form-id").value || undefined;
  const title = document.getElementById("form-name").value.trim();
  const price = parseFloat(document.getElementById("form-price").value);
  const description = document.getElementById("form-desc").value.trim();
  const image = document.getElementById("form-image").value.trim() || "https://placehold.co/600x750/111/fff?text=" + encodeURIComponent(title);
  const sizesRaw = document.getElementById("form-sizes").value.trim();
  const stockRaw = document.getElementById("form-stock").value.trim();
  const featured = document.getElementById("form-featured").checked;

  if (!title || isNaN(price)) {
    alert("Name and price are required.");
    return;
  }

  const sizes = sizesRaw.split(",").map(s => s.trim()).filter(Boolean);
  const stock = {};
  if (stockRaw) {
    stockRaw.split(",").forEach(pair => {
      const [s, q] = pair.split(":").map(x => x.trim());
      if (s && q) stock[s] = parseInt(q, 10) || 0;
    });
  } else {
    sizes.forEach(s => stock[s] = 1);
  }

  const product = {
    id,
    title,
    price,
    originalPrice: null,
    description,
    image,
    sizes,
    stock,
    category: "tees",
    tags: ["hand-painted", "diy"],
    featured,
    soldOut: false
  };

  try {
    await saveProduct(product);
    alert("Product saved.");
    resetForm();
    renderAdminProductList();
  } catch (err) {
    console.error(err);
    alert("Failed to save: " + err.message);
  }
}

function resetForm() {
  document.getElementById("product-form").reset();
  document.getElementById("form-id").value = "";
  document.getElementById("form-title").textContent = "Add New Shirt";
}

async function seedCatalog() {
  if (!confirm("This adds the starter catalog into the live database (won't touch your custom items). Continue?")) return;
  try {
    await seedDefaultProducts();
    renderAdminProductList();
    alert("Starter catalog added.");
  } catch (err) {
    console.error(err);
    alert("Failed: " + err.message);
  }
}

// Wire up static elements once the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("admin-login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const productForm = document.getElementById("product-form");
  if (productForm) productForm.addEventListener("submit", handleProductForm);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  const clearBtn = document.getElementById("clear-form-btn");
  if (clearBtn) clearBtn.addEventListener("click", resetForm);

  const seedBtn = document.getElementById("seed-catalog-btn");
  if (seedBtn) seedBtn.addEventListener("click", seedCatalog);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    showPanel();
  } else {
    showLogin();
  }
});
