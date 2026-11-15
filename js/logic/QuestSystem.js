/**
 * Inicio, progreso, objetivos, interacción y recompensas de misiones.
 */
import { gameState } from '../model/GameState.js';
import { QUESTS } from '../model/QuestsData.js';
import { NPCS } from '../model/WorldData.js';
import { spawn, vanish, emit } from './CombatSystem.js';
import { beep, jingle } from '../view/AudioSystem.js';
import { intersects } from './Physics.js';
/** Devuelve la misión activa o undefined al terminar la lista.
 */
const getCurrentQuest = () => QUESTS[gameState.currentQuestIndex];
export { getCurrentQuest };
/** Describe el progreso numérico de la misión actual.
 */
export function getQuestProgress() {
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
}
/** Activa la misión y crea sus ítems, enemigos o cajas de terraza.
 */
export function begin() {
  gameState.missionPhase = 1;
  gameState.collectedCount = gameState.kills = 0;
  const value = getCurrentQuest();
  (value.itemPositions || []).forEach(valueEntry => gameState.items.push({
    kind: value.itemType,
    x: valueEntry[0],
    y: valueEntry[1],
    w: 14,
    h: 14
  }));
  (value.enemySpawns || []).forEach(valueEntry => spawn(...valueEntry));
  if (value.objectiveType === 'boss') {
    spawn('boss', 780, 420);
  }
  if (value.objectiveType === 'protect') {
    gameState.pizzaBoxes = [[1190, 960], [1340, 1090], [1450, 980]].map((valueEntry, index) => ({
      x: valueEntry[0],
      y: valueEntry[1],
      w: 40,
      h: 24,
      wetness: 0,
      shake: 0,
      covered: false,
      label: ['PIZZA', 'EMPAN', 'PIZZA'][index]
    }));
    gameState.rainTimer = value.durationSeconds;
  }
}
/** Cierra la misión, aplica sus recompensas y avanza el índice.
 */
export function finishQuest() {
  if (!getCurrentQuest()) {
    gameState.missionPhase = 0;
    return;
  }
  if (gameState.currentQuestIndex === 1) {
    vanish();
  }
  if (gameState.currentQuestIndex === 2) {
    gameState.pizzaBoxes = [];
    gameState.rainTimer = 0;
    gameState.player.umbrellaCoverage = 0;
    gameState.rain = [];
  }
  gameState.month++;
  gameState.missionPhase = 0;
  gameState.currentQuestIndex++;
  gameState.player.hp = gameState.player.maxHealth;
  jingle([523, 659, 784]);
}
/** Abre los diálogos del NPC cercano y conecta sus respuestas con la misión.
 */
export function interact() {
  const npc = NPCS.find(candidate => {
    return Math.hypot(candidate.x - gameState.player.x, candidate.y - gameState.player.y) < 52;
  });
  if (!npc || !getCurrentQuest()) {
    return;
  }
  const index = NPCS.indexOf(npc);
  if (index !== gameState.currentQuestIndex) {
    gameState.dialogue = {
      lines: [
        npc.name + ': ' + (
          index < gameState.currentQuestIndex
            ? '¡Gracias por todo, Kupa!'
            : 'Todavía no es mi turno. Seguí la flecha amarilla.'
        )
      ],
      lineIndex: 0
    };
    return;
  }
  if (gameState.missionPhase === 0) {
    gameState.dialogue = {
      lines: [getCurrentQuest().introDialogue],
      lineIndex: 0,
      onComplete: begin
    };
  } else {
    if (gameState.missionPhase === 1) {
      gameState.dialogue = {
        lines: [`${npc.name}: Todavía no (${getQuestProgress()}).`],
        lineIndex: 0
      };
    } else {
      gameState.dialogue = {
        lines: [].concat(getCurrentQuest().completionDialogue),
        lineIndex: 0,
        onComplete: finishQuest
      };
    }
  }
  beep(660, .05);
}
/** Actualiza el temporizador, cobertura y humedad de las cajas de comida.
 */
