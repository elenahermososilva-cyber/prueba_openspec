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

const ship = {
  x: WIDTH / 2,
  y: HEIGHT - 58,
};

const pressedKeys = new Set();
const lasers = [];
let started = false;
let laserCooldown = 0;
let previousTime = 0;

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
    started = true;
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

function update(deltaTime) {
  if (!started) {
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

  for (const laser of lasers) {
    context.fillStyle = "#ff687f";
    context.shadowColor = "#ff345e";
    context.shadowBlur = 12;
    context.fillRect(laser.x - 2, laser.y - 12, 4, 18);
  }
  context.shadowBlur = 0;

  drawShip();

  if (!started) {
    context.fillStyle = "#eef4ff";
    context.textAlign = "center";
    context.font = "600 25px Segoe UI, sans-serif";
    context.fillText("Pulsa Enter para empezar", WIDTH / 2, HEIGHT / 2 - 12);
    context.fillStyle = "#aebbd4";
    context.font = "16px Segoe UI, sans-serif";
    context.fillText("La nave se controla con las flechas o A y D", WIDTH / 2, HEIGHT / 2 + 20);
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
