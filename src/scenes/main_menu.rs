// Menu principal estilo Metal Slug: orquesta las piezas de `crate::menu`.
// Maneja input, animaciones, sonido y los efectos (flash, shake, cortina).

use macroquad::audio::{play_sound, stop_sound, PlaySoundParams};
use macroquad::prelude::*;
use macroquad::rand::gen_range;

use crate::assets::Assets;
use crate::audio;
use crate::config;
use crate::fx::{self, Particles};
use crate::gfx::*;
use crate::input::InputTracker;
use crate::menu::{background, buttons, frame, logo, mute_button, sprites};
use crate::scene::{Scene, SceneAction, SceneId};

const OPTIONS: [&str; 4] = ["JUGAR", "OPCIONES", "CREDITOS", "SALIR"];

#[derive(Clone, Copy)]
enum State {
    Intro(f32),   // cortina abriendose (1.0 -> 0.0)
    Idle,         // menu activo
    Leaving(f32), // cortina cerrandose (0.0 -> 1.0)
}

pub struct MainMenu {
    t: f32,
    state: State,
    selected: usize,
    anims: [f32; OPTIONS.len()],
    input: InputTracker,
    particles: Particles,
    smoke_timer: f32,
    flash: f32,
    shake: f32,
    shake_off: Vec2,
    sel_shake: f32,
    toast: String,
    toast_t: f32,
    mute_hover: bool,
}

impl MainMenu {
    pub fn new(assets: &Assets) -> Self {
        let volume = if audio::is_muted() { 0.0 } else { audio::MUSIC_VOLUME };
        play_sound(&assets.bgm, PlaySoundParams { looped: true, volume });

        // "precalienta" las particulas para que el aire ya este lleno al abrir
        let mut particles = Particles::new();
        for _ in 0..300 {
            particles.update(1.0 / 60.0);
        }

        let mut anims = [0.0; OPTIONS.len()];
        anims[0] = 1.0;

        Self {
            t: 0.0,
            state: State::Intro(1.0),
            selected: 0,
            anims,
            input: InputTracker::new(),
            particles,
            smoke_timer: 0.0,
            flash: 0.0,
            shake: 0.0,
            shake_off: Vec2::ZERO,
            sel_shake: 0.0,
            toast: String::new(),
            toast_t: 0.0,
            mute_hover: false,
        }
    }

    fn say(&mut self, msg: &str) {
        self.toast = msg.to_owned();
        self.toast_t = 2.0;
    }
}

impl Scene for MainMenu {
    fn update(&mut self, assets: &Assets) -> SceneAction {
        let dt = get_frame_time().min(0.05);
        self.t += dt;

        // ---- animaciones y efectos que siempre corren
        self.particles.update(dt);
        self.smoke_timer -= dt;
        if self.smoke_timer <= 0.0 {
            self.smoke_timer = 0.16;
            self.particles.smoke(sprites::mecha_exhaust());
        }
        self.flash = (self.flash - dt * 3.0).max(0.0);
        self.shake = (self.shake - dt * 2.5).max(0.0);
        self.sel_shake = (self.sel_shake - dt * 5.0).max(0.0);
        self.toast_t = (self.toast_t - dt).max(0.0);
        self.shake_off = if self.shake > 0.0 {
            vec2(gen_range(-1.0f32, 1.0), gen_range(-1.0f32, 1.0)) * self.shake * 3.0
        } else {
            Vec2::ZERO
        };
        for i in 0..OPTIONS.len() {
            let target = if i == self.selected { 1.0 } else { 0.0 };
            self.anims[i] += (target - self.anims[i]) * (dt * 14.0).min(1.0);
        }

        // ---- maquina de estados de la transicion
        match self.state {
            State::Intro(p) => {
                let p = p - dt * 1.6;
                self.state = if p <= 0.0 { State::Idle } else { State::Intro(p) };
                return SceneAction::None;
            }
            State::Leaving(p) => {
                let p = p + dt * 1.3;
                if p >= 1.0 {
                    stop_sound(&assets.bgm);
                    return SceneAction::GoTo(SceneId::Gameplay);
                }
                self.state = State::Leaving(p);
                return SceneAction::None;
            }
            State::Idle => {}
        }

        // ---- input
        let inp = self.input.poll();
        let n = OPTIONS.len();
        let mut changed = false;
        let mut activated = inp.confirm;

        if inp.down {
            self.selected = (self.selected + 1) % n;
            changed = true;
        }
        if inp.up {
            self.selected = (self.selected + n - 1) % n;
            changed = true;
        }

        let m = View::new(Vec2::ZERO).to_virtual(inp.mouse);
        for i in 0..n {
            if buttons::rect(i).contains(m) {
                if inp.mouse_moved && self.selected != i {
                    self.selected = i;
                    changed = true;
                }
                if inp.mouse_clicked {
                    self.selected = i;
                    activated = true;
                }
            }
        }

        // boton de mute (esquina superior derecha) o tecla M
        self.mute_hover = mute_button::rect().contains(m);
        if inp.mute || (self.mute_hover && inp.mouse_clicked) {
            audio::toggle(assets);
            audio::sfx(&assets.hover); // solo suena si se acaba de activar el sonido
            self.say(if audio::is_muted() { "SONIDO DESACTIVADO" } else { "SONIDO ACTIVADO" });
        }

        if changed {
            audio::sfx(&assets.hover);
            self.sel_shake = 1.0;
        }

        if activated {
            match self.selected {
                0 => {
                    // confirmar: flash blanco + shake + explosion, y cierra la cortina
                    audio::sfx(&assets.confirm);
                    self.flash = 1.0;
                    self.shake = 1.0;
                    self.state = State::Leaving(0.0);
                }
                1 => self.say("OPCIONES: PROXIMAMENTE"),
                2 => self.say("HECHO POR LA COMUNIDAD DEL DISCORD"),
                _ => {
                    stop_sound(&assets.bgm);
                    return SceneAction::Quit;
                }
            }
        }

        SceneAction::None
    }

    fn draw(&self) {
        let v = View::new(self.shake_off);

        // fondo y entidades vivas
        background::draw(&v, self.t);
        sprites::draw_all(&v, self.t);
        self.particles.draw(&v);

        // marco, logo y subtitulo
        frame::draw(&v, self.t);
        logo::draw(&v, self.t);
        mute_button::draw(&v, audio::is_muted(), self.mute_hover, self.t);
        let (caption, color) = if self.toast_t > 0.0 {
            (self.toast.clone(), rgb(255, 210, 70))
        } else {
            (config::SUBTITLE.to_uppercase(), rgb(240, 214, 170))
        };
        v.text_centered(&caption, VW / 2.0 + 0.6, 100.6, 9.0, rgb(0, 0, 0));
        v.text_centered(&caption, VW / 2.0, 100.0, 9.0, color);

        // botones
        for (i, label) in OPTIONS.iter().enumerate() {
            let selected = i == self.selected;
            let shake_x = if selected { (self.t * 90.0).sin() * self.sel_shake * 1.2 } else { 0.0 };
            buttons::draw(&v, label, i, selected, self.anims[i], shake_x, self.t);
        }

        // flash blanco al confirmar
        if self.flash > 0.0 {
            v.rect(-8.0, -8.0, VW + 16.0, VH + 16.0, Color::new(1.0, 1.0, 1.0, self.flash));
        }

        // cortina metalica de entrada / salida
        match self.state {
            State::Intro(p) => fx::draw_curtain(&v, p),
            State::Leaving(p) => fx::draw_curtain(&v, p),
            State::Idle => {}
        }

        View::new(Vec2::ZERO).letterbox();
    }
}
