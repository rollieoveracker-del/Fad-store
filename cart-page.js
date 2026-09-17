document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('fad_cart')) || [];

  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#888; padding: 40px 0;">YOUR CART IS EMPTY</p>`;
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, index) => {
    total += Number(item.price || 30);
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
          <button onclick="removeItem(${index})" style="background:none; border:none; color:#666; cursor:pointer; font-size:16px;">✕</button>
        </div>
      </div>
    `;
  }).join('') + `
    <div style="display:flex; justify-content:space-between; margin-top:20px; font-weight:bold; font-size:16px;">
      <span>TOTAL:</span>
      <span style="color:#ff0000;">$${total}</span>
    </div>
  `;
});

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('fad_cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('fad_cart', JSON.stringify(cart));
  location.reload();
}
