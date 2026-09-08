// ============================================
// CART PAGE SPECIFIC LOGIC
// ============================================

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const summaryEl = document.getElementById("cart-summary");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
    if (summaryEl) summaryEl.style.display = "none";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (summaryEl) summaryEl.style.display = "block";

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="cart-item-meta">Size: ${item.size} · Qty: 
          <button onclick="updateQty('${item.id}','${item.size}',${item.qty - 1})" style="background:none;border:none;color:var(--text);cursor:pointer;font-size:16px;">−</button>
          ${item.qty}
          <button onclick="updateQty('${item.id}','${item.size}',${item.qty + 1})" style="background:none;border:none;color:var(--text);cursor:pointer;font-size:16px;">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}','${item.size}')">Remove</button>
      </div>
      <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join("");

  // Add free gift items visually if unlocked
  const totals = calculateTotals(cart);
  let giftsHtml = "";

  if (totals.freePatch) {
    giftsHtml += `
      <div class="cart-item" style="opacity:0.85;">
        <div style="width:100px;height:125px;background:#111;display:flex;align-items:center;justify-content:center;font-size:11px;color:#888;text-align:center;padding:8px;">FREE<br>PATCH</div>
        <div class="cart-item-info">
          <h3>Free Patch</h3>
          <div class="cart-item-meta">Unlocked at $40+</div>
        </div>
        <div class="cart-item-price" style="color:var(--success);">FREE</div>
      </div>
    `;
  }

  if (totals.freeMysteryShirt) {
    giftsHtml += `
      <div class="cart-item" style="opacity:0.85;">
        <div style="width:100px;height:125px;background:#111;display:flex;align-items:center;justify-content:center;font-size:11px;color:#888;text-align:center;padding:8px;">MYSTERY<br>SHIRT</div>
        <div class="cart-item-info">
          <h3>Mystery Shirt</h3>
          <div class="cart-item-meta">Unlocked at $75+ · One size</div>
        </div>
        <div class="cart-item-price" style="color:var(--success);">FREE</div>
      </div>
    `;
  }

  container.innerHTML += giftsHtml;

  // Update promo status
  document.getElementById("promo-40").className = totals.freePatch ? "unlocked" : "";
  document.getElementById("promo-40").innerHTML = totals.freePatch
    ? `<span class="check">✓</span> $40+ — Free patch unlocked`
    : `<span class="check">○</span> Spend $40+ for a free patch`;

  document.getElementById("promo-75").className = totals.freeMysteryShirt ? "unlocked" : "";
  document.getElementById("promo-75").innerHTML = totals.freeMysteryShirt
    ? `<span class="check">✓</span> $75+ — Free shipping + Mystery shirt unlocked`
    : `<span class="check">○</span> Spend $75+ for free shipping + free mystery shirt`;

  // Totals
  document.getElementById("subtotal-val").textContent = `$${totals.subtotal.toFixed(2)}`;
  document.getElementById("shipping-val").textContent = totals.freeShipping ? "FREE" : `$${totals.shipping.toFixed(2)}`;
  
  const discountRow = document.getElementById("discount-row");
  if (totals.discountAmount > 0) {
    discountRow.style.display = "flex";
    document.getElementById("discount-label").textContent = `Discount (${totals.discount.code})`;
    document.getElementById("discount-val").textContent = `-$${totals.discountAmount.toFixed(2)}`;
  } else {
    discountRow.style.display = "none";
  }

  document.getElementById("total-val").textContent = `$${totals.total.toFixed(2)}`;
}

function handleDiscountApply() {
  const input = document.getElementById("discount-input");
  const code = input.value;
  if (applyDiscountCode(code)) {
    alert("Discount applied.");
    renderCart();
  } else {
    alert("Invalid code.");
  }
  input.value = "";
}

async function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const totals = calculateTotals(cart);

  // Disable button while processing
  const btn = document.querySelector("button[onclick='handleCheckout()']");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Redirecting to payment...";
  }

  try {
    const response = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        freePatch: totals.freePatch,
        freeMysteryShirt: totals.freeMysteryShirt,
        freeShipping: totals.freeShipping,
        discountAmount: totals.discountAmount,
        discountCode: totals.discount ? totals.discount.code : null
      })
    });

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Could not create checkout session");
    }
  } catch (err) {
    console.error(err);
    alert("Payment error: " + err.message + "\n\nMake sure the Stripe secret key is set in Netlify.");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Checkout with Stripe";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});