export function rainStage(dt) {
  if (gameState.missionPhase !== 1 || !Array.isArray(gameState.pizzaBoxes)) {
    gameState.player.umbrellaCoverage = 0;
    return;
  }
  if (gameState.rainTimer > 0) {
    gameState.rainTimer = Math.max(0, gameState.rainTimer - dt);
  }
  const rate = 4.5 + (1 - Math.min(1, Math.max(0, gameState.rainTimer) / 20)) * 2.5;
  gameState.player.umbrellaCoverage = 0;
  for (const box of gameState.pizzaBoxes) {
    if (!box) {
      continue;
    }
    const isCovered = Math.hypot(gameState.player.x + 7 - box.x - 20, gameState.player.y + 9 - box.y - 12) < 40;
    box.covered = isCovered;
    if (isCovered) {
      gameState.player.umbrellaCoverage = 1;
      if (Math.random() < dt * 10) {
        emit(gameState.player.x + 7 + (Math.random() - .5) * 30, gameState.player.y - 8, '#bfe3ff');
      }
    } else {
      if (gameState.rainTimer > 0) {
        box.wetness = Math.min(100, box.wetness + rate * dt);
        if (Math.random() < dt * 12) {
          box.shake = .35;
        }
        if (Math.random() < dt * 14) {
          emit(box.x + Math.random() * 40, box.y + 2, '#bfe3ff', 2);
        }
      }
    }
    box.shake *= .9;
  }
  if (gameState.rainTimer > 0 && gameState.pizzaBoxes.some(box => box && box.wetness >= 100)) {
    gameState.gameStatus = 'over';
    gameState.missionPhase = 0;
    gameState.player.umbrellaCoverage = 0;
    beep(120, .6, 'sawtooth', .08, -80);
  }
}

/** Recoge objetos cercanos y aplica experiencia, curación y progreso.
 */
export function collectItems() {
  const player = gameState.player;
  gameState.items = gameState.items.filter(item => {
    if (!intersects(item, player)) {
      return true;
    }
    beep(880, .08);
    emit(item.x + 7, item.y + 7, '#ffd84a', 14);
    gameState.floatingMessages.push({
      text: item.kind === 'calc' ? '+XP' : item.drop ? '+15 HP' : '+1',
      x: item.x + 7,
      y: item.y,
      lifetime: 1.2
    });
    if (item.kind === 'calc') {
      gameState.experience++;
      if (gameState.experience % 3 === 0) {
        gameState.level++;
        player.maxHealth += 20;
        player.hp = player.maxHealth;
        gameState.message = '¡NIVEL ' + gameState.level + '! Pico más fuerte';
        gameState.messageTimer = 2;
        jingle([660, 880]);
      }
    } else if (item.drop) {
      player.hp = Math.min(player.maxHealth, player.hp + 15);
    } else {
      gameState.collectedCount++;
    }
    return false;
  });
}

/** Cambia la misión a su etapa de retorno al completar el objetivo.
 */
export function updateQuestProgress() {
  const quest = getCurrentQuest();
  if (!quest || gameState.missionPhase !== 1) {
    return;
  }
  const collectionComplete = quest.objectiveType === 'collect' && gameState.collectedCount >= quest.requiredCount;
  const defeatComplete = quest.objectiveType === 'defeat' && gameState.kills >= quest.requiredCount;
  const protectionComplete = quest.objectiveType === 'protect' && gameState.rainTimer <= 0;
  const objectiveComplete = collectionComplete || defeatComplete || protectionComplete;
  if (!objectiveComplete) {
    return;
  }
  gameState.missionPhase = 2;
  gameState.player.umbrellaCoverage = 0;
  const nextNpcName = NPCS[gameState.currentQuestIndex]?.name ?? '';
  gameState.message = gameState.currentQuestIndex === 1
    ? '¡Hablá con MARXEL!'
    : '¡Volvé con ' + nextNpcName + '!';
  gameState.messageTimer = 3;
  jingle([523, 784]);
}
