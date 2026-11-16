// Lore del discord - punto de entrada.
// Solo arranca la ventana y ejecuta la escena activa en cada frame.

mod config;
mod scene;
mod scenes;

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
    let mut current: Box<dyn Scene> = scenes::create(config::FIRST_SCENE);

    loop {
        match current.update() {
            SceneAction::None => {}
            SceneAction::GoTo(id) => current = scenes::create(id),
            SceneAction::Quit => break,
        }

        clear_background(config::BG);
        current.draw();

        next_frame().await;
    }
}
