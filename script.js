// ==========================================
// FILE: script.js (Level Lebih Panjang + Kamera)
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let gameOver = false;
let gameWon = false;

// KONTROL
const keys = { left: false, right: false, up: false };

// --- SISTEM KAMERA & DUNIA GAME ---
const WORLD_WIDTH = 2400; // Ukuran lebar dunia game (3x lipat layar 800px!)
const camera = { x: 0, y: 0 };

const player = {
  x: 50,
  y: 200,
  width: 35,
  height: 45,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpForce: 12,
  grounded: false,
  facing: 'right'
};

const gravity = 0.6;

// --- PLATFORM LEVEL PANJANG ---
const platforms = [
  // Tanah Utama (Dibuat ada celah/jurang!)
  { x: 0, y: 360, width: 700, height: 40, color: '#c84c0c' },
  // Jurang 1 (x: 700 - 820)
  { x: 820, y: 360, width: 650, height: 40, color: '#c84c0c' },
  // Jurang 2 (x: 1470 - 1600)
  { x: 1600, y: 360, width: 800, height: 40, color: '#c84c0c' },

  // Pijakan Melayang
  { x: 200, y: 270, width: 120, height: 20, color: '#e09000' },
  { x: 400, y: 200, width: 100, height: 20, color: '#e09000' },
  { x: 580, y: 270, width: 120, height: 20, color: '#e09000' },
  
  // Pijakan di atas Jurang 1
  { x: 730, y: 280, width: 70, height: 20, color: '#e09000' },
  
  // Area Tengah
  { x: 950, y: 220, width: 150, height: 20, color: '#e09000' },
  { x: 1200, y: 270, width: 120, height: 20, color: '#e09000' },
  { x: 1350, y: 180, width: 100, height: 20, color: '#e09000' },

  // Pijakan di atas Jurang 2
  { x: 1500, y: 250, width: 70, height: 20, color: '#e09000' },

  // Area Akhir menuju Finish
  { x: 1750, y: 270, width: 140, height: 20, color: '#e09000' },
  { x: 1980, y: 200, width: 120, height: 20, color: '#e09000' }
];

// --- KOIN DI SEPANJANG JALAN ---
const coins = [
  { x: 230, y: 230, radius: 8, collected: false },
  { x: 270, y: 230, radius: 8, collected: false },
  { x: 440, y: 160, radius: 8, collected: false },
  { x: 755, y: 240, radius: 8, collected: false }, // Di atas jurang 1
  { x: 980, y: 180, radius: 8, collected: false },
  { x: 1020, y: 180, radius: 8, collected: false },
  { x: 1380, y: 140, radius: 8, collected: false },
  { x: 1525, y: 210, radius: 8, collected: false }, // Di atas jurang 2
  { x: 1800, y: 230, radius: 8, collected: false },
  { x: 2020, y: 160, radius: 8, collected: false }
];

// --- MUSUH PATROLI ---
const enemies = [
  { x: 300, y: 330, width: 30, height: 30, speed: 2, direction: 1, minX: 200, maxX: 450 },
  { x: 600, y: 330, width: 30, height: 30, speed: 1.5, direction: -1, minX: 500, maxX: 680 },
  { x: 900, y: 330, width: 30, height: 30, speed: 2.5, direction: 1, minX: 830, maxX: 1100 },
  { x: 1250, y: 240, width: 30, height: 30, speed: 1.8, direction: 1, minX: 1200, maxX: 1310 },
  { x: 1700, y: 330, width: 30, height: 30, speed: 2, direction: -1, minX: 1620, maxX: 1900 },
  { x: 2100, y: 330, width: 30, height: 30, speed: 3, direction: 1, minX: 1950, maxX: 2300 }
];

// Bendera Finish ditaruh jauh di ujung kanan! (x = 2250)
const flag = { x: 2250, y: 160, width: 10, height: 200 };

// --- INTRO & KONTROL ---
const startBtn = document.getElementById('startBtn');
const introOverlay = document.getElementById('introOverlay');

if (startBtn) {
  startBtn.addEventListener('click', () => {
    introOverlay.style.opacity = '0';
    introOverlay.style.visibility = 'hidden';
  });
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = true;
  if ((gameOver || gameWon) && (e.code === 'Enter' || e.code === 'Space')) restartGame();
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = false;
});

const bindTouch = (id, key) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
  btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
  btn.addEventListener('mousedown', () => { keys[key] = true; });
  btn.addEventListener('mouseup', () => { keys[key] = false; });
};

bindTouch('btnLeft', 'left');
bindTouch('btnRight', 'right');
bindTouch('btnJump', 'up');

canvas.addEventListener('touchstart', () => {
  if (gameOver || gameWon) restartGame();
});

