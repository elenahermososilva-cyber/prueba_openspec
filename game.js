"use strict";

const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");

if (!context) {
  throw new Error("No se pudo inicializar el contexto 2D de Canvas.");
}

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const INITIAL_LIVES = 3;
const SHIP_WIDTH = 44;
const SHIP_HEIGHT = 44;
const PLAYER_SPEED = 360;
const PLAYER_BULLET_SPEED = 560;
const PLAYER_FIRE_INTERVAL = 0.18;
const THREAT_LEVEL_SECONDS = 60;
const THREAT_OFFSETS = { easy: 0, normal: 150, hard: 300 };
const THREAT_STAGES = [
  { seconds: 0, label: "Fácil", color: "easy" },
  { seconds: 120, label: "Normal", color: "normal" },
  { seconds: 300, label: "Difícil", color: "hard" },
  { seconds: 600, label: "Muy difícil", color: "very-hard" },
  { seconds: 900, label: "Imposible", color: "impossible" },
  { seconds: 1200, label: "¡JA, JA, JA…!", color: "laughing" },
];
const ENEMY_TYPES = {
  scout: {
    sprite: "enemy1",
    bullet: "enemyBullet1",
    radius: 17,
    health: 1,
    speed: 58,
    fireDelay: 1.65,
    cost: 1,
    color: "#ff526f",
  },
  strafe: {
    sprite: "enemy2",
    bullet: "enemyBullet2",
    radius: 18,
    health: 2,
    speed: 42,
    fireDelay: 2.15,
    cost: 1.5,
    color: "#c75dff",
  },
  armored: {
    sprite: "enemy3",
    bullet: "enemyBullet3",
    radius: 23,
    health: 5,
    speed: 30,
    fireDelay: 2.7,
    cost: 2.25,
    color: "#83c66d",
  },
};
const POWERUPS = {
  shield: { label: "Escudo", sprite: "shieldOrb" },
  heal: { label: "Vida", sprite: "healOrb" },
  shots: { label: "Disparo", sprite: "shotOrb" },
  speed: { label: "Velocidad", sprite: "speedOrb" },
  piercing: { label: "Perforante", sprite: "piercingOrb" },
  spread: { label: "Abanico", sprite: "spreadOrb" },
};
const ASSET_PATHS = {
  player: "assets/player.svg",
  enemy1: "assets/enemigo1.svg",
  enemy2: "assets/enemigo2.svg",
  enemy3: "assets/enemigo3.svg",
  boss: "assets/boss1.svg",
  playerBullet: "assets/disparo-jugador.svg",
  enemyBullet1: "assets/disparo-enemigo1.svg",
  enemyBullet2: "assets/disparo-enemigo2.svg",
  enemyBullet3: "assets/disparo-enemigo3.svg",
  bossBullet: "assets/disparo-boss1.svg",
  shieldOrb: "assets/escudo.svg",
  healOrb: "assets/heal.svg",
  shotOrb: "assets/+1disparo.svg",
  speedOrb: "assets/aceleracion.svg",
  piercingOrb: "assets/perforante.svg",
  spreadOrb: "assets/abanico.svg",
};
const assets = Object.fromEntries(
  Object.entries(ASSET_PATHS).map(([name, path]) => {
    const image = new Image();
    image.loaded = false;
    image.addEventListener("load", () => {
      image.loaded = true;
    });
    image.addEventListener("error", () => {
      console.error(`No se pudo cargar el recurso visual: ${path}`);
    });
    image.src = path;
    return [name, image];
  }),
);

const ship = {
  x: WIDTH / 2,
  y: HEIGHT - 62,
  previousX: WIDTH / 2,
  previousY: HEIGHT - 62,
};
const pressedKeys = new Set();
const playerBullets = [];
const enemyBullets = [];
const lasers = [];
const enemies = [];
const bosses = [];
const orbs = [];
const particles = [];
const stars = Array.from({ length: 110 }, () => ({
  x: Math.random() * WIDTH,
  y: Math.random() * HEIGHT,
  radius: Math.random() * 1.5 + 0.35,
  alpha: Math.random() * 0.6 + 0.15,
}));

const gameState = {
  status: "start",
  score: 0,
  lives: INITIAL_LIVES,
  difficulty: "easy",
  elapsed: 0,
  threatTime: 0,
  threatLevel: 1,
  shield: 0,
  shotLevel: 0,
  piercingLevel: 0,
  spreadLevel: 0,
  speedTimer: 0,
  hitCooldown: 0,
  feedbackTimer: 0,
  spawnBudget: 0,
};

const elements = {
  message: document.querySelector("#game-message"),
  score: document.querySelector("#game-score"),
  lives: document.querySelector("#game-lives"),
  time: document.querySelector("#game-time"),
  powerups: document.querySelector("#game-powerups"),
  difficulty: document.querySelector("#difficulty-select"),
  threatName: document.querySelector("#threat-name"),
  threatLevel: document.querySelector("#threat-level"),
  threatMeter: document.querySelector("#threat-meter"),
  threatFill: document.querySelector("#threat-fill"),
  threatNext: document.querySelector("#threat-next"),
};

