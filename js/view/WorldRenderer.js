/**
 * Dibujo del mapa, entidades ordenadas por profundidad y elementos del mundo.
 */
import { getCanvasContext } from './Sprites.js';
import { gameState } from '../model/GameState.js';
import { WW } from '../model/Config.js';
import { BUILDINGS, NPCS, BURNT_CARS, TREES } from '../model/WorldData.js';
import { rect as drawRect, text as drawText, burger, calc, drawPlayer, drawEnemy } from './Sprites.js';
import { glow } from './LightingAndVFX.js';

/** Convierte valores de estado a números finitos antes de enviarlos al Canvas. */
function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/** Devuelve un radio válido para las APIs de gradientes radiales. */
function safeRadius(value, fallback = 1) {
  return Math.max(0.1, Math.abs(finiteNumber(value, fallback)));
}

/** Deja el contexto en el estado neutro esperado por el resto del juego. */
function resetContext(ctx) {
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
/** Dibuja un rectángulo del mundo transformado por la cámara.
 */
const drawWorldRect = (color, positionX, positionY, width, height) => {
  drawRect(color, positionX - gameState.camera.x, positionY - gameState.camera.y, width, height);
};
/** Dibuja la sombra elíptica de un objeto del mundo.
 */
function shadow(positionX, positionY, width) {
  const ctx = getCanvasContext();
  if (!ctx) {
    return;
  }
  positionX = finiteNumber(positionX);
  positionY = finiteNumber(positionY);
  width = safeRadius(width);
  const stormFactor = gameState.zone === 2 ? 1 : 0;
  const flashFactor = Math.max(0, Math.min(1, finiteNumber(gameState.lightningFlash)));
  const offsetX = 5 + stormFactor * 7 - flashFactor * 5;
  const offsetY = 2 + stormFactor * 5 - flashFactor * 3;
  const shadowOpacity = 0.22 + stormFactor * 0.15 - flashFactor * 0.13;
  const screenX = positionX - gameState.camera.x + offsetX;
  const screenY = positionY - gameState.camera.y + offsetY;
  ctx.save();
  try {
    ctx.translate(screenX, screenY);
    ctx.scale(1, 0.38 + stormFactor * 0.08);
    try {
      const innerRadius = Math.max(0.1, width * 0.12);
      const outerRadius = Math.max(innerRadius + 0.1, width * (1.2 + stormFactor * 0.3));
      const shadowGradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
      shadowGradient.addColorStop(0, `rgba(4,7,18,${shadowOpacity})`);
      shadowGradient.addColorStop(0.65, `rgba(4,7,18,${shadowOpacity * 0.48})`);
      shadowGradient.addColorStop(1, 'rgba(4,7,18,0)');
      ctx.fillStyle = shadowGradient;
    } catch (error) {
      ctx.fillStyle = `rgba(4,7,18,${shadowOpacity * 0.5})`;
    }
    ctx.fillRect(-width * 1.6, -width * 1.6, width * 3.2, width * 3.2);
  } finally {
    ctx.restore();
    resetContext(ctx);
  }
}

/** Dibuja el cono de visión de un guardia en dirección a su patrulla o al jugador. */
function drawGuardVisionCone(enemy, positionX, positionY) {
  const ctx = getCanvasContext();
  const centerX = finiteNumber(positionX) + safeRadius(enemy?.w, 16) / 2;
  const centerY = finiteNumber(positionY) + safeRadius(enemy?.h, 18) / 2;
  const angle = enemy.isChasingPlayer
    ? Math.atan2(gameState.player.y - enemy.y, gameState.player.x - enemy.x)
    : enemy.direction > 0 ? 0 : Math.PI;
  ctx.save();
  try {
    ctx.globalCompositeOperation = 'lighter';
    try {
      const gradient = ctx.createRadialGradient(centerX, centerY, 6, centerX, centerY, 130);
      gradient.addColorStop(0, 'rgba(255,60,60,.32)');
      gradient.addColorStop(1, 'rgba(255,60,60,0)');
      ctx.fillStyle = gradient;
    } catch (error) {
      ctx.fillStyle = 'rgba(255,60,60,.12)';
    }
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, 130, angle - 1.05, angle + 1.05);
    ctx.closePath();
    ctx.fill();
  } finally {
    ctx.restore();
    resetContext(ctx);
  }
}
/** Dibuja césped, caminos, edificios, marcas y autos quemados.
 */
