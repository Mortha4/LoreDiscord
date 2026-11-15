/**
 * Definiciones declarativas de objetivos, posiciones, enemigos y diálogos.
 */
export const QUESTS = [
  {
    objectiveType: 'collect',
    itemType: 'paty',
    requiredCount: 3,
    itemPositions: [
      [420, 300],
      [900, 260],
      [600, 760]
    ],
    enemySpawns: [
      ['cloud', 520, 260],
      ['cloud', 820, 480],
      ['cloud', 300, 620]
    ],
    objectiveLabel: 'Juntá Patys',
    introDialogue: 'Juli: Kupa, bienvenido a la Reserva Ecológica. ' +
      'Juntá 3 Patys para La Aduana y pegale a las nubes verdes con la pico (ESPACIO).',
    completionDialogue: 'Juli: ¡Patys a salvo! Antigüedad en Discord: 1 mes.'
  },
  {
    objectiveType: 'collect',
    itemType: 'libro',
    requiredCount: 3,
    itemPositions: [
      [1080, 330],
      [1500, 330],
      [1000, 150]
    ],
    enemySpawns: [
      ['guard', 1150, 300],
      ['guard', 1400, 380]
    ],
    objectiveLabel: 'Recogé los libros de Análisis II',
    introDialogue: 'Marxel: Traeme los 3 libros de Análisis II. ' +
      'Los Guardias de Silencio patrullan con sus conos de visión: ¡que no te vean!',
    completionDialogue: [
      'Kupacraft: Marxel, ¿para qué sirve tanto Análisis II?',
      'Marxel: Dicen en FIUBA que la integral doble separa a los valientes ' +
        'de los que se van a la Aduana. Sobrevivir es el teorema.',
      'Marxel: ¡Estoy brillando! ¡EL KUPA EVOLUCIONA A KUPITINCHI! Los guardias se esfuman. Discord: 2 meses.'
    ]
  },
  {
    objectiveType: 'protect',
    requiredCount: 3,
    durationSeconds: 20,
    objectiveLabel: 'Cubrí las cajas',
    introDialogue: 'Kupitinchi: ¡Se viene la tormenta y las cajas de pizzas y empanadas ' +
      'están al aire libre! Corré de caja en caja y cubrilas con el paraguas durante 20 segundos.',
    completionDialogue: 'Kupitinchi: Empanadas salvadas. Cero reproches. Discord: 3 meses.'
  },
  {
    objectiveType: 'collect',
    itemType: 'papa',
    requiredCount: 3,
    itemPositions: [
      [560, 1080],
      [720, 900],
      [400, 820]
    ],
    enemySpawns: [
      ['cloud', 600, 1000],
      ['creepy', 700, 1100]
    ],
    objectiveLabel: 'Juntá papas',
    introDialogue: 'Cocinero: El Kupa quiere papa. Traeme 3 papas, pero esquivá los autos quemados.',
    completionDialogue: 'Cocinero: Está bien... amaso ñoquis a las 5 PM. Discord: 4 meses.'
  },
  {
    objectiveType: 'boss',
    objectiveLabel: 'Vencé al jefe',
    introDialogue: 'Mamá de Martín: ¡¿POR QUÉ PUSISTE QUE ME MORÍ?! ¡Peleá!'
  }
];
