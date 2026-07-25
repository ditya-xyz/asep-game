// ==========================================
// FILE: sprites.js (Asset & Particle Manager)
// ==========================================

const assets = {
  player: new Image(),
  enemy: new Image()
};

assets.player.src = 'https://cdn.phototourl.com/free/2026-07-25-2bbd7a5c-30ef-46c3-aff8-3e6639341195.png';
assets.enemy.src = 'enemy.png';

// Array Penampung Partikel Ledakan
const particles = [];

/**
 * Membuat efek partikel saat musuh diinjak
 */
function createExplosion(x, y, color = '#ff5500') {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 6 + 3,
      color: color,
      life: 1.0 // opacity/umur partikel
    });
  }
}

/**
 * Update & Render Partikel
 */
function updateAndDrawParticles(ctx) {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;

    if (p.life <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/**
 * Menggambar Sprite Karakter
 */
function drawSprite(ctx, img, x, y, width, height, flipX = false, fallbackColor = 'red') {
  if (img.complete && img.naturalWidth !== 0) {
    ctx.save();
    if (flipX) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      ctx.drawImage(img, x, y, width, height);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(x, y, width, height);
  }
}

/**
 * Menggambar Musuh dengan Efek Aura / Pulse
 */
function drawEnemyWithEffect(ctx, img, enemy) {
  ctx.save();
  // Efek Glow Merah pada Musuh
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 10;

  const isFacingLeft = enemy.direction === -1;
  drawSprite(ctx, img, enemy.x, enemy.y, enemy.width, enemy.height, isFacingLeft, '#a81000');
  ctx.restore();
}