let playerFireCooldown = 0;
let enemySpawnCooldown = 0;
let orbSpawnTimer = 30;
let bossSpawnTimer = 60;
let nextEntityId = 1;
let hudUpdateTimer = 0;
let previousTime = 0;
let messageTimer = 0;

elements.message.textContent = "Elige la dificultad y pulsa Enter para empezar.";

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

  if (event.code === "Enter") {
    if (!event.repeat && gameState.status !== "playing") {
      startGame();
    }
    return;
  }
  pressedKeys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.code);
});

window.addEventListener("blur", () => {
  pressedKeys.clear();
});

function threatStage(seconds) {
  let stage = THREAT_STAGES[0];
  for (const candidate of THREAT_STAGES) {
    if (seconds >= candidate.seconds) {
      stage = candidate;
    } else {
      break;
    }
  }
  return stage;
}

function currentThreatLevel() {
  return Math.floor(gameState.threatTime / THREAT_LEVEL_SECONDS) + 1;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function activePowerupLabels() {
  const labels = [];
  if (gameState.shield > 0) labels.push(`Escudo x${gameState.shield}`);
  if (gameState.shotLevel > 0) {
    labels.push(`Disparos ${Math.min(5, gameState.shotLevel + 1)}`);
  }
  if (gameState.piercingLevel > 0) {
    labels.push(`Perforación ${gameState.piercingLevel}`);
  }
  if (gameState.spreadLevel > 0) labels.push(`Abanico ${gameState.spreadLevel}`);
  if (gameState.speedTimer > 0) {
    labels.push(`Velocidad ${Math.ceil(gameState.speedTimer)}s`);
  }
  return labels.length > 0 ? labels.join(" · ") : "Ninguna";
}

function updateHud() {
  elements.score.textContent = String(gameState.score);
  elements.lives.textContent = String(gameState.lives);
  elements.time.textContent = formatTime(gameState.elapsed);
  elements.powerups.textContent = activePowerupLabels();

  const stage = threatStage(gameState.threatTime);
  elements.threatName.textContent = stage.label;
  elements.threatName.dataset.stage = stage.color;
  elements.threatMeter.dataset.stage = stage.color;
  elements.threatLevel.textContent = `Nivel ${gameState.threatLevel}`;
  const progress =
    ((gameState.threatTime % THREAT_LEVEL_SECONDS) / THREAT_LEVEL_SECONDS) * 100;
  elements.threatFill.style.height = `${progress}%`;
  elements.threatMeter.setAttribute("aria-valuenow", String(Math.round(progress)));
  const nextLevelIn = Math.ceil(THREAT_LEVEL_SECONDS - (gameState.threatTime % THREAT_LEVEL_SECONDS));
  elements.threatNext.textContent = `${nextLevelIn}s al siguiente nivel`;
}

function showMessage(message, duration = 1.4) {
  elements.message.textContent = message;
  messageTimer = duration;
}

function startGame() {
  playerBullets.length = 0;
  enemyBullets.length = 0;
  lasers.length = 0;
  enemies.length = 0;
  bosses.length = 0;
  orbs.length = 0;
  particles.length = 0;
  pressedKeys.clear();

  gameState.status = "playing";
  gameState.score = 0;
  gameState.lives = INITIAL_LIVES;
  gameState.difficulty = elements.difficulty.value;
  gameState.elapsed = 0;
  gameState.threatTime = THREAT_OFFSETS[gameState.difficulty];
  gameState.threatLevel = currentThreatLevel();
  gameState.shield = 0;
  gameState.shotLevel = 0;
  gameState.piercingLevel = 0;
  gameState.spreadLevel = 0;
  gameState.speedTimer = 0;
  gameState.hitCooldown = 0;
  gameState.feedbackTimer = 0;
  gameState.spawnBudget = 0;
  playerFireCooldown = 0;
  enemySpawnCooldown = 0.5;
  orbSpawnTimer = 30;
  bossSpawnTimer = 60;
  messageTimer = 0;
  ship.x = WIDTH / 2;
  ship.previousX = ship.x;
  ship.previousY = ship.y;
  elements.difficulty.disabled = true;
  showMessage("¡Sobrevive!", 1.2);
  updateHud();
}

function enemyCap() {
  return 10 + gameState.threatLevel * 6;
}

function selectEnemyType(maxCost = Number.POSITIVE_INFINITY) {
  const roll = Math.random();
  let type = "scout";
  const armoredChance = Math.min(0.08 + gameState.threatLevel * 0.012, 0.28);
  const strafeChance = Math.min(0.28 + gameState.threatLevel * 0.008, 0.42);
  if (roll < armoredChance) type = "armored";
  else if (roll < armoredChance + strafeChance) type = "strafe";
  if (ENEMY_TYPES[type].cost > maxCost) {
    const affordableTypes = Object.keys(ENEMY_TYPES).filter(
      (candidate) => ENEMY_TYPES[candidate].cost <= maxCost,
    );
    type = affordableTypes[Math.floor(Math.random() * affordableTypes.length)];
  }
  return type;
}

function spawnEnemy(type = selectEnemyType()) {

  const config = ENEMY_TYPES[type];
  const radius = config.radius;
  const sideSpawn = Math.random() < 0.22;
  const side = Math.random() < 0.5 ? -1 : 1;
  const x = sideSpawn
    ? side < 0
      ? -radius
      : WIDTH + radius
    : radius + Math.random() * (WIDTH - radius * 2);
  const y = sideSpawn ? 35 + Math.random() * (HEIGHT * 0.38) : -radius;
  const speedScale = 1 + gameState.threatLevel * 0.035;
  const shotDelayScale = Math.max(0.36, 1 - gameState.threatLevel * 0.028);
  const entryVelocity =
    sideSpawn && type !== "armored" ? -side * (55 + gameState.threatLevel * 1.3) : 0;

  enemies.push({
    id: nextEntityId++,
    type,
    x,
    y,
    previousX: x,
    previousY: y,
    vx: entryVelocity,
    vy: config.speed * speedScale,
    radius,
    health: config.health + Math.floor(gameState.threatLevel / 8),
    maxHealth: config.health + Math.floor(gameState.threatLevel / 8),
    fireCooldown: 0.8 + Math.random() * config.fireDelay * shotDelayScale,
    phase: Math.random() * Math.PI * 2,
  });
}

function spawnEnemyBullet(enemy, dx, dy, patternIndex = 0) {
  const length = Math.hypot(dx, dy) || 1;
  const levelSpeed = Math.min(440, 190 + gameState.threatLevel * 5);
  enemyBullets.push({
    id: nextEntityId++,
    x: enemy.x,
    y: enemy.y + enemy.radius * 0.65,
    previousX: enemy.x,
    previousY: enemy.y + enemy.radius * 0.65,
    vx: (dx / length) * levelSpeed,
    vy: (dy / length) * levelSpeed,
    radius: patternIndex === 0 ? 8 : 6,
    sprite: ENEMY_TYPES[enemy.type].bullet,
    angle: Math.atan2(-dx, dy),
    damage: 1,
    heavy: false,
  });
}

function fireEnemyWeapon(enemy) {
  if (enemy.type === "scout") {
    spawnEnemyBullet(enemy, 0, 1);
  } else if (enemy.type === "strafe") {
    const direction = ship.x < enemy.x ? -1 : 1;
    spawnEnemyBullet(enemy, direction * 0.62, 1, 1);
  } else {
    spawnEnemyBullet(enemy, 0, 1);
    spawnEnemyBullet(enemy, -0.55, 1, 1);
    spawnEnemyBullet(enemy, 0.55, 1, 1);
  }
}

function spawnBoss() {
  const x = 130 + Math.random() * (WIDTH - 260);
  const level = gameState.threatLevel;
  bosses.push({
    id: nextEntityId++,
    x,
    y: -70,
    previousX: x,
    previousY: -70,
    vx: (Math.random() < 0.5 ? -1 : 1) * (38 + level * 1.2),
    vy: Math.min(75, 38 + level * 0.7),
    radius: 52,
    health: 14 + level * 2,
    maxHealth: 14 + level * 2,
    fireCooldown: 2.5,
    charge: 0,
    targetX: ship.x,
    targetY: ship.y,
  });

  const escortCount = Math.min(
    3 + Math.floor(level / 3),
    Math.max(0, enemyCap() - enemies.length),
  );
  for (let index = 0; index < escortCount; index += 1) {
    spawnEnemy();
  }
  showMessage("¡JEFE Y ESCOLTA!", 2);
}

function spawnOrb() {
  const availablePowers = Object.keys(POWERUPS).filter((power) => {
    if (power === "shots" && gameState.shotLevel >= 4) return false;
    if (power === "heal" && gameState.lives >= INITIAL_LIVES) return false;
    return true;
  });
  const power = availablePowers[Math.floor(Math.random() * availablePowers.length)];
  orbs.push({
    id: nextEntityId++,
    type: power,
    x: 30 + Math.random() * (WIDTH - 60),
    y: -24,
    previousX: 0,
    previousY: 0,
    vy: Math.min(210, 105 + gameState.threatLevel * 2),
    radius: 19,
  });
  const orb = orbs[orbs.length - 1];
  orb.previousX = orb.x;
  orb.previousY = orb.y;
}

function firePlayerWeapon() {
  const shotCount = Math.min(5, gameState.shotLevel + 1);
  const spreadStage = Math.floor(gameState.spreadLevel / 2);
  const angleStep = Math.min(0.13 + spreadStage * 0.055, 0.38);
  const angleCount = spreadStage === 0 ? 1 : Math.min(1 + spreadStage * 2, 9);
  const damage = 1 + Math.floor(
    (gameState.shotLevel + gameState.piercingLevel + gameState.spreadLevel) / 5,
  );
  const baseOffsets = Array.from({ length: shotCount }, (_, index) =>
    shotCount === 1 ? 0 : (index - (shotCount - 1) / 2) * 7,
  );

  for (const xOffset of baseOffsets) {
    for (let index = 0; index < angleCount; index += 1) {
      const angle = (index - (angleCount - 1) / 2) * angleStep;
      playerBullets.push({
        id: nextEntityId++,
        x: ship.x + xOffset,
        y: ship.y - SHIP_HEIGHT / 2,
        previousX: ship.x + xOffset,
        previousY: ship.y - SHIP_HEIGHT / 2,
        vx: Math.sin(angle) * PLAYER_BULLET_SPEED,
        vy: -Math.cos(angle) * PLAYER_BULLET_SPEED,
        radius: 5,
        remainingHits: 1 + Math.floor(gameState.piercingLevel / 3),
        damage,
        hitIds: new Set(),
      });
    }
  }
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(px - x1, py - y1);
  const projection = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared),
  );
  return Math.hypot(px - (x1 + projection * dx), py - (y1 + projection * dy));
}

