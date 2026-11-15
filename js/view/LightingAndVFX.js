/** Presentación de iluminación, atmósfera, lluvia y efectos de pantalla. */
import { getCanvasContext } from './Sprites.js';
import { gameState } from '../model/GameState.js';
import { AMBIENT_LIGHTING, CW, CH, LAMPS } from '../model/Config.js';
import { beep } from './AudioSystem.js';

const rainSplashes = [];
let ambienceTimer = 0;

/** Actualiza las transiciones y los efectos temporales de presentación. */
export function updateVFX(deltaTime) {
  const interpolation = 1 - Math.exp(-deltaTime * 3.2);
  gameState.fade = Math.max(0, gameState.fade - deltaTime * 1.6);

  if (gameState.gameStatus !== gameState.previousGameStatus) {
    gameState.previousGameStatus = gameState.gameStatus;
    gameState.fade = 1;
  }

  gameState.displayedHealth += (gameState.player.hp - gameState.displayedHealth) * interpolation;
  gameState.displayedMonths += (gameState.month - gameState.displayedMonths) * interpolation * 0.7;
  gameState.displayedExperience += (gameState.experience % 3 - gameState.displayedExperience) * interpolation;

  const targetLight = AMBIENT_LIGHTING[gameState.zone] ?? AMBIENT_LIGHTING[0];
  for (let channel = 0; channel < 4; channel += 1) {
    gameState.ambientLight[channel] += (targetLight[channel] - gameState.ambientLight[channel]) * interpolation;
  }

  if (gameState.dialogue || gameState.gameStatus !== 'play') {
    gameState.isMoving = 0;
  }
  if (gameState.gameStatus === 'menu') {
    return;
  }

  updateStorm(deltaTime);
  updateRain(deltaTime);
  updateRainSplashes(deltaTime);
  updateAmbientParticles(deltaTime);
  updateFloatingMessages(deltaTime);
  updateGameParticles(deltaTime);
}

/** Programa relámpagos únicamente durante la tormenta de la terraza. */
function updateStorm(deltaTime) {
  gameState.lightningTimer -= deltaTime;
  if (gameState.zone === 2 && gameState.lightningTimer <= 0) {
    gameState.lightningFlash = 1;
    gameState.lightningTimer = 3 + Math.random() * 4;
    beep(70, 0.5, 'sawtooth', 0.06, -30);
  }
  gameState.lightningFlash = Math.max(0, gameState.lightningFlash - deltaTime * 2.5);
}

/** Actualiza gotas inclinadas y crea salpicaduras de corta duración. */
function updateRain(deltaTime) {
  if (gameState.zone !== 2) {
    gameState.rain.length = 0;
    return;
  }

  const spawnCount = gameState.missionPhase === 1 && gameState.currentQuestIndex === 2 ? 7 : 4;
  for (let index = 0; index < spawnCount && gameState.rain.length < 260; index += 1) {
    gameState.rain.push({
      x: Math.random() * 800,
      y: -10,
      speed: 420 + Math.random() * 200,
      groundY: 30 + Math.random() * 450
    });
  }

  gameState.rain = gameState.rain.filter((rainDrop) => {
    rainDrop.y += rainDrop.speed * deltaTime;
    rainDrop.x -= rainDrop.speed * 0.25 * deltaTime;
    if (rainDrop.y > rainDrop.groundY) {
      if (rainSplashes.length < 48) {
        rainSplashes.push({ x: rainDrop.x, y: rainDrop.groundY, lifetime: 0.24 });
      }
      return false;
    }
    return true;
  });
}

/** Retira las ondas una vez que se han desvanecido. */
function updateRainSplashes(deltaTime) {
  for (const splash of rainSplashes) {
    splash.lifetime -= deltaTime;
  }
  for (let index = rainSplashes.length - 1; index >= 0; index -= 1) {
    if (rainSplashes[index].lifetime <= 0) {
      rainSplashes.splice(index, 1);
    }
  }
}

/** Anima motas de polvo interiores y hojas de la reserva en una piscina acotada. */
function updateAmbientParticles(deltaTime) {
  ambienceTimer -= deltaTime;
  if (ambienceTimer <= 0 && gameState.gameStatus === 'play') {
    ambienceTimer = 0.08;
    const particleKind = gameState.zone === 1 ? 'dust' : 'leaf';
    if (gameState.zone < 2 && rainSplashes.length < 80) {
      rainSplashes.push({
        x: Math.random() * CW,
        y: Math.random() * CH,
        lifetime: 1.2 + Math.random() * 1.8,
        kind: particleKind
      });
    }
  }
  for (const particle of rainSplashes) {
    if (particle.kind === 'dust' || particle.kind === 'leaf') {
      particle.x += Math.sin(gameState.now / 900 + particle.y) * deltaTime * 9;
      particle.y += deltaTime * (particle.kind === 'leaf' ? 8 : -3);
    }
  }
  for (let index = rainSplashes.length - 1; index >= 0; index -= 1) {
    const particle = rainSplashes[index];
    if (particle.kind && (particle.lifetime <= 0 || particle.y < -8 || particle.y > CH + 8)) {
      rainSplashes.splice(index, 1);
    }
  }
}

/** Anima mensajes flotantes creados por el juego. */
function updateFloatingMessages(deltaTime) {
  gameState.floatingMessages = gameState.floatingMessages.filter((message) => {
    message.y -= 24 * deltaTime;
    message.lifetime -= deltaTime;
    return message.lifetime > 0;
  });
}