function ground() {
  for (let tx = Math.floor(gameState.camera.x / 40); tx < gameState.camera.x / 40 + 17; tx++) {
    for (let ty = Math.floor(gameState.camera.y / 40); ty < gameState.camera.y / 40 + 13; ty++) {
      drawWorldRect((tx + ty) % 2 ? '#3a7f3a' : '#3f8a3f', tx * 40, ty * 40, 40, 40);
    }
  }
  drawWorldRect('#4a4a58', 0, 560, WW, 80);
  for (let positionX = 0; positionX < WW; positionX += 80) {
    drawWorldRect('#ddd', positionX, 597, 40, 4);
  }
  drawWorldRect('#6b6a78', 700, 500, 200, 200);
  drawWorldRect('#8d8b9a', 1160, 780, 300, 110);
  for (let tileX = 1160; tileX < 1460; tileX += 24) {
    drawWorldRect('rgba(37,43,58,.16)', tileX, 780, 1, 110);
    for (let tileY = 780; tileY < 890; tileY += 22) {
      if ((tileX + tileY) % 3 === 0) {
        drawWorldRect('rgba(255,255,255,.08)', tileX + 4, tileY + 5, 7, 3);
      }
    }
  }
  drawWorldRect('#777584', 1160, 778, 300, 4);
  drawWorldRect('rgba(20,18,29,.28)', 0, 636, WW, 5);
  const visibleLeft = Math.max(0, Math.floor(gameState.camera.x / 40) * 40);
  const visibleRight = Math.min(WW, gameState.camera.x + 680);
  for (let tileX = visibleLeft; tileX < visibleRight; tileX += 40) {
    for (let tileY = Math.max(0, Math.floor(gameState.camera.y / 40) * 40); tileY < gameState.camera.y + 500; tileY += 40) {
      const pattern = Math.abs((tileX * 17 + tileY * 31) % 11);
      if (pattern < 3) {
        drawWorldRect('rgba(170,220,125,.13)', tileX + pattern * 7, tileY + 8, 2, 3);
      }
    }
  }
  for (const worldObject of BUILDINGS) {
    drawWorldRect('rgba(10,10,22,.42)', worldObject.x - 5, worldObject.y + worldObject.h - 2, worldObject.w + 10, 12);
    drawWorldRect(worldObject.color, worldObject.x, worldObject.y, worldObject.w, worldObject.h);
    drawWorldRect('rgba(0,0,0,.3)', worldObject.x, worldObject.y, worldObject.w, 16);
    drawWorldRect('rgba(255,220,160,.18)', worldObject.x + 4, worldObject.y + 18, 3, worldObject.h - 54);
    for (let brickX = worldObject.x + 8; brickX < worldObject.x + worldObject.w - 8; brickX += 26) {
      drawWorldRect('rgba(20,18,29,.18)', brickX, worldObject.y + 26, 18, 2);
      drawWorldRect('rgba(20,18,29,.18)', brickX - 7, worldObject.y + 48, 18, 2);
    }
    drawWorldRect('rgba(255,235,190,.26)', worldObject.x - 2, worldObject.y - 3, worldObject.w + 4, 4);
    drawWorldRect('rgba(20,18,29,.28)', worldObject.x, worldObject.y + worldObject.h - 3, worldObject.w, 5);
    drawWorldRect('#2a1a10', worldObject.x + worldObject.w / 2 - 16, worldObject.y + worldObject.h - 34, 32, 34);
    drawText(
      worldObject.label,
      worldObject.x + worldObject.w / 2 - gameState.camera.x,
      worldObject.y + 36 - gameState.camera.y,
      8,
      '#fff',
      'center'
    );
  }
  for (const car of BURNT_CARS) {
    shadow(car.x + car.w / 2, car.y + car.h, car.w * 0.65);
    drawWorldRect('#1d1d1d', car.x, car.y, car.w, car.h);
    drawWorldRect('#ff6a1a', car.x + 8, car.y + 6, 22, 10);
    drawWorldRect('#ffcd5c', car.x + 14, car.y + 4, 8, 4);
    glow(car.x + 18 - gameState.camera.x, car.y + 10 - gameState.camera.y, 54, '255,100,30', 0.48);
  }
}
/** Dibuja un árbol y su sombra en coordenadas de pantalla.
 */
