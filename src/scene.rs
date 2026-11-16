// Contrato que cumple cada pantalla del juego.

use crate::assets::Assets;

/// Identificador de cada escena. Agrega aqui las nuevas pantallas.
pub enum SceneId {
    MainMenu,
    Gameplay,
}

/// Lo que una escena le pide al juego despues de actualizarse.
pub enum SceneAction {
    None,
    GoTo(SceneId),
    Quit,
}

pub trait Scene {
    /// Logica, input y audio. Una vez por frame.
    fn update(&mut self, assets: &Assets) -> SceneAction;
    /// Dibujo. Una vez por frame, despues de update.
    fn draw(&self);
}
