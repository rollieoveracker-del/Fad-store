// Render Product Grid with Clickable Cards
function renderProductGrid(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Pull products from products.js or localStorage
  const products = JSON.parse(localStorage.getItem('fad_products')) || window.productsData || [];

  if (products.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#888; grid-column: 1/-1;">NO PRODUCTS AVAILABLE</p>`;
    return;
  }

  container.innerHTML = products.map(product => {
    const isOutOfStock = product.outOfStock;
    const imgPath = product.image || '501.png'; // Fallback to raw uploaded PNG if empty

    return `
      <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" 
           onclick="handleProductClick('${product.id}')" 
           style="cursor: pointer;">
        <div class="product-image-wrap">
          <img src="${imgPath}" alt="${product.title}" loading="lazy">
          ${isOutOfStock ? '<span class="stock-badge">SOLD OUT</span>' : ''}
        </div>
        <div class="product-info">
          <h3 style="font-size:14px; margin-bottom:4px;">${product.title}</h3>
          <p style="color:#ff0000; font-weight:bold;">$${product.price}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Handle Shirt Taps
function handleProductClick(productId) {
  // If you have Stripe Buy Links attached to products:
  const products = JSON.parse(localStorage.getItem('fad_products')) || window.productsData || [];
  const product = products.find(p => p.id === productId);

  if (product && product.stripeLink) {
    window.location.href = product.stripeLink; // Direct to Stripe Checkout
  } else {
    // Default fallback: Go to cart or detail page
    window.location.href = `cart.html?add=${productId}`;
  }
}