// --- UPDATE PERGERAKAN ---
function updatePlayer() {
  if (gameOver || gameWon) return;

  if (keys.left) {
    player.velocityX = -player.speed;
    player.facing = 'left';
  } else if (keys.right) {
    player.velocityX = player.speed;
    player.facing = 'right';
  } else {
    player.velocityX = 0;
  }

  if (keys.up && player.grounded) {
    player.velocityY = -player.jumpForce;
    player.grounded = false;
  }

  player.velocityY += gravity;
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Batas Kiri & Kanan Dunia Game
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > WORLD_WIDTH) player.x = WORLD_WIDTH - player.width;

  // --- LOGIKA KAMERA IKUTI MARIO ---
  // Kamera memfokuskan Mario di tengah layar (canvas.width / 2)
  camera.x = player.x - canvas.width / 2 + player.width / 2;
  // Batas kamera agar tidak melewati ujung kiri/kanan dunia game
  if (camera.x < 0) camera.x = 0;
  if (camera.x > WORLD_WIDTH - canvas.width) camera.x = WORLD_WIDTH - canvas.width;

  // Deteksi Platform
  player.grounded = false;
  platforms.forEach(plat => {
    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y + player.height >= plat.y &&
      player.y + player.height <= plat.y + plat.height &&
      player.velocityY >= 0
    ) {
      player.grounded = true;
      player.velocityY = 0;
      player.y = plat.y - player.height;
    }
  });

  // Deteksi Ambil Koin
  coins.forEach(coin => {
    if (!coin.collected) {
      const distX = (player.x + player.width / 2) - coin.x;
      const distY = (player.y + player.height / 2) - coin.y;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < player.width / 2 + coin.radius) {
        coin.collected = true;
        score += 10;
        createExplosion(coin.x, coin.y, '#f8d800');
      }
    }
  });

  // Check Win Condition
  if (
    player.x < flag.x + flag.width &&
    player.x + player.width > flag.x &&
    player.y < flag.y + flag.height &&
    player.y + player.height > flag.y
  ) {
    gameWon = true;
  }

  // Jatuh ke Jurang = Game Over
  if (player.y > canvas.height + 100) {
    gameOver = true;
  }
}

function updateEnemies() {
  if (gameOver || gameWon) return;

  enemies.forEach(enemy => {
    enemy.x += enemy.speed * enemy.direction;

    if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
      enemy.direction *= -1;
    }

    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y) {
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff3300');
        enemies.splice(enemies.indexOf(enemy), 1);
        player.velocityY = -8;
        score += 20;
      } else {
        gameOver = true;
      }
    }
  });
}

// --- RENDER VISUAL ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GESER CANVAS BERDASARKAN KAMERA
  ctx.save();
  ctx.translate(-camera.x, 0);

  // 1. Platform
  platforms.forEach(plat => {
    ctx.fillStyle = plat.color;
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    ctx.fillStyle = '#00a800';
    ctx.fillRect(plat.x, plat.y, plat.width, 5);
  });

  // 2. Koin
  coins.forEach(coin => {
    if (!coin.collected) {
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f8d800';
      ctx.fill();
      ctx.strokeStyle = '#d8a000';
      ctx.stroke();
      ctx.closePath();
    }
  });

  // 3. Musuh
  enemies.forEach(enemy => {
    drawEnemyWithEffect(ctx, assets.enemy, enemy);
  });

  // 4. Partikel
  updateAndDrawParticles(ctx);

  // 5. Bendera Finish
  ctx.fillStyle = '#fff';
  ctx.fillRect(flag.x, flag.y, flag.width, flag.height);
  ctx.fillStyle = '#00a800';
  ctx.beginPath();
  ctx.moveTo(flag.x + 10, flag.y);
  ctx.lineTo(flag.x + 50, flag.y + 20);
  ctx.lineTo(flag.x + 10, flag.y + 40);
  ctx.fill();

  // 6. Player
  const shouldFlipPlayer = player.facing === 'left';
  drawSprite(ctx, assets.player, player.x, player.y, player.width, player.height, shouldFlipPlayer, '#ff2a2a');

  // KEMBALIKAN PERGESERAN CANVAS UNTUK UI (HUD)
  ctx.restore();

  // 7. UI Skor & Progress
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`SKOR: ${score}`, 20, 35);
  
  // Progress Bar Jarak ke Finish
  const progress = Math.min(100, Math.floor((player.x / flag.x) * 100));
  ctx.font = '14px sans-serif';
  ctx.fillText(`FINISH: ${progress}%`, 20, 60);

  // 8. Screen Game Over / Win
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 35px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Tekan Spasi / Tap Layar untuk Restart', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }

  if (gameWon) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4dff4d';
    ctx.font = 'bold 35px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KAMU MENANG!', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Skor Akhir: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
    ctx.fillText('Tekan Spasi / Tap Layar untuk Main Lagi', canvas.width / 2, canvas.height / 2 + 60);
    ctx.textAlign = 'left';
  }
}

function restartGame() {
  player.x = 50;
  player.y = 200;
  player.velocityX = 0;
  player.velocityY = 0;
  player.facing = 'right';
  camera.x = 0;
  score = 0;
  gameOver = false;
  gameWon = false;

  coins.forEach(c => c.collected = false);

  enemies.length = 0;
  enemies.push(
    { x: 300, y: 330, width: 30, height: 30, speed: 2, direction: 1, minX: 200, maxX: 450 },
    { x: 600, y: 330, width: 30, height: 30, speed: 1.5, direction: -1, minX: 500, maxX: 680 },
    { x: 900, y: 330, width: 30, height: 30, speed: 2.5, direction: 1, minX: 830, maxX: 1100 },
    { x: 1250, y: 240, width: 30, height: 30, speed: 1.8, direction: 1, minX: 1200, maxX: 1310 },
    { x: 1700, y: 330, width: 30, height: 30, speed: 2, direction: -1, minX: 1620, maxX: 1900 },
    { x: 2100, y: 330, width: 30, height: 30, speed: 3, direction: 1, minX: 1950, maxX: 2300 }
  );
}

function gameLoop() {
  updatePlayer();
  updateEnemies();
  draw();
  requestAnimationFrame(gameLoop);
}

function drawPlayer() {
    // Ganti ctx.fillRect(...) dengan ini:
    ctx.drawImage(
        assets.player, 
        player.x, 
        player.y, 
        player.width, 
        player.height
    );
}

gameLoop();
