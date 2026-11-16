// Lore del discord - punto de entrada.
// Abre la ventana, genera los assets (sonidos) y ejecuta la escena activa.

mod assets;
mod audio;
mod config;
mod fx;
mod gfx;
mod input;
mod menu;
mod scene;
mod scenes;
mod synth;

use macroquad::prelude::*;
use scene::{Scene, SceneAction};

fn window_conf() -> Conf {
    Conf {
        window_title: config::TITLE.to_owned(),
        window_width: config::WINDOW_WIDTH,
        window_height: config::WINDOW_HEIGHT,
        ..Default::default()
    }
}

#[macroquad::main(window_conf)]
async fn main() {
    macroquad::rand::srand(macroquad::miniquad::date::now() as u64);

    let assets = assets::Assets::load().await;
    let mut current: Box<dyn Scene> = scenes::create(config::FIRST_SCENE, &assets);

    loop {
        match current.update(&assets) {
            SceneAction::None => {}
            SceneAction::GoTo(id) => current = scenes::create(id, &assets),
            SceneAction::Quit => break,
        }

        clear_background(BLACK);
        current.draw();

        next_frame().await;
    }
}
