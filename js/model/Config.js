/**
 * Constantes compartidas de dimensiones, movimiento, colores, enemigos e iluminación.
 */
export const WW = 1600,
  WH = 1200,
  CW = 640,
  CH = 480,
  SPEED = 125,
  COLORS = {
    fg: '#f4e9c8',
    accent: '#4de3d6',
    gold: '#ffcf33'
  };
export const ENEMY_DEFINITIONS = {
  cloud: {
    health: 2,
    w: 30,
    h: 24,
    damage: 8
  },
  guard: {
    health: 3,
    w: 16,
    h: 18,
    damage: 12
  },
  creepy: {
    health: 2,
    w: 16,
    h: 16,
    damage: 10
  },
  boss: {
    health: 30,
    w: 44,
    h: 44,
    damage: 15
  }
};
export const AMBIENT_LIGHTING = [[255, 150, 40, .12], [15, 10, 35, .42], [8, 14, 40, .5]],
  LAMPS = [[1230, 330], [1400, 300], [1330, 390]];