function tree(treeData) {
  const positionX = treeData.x - gameState.camera.x;
  const positionY = treeData.y - gameState.camera.y;
  if (positionX < -40 || positionX > 680 || positionY < -50 || positionY > 520) {
    return;
  }
  shadow(treeData.x, treeData.y + 12, 18);
  drawRect('#4a2f17', positionX - 3, positionY, 6, 12);
  const ctx = getCanvasContext();
  ctx.fillStyle = '#2d7a33';
  ctx.beginPath();
  ctx.arc(positionX, positionY - 12, 18, 0, 7);
  ctx.fill();
  ctx.fillStyle = '#47a04a';
  ctx.beginPath();
  ctx.arc(positionX - 4, positionY - 18, 10, 0, 7);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,235,145,.45)';
  ctx.fillRect(positionX - 10 + Math.sin(gameState.now / 700 + treeData.x) * 2, positionY - 23, 3, 2);
  ctx.fillRect(positionX + 4 + Math.sin(gameState.now / 820 + treeData.y) * 2, positionY - 15, 2, 2);
}
/** Dibuja un objeto recolectable con sombra y resplandor.
 */
function item(object) {
  const bob = Math.sin(gameState.now / 320 + object.x) * 2.5;
  const positionX = object.x - gameState.camera.x + 7;
  const positionY = object.y - gameState.camera.y + 7 - Math.abs(bob) * 2;
  shadow(object.x + 7, object.y + 14, 7);
  glow(positionX, positionY, 26, object.kind === 'libro' ? '90,150,255' : '255,205,70', .4);
  if (object.kind === 'calc') {
    calc(positionX - 6, positionY - 7);
  } else {
    if (object.kind === 'libro') {
      drawRect('#2a6fd1', positionX - 6, positionY - 8, 12, 16);
      drawRect('#fff', positionX - 4, positionY - 4, 8, 2);
    } else {
      if (object.kind === 'papa') {
        drawRect('#e8c36a', positionX - 7, positionY - 5, 14, 11);
      } else {
        burger(positionX - 7, positionY - 7);
      }
    }
  }
}
/** Dibuja una caja de comida con humedad y cobertura visibles.
 */
function box(worldObject) {
  const shake = finiteNumber(worldObject.shake);
  const wetness = Math.max(0, Math.min(100, finiteNumber(worldObject.wetness)));
  const positionX = finiteNumber(worldObject.x) - finiteNumber(gameState.camera.x) + Math.sin(finiteNumber(gameState.now) / 25) * shake * 3;
  const positionY = finiteNumber(worldObject.y) - finiteNumber(gameState.camera.y);
  shadow(worldObject.x + 20, worldObject.y + 24, 22);
  if (gameState.zone === 2) {
    glow(positionX + 20, positionY + 2, 32, '80,175,255', 0.12 + wetness / 100 * 0.2);
  }
  drawRect('#e0a53a', positionX, positionY, 40, 24);
  drawRect('#b9792a', positionX, positionY + 8, 40, 4);
  drawRect('#c98f2e', positionX, positionY + 16, 40, 8);
  drawRect('rgba(255,232,175,.45)', positionX + 3, positionY + 3, 10, 2);
  drawRect('rgba(91,51,20,.35)', positionX + 18, positionY + 2, 2, 20);
  drawText(worldObject.label, positionX + 20, positionY + 19, 5, '#222', 'center');
  getCanvasContext().fillStyle = `rgba(20,50,110,${wetness / 100 * .6})`;
  getCanvasContext().fillRect(positionX, positionY, 40, 24);
  if (worldObject.covered) {
    getCanvasContext().strokeStyle = '#4de3d6';
    getCanvasContext().strokeRect(positionX - 2, positionY - 2, 44, 28);
  }
}

