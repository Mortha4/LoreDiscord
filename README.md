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

## 🧩 Arquitectura

El código está organizado por responsabilidades para que el estado, las reglas y el dibujo evolucionen de forma independiente:

```text
.
├── index.html
├── css/
│   └── styles.css              # Tipografía, marco y diseño responsivo
└── js/
    ├── main.js                 # Inicialización y ciclo principal
    ├── model/
    │   ├── Config.js           # Parámetros globales
    │   ├── GameState.js        # Estado de la partida
    │   ├── QuestsData.js       # Misiones y diálogos
    │   └── WorldData.js        # Mapa, personajes y obstáculos
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

`main.js` conecta los módulos y ejecuta el ciclo de actualización y renderizado con `requestAnimationFrame`. El mundo se dibuja en un canvas de **640 × 480** y se escala para adaptarse a la pantalla.

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
