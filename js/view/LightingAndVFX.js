/**
 * Actualización y dibujo de iluminación, lluvia, partículas y resplandores.
 */
import { getCanvasContext } from './Sprites.js';
import { gameState } from '../model/GameState.js';
import { AMBIENT_LIGHTING, CW, CH, LAMPS } from '../model/Config.js';
import { beep } from './AudioSystem.js';
/** Avanza transiciones de luz, lluvia, partículas y mensajes flotantes.
 */
export function updateVFX(dt) {
  const kind = Math.min(1, dt * 6);
  if (gameState.fade > 0) {
    gameState.fade = Math.max(0, gameState.fade - dt * 1.6);
  }
  if (gameState.gameStatus !== gameState.previousGameStatus) {
    gameState.previousGameStatus = gameState.gameStatus;
    gameState.fade = 1;
  }
  gameState.displayedHealth += (gameState.player.hp - gameState.displayedHealth) * kind;
  gameState.displayedMonths += (gameState.month - gameState.displayedMonths) * kind * .7;
  gameState.displayedExperience += (gameState.experience % 3 - gameState.displayedExperience) * kind;
  const value = AMBIENT_LIGHTING[gameState.zone];
  for (let index = 0; index < 4; index++) {
    gameState.ambientLight[index] += (value[index] - gameState.ambientLight[index]) * Math.min(1, dt * 2);
  }
  if (gameState.dialogue || gameState.gameStatus !== 'play') {
    gameState.isMoving = 0;
  }
  if (gameState.gameStatus === 'menu') {
    return;
  }
  gameState.lightningTimer -= dt;
  if (gameState.zone === 2 && gameState.lightningTimer <= 0) {
    gameState.lightningFlash = 1;
    gameState.lightningTimer = 3 + Math.random() * 4;
    beep(70, .5, 'sawtooth', .06, -30);
  }
  gameState.lightningFlash = Math.max(0, gameState.lightningFlash - dt * 2.5);
  if (gameState.zone === 2) {
    const rainSpawnCount = gameState.missionPhase === 1 && gameState.currentQuestIndex === 2 ? 7 : 4;
    for (let index = 0; index < rainSpawnCount && gameState.rain.length < 260; index++) {
      gameState.rain.push({
        x: Math.random() * 800,
        y: -10,
        speed: 420 + Math.random() * 200,
        groundY: 30 + Math.random() * 450
      });
    }
  }
  gameState.rain = gameState.rain.filter(rectangle => {
    rectangle.y += rectangle.speed * dt;
    rectangle.x -= rectangle.speed * .25 * dt;
    return rectangle.y <= rectangle.groundY;
  });
  gameState.floatingMessages = gameState.floatingMessages.filter(message => {
    message.y -= 24 * dt;
    message.lifetime -= dt;
    return message.lifetime > 0;
  });
  gameState.particles = gameState.particles.filter(particle => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.lifetime -= dt;
    return particle.lifetime > 0;
  });
  if (gameState.particles.length > 600) {
    gameState.particles.splice(0, 150);
  }
}
/** Dibuja un resplandor radial con composición aditiva.
 */
export function glow(positionX, positionY, radius, color, opacity) {
  const ctx = getCanvasContext();
  ctx.save();
  try {
    ctx.globalCompositeOperation = 'lighter';
    const gradient = ctx.createRadialGradient(positionX, positionY, 0, positionX, positionY, radius);
    gradient.addColorStop(0, `rgba(${color},${opacity})`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(positionX - radius, positionY - radius, radius * 2, radius * 2);
  } finally {
    ctx.restore();
  }
}
/** Aplica luz ambiental, lámparas, relámpagos, lluvia y viñeta.
 */
export function lighting() {
  const ctx = getCanvasContext();
  const [ambientRed, ambientGreen, ambientBlue, ambientAlpha] = gameState.ambientLight;
  ctx.fillStyle = `rgba(${ambientRed | 0},${ambientGreen | 0},${ambientBlue | 0},${ambientAlpha})`;
  ctx.fillRect(0, 0, CW, CH);
  LAMPS.forEach(lamp => {
    glow(
      lamp[0] - gameState.camera.x,
      lamp[1] - gameState.camera.y,
      95,
      '255,200,110',
      Math.min(.5, ambientAlpha * 1.3)
    );
  });
  if (gameState.lightningFlash > 0) {
    ctx.fillStyle = `rgba(220,235,255,${gameState.lightningFlash * .55})`;
    ctx.fillRect(0, 0, CW, CH);
  }
  if (gameState.rain.length) {
    ctx.strokeStyle = 'rgba(170,210,255,.55)';
    ctx.beginPath();
    for (const rainDrop of gameState.rain) {
      ctx.moveTo(rainDrop.x, rainDrop.y);
      ctx.lineTo(rainDrop.x + 5, rainDrop.y - 16);
    }
    ctx.stroke();
  }
  const vignetteGradient = ctx.createRadialGradient(320, 240, 230, 320, 240, 420);
  vignetteGradient.addColorStop(0, 'transparent');
  vignetteGradient.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, CW, CH);
}