function sweptCollision(first, second, radius) {
  const startX = first.previousX - second.previousX;
  const startY = first.previousY - second.previousY;
  const endX = first.x - second.x;
  const endY = first.y - second.y;
  return distanceToSegment(0, 0, startX, startY, endX, endY) <= radius;
}

function addExplosion(x, y, color, count = 12) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 35 + Math.random() * 155;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color,
      life: 0.25 + Math.random() * 0.35,
      maxLife: 0.6,
    });
  }
}

function destroyEnemy(enemy, index, list = enemies) {
  list.splice(index, 1);
  gameState.score += 10;
  addExplosion(enemy.x, enemy.y, ENEMY_TYPES[enemy.type]?.color ?? "#ff604d");
}

function applyPowerup(type) {
  if (type === "shield") {
    gameState.shield += 1;
    showMessage("¡Escudo listo! Bloquea un impacto.", 1.5);
  } else if (type === "heal") {
    if (gameState.lives < INITIAL_LIVES) {
      gameState.lives += 1;
      showMessage("¡Vida recuperada!", 1.5);
    } else {
      gameState.score += 10;
      showMessage("Vidas completas: +10 puntos.", 1.5);
    }
  } else if (type === "shots") {
    gameState.shotLevel = Math.min(4, gameState.shotLevel + 1);
    showMessage("¡Disparo adicional!", 1.5);
  } else if (type === "speed") {
    gameState.speedTimer = 15;
    showMessage("¡Velocidad aumentada por 15 s!", 1.5);
  } else if (type === "piercing") {
    gameState.piercingLevel += 1;
    showMessage(`¡Perforación nivel ${gameState.piercingLevel}!`, 1.5);
  } else if (type === "spread") {
    gameState.spreadLevel += 1;
    showMessage(`¡Abanico nivel ${gameState.spreadLevel}!`, 1.5);
  }
  updateHud();
}

