// Control central del sonido: el estado de mute vive aca para que lo compartan
// todas las escenas (menu, juego, etc.).

use std::sync::atomic::{AtomicBool, Ordering};

use macroquad::audio::{play_sound_once, set_sound_volume, Sound};

use crate::assets::Assets;

pub const MUSIC_VOLUME: f32 = 0.5;

static MUTED: AtomicBool = AtomicBool::new(false);

pub fn is_muted() -> bool {
    MUTED.load(Ordering::Relaxed)
}

/// Activa/desactiva el sonido. La musica baja a volumen 0 sin reiniciarse.
pub fn toggle(assets: &Assets) {
    let muted = !is_muted();
    MUTED.store(muted, Ordering::Relaxed);
    set_sound_volume(&assets.bgm, if muted { 0.0 } else { MUSIC_VOLUME });
}

/// Reproduce un efecto de sonido, salvo que este muteado.
pub fn sfx(sound: &Sound) {
    if !is_muted() {
        play_sound_once(sound);
    }
}
