/**
 * Reglas de daño, ataques, drops, IA enemiga y proyectiles.
 */
import { ENEMY_DEFINITIONS } from '../model/Config.js';
import { gameState } from '../model/GameState.js';
import { intersects, moveEntity } from './Physics.js';
import { beep, jingle } from '../view/AudioSystem.js';
/** Añade partículas al estado del juego en una posición y color determinados.
 */
export function emit(positionX, positionY, color, count = 1) {
  for (let index = 0; index < count; index++) {
    gameState.particles.push({
      x: positionX,
      y: positionY,
      vx: (Math.random() - .5) * 90,
      vy: -20 - Math.random() * 60,
      lifetime: .7,
      color
    });
  }
}
/** Aplica daño, invulnerabilidad temporal, sacudida y efectos al jugador.
 */
export function hurt(count) {
  const player = gameState.player;
  if (player.invulnerabilityTimer > 0) {
    return;
  }
  player.hp -= count;
  player.invulnerabilityTimer = .8;
  gameState.screenShake = .4;
  emit(player.x + 7, player.y + 8, '#8e44ad', 9);
  emit(player.x + 7, player.y + 8, '#6bd36b', 6);
  beep(110, .25, 'sawtooth', .07, -50);
}
/** Crea una entidad enemiga con estadísticas de su definición.
 */
export function spawn(kind, positionX, positionY) {
  const enemyDefinition = ENEMY_DEFINITIONS[kind];
  gameState.enemies.push({
    kind,
    x: positionX,
    y: positionY,
    patrolOriginX: positionX,
    patrolOriginY: positionY,
    health: enemyDefinition.health,
    w: enemyDefinition.w,
    h: enemyDefinition.h,
    damage: enemyDefinition.damage,
    direction: 1,
    elapsedTime: 0,
    attackTimer: 1
  });
}
/** Registra la derrota de un enemigo y genera su recompensa o victoria final.
 */
export function kill(entity) {
  gameState.kills++;
  emit(entity.x + entity.w / 2, entity.y + entity.h / 2, '#fff', 10);
  beep(500, .1, 'square', .06, 200);
  if (entity.kind === 'boss') {
    gameState.month = 6;
    gameState.enemies = [];
    gameState.projectiles = [];
    jingle([523, 659, 784, 1047, 784, 1047]);
    gameState.dialogue = {
      lines: [
        'Mamá de Martín: ...Bueno. Estás perdonado, Kupa.',
        '¡Desbloqueaste los 6 meses de antigüedad en Discord!'
      ],
      lineIndex: 0,
      onComplete: () => gameState.gameStatus = 'win'
    };
    return;
  }
  gameState.items.push({
    kind: Math.random() < .7 ? 'calc' : 'paty',
    drop: 1,
    x: entity.x,
    y: entity.y,
    w: 14,
    h: 14
  });
}
/** Aplica el golpe del pico a los enemigos dentro del alcance frontal.
 */
export function attack() {
  const player = gameState.player;
  if (player.attackCooldown > 0) {
    return;
  }
  player.attackCooldown = .25;
  beep(300, .1, 'square', .05, -120);
  const rectangle = {
    x: player.x + 7 + player.facingX * 20 - 14,
    y: player.y + 9 + player.facingY * 20 - 14,
    w: 28,
    h: 28
  };
  for (const entity of gameState.enemies) {
    if (entity.health > 0 && !entity.vanishOpacity && intersects(rectangle, entity)) {
      entity.health -= gameState.level;
      if (entity.kind !== 'boss') {
        entity.knockbackTimer = .15;
        entity.knockbackX = player.facingX * 260;
        entity.knockbackY = player.facingY * 260;
      }
      emit(entity.x + entity.w / 2, entity.y + entity.h / 2, '#4de3d6', 5);
      if (entity.health <= 0) {
        kill(entity);
      }
    }
  }
  gameState.enemies = gameState.enemies.filter(entity => entity.health > 0);
}
/** Hace desaparecer a los guardias y genera su efecto de salida.
 */
export function vanish() {
  for (const entity of gameState.enemies) {
    if (entity.kind === 'guard') {
      entity.vanishOpacity = 1;
      for (let index = 0; index < 16; index++) {
        gameState.particles.push({
          x: entity.x + 8,
          y: entity.y + 8,
          vx: (Math.random() - .5) * 110,
          vy: -10 - Math.random() * 60,
          lifetime: .9,
          color: index % 2 ? '#fff' : '#9fe8ff'
        });
      }
    }
  }
  beep(900, .45, 'sine', .07, -700);
  setTimeout(() => beep(300, .4, 'triangle', .06, 500), 120);
}

/** Actualiza persecución, patrullas, jefe y daño por contacto.
 */