function damagePlayer() {
  if (gameState.hitCooldown > 0 || gameState.status !== "playing") return;
  gameState.hitCooldown = 0.72;
  gameState.feedbackTimer = 0.38;

  if (gameState.shield > 0) {
    gameState.shield -= 1;
    showMessage("¡El escudo bloqueó el impacto!", 1.5);
    addExplosion(ship.x, ship.y, "#42d9ff", 20);
  } else {
    gameState.lives -= 1;
    showMessage("¡Impacto! Has perdido una vida.", 1.5);
    addExplosion(ship.x, ship.y, "#ff526f", 18);
  }

  if (gameState.lives <= 0) {
    gameState.lives = 0;
    gameState.status = "game-over";
    pressedKeys.clear();
    elements.difficulty.disabled = false;
    elements.message.textContent = `Game Over. Puntuación final: ${gameState.score}. Pulsa Enter para volver a jugar.`;
    messageTimer = 0;
  }
  updateHud();
}

function updatePlayer(deltaTime) {
  ship.previousX = ship.x;
  ship.previousY = ship.y;
  const left = pressedKeys.has("ArrowLeft") || pressedKeys.has("KeyA");
  const right = pressedKeys.has("ArrowRight") || pressedKeys.has("KeyD");
  if (left !== right) {
    const speed = PLAYER_SPEED * (gameState.speedTimer > 0 ? 1.55 : 1);
    ship.x += (right ? 1 : -1) * speed * deltaTime;
  }
  ship.x = Math.max(SHIP_WIDTH / 2, Math.min(WIDTH - SHIP_WIDTH / 2, ship.x));

  if (pressedKeys.has("Space")) {
    playerFireCooldown -= deltaTime;
    if (playerFireCooldown <= 0) {
      firePlayerWeapon();
      playerFireCooldown = PLAYER_FIRE_INTERVAL;
    }
  } else {
    playerFireCooldown = 0;
  }
}

function updateThreatDirector(deltaTime) {
  const level = gameState.threatLevel;
  const spawnInterval = Math.max(0.09, 1.12 * Math.pow(0.94, level - 1));
  const budgetIncome = 0.8 + level * 0.24;
  gameState.spawnBudget = Math.min(2.5, gameState.spawnBudget + budgetIncome * deltaTime);
  enemySpawnCooldown -= deltaTime;

  if (
    gameState.spawnBudget >= ENEMY_TYPES.scout.cost &&
    enemySpawnCooldown <= 0 &&
    enemies.length < enemyCap()
  ) {
    const type = selectEnemyType(gameState.spawnBudget);
    spawnEnemy(type);
    gameState.spawnBudget -= ENEMY_TYPES[type].cost;
    enemySpawnCooldown += spawnInterval;
  }
}

