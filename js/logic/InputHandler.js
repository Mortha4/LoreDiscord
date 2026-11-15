/**
 * Conversión de teclado y puntero en acciones de juego desacopladas.
 */
import { gameState } from '../model/GameState.js';
/** Registra teclado y puntero y traduce sus eventos a acciones del juego.
 */
export function attachInput(canvas) {
  addEventListener('keydown', event => {
    const kind = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(kind)) {
      event.preventDefault();
    }
    if (!gameState.keys[kind]) {
      if (kind === ' ') {
        gameState.actions.attack = true;
      }
      if (kind === 'e' || kind === 'enter') {
        gameState.actions.interact = true;
      }
    }
    gameState.keys[kind] = true;
  });
  addEventListener('keyup', event => gameState.keys[event.key.toLowerCase()] = false);
  canvas.addEventListener('pointermove', event => {
    const rectangle = canvas.getBoundingClientRect();
    gameState.mouse.x = (event.clientX - rectangle.left) * 640 / rectangle.width;
    gameState.mouse.y = (event.clientY - rectangle.top) * 480 / rectangle.height;
  });
  canvas.addEventListener('pointerdown', () => gameState.mouse.click = true);
}