export function updateEnemies(deltaTime, applyDamage) {
  const player = gameState.player;
  gameState.enemies = gameState.enemies.filter(entity => {
    return entity.vanishOpacity === undefined || entity.vanishOpacity > 0;
  });
  for (const enemy of gameState.enemies) {
    enemy.elapsedTime += deltaTime;
    if (enemy.vanishOpacity !== undefined) {
      enemy.vanishOpacity -= deltaTime * 1.6;
      if (Math.random() < .5) {
        emit(enemy.x + 8, enemy.y + 8, Math.random() < .5 ? '#fff' : '#9fe8ff');
      }
      continue;
    }
    const deltaX = player.x - enemy.x;
    const deltaY = player.y - enemy.y;
    const distance = Math.hypot(deltaX, deltaY) || 1;
    if (enemy.knockbackTimer > 0) {
      enemy.knockbackTimer -= deltaTime;
      moveEntity(enemy, enemy.knockbackX * deltaTime, enemy.knockbackY * deltaTime, applyDamage);
    } else if (enemy.kind === 'cloud') {
      moveCloud(enemy, deltaX, deltaY, distance, deltaTime);
    } else if (enemy.kind === 'guard') {
      moveGuard(enemy, deltaX, deltaY, distance, deltaTime, applyDamage);
    } else if (enemy.kind === 'creepy') {
      moveCreepy(enemy, deltaX, deltaY, distance, deltaTime, applyDamage);
    } else {
      updateBoss(enemy, deltaTime);
    }
    if (intersects(enemy, player)) {
      applyDamage(enemy.damage);
    }
  }
}

/** Acerca una nube al jugador cuando entra en su radio de persecución. */
function moveCloud(enemy, deltaX, deltaY, distance, deltaTime) {
  if (distance < 260) {
    enemy.x += deltaX / distance * 45 * deltaTime;
    enemy.y += deltaY / distance * 45 * deltaTime;
  }
}

/** Hace patrullar al guardia y perseguir al jugador si entra en su cono. */
function moveGuard(enemy, deltaX, deltaY, distance, deltaTime, applyDamage) {
  const playerIsVisible = distance < 130 && (deltaX / distance * enemy.direction > .5 || distance < 45);
  if (playerIsVisible) {
    enemy.isChasingPlayer = 1;
  } else if (distance > 170) {
    enemy.isChasingPlayer = 0;
  }
  if (enemy.isChasingPlayer) {
    moveEntity(enemy, deltaX / distance * 95 * deltaTime, deltaY / distance * 95 * deltaTime, applyDamage);
    return;
  }
  enemy.x += enemy.direction * 55 * deltaTime;
  if (Math.abs(enemy.x - enemy.patrolOriginX) > 110) {
    enemy.direction *= -1;
  }
}

/** Persigue al jugador con el enemigo del Bodegón. */
function moveCreepy(enemy, deltaX, deltaY, distance, deltaTime, applyDamage) {
  if (distance < 320) {
    moveEntity(enemy, deltaX / distance * 60 * deltaTime, deltaY / distance * 60 * deltaTime, applyDamage);
  }
}

/** Mueve a la jefa y crea sus ráfagas radiales de proyectiles. */
function updateBoss(boss, deltaTime) {
  boss.x = 778 + Math.sin(boss.elapsedTime * .8) * 220;
  boss.y = 420 + Math.sin(boss.elapsedTime * .5) * 70;
  boss.attackTimer -= deltaTime;
  if (boss.attackTimer > 0) {
    return;
  }
  boss.attackTimer = boss.health < 15 ? .9 : 1.4;
  const projectileCount = boss.health < 15 ? 12 : 8;
  const startingAngle = Math.random() * 6;
  for (let index = 0; index < projectileCount; index++) {
    const angle = startingAngle + index * 6.283 / projectileCount;
    gameState.projectiles.push({
      x: boss.x + 22,
      y: boss.y + 22,
      vx: Math.cos(angle) * 110,
      vy: Math.sin(angle) * 110,
      w: 12,
      h: 12,
      lifetime: 6,
      patternType: index % 3
    });
  }
  beep(200, .2, 'sawtooth', .05, -60);
}

/** Mueve proyectiles, comprueba impactos y descarta los expirados.
 */
export function updateProjectiles(deltaTime, applyDamage) {
  gameState.projectiles = gameState.projectiles.filter(projectile => {
    projectile.x += projectile.vx * deltaTime;
    projectile.y += projectile.vy * deltaTime;
    projectile.lifetime -= deltaTime;
    if (intersects(projectile, gameState.player)) {
      applyDamage(8);
      return false;
    }
    return projectile.lifetime > 0;
  });
}
