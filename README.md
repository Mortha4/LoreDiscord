<div align="center">

# ✦ FIUBA LORE ✦

### Una aventura pixel art sobre cursar, sobrevivir y llegar a los seis meses de Discord.

[![Jugar online](https://img.shields.io/badge/JUGAR-online-4de3d6?style=for-the-badge&logo=html5&logoColor=14121d)](https://mortha4.github.io/LoreDiscord/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%20Modules-f7df1e?style=for-the-badge&logo=javascript&logoColor=14121d)](#-tecnolog%C3%ADas)
[![Canvas](https://img.shields.io/badge/Canvas-640%C3%97480-5865f2?style=for-the-badge&logo=html5&logoColor=white)](#-tecnolog%C3%ADas)

**Explorá la FIUBA. Juntá provisiones. Esquivá a los guardias.**<br>
Y, por favor, cuidá las empanadas cuando empiece a llover.

</div>

---

## 🎮 La aventura

FIUBA LORE es un videojuego web de exploración y acción hecho con **HTML5 Canvas**, **CSS** y **JavaScript moderno**. Acompañá a Kupacraft por un mapa inspirado en el universo FIUBA, completá misiones, enfrentá enemigos y ayudá a la comunidad a sobrevivir otro cuatrimestre.

La experiencia combina combates arcade, diálogos, objetivos de recolección y una misión de protección contrarreloj, con una presentación pixel art de colores intensos, iluminación ambiental y efectos de clima.

## 🗺️ Tus misiones

| Etapa | Objetivo |
|:--|:--|
| 🌳 **Reserva Ecológica** | Reuní tres Patys y defendete de las nubes verdes. |
| 📚 **Biblioteca** | Recuperá los libros de Análisis II mientras evitás a los guardias **SHH**. |
| ⛈️ **Terraza de Kupitinchi** | Protegé las cajas de pizzas y empanadas durante 20 segundos de tormenta. |
| 🍟 **Bodegón** | Juntá papas y esquivá los autos quemados. |
| 💥 **Desafío final** | Enfrentá a la Mamá de Martín y alcanzá los seis meses en Discord. |

## 🕹️ Controles

| Acción | Teclado |
|:--|:--|
| Moverse | `W` `A` `S` `D` o flechas |
| Atacar con el pico | `Espacio` |
| Hablar / interactuar / avanzar diálogos | `E` |
| Empezar desde el menú | Clic en **JUGAR**, `E` o `Espacio` |
| Reintentar después de Game Over | `E` o `Espacio` |

## 🚀 Cómo jugar

**En línea:** [Abrir FIUBA LORE](https://mortha4.github.io/LoreDiscord/)

**En local:** como el juego usa módulos ES, abrilo desde un servidor HTTP local en lugar de cargar `index.html` directamente como archivo.

```bash
# Opción 1: Python 3
python3 -m http.server 8000
```

```bash
# Opción 2: Node.js, si tenés npx disponible
npx serve .
```

Después visitá `http://localhost:8000` (o la dirección que indique tu servidor) en un navegador moderno. No hace falta instalar dependencias ni compilar el proyecto.

## 🧩 Mapa del proyecto

El proyecto separa el documento y los estilos, los datos de la partida, sus reglas y la presentación Canvas. Los módulos se conectan mediante **ES Modules** con imports explícitos.

```text
.
├── index.html
├── README.md
├── css/
│   └── styles.css
└── js/
    ├── main.js
    ├── model/
    │   ├── Config.js
    │   ├── GameState.js
    │   ├── QuestsData.js
    │   └── WorldData.js
    ├── logic/
    │   ├── CameraController.js
    │   ├── CombatSystem.js
    │   ├── InputHandler.js
    │   ├── Physics.js
    │   └── QuestSystem.js
    └── view/
        ├── AudioSystem.js
        ├── LightingAndVFX.js
        ├── Sprites.js
        ├── UIRenderer.js
        └── WorldRenderer.js
```

### Documento y estilos

- **`index.html`** define el documento, el canvas de juego `640 × 480`, la hoja de estilos y el punto de entrada JavaScript. No contiene mecánicas.
- **`css/styles.css`** define la tipografía, paleta exterior, marco y sombras del canvas, fondo de la página y reglas de adaptación a pantallas estrechas o bajas.

### Modelo: configuración, mapa y estado

- **`js/model/Config.js`** concentra el tamaño del mundo y del canvas, velocidad del jugador, colores, estadísticas base de enemigos, paletas ambientales y posiciones de lámparas. Ajustá aquí valores globales de balance o presentación.
- **`js/model/GameState.js`** exporta `gameState`, el objeto compartido que guarda la partida activa: estado de pantalla, jugador, cámara, progreso, entidades, diálogos, controles y temporizadores. La lógica cambia estos datos y las vistas los leen para dibujarlos.
- **`js/model/QuestsData.js`** contiene la lista declarativa de misiones. Cada objeto define el tipo de objetivo, cantidades, posiciones de aparición, diálogos y recompensas. Es el lugar principal para editar el contenido narrativo de una misión.
- **`js/model/WorldData.js`** define edificios, NPCs y autos quemados; deriva obstáculos estáticos de la geometría y genera árboles con una secuencia pseudoaleatoria reproducible. Si se modifica el mapa, revisá también las colisiones que usa Física.

### Lógica: entrada, movimiento, combate y misiones

- **`js/logic/InputHandler.js`** escucha teclado y puntero. Traduce WASD, flechas, Espacio, E y clics a estados de tecla o acciones; no dibuja la interfaz.
- **`js/logic/Physics.js`** comprueba intersecciones, mueve entidades por ejes y resuelve obstáculos estáticos. También determina si el jugador está en la Reserva, la Biblioteca o la Terraza.
- **`js/logic/CameraController.js`** sigue al jugador con interpolación, mantiene la cámara dentro de los límites del mapa y reduce el temporizador de sacudida.
- **`js/logic/CombatSystem.js`** implementa ataques con el pico, daño e invulnerabilidad, aparición y derrota de enemigos, IA por tipo, proyectiles y generación de partículas de juego.
- **`js/logic/QuestSystem.js`** inicia misiones, abre diálogos, comprueba recolecciones y derrotas, entrega progreso y recompensas. También contiene la regla de lluvia, humedad y cobertura de las cajas en la terraza.

### Vista: dibujo, iluminación, interfaz y audio

- **`js/view/Sprites.js`** ofrece primitivas de dibujo y sprites Canvas (Kupacraft, enemigos, paty, calculadora, Discord y Pinga). `main.js` inyecta aquí el contexto 2D al iniciar.
- **`js/view/WorldRenderer.js`** dibuja terreno, edificios, árboles, objetos, NPCs, jugador, enemigos, proyectiles y efectos. Ordena las entidades por profundidad y añade detalles de suelo, sombras y parallax.
- **`js/view/LightingAndVFX.js`** interpola la luz ambiental por zona y actualiza/dibuja lluvia, relámpagos, partículas de ambiente, rayos de sol, lámparas, resplandores y viñeta.
- **`js/view/UIRenderer.js`** presenta el menú, el HUD, progreso y barras, instrucciones de misión, diálogos, victoria, derrota y cortina de transición.
- **`js/view/AudioSystem.js`** sintetiza tonos y melodías con Web Audio API; no necesita archivos de sonido externos.

### Orquestación de una partida

`js/main.js` une las capas y administra el bucle de juego:

1. `requestAnimationFrame` programa el siguiente fotograma y calcula `deltaTime`, con un límite para evitar saltos grandes tras pausas.
2. La actualización procesa el menú o el juego: movimiento, combate, interacción, enemigos, recolección y progreso de misión.
3. Se calcula la zona ambiental y se actualizan las transiciones y efectos visuales.
4. La cámara se actualiza; el mundo se dibuja, seguido por iluminación, interfaz y cortina. El menú usa su propia ruta de renderizado.
5. Si el jugador pierde, `respawn` restaura su posición y salud y limpia entidades temporales para permitir reintentar.

**Nota sobre las dependencias actuales:** `CombatSystem.js` y `QuestSystem.js` importan `AudioSystem.js` para reproducir sonidos al ocurrir eventos del juego. El sintetizador vive en `view/`, pero esas reglas lo invocan directamente.

El canvas conserva una resolución interna de **640 × 480**. CSS ajusta su tamaño en pantalla y `image-rendering: pixelated` mantiene el aspecto de píxel. No se requiere bundler ni instalación de paquetes; serví el directorio por HTTP para que el navegador pueda cargar los módulos.

### ¿Dónde hago un cambio?

| Quiero cambiar… | Empezá por… | También puede afectar… |
|:--|:--|:--|
| El diálogo, objetivo o recompensa de una misión | `js/model/QuestsData.js` | `js/logic/QuestSystem.js` si agregás un tipo de objetivo nuevo |
| La ubicación de edificios, NPCs u obstáculos | `js/model/WorldData.js` | `js/view/WorldRenderer.js` para detalles dibujados a medida |
| Salud, velocidad o balance de enemigos | `js/model/Config.js` | `js/logic/CombatSystem.js` si cambiás reglas de combate |
| Movimiento, colisiones o zonas | `js/logic/Physics.js` | `js/logic/CameraController.js` para límites de cámara |
| Apariencia de personaje u objeto | `js/view/Sprites.js` | `js/view/WorldRenderer.js` para ubicación, sombra y luz |
| Clima, paletas o luces | `js/view/LightingAndVFX.js` | `js/model/Config.js` para valores ambientales |
| Menú, HUD o diálogos en pantalla | `js/view/UIRenderer.js` | `css/styles.css` solo para el marco y diseño exterior |
| Resolución o adaptación del canvas | `index.html` y `css/styles.css` | `js/model/Config.js` si cambia la resolución interna |

## ✨ Detalles

- Sprites pixel art dibujados directamente con Canvas.
- Cámara con seguimiento del jugador y límites del mundo.
- Misiones con diálogos, objetivos, progreso y recompensas.
- Combate, proyectiles, enemigos y jefe final.
- Iluminación por zonas, resplandores, lluvia, relámpagos y partículas.
- Interfaz arcade con indicadores de vida, experiencia y meses.
- Audio retro sintetizado mediante Web Audio API.

## 🛠️ Tecnologías

`HTML5` · `CSS3` · `JavaScript ES Modules` · `Canvas 2D` · `Web Audio API`

---

<div align="center">

**Hecho con café, pixelitos y una cantidad preocupante de Análisis II.**<br>
*FIUBA LORE — sobrevivir también cuenta como mérito académico.*

</div>
