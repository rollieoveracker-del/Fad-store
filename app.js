// ============================================
// FUCK A DRESS CODE - MAIN APP LOGIC
// Cart, promos, product display
// ============================================

const CART_KEY = "fad_cart";
const DISCOUNT_KEY = "fad_discount";

// ---------- CART HELPERS ----------
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

function addToCart(productId, size, qty = 1) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product || product.soldOut || product.isGift) return false;

  const stock = product.stock[size] || 0;
  if (stock < 1) {
    alert("That size is sold out.");
    return false;
  }

  let cart = getCart();
  const existing = cart.find(item => item.id === productId && item.size === size);

  if (existing) {
    if (existing.qty + qty > stock) {
      alert("Not enough stock for that size.");
      return false;
    }
    existing.qty += qty;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty
    });
  }

  saveCart(cart);
  return true;
}

function removeFromCart(productId, size) {
  let cart = getCart().filter(item => !(item.id === productId && item.size === size));
  saveCart(cart);
  if (typeof renderCart === "function") renderCart();
}

function updateQty(productId, size, newQty) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId && i.size === size);
  if (!item) return;

  if (newQty < 1) {
    removeFromCart(productId, size);
    return;
  }

  const products = getProducts();
  const product = products.find(p => p.id === productId);
  const stock = product ? (product.stock[size] || 0) : 99;

  if (newQty > stock) {
    alert("Not enough stock.");
    return;
  }

  item.qty = newQty;
  saveCart(cart);
  if (typeof renderCart === "function") renderCart();
}

// ---------- PROMO LOGIC ----------
function getSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getAppliedDiscount() {
  try {
    return JSON.parse(localStorage.getItem(DISCOUNT_KEY));
  } catch {
    return null;
  }
}

function applyDiscountCode(code) {
  const upper = code.trim().toUpperCase();
  const discounts = typeof DISCOUNT_CODES !== "undefined" ? DISCOUNT_CODES : {};
  if (discounts[upper]) {
    localStorage.setItem(DISCOUNT_KEY, JSON.stringify({ code: upper, ...discounts[upper] }));
    return true;
  }
  return false;
}

function clearDiscount() {
  localStorage.removeItem(DISCOUNT_KEY);
}

function calculateTotals(cart) {
  let subtotal = getSubtotal(cart);
  let discountAmount = 0;
  let freeShipping = false;
  let freePatch = false;
  let freeMysteryShirt = false;
  let shipping = 8; // base shipping cost

  // Threshold promos
  if (subtotal >= 40) freePatch = true;
  if (subtotal >= 75) {
    freeShipping = true;
    freeMysteryShirt = true;
    shipping = 0;
  }

  // Applied discount code
  const disc = getAppliedDiscount();
  if (disc) {
    if (disc.type === "percent") {
      discountAmount = Math.round(subtotal * (disc.value / 100) * 100) / 100;
    } else if (disc.type === "fixed") {
      discountAmount = Math.min(disc.value, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discountAmount) + shipping;

  return {
    subtotal,
    discountAmount,
    shipping,
    total,
    freePatch,
    freeShipping,
    freeMysteryShirt,
    discount: disc
  };
}

// ---------- PRODUCT GRID RENDER ----------
function renderProductGrid(containerSelector, filterFn = null) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let products = getProducts().filter(p => !p.isGift);
  if (filterFn) products = products.filter(filterFn);

  if (products.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:40px;">No products yet. Check back soon.</p>`;
    return;
  }

  container.innerHTML = products.map(p => {
    const isSoldOut = p.soldOut || Object.values(p.stock).every(s => s < 1);
    const priceHtml = p.originalPrice
      ? `<span class="sale">$${p.price}</span><span class="original">$${p.originalPrice}</span>`
      : `$${p.price}`;

    return `
      <div class="product-card" data-id="${p.id}" onclick="openProductModal('${p.id}')">
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${isSoldOut ? '<span class="badge sold-out">Sold Out</span>' : (p.originalPrice ? '<span class="badge">Sale</span>' : '')}
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-price">${priceHtml}</div>
        </div>
      </div>
    `;
  }).join("");
}

// ---------- PRODUCT MODAL ----------
let currentModalProduct = null;
let selectedSize = null;
let selectedQty = 1;

function openProductModal(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentModalProduct = product;
  selectedSize = null;
  selectedQty = 1;

  const modal = document.getElementById("product-modal");
  if (!modal) return;

  document.getElementById("modal-image").src = product.image;
  document.getElementById("modal-name").textContent = product.name;
  document.getElementById("modal-price").textContent = `$${product.price}`;
  document.getElementById("modal-desc").textContent = product.description;

  const sizeContainer = document.getElementById("size-options");
  sizeContainer.innerHTML = product.sizes.map(size => {
    const stock = product.stock[size] || 0;
    const disabled = stock < 1 ? "disabled" : "";
    return `<button class="size-btn" data-size="${size}" ${disabled} onclick="selectSize('${size}')">${size}</button>`;
  }).join("");

  document.getElementById("qty-display").textContent = "1";
  document.getElementById("add-to-cart-btn").disabled = product.soldOut;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
  currentModalProduct = null;
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll(".size-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.size === size);
  });
}

function changeQty(delta) {
  selectedQty = Math.max(1, selectedQty + delta);
  document.getElementById("qty-display").textContent = selectedQty;
}

function handleAddToCart() {
  if (!currentModalProduct) return;
  if (!selectedSize) {
    alert("Please select a size.");
    return;
  }
  const success = addToCart(currentModalProduct.id, selectedSize, selectedQty);
  if (success) {
    closeProductModal();
    // brief feedback
    const countEl = document.querySelector(".cart-count");
    if (countEl) {
      countEl.style.transform = "scale(1.3)";
      setTimeout(() => countEl.style.transform = "", 200);
    }
  }
}

// ---------- MAILING LIST ----------
function handleMailingSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("mailing-email").value.trim();
  if (!email) return;

  // Store locally for now. Later connect to Formspree / Mailchimp / Netlify Forms
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("fad_mailing") || "[]");
  } catch {}
  if (!list.includes(email)) {
    list.push(email);
    localStorage.setItem("fad_mailing", JSON.stringify(list));
  }

  alert("You're on the list. No spam, just drops.");
  e.target.reset();
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  // Close modal on overlay click
  const overlay = document.getElementById("product-modal");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeProductModal();
    });
  }

  // Escape key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProductModal();
  });
});