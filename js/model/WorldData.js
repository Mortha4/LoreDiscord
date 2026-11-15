/**
 * Geometría estática del mapa, NPCs, autos, árboles y obstáculos deterministas.
 */
import { QUESTS } from './QuestsData.js';
export const BUILDINGS = [{
  x: 80,
  y: 60,
  w: 220,
  h: 130,
  color: '#b8b8c8',
  label: 'ADUANA'
}, {
  x: 620,
  y: 60,
  w: 300,
  h: 130,
  color: '#c9a24a',
  label: 'FIUBA'
}, {
  x: 1160,
  y: 60,
  w: 300,
  h: 150,
  color: '#7a4a2b',
  label: 'BIBLIOTECA'
}, {
  x: 1160,
  y: 780,
  w: 300,
  h: 110,
  color: '#a0522d',
  label: 'TERRAZA'
}, {
  x: 80,
  y: 900,
  w: 260,
  h: 140,
  color: '#7a2a2a',
  label: 'BODEGON'
}];
export const NPCS = [{
  name: 'JULI',
  x: 180,
  y: 235,
  color: '#e84393'
}, {
  name: 'MARXEL',
  x: 1300,
  y: 260,
  color: '#d9b38c'
}, {
  name: 'KUPITINCHI',
  x: 1535,
  y: 935,
  color: '#9b59b6'
}, {
  name: 'COCINERO',
  x: 230,
  y: 860,
  color: '#eee'
}, {
  name: 'MAMA DE MARTIN',
  x: 800,
  y: 540,
  color: '#d86aa0'
}];
export const BURNT_CARS = [{
  x: 430,
  y: 800,
  w: 64,
  h: 30,
  hot: 1
}, {
  x: 540,
  y: 960,
  w: 64,
  h: 30,
  hot: 1
}, {
  x: 650,
  y: 860,
  w: 64,
  h: 30,
  hot: 1
}];
let seed = 7;
/** Devuelve un valor pseudoaleatorio reproducible para generar el arbolado del mapa. */
const rnd = () => seed = seed * 16807 % 2147483647 / 2147483647;
export const TREES = [];
export const STATIC_OBSTACLES = BUILDINGS.map(({
  x: positionX,
  y: positionY,
  w: width,
  h: height
}) => ({
  x: positionX,
  y: positionY,
  w: width,
  h: height
}));
STATIC_OBSTACLES.push(...BURNT_CARS);
const reservedLocations = [
  [640, 470],
  ...NPCS.map(npc => [npc.x, npc.y]),
  ...QUESTS.flatMap(quest => {
    const enemyLocations = (quest.enemySpawns || []).map(enemy => [enemy[1], enemy[2]]);
    return (quest.itemPositions || []).concat(enemyLocations);
  })
];

/** Evita colocar árboles sobre caminos, edificios, entidades u objetivos. */
function canPlaceTree(positionX, positionY) {
  const isOnRoad = positionY > 540 && positionY < 660;
  const overlapsBuilding = BUILDINGS.some(building => {
    return positionX > building.x - 30 &&
      positionX < building.x + building.w + 30 &&
      positionY > building.y - 30 &&
      positionY < building.y + building.h + 60;
  });
  const isNearReservedLocation = reservedLocations.some(location => {
    return Math.hypot(location[0] - positionX, location[1] - positionY) < 60;
  });
  const isNearBurntCar = BURNT_CARS.some(car => {
    return Math.hypot(car.x - positionX, car.y - positionY) < 90;
  });
  const isInCentralPlaza = positionX > 680 && positionX < 920 && positionY > 480 && positionY < 720;
  const isBehindTerrace = positionX > 1080 && positionY > 870;

  return !(
    isOnRoad ||
    overlapsBuilding ||
    isNearReservedLocation ||
    isNearBurntCar ||
    isInCentralPlaza ||
    isBehindTerrace
  );
}

for (let index = 0; index < 160 && TREES.length < 70; index++) {
  const positionX = rnd() * 1560 + 20,
    positionY = rnd() * 1160 + 20;
  if (!canPlaceTree(positionX, positionY)) {
    continue;
  }
  TREES.push({
    x: positionX,
    y: positionY
  });
  STATIC_OBSTACLES.push({
    x: positionX - 8,
    y: positionY - 4,
    w: 16,
    h: 16
  });
}
