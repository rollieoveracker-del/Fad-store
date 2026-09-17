function renderProductGrid(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const products = JSON.parse(localStorage.getItem('fad_products')) || window.productsData || [];

  if (products.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#888; grid-column: 1/-1;">NO PRODUCTS AVAILABLE</p>`;
    return;
  }

  container.innerHTML = products.map(product => {
    const isOutOfStock = product.outOfStock;
    const imgPath = product.image || '';

    return `
      <a href="product.html?id=${product.id}" class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" style="display:block; text-decoration:none; color:inherit;">
        <div class="product-image-wrap">
          ${imgPath ? `<img src="${imgPath}" alt="${product.title}" loading="lazy">` : ''}
          ${isOutOfStock ? '<span class="stock-badge">SOLD OUT</span>' : ''}
        </div>
        <div class="product-info">
          <h3 style="font-size:14px; margin-bottom:4px;">${product.title}</h3>
          <p style="color:#ff0000; font-weight:bold;">$${product.price || '30'}</p>
        </div>
      </a>
    `;
  }).join('');
}
