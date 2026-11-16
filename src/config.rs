// Datos generales del juego: nombre, tamano de ventana, colores y escena inicial.

use macroquad::prelude::Color;

use crate::scene::SceneId;

pub const TITLE: &str = "Lore del discord";
pub const SUBTITLE: &str = "Un juego sobre el lore de tu servidor";

pub const WINDOW_WIDTH: i32 = 960;
pub const WINDOW_HEIGHT: i32 = 600;

pub const FIRST_SCENE: SceneId = SceneId::MainMenu;

// Paleta (estilo blurple de Discord)
pub const BG: Color = Color::new(0.10, 0.11, 0.15, 1.0);
pub const SURFACE: Color = Color::new(0.14, 0.15, 0.23, 1.0);
pub const ACCENT: Color = Color::new(0.47, 0.51, 0.96, 1.0);
pub const TEXT: Color = Color::new(0.95, 0.95, 1.0, 1.0);
pub const MUTED: Color = Color::new(0.64, 0.65, 0.78, 1.0);
