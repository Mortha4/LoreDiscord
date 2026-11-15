/**
 * Dibujo del mapa, entidades ordenadas por profundidad y elementos del mundo.
 */
import { getCanvasContext } from './Sprites.js';
import { gameState } from '../model/GameState.js';
import { WW } from '../model/Config.js';
import { BUILDINGS, NPCS, BURNT_CARS, TREES } from '../model/WorldData.js';
import { rect as drawRect, text as drawText, burger, calc, drawPlayer, drawEnemy } from './Sprites.js';
import { glow } from './LightingAndVFX.js';
/** Dibuja un rectángulo del mundo transformado por la cámara.
 */
const drawWorldRect = (color, positionX, positionY, width, height) => {
  drawRect(color, positionX - gameState.camera.x, positionY - gameState.camera.y, width, height);
};
/** Dibuja la sombra elíptica de un objeto del mundo.
 */
function shadow(positionX, positionY, width) {
  const ctx = getCanvasContext();
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath();
  ctx.ellipse(positionX - gameState.camera.x, positionY - gameState.camera.y, width, width * .32, 0, 0, 7);
  ctx.fill();
}

/** Dibuja el cono de visión de un guardia en dirección a su patrulla o al jugador. */
function drawGuardVisionCone(enemy, positionX, positionY) {
  const ctx = getCanvasContext();
  const centerX = positionX + enemy.w / 2;
  const centerY = positionY + enemy.h / 2;
  const angle = enemy.isChasingPlayer
    ? Math.atan2(gameState.player.y - enemy.y, gameState.player.x - enemy.x)
    : enemy.direction > 0 ? 0 : Math.PI;
  ctx.save();
  try {
    ctx.globalCompositeOperation = 'lighter';
    const gradient = ctx.createRadialGradient(centerX, centerY, 6, centerX, centerY, 130);
    gradient.addColorStop(0, 'rgba(255,60,60,.32)');
    gradient.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, 130, angle - 1.05, angle + 1.05);
    ctx.closePath();
    ctx.fill();
  } finally {
    ctx.restore();
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
  for (const worldObject of BUILDINGS) {
    drawWorldRect(worldObject.color, worldObject.x, worldObject.y, worldObject.w, worldObject.h);
    drawWorldRect('rgba(0,0,0,.3)', worldObject.x, worldObject.y, worldObject.w, 16);
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
    drawWorldRect('#1d1d1d', car.x, car.y, car.w, car.h);
    drawWorldRect('#ff6a1a', car.x + 8, car.y + 6, 22, 10);
  }
}
/** Dibuja un árbol y su sombra en coordenadas de pantalla.
 */
function tree(treeData) {
  let positionX = treeData.x - gameState.camera.x,
    positionY = treeData.y - gameState.camera.y;
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
}
/** Dibuja un objeto recolectable con sombra y resplandor.
 */
function item(object) {
  let positionX = object.x - gameState.camera.x + 7,
    positionY = object.y - gameState.camera.y + 7 - Math.abs(Math.sin(gameState.now / 300 + object.x)) * 5;
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
  const positionX = worldObject.x - gameState.camera.x + Math.sin(gameState.now / 25) * worldObject.shake * 3,
    positionY = worldObject.y - gameState.camera.y;
  shadow(worldObject.x + 20, worldObject.y + 24, 22);
  drawRect('#e0a53a', positionX, positionY, 40, 24);
  drawRect('#b9792a', positionX, positionY + 8, 40, 4);
  drawRect('#c98f2e', positionX, positionY + 16, 40, 8);
  drawText(worldObject.label, positionX + 20, positionY + 19, 5, '#222', 'center');
  getCanvasContext().fillStyle = `rgba(20,50,110,${worldObject.wetness / 100 * .6})`;
  getCanvasContext().fillRect(positionX, positionY, 40, 24);
  if (worldObject.covered) {
    getCanvasContext().strokeStyle = '#4de3d6';
    getCanvasContext().strokeRect(positionX - 2, positionY - 2, 44, 28);
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
export function renderWorld() {
  const ctx = getCanvasContext();
  ctx.fillStyle = '#25803b';
  ctx.fillRect(0, 0, 640, 480);
  ground();
  const drawQueue = [];
  TREES.forEach(treeData => drawQueue.push([treeData.y + 12, () => tree(treeData)]));
  gameState.items.forEach(object => drawQueue.push([object.y + 14, () => item(object)]));
  NPCS.forEach((npc, index) => drawQueue.push([npc.y + 22, () => {
    const positionX = npc.x - gameState.camera.x,
      positionY = npc.y - gameState.camera.y;
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
      positionY = entity.y - gameState.camera.y;
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
    ctx.globalAlpha = Math.max(0, Math.min(1, object.lifetime));
    drawWorldRect(object.color, object.x, object.y, 3, 3);
  }
  ctx.globalAlpha = 1;
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