/** Dibuja las partículas que producen combate, pasos y recompensas. */
function drawParticle(particle, ctx) {
  const alpha = Math.max(0, Math.min(1, finiteNumber(particle?.lifetime) / 0.7));
  const screenX = finiteNumber(particle?.x) - finiteNumber(gameState.camera.x);
  const screenY = finiteNumber(particle?.y) - finiteNumber(gameState.camera.y);
  const size = 1.5 + alpha * 2.5;
  ctx.save();
  try {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
    if (particle.color === '#ffd84a' || particle.color === '#fff') {
      glow(screenX, screenY, 13 + alpha * 9, particle.color === '#fff' ? '230,245,255' : '255,210,70', alpha * 0.3);
    }
  } finally {
    ctx.restore();
    resetContext(ctx);
  }
}

/** Agrega una línea de árboles y edificios lejanos con desplazamiento parallax. */
function drawParallaxSkyline(ctx) {
  const parallaxOffset = (finiteNumber(gameState.camera.x) * 0.16) % 720;
  const skylineY = 48 - finiteNumber(gameState.camera.y) * 0.12;
  ctx.save();
  try {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#26384b';
    for (let index = -1; index < 3; index += 1) {
      const baseX = index * 720 - parallaxOffset;
      ctx.fillRect(baseX + 35, skylineY + 9, 45, 31);
      ctx.fillRect(baseX + 82, skylineY, 34, 40);
      ctx.fillRect(baseX + 120, skylineY + 15, 58, 25);
      ctx.fillRect(baseX + 202, skylineY + 8, 20, 32);
      ctx.beginPath();
      ctx.arc(baseX + 250, skylineY + 25, 23, 0, Math.PI * 2);
      ctx.arc(baseX + 278, skylineY + 18, 27, 0, Math.PI * 2);
      ctx.arc(baseX + 307, skylineY + 27, 21, 0, Math.PI * 2);
      ctx.fill();
    }
  } finally {
    ctx.restore();
    resetContext(ctx);
  }
}

/** Dibuja el paraguas del jugador cuando cubre una caja durante la tormenta. */
function umbrella(positionX, positionY) {
  drawRect('#e04040', positionX - 16, positionY - 12, 46, 12);
  drawRect('rgba(255,255,255,.25)', positionX - 16, positionY - 12, 46, 2);
  drawRect('#5a3a1e', positionX + 6, positionY - 12, 2, 14);
}
/** Ordena y dibuja terreno, entidades, efectos y guía de misión.
 */
