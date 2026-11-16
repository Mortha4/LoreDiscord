// Contrato que cumple cada pantalla del juego.

/// Identificador de cada escena. Agrega aqui las nuevas pantallas.
pub enum SceneId {
    MainMenu,
    // Gameplay,
    // Options,
}

/// Lo que una escena le pide al juego despues de actualizarse.
pub enum SceneAction {
    None,
    GoTo(SceneId),
    Quit,
}

pub trait Scene {
    /// Logica e input. Se llama una vez por frame.
    fn update(&mut self) -> SceneAction;
    /// Dibujo. Se llama una vez por frame, despues de update.
    fn draw(&self);
}
