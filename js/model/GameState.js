/**
 * Estado mutable único del juego, sin referencias al Canvas ni a la presentación.
 */
export const gameState = {
  gameStatus: 'menu',
  now: 0,
  last: 0,
  camera: {
    x: 0,
    y: 0
  },
  dialogue: null,
  currentQuestIndex: 0,
  missionPhase: 0,
  screenShake: 0,
  message: '',
  messageTimer: 0,
  month: 0,
  experience: 0,
  level: 1,
  collectedCount: 0,
  kills: 0,
  player: {
    x: 640,
    y: 470,
    w: 14,
    h: 18,
    hp: 100,
    maxHealth: 100,
    facingX: 0,
    facingY: 1,
    invulnerabilityTimer: 0,
    attackCooldown: 0,
    umbrellaCoverage: 0
  },
  items: [],
  enemies: [],
  projectiles: [],
  particles: [],
  pizzaBoxes: [],
  rainTimer: 0,
  walkingAnimationTime: 0,
  isMoving: 0,
  ambientLight: [255, 150, 40, .12],
  rain: [],
  floatingMessages: [],
  displayedHealth: 100,
  displayedMonths: 0,
  displayedExperience: 0,
  lightningFlash: 0,
  lightningTimer: 4,
  fade: 1,
  previousGameStatus: 'menu',
  keys: {},
  actions: {
    interact: false,
    attack: false
  },
  mouse: {
    x: 0,
    y: 0,
    click: false
  },
  audio: null
};