function updateEnemies(deltaTime) {
  for (const enemy of enemies) {
    enemy.previousX = enemy.x;
    enemy.previousY = enemy.y;
    enemy.phase += deltaTime * (enemy.type === "scout" ? 2 : 1.2);

    if (enemy.type === "scout") {
      enemy.x += Math.sin(enemy.phase) * 65 * deltaTime;
    } else if (enemy.type === "strafe") {
      const targetDirection = Math.sign(ship.x - enemy.x);
      enemy.vx += (targetDirection * 70 - enemy.vx) * deltaTime * 0.35;
      enemy.x += enemy.vx * deltaTime;
    } else {
      enemy.x += Math.sin(enemy.phase * 0.55) * 22 * deltaTime;
    }
    enemy.y += enemy.vy * deltaTime;
    enemy.x = Math.max(enemy.radius, Math.min(WIDTH - enemy.radius, enemy.x));
    enemy.fireCooldown -= deltaTime;
    if (enemy.fireCooldown <= 0) {
      fireEnemyWeapon(enemy);
      const delayScale = Math.max(0.36, 1 - gameState.threatLevel * 0.028);
      enemy.fireCooldown =
        ENEMY_TYPES[enemy.type].fireDelay * delayScale * (0.8 + Math.random() * 0.4);
    }
  }

  for (let index = enemies.length - 1; index >= 0; index -= 1) {
    if (enemies[index].y - enemies[index].radius > HEIGHT) {
      enemies.splice(index, 1);
    }
  }
}

function fireBossBeam(boss) {
  const originY = boss.y + boss.radius * 0.55;
  const dx = boss.targetX - boss.x;
  const dy = boss.targetY - originY;
  const length = Math.hypot(dx, dy);
  lasers.push({
    id: nextEntityId++,
    ownerId: boss.id,
    x: boss.x,
    y: originY,
    targetX: boss.targetX,
    targetY: boss.targetY,
    distance: length,
    progress: 0,
    speed: Math.min(900, 620 + gameState.threatLevel * 8),
    linger: 0.12,
    hitEnemyIds: new Set(),
    hitBossIds: new Set(),
  });
}

function updateBosses(deltaTime) {
  for (const boss of bosses) {
    boss.previousX = boss.x;
    boss.previousY = boss.y;
    if (boss.y < 95) {
      boss.y = Math.min(95, boss.y + boss.vy * deltaTime);
    } else {
      boss.x += boss.vx * deltaTime;
      if (boss.x < boss.radius || boss.x > WIDTH - boss.radius) boss.vx *= -1;
    }

    if (boss.charge > 0) {
      boss.charge -= deltaTime;
      if (boss.charge <= 0) {
        fireBossBeam(boss);
        boss.fireCooldown = Math.max(1.7, 3.8 - gameState.threatLevel * 0.035);
      }
    } else {
      boss.fireCooldown -= deltaTime;
      if (boss.fireCooldown <= 0) {
        boss.charge = Math.max(0.6, 2 - gameState.threatLevel * 0.035);
        boss.targetX = ship.x;
        boss.targetY = ship.y;
        showMessage("¡El jefe carga su rayo! ¡Muévete!", Math.max(0.6, boss.charge));
      }
    }
  }

  for (let index = bosses.length - 1; index >= 0; index -= 1) {
    if (bosses[index].y > HEIGHT + bosses[index].radius) bosses.splice(index, 1);
  }
}

function updateLasers(deltaTime) {
  for (let laserIndex = lasers.length - 1; laserIndex >= 0; laserIndex -= 1) {
    const laser = lasers[laserIndex];
    laser.progress = Math.min(laser.distance, laser.progress + laser.speed * deltaTime);
    if (laser.progress >= laser.distance) laser.linger -= deltaTime;

    const endX = laser.x + ((laser.targetX - laser.x) / laser.distance) * laser.progress;
    const endY = laser.y + ((laser.targetY - laser.y) / laser.distance) * laser.progress;

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = enemies[enemyIndex];
      if (
        laser.hitEnemyIds.has(enemy.id) ||
        distanceToSegment(enemy.x, enemy.y, laser.x, laser.y, endX, endY) >
          enemy.radius + 22
      ) {
        continue;
      }
      laser.hitEnemyIds.add(enemy.id);
      destroyEnemy(enemy, enemyIndex);
    }

    for (let bossIndex = bosses.length - 1; bossIndex >= 0; bossIndex -= 1) {
      const targetBoss = bosses[bossIndex];
      if (
        targetBoss.id === laser.ownerId ||
        laser.hitBossIds.has(targetBoss.id) ||
        distanceToSegment(
          targetBoss.x,
          targetBoss.y,
          laser.x,
          laser.y,
          endX,
          endY,
        ) > targetBoss.radius + 22
      ) {
        continue;
      }
      laser.hitBossIds.add(targetBoss.id);
      bosses.splice(bossIndex, 1);
      gameState.score += 100;
      addExplosion(targetBoss.x, targetBoss.y, "#ffbb55", 36);
      showMessage("¡Jefe destruido! +100", 1.8);
    }

    if (
      distanceToSegment(ship.x, ship.y, laser.x, laser.y, endX, endY) <=
      SHIP_WIDTH * 0.34 + 22
    ) {
      damagePlayer();
    }

    if (laser.linger <= 0) lasers.splice(laserIndex, 1);
  }
}

function collectOrb(orb, index) {
  orbs.splice(index, 1);
  applyPowerup(orb.type);
}

