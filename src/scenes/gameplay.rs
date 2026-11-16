// Escena de juego (por ahora un placeholder). ESC vuelve al menu.

use macroquad::prelude::*;

use crate::assets::Assets;
use crate::audio;
use crate::fx;
use crate::gfx::*;
use crate::scene::{Scene, SceneAction, SceneId};

pub struct Gameplay {
    t: f32,
}

impl Gameplay {
    pub fn new() -> Self {
        Self { t: 0.0 }
    }
}

impl Scene for Gameplay {
    fn update(&mut self, assets: &Assets) -> SceneAction {
        self.t += get_frame_time().min(0.05);
        if is_key_pressed(KeyCode::M) {
            audio::toggle(assets);
        }
        if is_key_pressed(KeyCode::Escape) {
            return SceneAction::GoTo(SceneId::MainMenu);
        }
        SceneAction::None
    }

    fn draw(&self) {
        let v = View::new(Vec2::ZERO);
        v.rect(0.0, 0.0, VW, VH, rgb(18, 16, 20));
        v.text_centered("MISION 1", VW / 2.0, 110.0, 28.0, rgb(255, 190, 40));
        v.text_centered("PROXIMAMENTE", VW / 2.0, 132.0, 14.0, rgb(230, 230, 236));
        v.text_centered("ESC PARA VOLVER AL MENU", VW / 2.0, 200.0, 9.0, rgb(160, 160, 176));

        // la cortina del menu se abre al entrar
        fx::draw_curtain(&v, (1.0 - self.t * 1.3).max(0.0));
        v.letterbox();
    }
}
