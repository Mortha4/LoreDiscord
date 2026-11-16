// Registro de escenas: traduce un SceneId a la escena real.

pub mod gameplay;
pub mod main_menu;

use crate::assets::Assets;
use crate::scene::{Scene, SceneId};

pub fn create(id: SceneId, assets: &Assets) -> Box<dyn Scene> {
    match id {
        SceneId::MainMenu => Box::new(main_menu::MainMenu::new(assets)),
        SceneId::Gameplay => Box::new(gameplay::Gameplay::new()),
    }
}
