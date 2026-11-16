// Entrada unificada para menus: teclado + mouse.
// Para sumar gamepad (macroquad no lo trae) se puede agregar `gilrs` y
// activar up/down/confirm/back desde aqui, sin tocar las escenas.

use macroquad::prelude::*;

pub struct MenuInput {
    pub up: bool,
    pub down: bool,
    pub confirm: bool,
    pub back: bool,
    pub mute: bool,
    pub mouse: (f32, f32),
    pub mouse_moved: bool,
    pub mouse_clicked: bool,
}

pub struct InputTracker {
    last_mouse: (f32, f32),
}

impl InputTracker {
    pub fn new() -> Self {
        Self { last_mouse: mouse_position() }
    }

    pub fn poll(&mut self) -> MenuInput {
        let mouse = mouse_position();
        let moved = mouse != self.last_mouse;
        self.last_mouse = mouse;

        MenuInput {
            up: is_key_pressed(KeyCode::Up) || is_key_pressed(KeyCode::W),
            down: is_key_pressed(KeyCode::Down) || is_key_pressed(KeyCode::S),
            confirm: is_key_pressed(KeyCode::Enter) || is_key_pressed(KeyCode::Space),
            back: is_key_pressed(KeyCode::Escape),
            mute: is_key_pressed(KeyCode::M),
            mouse,
            mouse_moved: moved,
            mouse_clicked: is_mouse_button_pressed(MouseButton::Left),
        }
    }
}
