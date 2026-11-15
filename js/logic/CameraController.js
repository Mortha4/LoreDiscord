/**
 * Seguimiento de cámara, límites del mundo y amortiguación de la sacudida.
 */
import { WW, WH, CW, CH } from '../model/Config.js';
import { gameState } from '../model/GameState.js';
/** Suaviza el seguimiento del jugador y mantiene la cámara dentro del mundo.
 */
export function updateCamera(dt) {
  const tx = Math.max(0, Math.min(WW - CW, gameState.player.x - CW / 2)),
    ty = Math.max(0, Math.min(WH - CH, gameState.player.y - CH / 2));
  gameState.camera.x += (tx - gameState.camera.x) * Math.min(1, dt * 8);
  gameState.camera.y += (ty - gameState.camera.y) * Math.min(1, dt * 8);
  gameState.screenShake = Math.max(0, gameState.screenShake - dt);
}
