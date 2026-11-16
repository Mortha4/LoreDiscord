// Registro de escenas: traduce un SceneId a la escena real.

pub mod main_menu;

use crate::scene::{Scene, SceneId};

pub fn create(id: SceneId) -> Box<dyn Scene> {
    match id {
        SceneId::MainMenu => Box::new(main_menu::MainMenu::new()),
    }
}
