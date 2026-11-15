/**
 * Punto de entrada: conecta input, lógica, estado y presentación en el bucle del juego.
 */
import { gameState } from './model/GameState.js';
import { QUESTS } from './model/QuestsData.js';
import { attachInput } from './logic/InputHandler.js';
import { updatePlayerMovement, zone } from './logic/Physics.js';
import { updateCamera } from './logic/CameraController.js';
import { getCurrentQuest, interact, rainStage, collectItems, updateQuestProgress } from './logic/QuestSystem.js';
import { hurt, attack, updateEnemies, updateProjectiles } from './logic/CombatSystem.js';
import { beep, jingle } from './view/AudioSystem.js';
import { updateVFX, lighting } from './view/LightingAndVFX.js';
import { renderWorld } from './view/WorldRenderer.js';
import { setCanvasContext } from './view/Sprites.js';
import { renderUI, renderCurtain } from './view/UIRenderer.js';
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
setCanvasContext(ctx);
attachInput(canvas);
/** Restaura al jugador y limpia entidades temporales después de una derrota.
 */
function respawn() {
  Object.assign(gameState.player, {
    x: 640,
    y: 470,
    hp: gameState.player.maxHealth,
    invulnerabilityTimer: 1,
    umbrellaCoverage: 0
  });
  gameState.enemies = [];
  gameState.projectiles = [];
  gameState.items = [];
  gameState.pizzaBoxes = [];
  gameState.rainTimer = 0;
  gameState.rain = [];
  if (gameState.missionPhase === 1) {
    gameState.missionPhase = 0;
  }
  gameState.gameStatus = 'play';
  gameState.dialogue = null;
}
/** Ejecuta una actualización de juego y delega cada sistema especializado.
 */
function stepPlay(deltaTime) {
  gameState.player.invulnerabilityTimer -= deltaTime;
  gameState.player.attackCooldown -= deltaTime;
  gameState.messageTimer -= deltaTime;
  updatePlayerMovement(deltaTime, hurt);
  if (gameState.actions.attack) {
    attack();
  }
  if (gameState.actions.interact) {
    interact();
  }
  updateEnemies(deltaTime, hurt);
  updateProjectiles(deltaTime, hurt);
  collectItems();
  if (gameState.missionPhase === 1 && getCurrentQuest()?.objectiveType === 'protect') {
    rainStage(deltaTime);
  } else {
    gameState.player.umbrellaCoverage = 0;
  }
  updateQuestProgress();
  if (gameState.player.hp <= 0) {
    gameState.gameStatus = 'over';
    beep(120, .6, 'sawtooth', .08, -80);
  }
}
/** Procesa el estado de menú, juego, diálogos, victoria y derrota.
 */
function update(dt) {
  if (gameState.gameStatus === 'menu') {
    const startButtonClicked = gameState.mouse.click &&
      gameState.mouse.x > 175 &&
      gameState.mouse.x < 465 &&
      gameState.mouse.y > 417 &&
      gameState.mouse.y < 459;
    if (gameState.actions.interact || gameState.actions.attack || startButtonClicked) {
      gameState.gameStatus = 'play';
      gameState.currentQuestIndex = 0;
      gameState.missionPhase = 0;
      gameState.month = gameState.experience = 0;
      gameState.level = 1;
      gameState.player.maxHealth = 100;
      respawn();
    }
  } else {
    if (gameState.gameStatus === 'win' && !gameState.dialogue) {
      if (gameState.actions.interact || gameState.actions.attack) {
        gameState.gameStatus = 'menu';
      }
    } else {
      if (gameState.gameStatus === 'over') {
        if (gameState.actions.interact || gameState.actions.attack) {
          respawn();
        }
      } else {
        if (gameState.dialogue) {
          if (gameState.actions.interact || gameState.actions.attack) {
            gameState.dialogue.lineIndex++;
            beep(520, .04);
            if (gameState.dialogue.lineIndex >= gameState.dialogue.lines.length) {
              const completionCallback = gameState.dialogue.onComplete;
              gameState.dialogue = null;
              if (completionCallback) {
                completionCallback();
              }
            }
          }
        } else {
          if (gameState.gameStatus === 'play') {
            stepPlay(dt);
          }
        }
      }
    }
  }
  gameState.actions.interact = gameState.actions.attack = gameState.mouse.click = false;
}
/** Compone el mundo, la iluminación, la interfaz y las transiciones.
 */
function render(deltaTime) {
  ctx.fillStyle = '#0d0c1a';
  ctx.fillRect(0, 0, 640, 480);
  if (gameState.gameStatus === 'menu') {
    renderUI();
    renderCurtain();
    return;
  }
  updateCamera(deltaTime);
  ctx.save();
  try {
    if (gameState.screenShake > 0) {
      ctx.translate((Math.random() - .5) * 8, (Math.random() - .5) * 8);
    }
    renderWorld();
  } finally {
    ctx.restore();
  }
  lighting();
  renderUI();
  renderCurtain();
}
let last = 0;
/** Calcula deltaTime, ejecuta la actualización y agenda el siguiente frame.
 */
function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, Math.max(0, (ts - last) / 1000 || .016));
  last = ts;
  gameState.now = ts;
  try {
    update(dt);
    gameState.zone = zone();
    updateVFX(dt);
    render(dt);
  } catch (entity) {
    console.error('[FIUBA LORE]', entity);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    gameState.actions.interact = gameState.actions.attack = false;
    if (!getCurrentQuest()) {
      gameState.currentQuestIndex = Math.min(Math.max(gameState.currentQuestIndex, 0), QUESTS.length - 1);
      gameState.missionPhase = 0;
    }
    const dialogueLines = gameState.dialogue?.lines;
    const currentLine = dialogueLines?.[gameState.dialogue?.lineIndex];
    if (gameState.dialogue && (!Array.isArray(dialogueLines) || currentLine === undefined)) {
      gameState.dialogue = null;
    }
    gameState.pizzaBoxes = gameState.pizzaBoxes.filter(Boolean);
  }
}
requestAnimationFrame(frame);