function updateOrbs(deltaTime) {
  orbSpawnTimer -= deltaTime;
  if (orbSpawnTimer <= 0) {
    spawnOrb();
    orbSpawnTimer += 30;
  }
  for (const orb of orbs) {
    orb.previousX = orb.x;
    orb.previousY = orb.y;
    orb.y += orb.vy * deltaTime;
  }
  for (let index = orbs.length - 1; index >= 0; index -= 1) {
    const orb = orbs[index];
    if (orb.y - orb.radius > HEIGHT) {
      orbs.splice(index, 1);
    } else if (Math.hypot(orb.x - ship.x, orb.y - ship.y) < orb.radius + 22) {
      collectOrb(orb, index);
    }
  }
}

function updateBullets(deltaTime) {
  for (const bullet of playerBullets) {
    bullet.previousX = bullet.x;
    bullet.previousY = bullet.y;
    bullet.x += bullet.vx * deltaTime;
    bullet.y += bullet.vy * deltaTime;
  }
  for (const bullet of enemyBullets) {
    bullet.previousX = bullet.x;
    bullet.previousY = bullet.y;
    bullet.x += bullet.vx * deltaTime;
    bullet.y += bullet.vy * deltaTime;
  }

  for (let playerIndex = playerBullets.length - 1; playerIndex >= 0; playerIndex -= 1) {
    const playerBullet = playerBullets[playerIndex];
    let consumed = false;
    for (let enemyIndex = enemyBullets.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemyBullet = enemyBullets[enemyIndex];
      if (sweptCollision(playerBullet, enemyBullet, playerBullet.radius + enemyBullet.radius)) {
        playerBullets.splice(playerIndex, 1);
        enemyBullets.splice(enemyIndex, 1);
        consumed = true;
        break;
      }
    }
    if (consumed) continue;

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = enemies[enemyIndex];
      if (
        playerBullet.hitIds.has(enemy.id) ||
        !sweptCollision(playerBullet, enemy, playerBullet.radius + enemy.radius)
      ) {
        continue;
      }
      playerBullet.hitIds.add(enemy.id);
      enemy.health -= playerBullet.damage;
      if (enemy.health <= 0) destroyEnemy(enemy, enemyIndex);
      playerBullet.remainingHits -= 1;
      if (playerBullet.remainingHits <= 0) {
        playerBullets.splice(playerIndex, 1);
        consumed = true;
        break;
      }
    }
    if (consumed) continue;

    for (let bossIndex = bosses.length - 1; bossIndex >= 0; bossIndex -= 1) {
      const boss = bosses[bossIndex];
      if (
        playerBullet.hitIds.has(boss.id) ||
        !sweptCollision(playerBullet, boss, playerBullet.radius + boss.radius)
      ) {
        continue;
      }
      playerBullet.hitIds.add(boss.id);
      boss.health -= playerBullet.damage;
      playerBullet.remainingHits -= 1;
      if (boss.health <= 0) {
        bosses.splice(bossIndex, 1);
        gameState.score += 100;
        addExplosion(boss.x, boss.y, "#ffbb55", 36);
        showMessage("¡Jefe destruido! +100", 1.8);
      }
      if (playerBullet.remainingHits <= 0) {
        playerBullets.splice(playerIndex, 1);
        break;
      }
    }
  }

  for (let bulletIndex = enemyBullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
    const bullet = enemyBullets[bulletIndex];
    const player = {
      x: ship.x,
      y: ship.y,
      previousX: ship.previousX,
      previousY: ship.previousY,
    };
    if (sweptCollision(bullet, player, bullet.radius + SHIP_WIDTH * 0.34)) {
      enemyBullets.splice(bulletIndex, 1);
      damagePlayer();
    }
  }

  for (let index = enemies.length - 1; index >= 0; index -= 1) {
    const enemy = enemies[index];
    const player = {
      x: ship.x,
      y: ship.y,
      previousX: ship.previousX,
      previousY: ship.previousY,
    };
    if (sweptCollision(enemy, player, enemy.radius + SHIP_WIDTH * 0.35)) {
      enemies.splice(index, 1);
      damagePlayer();
    }
  }

  for (let index = bosses.length - 1; index >= 0; index -= 1) {
    const boss = bosses[index];
    if (Math.hypot(boss.x - ship.x, boss.y - ship.y) < boss.radius + 22) {
      bosses.splice(index, 1);
      damagePlayer();
    }
  }

  for (let index = playerBullets.length - 1; index >= 0; index -= 1) {
    const bullet = playerBullets[index];
    if (
      bullet.y < -20 ||
      bullet.x < -30 ||
      bullet.x > WIDTH + 30 ||
      bullet.y > HEIGHT + 20
    ) {
      playerBullets.splice(index, 1);
    }
  }
  for (let index = enemyBullets.length - 1; index >= 0; index -= 1) {
    const bullet = enemyBullets[index];
    if (
      bullet.y < -40 ||
      bullet.x < -50 ||
      bullet.x > WIDTH + 50 ||
      bullet.y > HEIGHT + 50
    ) {
      enemyBullets.splice(index, 1);
    }
  }
}

