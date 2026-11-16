// Menu principal de "Lore del discord".
// Se maneja con mouse o con flechas arriba/abajo + Enter.

use macroquad::prelude::*;

use crate::config;
use crate::scene::{Scene, SceneAction};

const OPTIONS: [&str; 3] = ["Jugar", "Opciones", "Salir"];

pub struct MainMenu {
    selected: usize,
    last_mouse: (f32, f32),
    message: String,
}

impl MainMenu {
    pub fn new() -> Self {
        Self {
            selected: 0,
            last_mouse: (0.0, 0.0),
            message: String::new(),
        }
    }

    fn button_rect(index: usize) -> Rect {
        let (w, h, gap) = (260.0, 52.0, 14.0);
        let x = (screen_width() - w) / 2.0;
        let y = screen_height() * 0.5 + index as f32 * (h + gap);
        Rect::new(x, y, w, h)
    }
}

impl Scene for MainMenu {
    fn update(&mut self) -> SceneAction {
        let n = OPTIONS.len();

        // Teclado
        if is_key_pressed(KeyCode::Down) {
            self.selected = (self.selected + 1) % n;
        }
        if is_key_pressed(KeyCode::Up) {
            self.selected = (self.selected + n - 1) % n;
        }
        let mut activated = is_key_pressed(KeyCode::Enter);

        // Mouse: solo cambia la seleccion si el mouse se movio
        let mouse = mouse_position();
        let moved = mouse != self.last_mouse;
        self.last_mouse = mouse;
        for i in 0..n {
            if Self::button_rect(i).contains(vec2(mouse.0, mouse.1)) {
                if moved {
                    self.selected = i;
                }
                if is_mouse_button_pressed(MouseButton::Left) {
                    self.selected = i;
                    activated = true;
                }
            }
        }

        if activated {
            match self.selected {
                0 => self.message = "Proximamente: aqui empieza el juego.".to_owned(),
                1 => self.message = "Proximamente: opciones.".to_owned(),
                _ => return SceneAction::Quit,
            }
        }

        SceneAction::None
    }

    fn draw(&self) {
        let h = screen_height();

        draw_centered(config::TITLE, h * 0.25, 72, config::ACCENT);
        draw_centered(config::SUBTITLE, h * 0.25 + 40.0, 26, config::MUTED);

        for (i, label) in OPTIONS.iter().enumerate() {
            let r = Self::button_rect(i);
            let is_selected = i == self.selected;

            if is_selected {
                draw_rectangle(r.x, r.y, r.w, r.h, config::ACCENT);
            } else {
                draw_rectangle(r.x, r.y, r.w, r.h, config::SURFACE);
                draw_rectangle_lines(r.x, r.y, r.w, r.h, 2.0, config::MUTED);
            }

            let color = if is_selected { config::BG } else { config::TEXT };
            let dims = measure_text(label, None, 30, 1.0);
            draw_text(
                label,
                r.x + (r.w - dims.width) / 2.0,
                r.y + (r.h + dims.height) / 2.0,
                30.0,
                color,
            );
        }

        if !self.message.is_empty() {
            draw_centered(&self.message, h - 40.0, 24, config::MUTED);
        }
    }
}

fn draw_centered(text: &str, y: f32, size: u16, color: Color) {
    let dims = measure_text(text, None, size, 1.0);
    draw_text(text, (screen_width() - dims.width) / 2.0, y, size as f32, color);
}
