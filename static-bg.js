// Subtle animated static/grain overlay — sits behind the product grid
(function () {
  function initStaticNoise(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Low internal resolution, scaled up via CSS — cheap to render, soft grainy look
    canvas.width = 300;
    canvas.height = 200;

    function draw() {
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const buffer = imageData.data;
      for (let i = 0; i < buffer.length; i += 4) {
        const shade = Math.random() * 255;
        buffer[i] = shade;
        buffer[i + 1] = shade;
        buffer[i + 2] = shade;
        buffer[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      // ~11fps flicker — fast enough to read as "alive", slow enough to stay subtle
      setTimeout(() => requestAnimationFrame(draw), 90);
    }
    draw();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initStaticNoise('shop-static-canvas');
  });
})();