/** Anima y limita las partículas de combate. */
function updateGameParticles(deltaTime) {
  gameState.particles = gameState.particles.filter((particle) => {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.lifetime -= deltaTime;
    return particle.lifetime > 0;
  });
  if (gameState.particles.length > 600) {
    gameState.particles.splice(0, 150);
  }
}

/** Dibuja una luz radial aditiva, sin dejar estado global del contexto alterado. */
export function glow(positionX, positionY, radius, color, opacity) {
  if (radius <= 0 || opacity <= 0) {
    return;
  }
  const ctx = getCanvasContext();
  ctx.save();
  try {
    ctx.globalCompositeOperation = 'lighter';
    const gradient = ctx.createRadialGradient(positionX, positionY, 0, positionX, positionY, radius);
    gradient.addColorStop(0, `rgba(${color},${opacity})`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(positionX - radius, positionY - radius, radius * 2, radius * 2);
  } finally {
    ctx.restore();
  }
}

/** Dibuja rayos diagonales cálidos de la reserva. */
function drawSunRays(ctx) {
  const drift = Math.sin(gameState.now / 2600) * 18;
  ctx.save();
  try {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ffe9ad';
    for (let index = 0; index < 5; index += 1) {
      const startX = 35 + index * 72 + drift;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + 28, 0);
      ctx.lineTo(startX + 240, CH);
      ctx.lineTo(startX + 190, CH);
      ctx.closePath();
      ctx.fill();
    }
  } finally {
    ctx.restore();
  }
}

/** Dibuja luces cálidas puntuales en lámparas y ventanas de la biblioteca. */
function drawLibraryLights() {
  for (const lamp of LAMPS) {
    glow(lamp[0] - gameState.camera.x, lamp[1] - gameState.camera.y, 108, '255,190,105', 0.54);
    const screenX = lamp[0] - gameState.camera.x;
    const screenY = lamp[1] - gameState.camera.y;
    const ctx = getCanvasContext();
    ctx.save();
    try {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ffd48b';
      ctx.beginPath();
      ctx.moveTo(screenX - 10, screenY);
      ctx.lineTo(screenX + 10, screenY);
      ctx.lineTo(screenX + 65, CH);
      ctx.lineTo(screenX - 68, CH);
      ctx.closePath();
      ctx.fill();
    } finally {
      ctx.restore();
    }
  }
}

/** Dibuja gotas, salpicaduras y motas de ambiente en coordenadas de pantalla. */
function drawAtmosphericParticles(ctx) {
  if (gameState.rain.length > 0) {
    ctx.save();
    try {
      ctx.strokeStyle = 'rgba(177,215,255,.58)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const rainDrop of gameState.rain) {
        ctx.moveTo(rainDrop.x, rainDrop.y);
        ctx.lineTo(rainDrop.x - 5, rainDrop.y + 15);
      }
      ctx.stroke();
    } finally {
      ctx.restore();
    }
  }

  for (const particle of rainSplashes) {
    if (particle.kind === 'leaf') {
      ctx.fillStyle = `rgba(220,190,95,${Math.min(0.8, particle.lifetime)})`;
      ctx.fillRect(particle.x, particle.y, 4, 2);
    } else if (particle.kind === 'dust') {
      if (Math.floor(particle.x + particle.y) % 3 === 0) {
        glow(particle.x, particle.y, 12, '255,220,155', 0.2);
      }
      ctx.fillStyle = 'rgba(255,232,187,.65)';
      ctx.fillRect(particle.x, particle.y, 2, 2);
    } else {
      const progress = 1 - particle.lifetime / 0.24;
      ctx.strokeStyle = `rgba(170,220,255,${Math.max(0, particle.lifetime / 0.24) * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(particle.x, particle.y, 2 + progress * 8, 1 + progress * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/** Aplica la paleta de zona, relámpagos, lluvia y acabado cinematográfico. */
export function lighting() {
  const ctx = getCanvasContext();
  const [red, green, blue, alpha] = gameState.ambientLight;
  ctx.fillStyle = `rgba(${red | 0},${green | 0},${blue | 0},${alpha})`;
  ctx.fillRect(0, 0, CW, CH);

  if (gameState.zone === 0) {
    drawSunRays(ctx);
    const heat = 0.035 + Math.sin(gameState.now / 420) * 0.012;
    const heatGradient = ctx.createLinearGradient(0, 0, 0, CH);
    heatGradient.addColorStop(0, `rgba(255,150,60,${heat})`);
    heatGradient.addColorStop(0.2, 'transparent');
    heatGradient.addColorStop(0.8, 'transparent');
    heatGradient.addColorStop(1, `rgba(255,130,55,${heat})`);
    ctx.fillStyle = heatGradient;
    ctx.fillRect(0, 0, CW, CH);
  } else if (gameState.zone === 1) {
    drawLibraryLights();
  }

  if (gameState.lightningFlash > 0) {
    const flashOpacity = gameState.lightningFlash * 0.62;
    ctx.fillStyle = `rgba(210,230,255,${flashOpacity})`;
    ctx.fillRect(0, 0, CW, CH);
    glow(CW * 0.74, CH * 0.2, 280, '175,210,255', gameState.lightningFlash * 0.55);
  }

  drawAtmosphericParticles(ctx);
  const vignette = ctx.createRadialGradient(CW / 2, CH / 2, 190, CW / 2, CH / 2, 440);
  vignette.addColorStop(0, 'rgba(5,7,18,0)');
  vignette.addColorStop(1, 'rgba(5,7,18,.48)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CW, CH);
}
