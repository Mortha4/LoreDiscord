## 📖 Lore


- **Facciones:** [ej. Los Moderadores, Los Bots Rebeldes, Los Lurkers]
- **Ambientación:** [ej. un servidor de Discord corrompido]
- **Objetivo:** [qué debe lograr el jugador]

## 🧰 Requisitos

- [Rust](https://www.rust-lang.org/tools/install) (versión estable, 1.75 o superior)
- Cargo (se instala junto con Rust)
- Git
- [Dependencias del sistema si aplica, ej. `libasound2-dev` en Linux]

Verifica tu instalación:

```bash
rustc --version
cargo --version
```

## 🚀 Instalación y ejecución

1. Clona el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
cd [nombre-del-proyecto]
```

2. Ejecuta el juego en modo desarrollo:

```bash
cargo run
```

3. O compílalo optimizado para mejor rendimiento:

```bash
cargo run --release
```

El ejecutable queda en `target/release/[nombre-del-juego]`.

## 🎮 Controles

| Acción | Tecla |
|--------|-------|
| [Mover] | [WASD / Flechas] |
| [Interactuar] | [E] |
| [Salir] | [Esc] |

## ⚙️ Configuración (opcional)

Si el juego se conecta a Discord (bot, Rich Presence, etc.), crea un archivo `.env`:

```env
DISCORD_TOKEN=tu_token_aqui
```

> ⚠️ Nunca subas tu token a GitHub. Añade `.env` a tu `.gitignore`.

## 🛠️ Problemas comunes

- **`cargo: command not found`**: reinicia la terminal o revisa que Rust esté en tu PATH.
- **Error de compilación por dependencias**: ejecuta `rustup update` y vuelve a intentar.
- **Falla en Linux por librerías gráficas o de audio**: instala los paquetes de desarrollo correspondientes.

## 🤝 Contribuir

Los PRs son bienvenidos. Abre un issue antes de hacer cambios grandes.

## 📜 Licencia

[MIT / Apache-2.0 / otra]