function updateParticles(deltaTime) {
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    particle.life -= deltaTime;
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.vx *= Math.max(0, 1 - deltaTime * 2);
    particle.vy *= Math.max(0, 1 - deltaTime * 2);
    if (particle.life <= 0) particles.splice(index, 1);
  }
}

function update(deltaTime) {
  if (messageTimer > 0) {
    messageTimer -= deltaTime;
    if (messageTimer <= 0 && gameState.status === "playing") {
      elements.message.textContent = "";
    }
  }
  if (gameState.status !== "playing") {
    updateParticles(deltaTime);
    return;
  }

  gameState.elapsed += deltaTime;
  gameState.threatTime = gameState.elapsed + THREAT_OFFSETS[gameState.difficulty];
  gameState.threatLevel = currentThreatLevel();
  gameState.hitCooldown = Math.max(0, gameState.hitCooldown - deltaTime);
  gameState.feedbackTimer = Math.max(0, gameState.feedbackTimer - deltaTime);
  gameState.speedTimer = Math.max(0, gameState.speedTimer - deltaTime);

  updatePlayer(deltaTime);
  updateThreatDirector(deltaTime);
  updateEnemies(deltaTime);
  updateBullets(deltaTime);
  updateBosses(deltaTime);
  updateLasers(deltaTime);
  updateOrbs(deltaTime);
  updateParticles(deltaTime);

  bossSpawnTimer -= deltaTime;
  if (bossSpawnTimer <= 0) {
    spawnBoss();
    bossSpawnTimer += 60;
  }

  hudUpdateTimer -= deltaTime;
  if (hudUpdateTimer <= 0) {
    updateHud();
    hudUpdateTimer = 0.15;
  }
}

function drawImage(name, x, y, width, height, fallbackColor) {
  const image = assets[name];
  if (image?.loaded) {
    context.drawImage(image, x - width / 2, y - height / 2, width, height);
    return;
  }
  context.fillStyle = fallbackColor;
  context.beginPath();
  context.arc(x, y, Math.max(width, height) * 0.32, 0, Math.PI * 2);
  context.fill();
}

function drawEnemy(enemy) {
  const config = ENEMY_TYPES[enemy.type];
  drawImage(config.sprite, enemy.x, enemy.y, enemy.radius * 2.35, enemy.radius * 2.35, config.color);
  if (enemy.maxHealth > 1) {
    const width = enemy.radius * 2;
    context.fillStyle = "#182033";
    context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 8, width, 4);
    context.fillStyle = config.color;
    context.fillRect(
      enemy.x - width / 2,
      enemy.y - enemy.radius - 8,
      width * Math.max(0, enemy.health / enemy.maxHealth),
      4,
    );
  }
}

function drawBoss(boss) {
  if (boss.charge > 0) {
    context.save();
    context.strokeStyle = `rgba(255, 65, 87, ${0.25 + Math.sin(gameState.elapsed * 24) * 0.2})`;
    context.lineWidth = 3 + Math.sin(gameState.elapsed * 18) * 1.5;
    context.setLineDash([10, 8]);
    context.beginPath();
    context.moveTo(boss.x, boss.y + boss.radius / 2);
    context.lineTo(boss.targetX, boss.targetY);
    context.stroke();
    context.setLineDash([]);
    context.restore();
  }
  drawImage("boss", boss.x, boss.y, 100, 100, "#891d31");
  const width = 100;
  context.fillStyle = "#22121b";
  context.fillRect(boss.x - width / 2, boss.y - boss.radius - 12, width, 6);
  context.fillStyle = "#ff526f";
  context.fillRect(
    boss.x - width / 2,
    boss.y - boss.radius - 12,
    width * Math.max(0, boss.health / boss.maxHealth),
    6,
  );
}

function drawLaser(laser) {
  const distance = Math.min(laser.progress, laser.distance);
  if (distance <= 0) return;

  const dx = laser.targetX - laser.x;
  const dy = laser.targetY - laser.y;
  const angle = Math.atan2(-dx, dy);
  const centerX = laser.x + (dx / laser.distance) * (distance / 2);
  const centerY = laser.y + (dy / laser.distance) * (distance / 2);

  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.shadowColor = "#ff3b32";
  context.shadowBlur = 26;
  if (assets.bossBullet.loaded) {
    context.drawImage(assets.bossBullet, -24, -distance / 2, 48, distance);
  } else {
    context.fillStyle = "#ff493b";
    context.fillRect(-24, -distance / 2, 48, distance);
  }
  context.fillStyle = "#fff6cb";
  context.shadowBlur = 12;
  context.fillRect(-5, -distance / 2, 10, distance);
  context.restore();
}

function drawShip() {
  if (gameState.hitCooldown > 0 && Math.floor(gameState.elapsed * 18) % 2 === 0) return;
  if (gameState.shield > 0 || gameState.feedbackTimer > 0) {
    context.strokeStyle = gameState.shield > 0 ? "#52dfff" : "#ff687f";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(ship.x, ship.y, 32 + Math.sin(gameState.elapsed * 9) * 3, 0, Math.PI * 2);
    context.stroke();
  }
  drawImage("player", ship.x, ship.y, SHIP_WIDTH, SHIP_HEIGHT, "#8cecff");
}

