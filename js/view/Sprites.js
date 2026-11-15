/**
 * Primitivas y sprites pixel art dibujados sobre el contexto Canvas inyectado.
 */
let canvasContext = null;
/** Inyecta el contexto Canvas que usarán los módulos de presentación.
 */
export function setCanvasContext(context) {
  canvasContext = context;
}
/** Devuelve el contexto Canvas configurado por el punto de entrada.
 */
export function getCanvasContext() {
  return canvasContext;
}
/** Dibuja un rectángulo de color con coordenadas de píxel enteras.
 */
export function rect(color, positionX, positionY, width, height) {
  const ctx = getCanvasContext();
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(positionX), Math.round(positionY), width, height);
}
/** Dibuja texto con la tipografía y alineación indicadas.
 */
export function text(message, positionX, positionY, size = 8, color = '#f4e9c8', align = 'left') {
  const ctx = getCanvasContext();
  ctx.font = `${size}px "Press Start 2P",monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(message, positionX, positionY);
}
/** Dibuja el sprite pixel art de un paty.
 */
export function burger(positionX, positionY, scale = 1) {
  rect('#e8b04a', positionX, positionY, 14 * scale, 4 * scale);
  rect('#4cd964', positionX, positionY + 4 * scale, 14 * scale, 2 * scale);
  rect('#5b3a1e', positionX, positionY + 6 * scale, 14 * scale, 3 * scale);
  rect('#e8b04a', positionX, positionY + 9 * scale, 14 * scale, 4 * scale);
}
/** Dibuja el sprite pixel art de una calculadora.
 */
export function calc(positionX, positionY, scale = 1) {
  rect('#8a8f98', positionX, positionY, 12 * scale, 14 * scale);
  rect('#9fd89f', positionX + 2 * scale, positionY + 2 * scale, 8 * scale, 3 * scale);
  for (let index = 0; index < 3; index++) {
    for (let subIndex = 0; subIndex < 3; subIndex++) {
      rect(
        '#2a2d30',
        positionX + (2 + index * 3) * scale,
        positionY + (6 + subIndex * 3) * scale,
        2 * scale,
        2 * scale
      );
    }
  }
}
/** Dibuja el icono pixel art de Discord.
 */
export function discord(positionX, positionY, scale = 1) {
  rect('#5865f2', positionX, positionY, 16 * scale, 12 * scale);
  rect('#fff', positionX + 3 * scale, positionY + 4 * scale, 3 * scale, 4 * scale);
  rect('#fff', positionX + 10 * scale, positionY + 4 * scale, 3 * scale, 4 * scale);
}

/** Dibuja a Pinga, el elefante pixel art que acompaña el menú. */
export function elephant(positionX, positionY, scale = 1) {
  rect('#9aa7b8', positionX, positionY + 3 * scale, 14 * scale, 9 * scale);
  rect('#9aa7b8', positionX + 11 * scale, positionY, 6 * scale, 8 * scale);
  rect('#7d8a9c', positionX + 16 * scale, positionY + 6 * scale, 2 * scale, 8 * scale);
  rect('#222', positionX + 14 * scale, positionY + 3 * scale, scale, scale);
}
/** Dibuja a Kupacraft y anima su cuerpo y pico.
 */
export function drawPlayer(positionX, positionY, player, now, moving, wk) {
  const ctx = getCanvasContext();
  positionY += moving ? -Math.abs(Math.sin(wk)) * 2 : Math.sin(now / 380) * .8;
  const walkSway = moving ? Math.sin(wk) * 3 : 0;
  rect('#2a2d30', positionX + 2 + walkSway * .5, positionY + 14, 4, 5);
  rect('#2a2d30', positionX + 8 - walkSway * .5, positionY + 14, 4, 5);
  rect('#555a60', positionX, positionY + 7, 14, 8);
  rect('#3f444b', positionX + 1, positionY + 8, 12, 2);
  rect('#777d84', positionX + 1, positionY + 11, 12, 2);
  rect('#3f444b', positionX + 1, positionY + 14, 12, 1);
  rect('#e0a679', positionX + 2, positionY + 1, 10, 7);
  rect('#4a3020', positionX + 2, positionY + 6, 10, 3);
  rect('#222', positionX + 4, positionY + 3, 2, 2);
  rect('#222', positionX + 8, positionY + 3, 2, 2);
  rect('#1fa59b', positionX - 2, positionY - 9, 18, 10);
  rect('#4de3d6', positionX - 1, positionY - 8, 16, 8);
  rect('#b9fff8', positionX + 1, positionY - 7, 7, 2);
  const attackAngle = Math.atan2(player.facingY, player.facingX) + (
    player.attackCooldown > 0
      ? -1.2 + 2.4 * (1 - player.attackCooldown / .25)
      : .5
  );
  ctx.save();
  try {
    ctx.translate(positionX + 7, positionY + 10);
    ctx.rotate(attackAngle);
    rect('#8a5a2b', 2, -1, 17, 3);
    rect('#4de3d6', 15, -8, 4, 16);
    rect('#b9fff8', 15, -8, 2, 16);
  } finally {
    ctx.restore();
  }
}
/** Dibuja el sprite que corresponde al tipo de enemigo.
 */
export function drawEnemy(entity, positionX, positionY) {
  if (entity.kindind === 'cloud') {
    rect('#6bd36b', positionX, positionY, 30, 24);
    rect('#3c8c3c', positionX + 6, positionY + 6, 22, 16);
  } else {
    if (entity.kindind === 'guard') {
      rect('#c0392b', positionX, positionY, 16, 18);
      rect('#fff', positionX + 4, positionY + 6, 8, 3);
      text('SHH', positionX + 8, positionY - 3, 6, '#fff', 'center');
    } else {
      if (entity.kindind === 'creepy') {
        rect('#8e44ad', positionX, positionY, 16, 16);
        rect('#fff', positionX + 3, positionY + 4, 4, 4);
        rect('#fff', positionX + 9, positionY + 4, 4, 4);
      } else {
        rect('#d86aa0', positionX, positionY, 44, 44);
        rect('#3a1a2a', positionX, positionY, 44, 14);
        rect('#fff', positionX + 10, positionY + 22, 8, 8);
        rect('#fff', positionX + 26, positionY + 22, 8, 8);
        rect('#a00', positionX + 14, positionY + 36, 16, 3);
      }
    }
  }
}
