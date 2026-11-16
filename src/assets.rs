// Carga de recursos. Los sonidos se sintetizan por codigo (ver synth.rs),
// asi que no hace falta ningun archivo externo.

use macroquad::audio::{load_sound_from_bytes, Sound};

use crate::synth;

pub struct Assets {
    pub bgm: Sound,
    pub hover: Sound,
    pub confirm: Sound,
}

impl Assets {
    pub async fn load() -> Self {
        let bgm = load_sound_from_bytes(&synth::bgm_wav())
            .await
            .expect("no se pudo cargar la musica");
        let hover = load_sound_from_bytes(&synth::hover_wav())
            .await
            .expect("no se pudo cargar el sfx hover");
        let confirm = load_sound_from_bytes(&synth::confirm_wav())
            .await
            .expect("no se pudo cargar el sfx confirmar");
        Self { bgm, hover, confirm }
    }
}