function drawPlayerBullet(bullet) {
  context.save();
  context.shadowColor = "#4fdfff";
  context.shadowBlur = 5;
  context.fillStyle = "rgba(79, 223, 255, 0.2)";
  context.beginPath();
  context.ellipse(bullet.x, bullet.y + 5, 8, 18, 0, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 0.85;
  drawImage("playerBullet", bullet.x, bullet.y, 22, 38, "#8cf5ff");
  context.globalAlpha = 1;
  context.fillStyle = "#d5faff";
  context.shadowBlur = 3;
  context.beginPath();
  context.ellipse(bullet.x, bullet.y, 3, 11, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawEnemyBullet(bullet) {
  const colors = {
    enemyBullet1: "#ff526f",
    enemyBullet2: "#e56bff",
    enemyBullet3: "#a4ff68",
    bossBullet: "#ff304d",
  };
  const color = colors[bullet.sprite] || "#ffb14d";
  const width = bullet.heavy ? 44 : 28;
  const height = bullet.heavy ? 50 : 38;
  context.save();
  context.translate(bullet.x, bullet.y);
  context.rotate(bullet.angle || 0);
  context.shadowColor = color;
  context.shadowBlur = bullet.heavy ? 9 : 5;
  context.fillStyle = color;
  context.globalAlpha = 0.3;
  context.beginPath();
  context.ellipse(0, 0, width * 0.4, height * 0.4, 0, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  context.globalAlpha = 0.88;
  drawImage(bullet.sprite, 0, 0, width, height, color);
  context.globalAlpha = 1;
  context.fillStyle = "#f3e8cd";
  context.beginPath();
  context.ellipse(
    0,
    0,
    bullet.heavy ? 6 : 4,
    bullet.heavy ? 12 : 7,
    0,
    0,
    Math.PI * 2,
  );
  context.fill();
  context.restore();
}

function drawOrb(orb) {
  const powerup = POWERUPS[orb.type];
  const colors = {
    shield: "#40dcff",
    heal: "#71ff9a",
    shots: "#ffd45c",
    speed: "#62e9a1",
    piercing: "#bd8bff",
    spread: "#ffe45f",
  };
  const color = colors[orb.type];
  const pulse = (Math.sin(gameState.elapsed * 6 + orb.id) + 1) / 2;
  const glow = context.createRadialGradient(orb.x, orb.y, 3, orb.x, orb.y, 25);
  glow.addColorStop(0, `${color}66`);
  glow.addColorStop(0.55, `${color}33`);
  glow.addColorStop(1, `${color}00`);
  context.save();
  context.fillStyle = glow;
  context.beginPath();
  context.arc(orb.x, orb.y, 25, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = color;
  context.globalAlpha = 0.45 + pulse * 0.25;
  context.lineWidth = 1.5;
  context.shadowColor = color;
  context.shadowBlur = 6;
  context.beginPath();
  context.arc(orb.x, orb.y, 21 + pulse * 2, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 1;
  for (let index = 0; index < 3; index += 1) {
    const angle = gameState.elapsed * 1.8 + orb.id + (index * Math.PI * 2) / 3;
    context.beginPath();
    context.arc(
      orb.x + Math.cos(angle) * 24,
      orb.y + Math.sin(angle) * 24,
      1.5 + pulse,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  if (powerup.sprite) {
    drawImage(powerup.sprite, orb.x, orb.y, 38, 38, "#f7b84f");
  } else {
    context.fillStyle = color;
    context.beginPath();
    context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#101626";
    context.font = "bold 15px Segoe UI, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(orb.type === "speed" ? "V" : orb.type === "piercing" ? "P" : "A", orb.x, orb.y);
  }
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

  for (const orb of orbs) drawOrb(orb);
  for (const enemy of enemies) drawEnemy(enemy);
  for (const boss of bosses) drawBoss(boss);
  for (const laser of lasers) drawLaser(laser);
  for (const bullet of enemyBullets) drawEnemyBullet(bullet);
  for (const bullet of playerBullets) drawPlayerBullet(bullet);

  for (const particle of particles) {
    context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  drawShip();

  if (gameState.status === "playing") {
    context.fillStyle = "#eef4ff";
    context.textAlign = "left";
    context.font = "600 15px Segoe UI, sans-serif";
    context.fillText(`Amenaza ${gameState.threatLevel}`, 18, 28);
    context.fillStyle = "#aebbd4";
    context.font = "14px Segoe UI, sans-serif";
    context.fillText(`Enemigos: ${enemies.length} · Jefes: ${bosses.length}`, 18, 49);
  } else if (gameState.status === "start") {
    context.fillStyle = "#eef4ff";
    context.textAlign = "center";
    context.font = "600 26px Segoe UI, sans-serif";
    context.fillText("Pulsa Enter para empezar", WIDTH / 2, HEIGHT / 2 - 12);
    context.fillStyle = "#aebbd4";
    context.font = "16px Segoe UI, sans-serif";
    context.fillText("Flechas o A/D para moverte · Espacio para disparar", WIDTH / 2, HEIGHT / 2 + 20);
  } else if (gameState.status === "game-over") {
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
  const deltaTime =
    previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;
  update(deltaTime);
  render();
  window.requestAnimationFrame(frame);
}

updateHud();
render();
window.requestAnimationFrame(frame);
