"use strict";

const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");

if (!context) {
  throw new Error("No se pudo inicializar el contexto 2D de Canvas.");
}

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SHIP_WIDTH = 42;
const SHIP_HEIGHT = 42;
const SHIP_SPEED = 360;
const LASER_SPEED = 560;
const LASER_INTERVAL = 0.18;
const ENEMY_RADIUS = 18;
const ENEMIES_PER_WAVE = 5;
const ENEMY_SPAWN_INTERVAL = 0.85;
const ENEMY_BASE_SPEED = 40;
const ENEMY_SPEED_PER_WAVE = 10;
const ENEMY_PURSUIT_SPEED = 105;

const INITIAL_LIVES = 3;

const ship = {
  x: WIDTH / 2,
  y: HEIGHT - 58,
};

const pressedKeys = new Set();
const lasers = [];
const enemies = [];
let started = false;
const gameState = {
  status: "start",
  score: 0,
  lives: INITIAL_LIVES,
};
const messageElement = document.querySelector("#game-message");
let laserCooldown = 0;
let previousTime = 0;
let waveNumber = 0;
let enemiesToSpawn = 0;
let enemySpawnCooldown = 0;

const stars = Array.from({ length: 90 }, () => ({
  x: Math.random() * WIDTH,
  y: Math.random() * HEIGHT,
  radius: Math.random() * 1.4 + 0.4,
  alpha: Math.random() * 0.55 + 0.2,
}));

function isGameKey(key) {
  return (
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "KeyA" ||
    key === "KeyD" ||
    key === "Space" ||
    key === "Enter"
  );
}

window.addEventListener("keydown", (event) => {
  if (!isGameKey(event.code)) {
    return;
  }

  event.preventDefault();
  pressedKeys.add(event.code);

  if (event.code === "Enter") {
    if (!started) {
      started = true;
      startWave();
    }
    startGame();
  }
});

window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.code);
});

window.addEventListener("blur", () => {
  pressedKeys.clear();
});

function fireLaser() {
  lasers.push({
    x: ship.x,
    y: ship.y - SHIP_HEIGHT / 2,
  });
}

function startWave() {
  waveNumber += 1;
  enemiesToSpawn = ENEMIES_PER_WAVE + waveNumber - 1;
  enemySpawnCooldown = 0;
}

function spawnEnemy() {
  const waveSize = ENEMIES_PER_WAVE + waveNumber - 1;
  const spawnIndex = waveSize - enemiesToSpawn;
  const spawnPosition = spawnIndex % 3;
  const pattern = spawnIndex % 2 === 0 ? "descend" : "pursue";
  let x;
  let y;
  let vx = 0;
  let spawnEdge = "top";

  if (spawnPosition === 0) {
    x = ENEMY_RADIUS + Math.random() * (WIDTH - ENEMY_RADIUS * 2);
    y = -ENEMY_RADIUS;
  } else {
    spawnEdge = spawnPosition === 1 ? "left" : "right";
    x = spawnEdge === "left" ? -ENEMY_RADIUS : WIDTH + ENEMY_RADIUS;
    y = ENEMY_RADIUS + Math.random() * (HEIGHT * 0.45);
    if (pattern === "descend") {
      vx = spawnEdge === "left" ? ENEMY_PURSUIT_SPEED : -ENEMY_PURSUIT_SPEED;
    }
  }

  enemies.push({
    x,
    y,
    vx,
    vy: ENEMY_BASE_SPEED + (waveNumber - 1) * ENEMY_SPEED_PER_WAVE,
    health: 1,
    maxHealth: 1,
    pattern,
    spawnEdge,
    radius: ENEMY_RADIUS,
  });
  enemiesToSpawn -= 1;
}

function updateEnemies(deltaTime) {
  enemySpawnCooldown -= deltaTime;
  while (enemiesToSpawn > 0 && enemySpawnCooldown <= 0) {
    spawnEnemy();
    enemySpawnCooldown += ENEMY_SPAWN_INTERVAL;
  }

  for (const enemy of enemies) {
    if (enemy.pattern === "pursue") {
      const horizontalDistance = ship.x - enemy.x;
      enemy.vx =
        Math.abs(horizontalDistance) <= enemy.radius
          ? 0
          : Math.sign(horizontalDistance) * ENEMY_PURSUIT_SPEED;
    } else if (
      enemy.spawnEdge !== "top" &&
      enemy.x >= enemy.radius &&
      enemy.x <= WIDTH - enemy.radius
    ) {
      enemy.vx = 0;
    }

    enemy.x += enemy.vx * deltaTime;
    enemy.y += enemy.vy * deltaTime;
    enemy.x = Math.max(enemy.radius, Math.min(WIDTH - enemy.radius, enemy.x));
  }

  for (let index = enemies.length - 1; index >= 0; index -= 1) {
    if (enemies[index].y - enemies[index].radius > HEIGHT) {
      enemies.splice(index, 1);
    }
  }

  if (enemiesToSpawn === 0 && enemies.length === 0) {
    startWave();
  }
function resetEntities() {
  lasers.length = 0;
  enemies.length = 0;
  laserCooldown = 0;
}

function startGame() {
  resetEntities();
  gameState.status = "playing";
  gameState.score = 0;
  gameState.lives = INITIAL_LIVES;
  ship.x = WIDTH / 2;
  messageElement.textContent = "";
}

function update(deltaTime) {
  if (gameState.status !== "playing") {
    return;
  }

  const movingLeft = pressedKeys.has("ArrowLeft") || pressedKeys.has("KeyA");
  const movingRight = pressedKeys.has("ArrowRight") || pressedKeys.has("KeyD");

  if (movingLeft !== movingRight) {
    ship.x += (movingRight ? 1 : -1) * SHIP_SPEED * deltaTime;
  }

  const halfShipWidth = SHIP_WIDTH / 2;
  ship.x = Math.max(halfShipWidth, Math.min(WIDTH - halfShipWidth, ship.x));

  if (pressedKeys.has("Space")) {
    laserCooldown -= deltaTime;
    if (laserCooldown <= 0) {
      fireLaser();
      laserCooldown = LASER_INTERVAL;
    }
  } else {
    laserCooldown = 0;
  }

  for (const laser of lasers) {
    laser.y -= LASER_SPEED * deltaTime;
  }

  for (let index = lasers.length - 1; index >= 0; index -= 1) {
    if (lasers[index].y < 0) {
      lasers.splice(index, 1);
    }
  }

  updateEnemies(deltaTime);
}

function drawEnemy(enemy) {
  context.save();
  context.translate(enemy.x, enemy.y);
  context.fillStyle = enemy.pattern === "pursue" ? "#ff9b6b" : "#ff526f";
  context.strokeStyle = "#ffe4eb";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, enemy.radius);
  context.lineTo(-enemy.radius, -enemy.radius / 2);
  context.lineTo(-enemy.radius / 2, -enemy.radius);
  context.lineTo(0, -enemy.radius / 2);
  context.lineTo(enemy.radius / 2, -enemy.radius);
  context.lineTo(enemy.radius, -enemy.radius / 2);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = "#fff3a6";
  context.fillRect(-3, -5, 6, 6);
  context.restore();
}

