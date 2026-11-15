/**
 * Colisiones, resolución de movimiento y clasificación de zonas.
 */
import { WW, WH, SPEED } from '../model/Config.js';
import { STATIC_OBSTACLES } from '../model/WorldData.js';
import { gameState } from '../model/GameState.js';
/** Indica si dos rectángulos se superponen.
 */
export const intersects = (first, second) => {
  return first.x < second.x + second.w &&
    first.x + first.w > second.x &&
    first.y < second.y + second.h &&
    first.y + first.h > second.y;
};
/** Mueve una entidad en ambos ejes y resuelve colisiones estáticas.
 */
export function moveEntity(entity, dx, dy, applyDamage) {
  for (const [ax, ay] of [[dx, 0], [0, dy]]) {
    entity.x = Math.max(0, Math.min(WW - entity.w, entity.x + ax));
    entity.y = Math.max(0, Math.min(WH - entity.h, entity.y + ay));
    for (const object of STATIC_OBSTACLES) {
      if (intersects(entity, object)) {
        entity.x -= ax;
        entity.y -= ay;
        if (object.hot && entity === gameState.player) {
          applyDamage(5);
        }
        break;
      }
    }
  }
}
/** Devuelve la zona ambiental que ocupa el jugador.
 */
export function zone() {
  const positionX = gameState.player.x + 7,
    positionY = gameState.player.y;
  return positionX > 1100 && positionY < 430 ? 1 : positionX > 1100 && positionY > 700 ? 2 : 0;
}

/** Aplica dirección, velocidad, colisiones y partículas de pasos.
 */
export function updatePlayerMovement(deltaTime, applyDamage) {
  const player = gameState.player;
  const movingRight = gameState.keys.arrowright || gameState.keys.d;
  const movingLeft = gameState.keys.arrowleft || gameState.keys.a;
  const movingDown = gameState.keys.arrowdown || gameState.keys.s;
  const movingUp = gameState.keys.arrowup || gameState.keys.w;
  let horizontal = Number(Boolean(movingRight)) - Number(Boolean(movingLeft));
  let vertical = Number(Boolean(movingDown)) - Number(Boolean(movingUp));
  gameState.isMoving = 0;
  if (!horizontal && !vertical) {
    return;
  }
  const magnitude = Math.hypot(horizontal, vertical);
  horizontal /= magnitude;
  vertical /= magnitude;
  player.facingX = horizontal;
  player.facingY = vertical;
  moveEntity(player, horizontal * SPEED * deltaTime, vertical * SPEED * deltaTime, applyDamage);
  gameState.isMoving = 1;
  gameState.walkingAnimationTime += deltaTime * 14;
  if (Math.random() < .6) {
    gameState.particles.push({
      x: player.x + 4,
      y: player.y + 17,
      vx: (Math.random() - .5) * 20,
      vy: -8,
      lifetime: .4,
      color: 'rgba(210,195,150,.8)'
    });
  }
}
