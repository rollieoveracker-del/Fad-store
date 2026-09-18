import { DISCOUNT_CODES } from "./products.js";

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const applyBtn = document.getElementById("apply-discount-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", applyDiscountCode);
  }
});

function getCart() {
  return JSON.parse(localStorage.getItem("fad_cart")) || [];
}

function getAppliedDiscount() {
  try {
    return JSON.parse(localStorage.getItem("fad_discount")) || null;
  } catch (e) {
    return null;
  }
}

function renderCart() {
  const container = document.getElementById("cart-items-container");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#888; padding: 40px 0;">YOUR CART IS EMPTY</p>`;
    updateSummary(0, 0, []);
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, index) => {
    subtotal += Number(item.price || 30);
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #222; padding: 12px 0;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${item.image ? `<img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border:1px solid #333;">` : ''}
          <div>
            <h4 style="font-size:14px; margin:0;">${item.title}</h4>
            <span style="font-size:11px; color:#888;">SIZE: ${item.size || 'M'}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:16px;">
          <span style="color:#ff0000; font-weight:bold;">$${item.price || 30}</span>
          <button data-remove-index="${index}" style="background:none; border:none; color:#666; cursor:pointer; font-size:16px;">✕</button>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll('[data-remove-index]').forEach(btn => {
    btn.addEventListener('click', () => removeItem(parseInt(btn.dataset.removeIndex, 10)));
  });

  const perks = getPromoPerks(subtotal);
  updateSummary(subtotal, computeFinalTotal(subtotal), perks);
}

// Promo tiers: $40 free patch, $75 free shipping + mystery shirt
function getPromoPerks(subtotal) {
  const perks = [];
  if (subtotal >= 40) perks.push("Free patch unlocked");
  if (subtotal >= 75) perks.push("Free shipping + mystery shirt unlocked");
  return perks;
}

function computeFinalTotal(subtotal) {
  const discount = getAppliedDiscount();
  if (!discount) return subtotal;

  if (discount.type === "percent") {
    return Math.max(0, subtotal - (subtotal * discount.value / 100));
  }
  if (discount.type === "fixed") {
    return Math.max(0, subtotal - discount.value);
  }
  return subtotal;
}

function updateSummary(subtotal, finalTotal, perks) {
  const summaryEl = document.getElementById("cart-summary");
  if (!summaryEl) return;

  const discount = getAppliedDiscount();

  let html = "";
  if (perks.length) {
    html += perks.map(p => `<p style="color:#0f0; font-size:12px; margin-bottom:6px;">🎁 ${p}</p>`).join("");
  }
  if (discount) {
    html += `<p style="color:#888; font-size:12px; margin-bottom:6px;">Code "${discount.code}" applied (${discount.description})</p>`;
  }

  html += `
    <div style="display:flex; justify-content:space-between; margin-top:12px;">
      <span>Subtotal:</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:6px; font-weight:bold; font-size:16px;">
      <span>TOTAL:</span>
      <span style="color:#ff0000;">$${finalTotal.toFixed(2)}</span>
    </div>
    <button id="checkout-btn" style="width:100%; background:#ff0000; color:#fff; border:none; padding:14px; font-weight:bold; cursor:pointer; margin-top:16px;">PROCEED TO CHECKOUT</button>
  `;

  summaryEl.innerHTML = html;

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }
}

function applyDiscountCode() {
  const input = document.getElementById("discount-input");
  const msg = document.getElementById("discount-message");
  const code = input.value.trim().toUpperCase();

  if (!code) return;

  const match = DISCOUNT_CODES[code];

  if (!match) {
    msg.textContent = "Invalid code.";
    msg.style.color = "#ff0000";
    return;
  }

  localStorage.setItem("fad_discount", JSON.stringify({ code, ...match }));
  msg.textContent = `Code applied: ${match.description}`;
  msg.style.color = "#0f0";
  renderCart();
}

function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem("fad_cart", JSON.stringify(cart));
  renderCart();
}

async function handleCheckout() {
  const btn = document.getElementById("checkout-btn");
  const cart = getCart();

  if (cart.length === 0) return;

  if (btn) {
    btn.disabled = true;
    btn.textContent = "REDIRECTING TO CHECKOUT...";
  }

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 30), 0);
  const finalTotal = computeFinalTotal(subtotal);
  const discount = getAppliedDiscount();

  const items = cart.map(item => ({
    name: item.title,
    size: item.size || "M",
    image: item.image || "",
    price: item.price || 30,
    qty: 1
  }));

  const payload = {
    items,
    freePatch: subtotal >= 40,
    freeMysteryShirt: subtotal >= 75,
    freeShipping: subtotal >= 75,
    discountAmount: +(subtotal - finalTotal).toFixed(2),
    discountCode: discount ? discount.code : ""
  };

  try {
    const res = await fetch("https://fadcheckout.rollieoveracker.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error(data.error || "Checkout session failed to create.");
    }

    window.location.href = data.url;
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong starting checkout: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "PROCEED TO CHECKOUT";
    }
  }
}