function renderWorldUnsafe() {
  const ctx = getCanvasContext();
  ctx.fillStyle = '#25803b';
  ctx.fillRect(0, 0, 640, 480);
  ground();
  drawParallaxSkyline(ctx);
  const drawQueue = [];
  TREES.forEach(treeData => drawQueue.push([treeData.y + 12, () => tree(treeData)]));
  gameState.items.forEach(object => drawQueue.push([object.y + 14, () => item(object)]));
  NPCS.forEach((npc, index) => drawQueue.push([npc.y + 22, () => {
    const positionX = npc.x - gameState.camera.x,
      positionY = npc.y - gameState.camera.y + Math.sin(gameState.now / 520 + index) * 0.6;
    shadow(npc.x + 9, npc.y + 22, 11);
    drawRect(npc.color, positionX, positionY, 18, 22);
    drawRect('#222', positionX + 4, positionY + 6, 3, 3);
    drawRect('#222', positionX + 11, positionY + 6, 3, 3);
    drawText(npc.name, positionX + 9, positionY - 6, 6, '#fff', 'center');
    if (npc.name === 'KUPITINCHI') {
      drawRect('#e0a679', positionX + 2, positionY + 1, 14, 8);
      drawRect('#1fa59b', positionX - 2, positionY - 6, 22, 8);
      drawRect('#4de3d6', positionX - 1, positionY - 5, 20, 6);
      drawRect('#b9fff8', positionX + 1, positionY - 4, 8, 2);
      drawRect('#8a5a2b', positionX + 17, positionY + 6, 2, 16);
      drawRect('#4de3d6', positionX + 12, positionY + 4, 12, 3);
      glow(positionX + 9, positionY, 30, '77,227,214', .3);
    }
    if (index === gameState.currentQuestIndex && gameState.missionPhase !== 1) {
      drawText('!', positionX + 9, positionY - 16, 10, '#ffcf33', 'center');
    }
  }]));
  gameState.enemies.forEach(entity => drawQueue.push([entity.y + entity.h, () => {
    const positionX = entity.x - gameState.camera.x,
      positionY = entity.y - gameState.camera.y + Math.sin(gameState.now / 230 + entity.x) * 0.7;
    shadow(entity.x + entity.w / 2, entity.y + entity.h, entity.w * .6);
    if (entity.kind === 'guard') {
      drawGuardVisionCone(entity, positionX, positionY);
    }
    ctx.save();
    try {
      ctx.globalAlpha = entity.vanishOpacity ?? 1;
      drawEnemy(entity, positionX, positionY);
    } finally {
      ctx.restore();
    }
  }]));
  drawQueue.push([gameState.player.y + gameState.player.h, () => {
    const playerX = gameState.player.x - gameState.camera.x;
    const playerY = gameState.player.y - gameState.camera.y;
    shadow(gameState.player.x + gameState.player.w / 2, gameState.player.y + gameState.player.h, 11);
    glow(playerX + 7, playerY - 3, 34, '95,230,255', 0.2);
    drawPlayer(playerX, playerY, gameState.player, gameState.now, gameState.isMoving, gameState.walkingAnimationTime);
    if (gameState.player.umbrellaCoverage && gameState.missionPhase === 1) {
      umbrella(playerX + 7, playerY - 10);
    }
  }]);
  gameState.pizzaBoxes.forEach(worldObject => {
    if (worldObject) {
      drawQueue.push([worldObject.y + worldObject.h, () => box(worldObject)]);
    }
  });
  drawQueue.sort((leftDepth, rightDepth) => leftDepth[0] - rightDepth[0]).forEach(depthEntry => depthEntry[1]());
  for (const object of gameState.projectiles) {
    const positionX = object.x - gameState.camera.x,
      positionY = object.y - gameState.camera.y;
    glow(positionX + 6, positionY + 6, 22, '255,120,200', .4);
    const projectileColor = object.patternType === 0
      ? '#25d366'
      : object.patternType === 1 ? '#a0522d' : '#8e44ad';
    drawRect(projectileColor, positionX, positionY, 16, 12);
    if (object.patternType === 0) {
      drawText('¿ME MORÍ?', positionX - 10, positionY + 9, 5, '#000');
    }
  }
  for (const object of gameState.particles) {
    drawParticle(object, ctx);
  }
  for (const object of gameState.floatingMessages) {
    drawText(object.text, object.x - gameState.camera.x, object.y - gameState.camera.y, 8, '#ffe27a', 'center');
  }
  if (gameState.player.invulnerabilityTimer > .6) {
    ctx.fillStyle = 'rgba(255,0,0,.2)';
    ctx.fillRect(0, 0, 640, 480);
  }
  const target = NPCS[gameState.currentQuestIndex];
  if (target) {
    const angle = Math.atan2(target.y - gameState.player.y, target.x - gameState.player.x),
      positionX = gameState.player.x + 7 - gameState.camera.x + Math.cos(angle) * 42,
      positionY = gameState.player.y + 4 - gameState.camera.y + Math.sin(angle) * 42;
    ctx.fillStyle = '#ffcf33';
    ctx.beginPath();
    ctx.moveTo(positionX + Math.cos(angle) * 7, positionY + Math.sin(angle) * 7);
    ctx.lineTo(positionX + Math.cos(angle + 2.5) * 6, positionY + Math.sin(angle + 2.5) * 6);
    ctx.lineTo(positionX + Math.cos(angle - 2.5) * 6, positionY + Math.sin(angle - 2.5) * 6);
    ctx.fill();
  }
}

/** Renderiza el mundo con un fallback visible si un efecto visual falla. */
export function renderWorld() {
  const ctx = getCanvasContext();
  if (!ctx) {
    return;
  }
  ctx.save();
  try {
    renderWorldUnsafe();
  } catch (error) {
    console.error('[FIUBA LORE] Falló el render del mundo:', error);
    ctx.fillStyle = '#25803b';
    ctx.fillRect(0, 0, 640, 480);
  } finally {
    ctx.restore();
    resetContext(ctx);
  }
}
