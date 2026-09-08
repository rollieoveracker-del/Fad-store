// ============================================
// ADMIN PANEL
// Password: fadadmin (change it below)
// ============================================

const ADMIN_PASSWORD = "fadadmin"; // ← change this to whatever you want
const AUTH_KEY = "fad_admin_auth";

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

function login(password) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  location.reload();
}

function showLogin() {
  document.getElementById("admin-login").style.display = "block";
  document.getElementById("admin-panel").style.display = "none";
}

function showPanel() {
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  renderAdminProductList();
}

function handleLogin(e) {
  e.preventDefault();
  const pw = document.getElementById("admin-password").value;
  if (login(pw)) {
    showPanel();
  } else {
    alert("Wrong password.");
  }
}

function renderAdminProductList() {
  const products = getProducts().filter(p => !p.isGift);
  const list = document.getElementById("admin-product-list");
  if (!list) return;

  list.innerHTML = products.map(p => {
    const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
    return `
      <div class="admin-product-item">
        <div>
          <h3>${p.name}</h3>
          <div style="font-size:12px;color:var(--text-muted);">$${p.price} · Stock: ${totalStock} · ${p.soldOut ? "SOLD OUT" : "Available"}</div>
        </div>
        <div class="admin-actions">
          <button onclick="editProduct('${p.id}')">Edit</button>
          <button onclick="toggleSoldOut('${p.id}')">${p.soldOut ? "Restock" : "Mark Sold Out"}</button>
          <button onclick="deleteProduct('${p.id}')" style="color:var(--accent);">Delete</button>
        </div>
      </div>
    `;
  }).join("") || "<p style='color:var(--text-muted);'>No products yet.</p>";
}

function toggleSoldOut(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (p) {
    p.soldOut = !p.soldOut;
    saveProducts(products);
    renderAdminProductList();
  }
}

function deleteProduct(id) {
  if (!confirm("Delete this product permanently?")) return;
  let products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  renderAdminProductList();
}

function editProduct(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById("form-id").value = p.id;
  document.getElementById("form-name").value = p.name;
  document.getElementById("form-price").value = p.price;
  document.getElementById("form-desc").value = p.description;
  document.getElementById("form-image").value = p.image;
  document.getElementById("form-sizes").value = p.sizes.join(", ");
  document.getElementById("form-stock").value = Object.entries(p.stock).map(([s, q]) => `${s}:${q}`).join(", ");
  document.getElementById("form-featured").checked = p.featured;

  document.getElementById("form-title").textContent = "Edit Product";
  document.getElementById("product-form").scrollIntoView({ behavior: "smooth" });
}

function handleProductForm(e) {
  e.preventDefault();

  const id = document.getElementById("form-id").value || ("diy-" + Date.now());
  const name = document.getElementById("form-name").value.trim();
  const price = parseFloat(document.getElementById("form-price").value);
  const description = document.getElementById("form-desc").value.trim();
  const image = document.getElementById("form-image").value.trim() || "https://placehold.co/600x750/111/fff?text=" + encodeURIComponent(name);
  const sizesRaw = document.getElementById("form-sizes").value.trim();
  const stockRaw = document.getElementById("form-stock").value.trim();
  const featured = document.getElementById("form-featured").checked;

  if (!name || isNaN(price)) {
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

  let products = getProducts();
  const existingIdx = products.findIndex(p => p.id === id);

  const product = {
    id,
    name,
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

  if (existingIdx >= 0) {
    products[existingIdx] = { ...products[existingIdx], ...product };
  } else {
    products.unshift(product);
  }

  saveProducts(products);
  alert("Product saved.");
  resetForm();
  renderAdminProductList();
}

function resetForm() {
  document.getElementById("product-form").reset();
  document.getElementById("form-id").value = "";
  document.getElementById("form-title").textContent = "Add New Shirt";
}

function resetToDefaults() {
  if (!confirm("This will wipe all custom products and restore the original catalog. Continue?")) return;
  localStorage.removeItem("fad_products");
  renderAdminProductList();
  alert("Reset to defaults.");
}

document.addEventListener("DOMContentLoaded", () => {
  if (isAuthenticated()) {
    showPanel();
  } else {
    showLogin();
  }
});