function drawShip() {
  context.save();
  context.translate(ship.x, ship.y);
  context.fillStyle = "#8cecff";
  context.strokeStyle = "#e8fbff";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, -SHIP_HEIGHT / 2);
  context.lineTo(SHIP_WIDTH / 2, SHIP_HEIGHT / 2);
  context.lineTo(0, SHIP_HEIGHT / 4);
  context.lineTo(-SHIP_WIDTH / 2, SHIP_HEIGHT / 2);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = "#fff3a6";
  context.beginPath();
  context.moveTo(-6, SHIP_HEIGHT / 2 - 2);
  context.lineTo(0, SHIP_HEIGHT / 2 + 9);
  context.lineTo(6, SHIP_HEIGHT / 2 - 2);
  context.closePath();
  context.fill();
  context.restore();
}

function drawHeart(x, y, filled) {
  context.save();
  context.translate(x, y);
  context.beginPath();
  context.moveTo(0, 7);
  context.lineTo(-14, -5);
  context.bezierCurveTo(-22, -12, -16, -24, -7, -20);
  context.bezierCurveTo(-3, -18, 0, -14, 0, -11);
  context.bezierCurveTo(0, -14, 3, -18, 7, -20);
  context.bezierCurveTo(16, -24, 22, -12, 14, -5);
  context.closePath();
  context.fillStyle = filled ? "#ff687f" : "#59657d";
  context.strokeStyle = filled ? "#ffd0d8" : "#8792a8";
  context.lineWidth = 2;
  context.fill();
  context.stroke();
  context.restore();
}

function drawHud() {
  const hudPadding = 24;
  const heartSpacing = 40;

  for (let index = 0; index < INITIAL_LIVES; index += 1) {
    drawHeart(
      hudPadding + index * heartSpacing,
      hudPadding + 12,
      index < gameState.lives,
    );
  }

  context.save();
  context.fillStyle = "#eef4ff";
  context.font = "600 26px Segoe UI, sans-serif";
  context.textAlign = "right";
  context.fillText(String(gameState.score), WIDTH - hudPadding, hudPadding + 12);
  context.restore();
}

function render() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = "#080d1a";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  for (const star of stars) {
    context.globalAlpha = star.alpha;
    context.fillStyle = "#d9eaff";
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  for (const enemy of enemies) {
    drawEnemy(enemy);
  }
  drawHud();

  for (const laser of lasers) {
    context.fillStyle = "#ff687f";
    context.shadowColor = "#ff345e";
    context.shadowBlur = 12;
    context.fillRect(laser.x - 2, laser.y - 12, 4, 18);
  }
  context.shadowBlur = 0;

  drawShip();

  if (started) {
    context.fillStyle = "#eef4ff";
    context.textAlign = "left";
    context.font = "600 15px Segoe UI, sans-serif";
    context.fillText(`Oleada ${waveNumber}`, 18, 28);
    context.fillStyle = "#aebbd4";
    context.font = "14px Segoe UI, sans-serif";
    context.fillText(`Enemigos: ${enemies.length + enemiesToSpawn}`, 18, 49);
  }

  if (!started) {
  if (gameState.status === "start") {
    context.fillStyle = "#eef4ff";
    context.textAlign = "center";
    context.font = "600 25px Segoe UI, sans-serif";
    context.fillText("Pulsa Enter para empezar", WIDTH / 2, HEIGHT / 2 - 12);
    context.fillStyle = "#aebbd4";
    context.font = "16px Segoe UI, sans-serif";
    context.fillText("La nave se controla con las flechas o A y D", WIDTH / 2, HEIGHT / 2 + 20);
  }

  if (gameState.status === "game-over") {
    context.fillStyle = "#eef4ff";
    context.textAlign = "center";
    context.font = "600 30px Segoe UI, sans-serif";
    context.fillText("Game Over", WIDTH / 2, HEIGHT / 2 - 12);
    context.fillStyle = "#aebbd4";
    context.font = "16px Segoe UI, sans-serif";
    context.fillText(`Puntuación final: ${gameState.score}`, WIDTH / 2, HEIGHT / 2 + 20);
  }
}

function frame(time) {
  const deltaTime = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;
  update(deltaTime);
  render();
  window.requestAnimationFrame(frame);
}

render();
window.requestAnimationFrame(frame);
