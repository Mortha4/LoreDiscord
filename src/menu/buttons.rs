// Botones: rectangulo negro con doble borde metalico biselado.
// Seleccionado: texto amarillo/naranja, leve scale-up, vibracion y balas a los lados.

use macroquad::prelude::Rect;

use crate::gfx::*;

pub const BTN_W: f32 = 120.0;
pub const BTN_H: f32 = 20.0;
const GAP: f32 = 6.0;
const TOP: f32 = 106.0;

/// Rectangulo (en coordenadas virtuales) del boton `i`.
pub fn rect(i: usize) -> Rect {
    Rect::new((VW - BTN_W) / 2.0, TOP + i as f32 * (BTN_H + GAP), BTN_W, BTN_H)
}

/// `anim`: 0.0 = reposo, 1.0 = totalmente seleccionado (animado por la escena).
pub fn draw(v: &View, label: &str, i: usize, selected: bool, anim: f32, shake: f32, t: f32) {
    let r = rect(i);
    let s = 1.0 + 0.07 * anim;
    let (w, h) = (r.w * s, r.h * s);
    let x = r.x + (r.w - w) / 2.0 + shake;
    let y = r.y + (r.h - h) / 2.0;

    // sombra y fondo
    v.rect(x + 1.0, y + 1.0, w, h, rgba(0, 0, 0, 0.5));
    v.rect(x, y, w, h, rgb(10, 10, 12));
    v.rect(x, y + h / 2.0, w, h / 2.0, rgb(22, 22, 26));

    // borde exterior biselado
    let (hi, lo) = (rgb(236, 236, 242), rgb(104, 104, 116));
    v.rect(x, y, w, 1.0, hi);
    v.rect(x, y, 1.0, h, hi);
    v.rect(x, y + h - 1.0, w, 1.0, lo);
    v.rect(x + w - 1.0, y, 1.0, h, lo);

    // borde interior (bisel invertido)
    let (hi2, lo2) = (rgb(200, 200, 210), rgb(110, 110, 124));
    v.rect(x + 2.0, y + 2.0, w - 4.0, 1.0, lo2);
    v.rect(x + 2.0, y + 2.0, 1.0, h - 4.0, lo2);
    v.rect(x + 2.0, y + h - 3.0, w - 4.0, 1.0, hi2);
    v.rect(x + w - 3.0, y + 2.0, 1.0, h - 4.0, hi2);

    // texto
    let size = 11.0 * s;
    let pulse = mix(rgb(238, 138, 12), rgb(255, 205, 70), 0.5 + 0.5 * (t * 9.0).sin());
    let color = mix(rgb(240, 240, 244), pulse, anim);
    let base = y + h / 2.0 + size * 0.3;
    v.text_centered(label, x + w / 2.0 + 0.8, base + 0.8, size, rgb(0, 0, 0));
    v.text_centered(label, x + w / 2.0, base, size, color);

    // iconos selectores (balas que "respiran")
    if selected {
        let wiggle = (t * 8.0).sin() * 1.5;
        bullet(v, x - 17.0 + wiggle, y + h / 2.0, 1.0);
        bullet(v, x + w + 17.0 - wiggle, y + h / 2.0, -1.0);
    }
}

fn bullet(v: &View, x: f32, y: f32, dir: f32) {
    let body_x = if dir > 0.0 { x } else { x - 8.0 };
    v.rect(body_x, y - 2.0, 8.0, 4.0, rgb(214, 160, 48));
    v.rect(body_x, y - 2.0, 8.0, 1.0, rgb(250, 214, 110));
    let base_x = if dir > 0.0 { body_x } else { body_x + 6.5 };
    v.rect(base_x, y - 2.5, 1.5, 5.0, rgb(150, 100, 28));
    let tip_x = if dir > 0.0 { body_x + 8.0 } else { body_x };
    v.tri((tip_x, y - 2.0), (tip_x, y + 2.0), (tip_x + 5.0 * dir, y), rgb(206, 206, 214));
}
