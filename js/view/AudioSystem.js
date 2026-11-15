/**
 * Síntesis de sonidos y melodías retro con Web Audio.
 */
import { gameState } from '../model/GameState.js';
/** Sintetiza un tono con oscilador y envolvente de volumen.
 */
export function beep(frequency, duration = .08, waveform = 'square', volume = .05, pitchSlide = 0) {
  try {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    gameState.audio = gameState.audio || new AudioContextConstructor();
    const oscillator = gameState.audio.createOscillator();
    const gain = gameState.audio.createGain();
    const startTime = gameState.audio.currentTime;
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    if (pitchSlide) {
      oscillator.frequency.linearRampToValueAtTime(Math.max(30, frequency + pitchSlide), startTime + duration);
    }
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(.001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(gameState.audio.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  } catch {}
}
/** Programa una secuencia de tonos como melodía retro.
 */
export const jingle = frequencies => {
  frequencies.forEach((frequency, index) => {
    setTimeout(() => beep(frequency, .15), index * 120);
  });
};
