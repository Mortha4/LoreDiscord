/**
 * Menú, indicadores, diálogos y pantallas de estado del juego.
 */
import { getCanvasContext } from './Sprites.js';
import { gameState } from '../model/GameState.js';
import { NPCS } from '../model/WorldData.js';
import { QUESTS } from '../model/QuestsData.js';
import { rect as drawRect, text as drawText, burger, calc, discord, elephant, drawPlayer } from './Sprites.js';
/** Devuelve la misión activa o undefined al terminar la lista.
 */
const getCurrentQuest = () => QUESTS[gameState.currentQuestIndex];
/** Describe el progreso numérico de la misión actual.
 */
const getQuestProgress = () => {
  const quest = getCurrentQuest();
  if (!quest) {
    return '';
  }
  if (quest.objectiveType === 'collect') {
    return `${gameState.collectedCount}/${quest.requiredCount}`;
  }
  if (quest.objectiveType === 'defeat') {
    return `${gameState.kills}/${quest.requiredCount}`;
  }
  if (quest.objectiveType === 'protect') {
    return `${Math.max(0, Math.ceil(gameState.rainTimer))}s`;
  }
  return 'jefe';
};
/** Dibuja un panel de interfaz con esquinas redondeadas.
 */
function panel(positionX, positionY, width, height) {
  const ctx = getCanvasContext();
  ctx.fillStyle = 'rgba(15,20,30,.88)';
  ctx.strokeStyle = 'rgba(77,227,214,.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(positionX + 8, positionY);
  ctx.arcTo(positionX + width, positionY, positionX + width, positionY + height, 8);
  ctx.arcTo(positionX + width, positionY + height, positionX, positionY + height, 8);
  ctx.arcTo(positionX, positionY + height, positionX, positionY, 8);
  ctx.arcTo(positionX, positionY, positionX + width, positionY, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
/** Dibuja una barra de progreso con relleno de color.
 */
function bar(positionX, positionY, width, value, color) {
  drawRect('rgba(0,0,0,.5)', positionX, positionY, width, 12);
  const ctx = getCanvasContext();
  const fillGradient = ctx.createLinearGradient(positionX, 0, positionX + width * Math.max(0, Math.min(1, value)), 0);
  fillGradient.addColorStop(0, color);
  fillGradient.addColorStop(1, '#b9fff8');
  ctx.fillStyle = fillGradient;
  ctx.fillRect(positionX, positionY, width * Math.max(0, Math.min(1, value)), 12);
}
/** Dibuja el menú principal, sus personajes y el botón Jugar.
 */
function menu() {
  for (let positionX = 0; positionX < 16; positionX++) {
    for (let positionY = 0; positionY < 12; positionY++) {
      drawRect((positionX + positionY) % 2 ? '#262545' : '#2b2a4a', positionX * 40, positionY * 40, 40, 40);
    }
  }
  drawText('FIUBA LORE', 320, 72, 26, '#4de3d6', 'center');
  panel(115, 105, 410, 260);
  drawRect('#6fb3ff', 130, 120, 380, 220);
  drawRect('#3f8a3f', 130, 275, 380, 65);
  drawPlayer(302, 188, {
    facingX: 1,
    facingY: 0,
    attackCooldown: 0
  }, gameState.now, false, 0);
  burger(145, 132, 2);
  calc(475, 132, 2);
  discord(158, 322, 2);
  elephant(458, 318, 1.5);
  drawText('KUPACRAFT', 320, 352, 14, '#fff', 'center');
  drawText('Flechas / WASD · ESPACIO · E', 320, 405, 8, '#f4e9c8', 'center');
  const over = gameState.mouse.x > 175 && gameState.mouse.x < 465 && gameState.mouse.y > 415 && gameState.mouse.y < 465;
  panel(175, 417, 290, 42);
  drawText('JUGAR', 320, 444, 9, over ? '#4de3d6' : '#ffcf33', 'center');
  if (over) {
    getCanvasContext().canvas.style.cursor = 'pointer';
  } else {
    getCanvasContext().canvas.style.cursor = 'default';
  }
}

/** Devuelve la instrucción breve que corresponde a la etapa de misión actual. */
function getMissionInstruction(quest) {
  const npcName = NPCS[gameState.currentQuestIndex]?.name ?? '';
  if (gameState.missionPhase === 0) {
    return `Hablá con ${npcName} (E)`;
  }
  if (gameState.missionPhase === 1) {
    return `${quest.objectiveLabel || ''} (${getQuestProgress()})`;
  }
  return `¡Volvé con ${npcName}! (E)`;
}

/** Dibuja menú, HUD, diálogos y pantallas de victoria o derrota.
 */
export function renderUI() {
  const ctx = getCanvasContext();
  if (gameState.gameStatus === 'menu') {
    menu();
    return;
  }
  panel(6, 4, 628, 30);
  burger(14, 11);
  bar(34, 12, 104, gameState.displayedHealth / gameState.player.maxHealth, '#ff4d6d');
  calc(156, 9);
  bar(176, 12, 60, gameState.displayedExperience / 3, '#1fa59b');
  drawText('NV' + gameState.level, 244, 23, 7);
  discord(330, 10);
  bar(352, 12, 170, gameState.displayedMonths / 6, '#5865f2');
  drawText(gameState.month + '/6', 530, 23, 7);
  const quest = getCurrentQuest();
  if (gameState.missionPhase === 1 && quest?.objectiveType === 'protect' && gameState.pizzaBoxes.length) {
    panel(120, 40, 400, 26);
    drawText('CAJAS', 126, 57, 6);
    gameState.pizzaBoxes.forEach((box, index) => {
      const color = box.wetness > 70 ? '#ff4d6d' : '#4de3d6';
      bar(170 + index * 95, 46, 80, 1 - box.wetness / 100, color);
    });
    const timerColor = gameState.rainTimer < 6 ? '#ff4d4d' : '#fff';
    drawText(Math.max(0, Math.ceil(gameState.rainTimer)) + 's', 508, 59, 8, timerColor, 'right');
  }
  const boss = gameState.enemies.find(enemy => enemy.kind === 'boss');
  if (boss) {
    panel(160, 40, 320, 18);
    bar(170, 43, 300, boss.health / 30, '#ff5555');
  }
  if (gameState.dialogue) {
    panel(8, 408, 624, 68);
    drawText(gameState.dialogue.lines[gameState.dialogue.lineIndex] || '', 20, 438, 8, '#fff');
    drawText('E · continuar', 610, 468, 6, '#ffcf33', 'right');
  } else {
    if (getCurrentQuest()) {
      drawRect('#10102a', 0, 452, 640, 28);
      drawText(getMissionInstruction(getCurrentQuest()), 12, 471, 7, '#ffcf33');
    }
  }
  if (gameState.message && gameState.messageTimer > 0) {
    drawText(gameState.message, 320, 82, 8, '#ffcf33', 'center');
  }
  if (gameState.gameStatus === 'over' || gameState.gameStatus === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,.8)';
    ctx.fillRect(0, 0, 640, 480);
    const isGameOver = gameState.gameStatus === 'over';
    const title = isGameOver ? 'GAME OVER' : '¡VICTORIA!';
    const subtitle = isGameOver
      ? 'Presioná E para volver a intentarlo'
      : '6 meses de antigüedad en Discord';
    const titleColor = isGameOver ? '#ff4d4d' : '#4de3d6';
    drawText(title, 320, 210, 26, titleColor, 'center');
    drawText(subtitle, 320, 270, 8, '#ffcf33', 'center');
  }
}
/** Dibuja la transición de apertura o cierre de pantalla.
 */
export function renderCurtain() {
  if (gameState.fade > 0) {
    const ctx = getCanvasContext(),
      width = 320 * Math.min(1, gameState.fade * 1.2);
    ctx.fillStyle = '#0d0c1a';
    ctx.fillRect(0, 0, width, 480);
    ctx.fillRect(640 - width, 0, width, 480);
  }
}
