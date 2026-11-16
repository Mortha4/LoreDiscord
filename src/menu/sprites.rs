// Entidades animadas del fondo, dibujadas con rectangulos (pixel art procedural).

use macroquad::prelude::{vec2, Vec2};

use crate::gfx::*;

// ---------------------------------------------------------------- OVNI
pub fn ufo(v: &View, t: f32) {
    let x = 24.0 + 3.0 * (t * 0.7).sin();
    let y = 64.0 + 3.0 * (t * 1.6).sin();

    // cupula con alienigena
    v.circle(x, y - 4.0, 9.0, rgb(126, 150, 150));
    v.circle(x, y - 3.0, 4.5, rgb(86, 98, 90));
    v.rect(x - 3.0, y - 5.0, 1.5, 1.5, rgb(10, 10, 10));
    v.rect(x + 1.5, y - 5.0, 1.5, 1.5, rgb(10, 10, 10));

    // plato
    v.rect(x - 18.0, y, 36.0, 5.0, rgb(98, 98, 106));
    v.rect(x - 18.0, y, 36.0, 1.0, rgb(168, 168, 178));
    v.rect(x - 13.0, y + 5.0, 26.0, 3.0, rgb(66, 66, 76));
    for i in 0..5 {
        let on = ((t * 4.0) as i32 + i) % 2 == 0;
        let c = if on { rgb(255, 210, 60) } else { rgb(200, 90, 30) };
        v.rect(x - 14.0 + i as f32 * 7.0, y + 2.0, 2.0, 2.0, c);
    }
}

// -------------------------------------------------------- HELICOPTERO
pub fn helicopter(v: &View, t: f32) {
    let x = 272.0 + 6.0 * (t * 0.5).sin();
    let y = 58.0 + 4.0 * (t * 0.9 + 1.0).sin();
    let olive = rgb(92, 98, 72);
    let dark = rgb(46, 50, 40);

    // cola
    v.rect(x + 12.0, y + 3.0, 24.0, 4.0, rgb(80, 86, 62));
    v.rect(x + 32.0, y - 4.0, 4.0, 10.0, olive);
    // cuerpo y cabina
    v.rect(x - 14.0, y, 28.0, 12.0, olive);
    v.rect(x - 14.0, y + 9.0, 28.0, 3.0, dark);
    v.rect(x - 14.0, y + 1.0, 9.0, 7.0, rgb(128, 156, 156));
    v.rect(x - 14.0, y + 1.0, 9.0, 1.0, rgb(190, 214, 210));
    // patines
    v.rect(x - 14.0, y + 15.0, 28.0, 2.0, dark);
    v.rect(x - 8.0, y + 12.0, 2.0, 3.0, dark);
    v.rect(x + 6.0, y + 12.0, 2.0, 3.0, dark);
    // rotor principal (el largo oscila para simular el giro)
    let half = 10.0 + 24.0 * (0.5 + 0.5 * (t * 18.0).sin());
    v.rect(x - 1.0, y - 4.0, 2.0, 4.0, dark);
    v.rect(x - half, y - 5.0, half * 2.0, 1.5, rgb(52, 52, 48));
    // rotor de cola
    v.rect(x + 34.0, y - 2.0, 2.0, 2.0 + 8.0 * (t * 20.0).sin().abs(), dark);
}

// -------------------------------------------------------------- MECHA
const MECHA_X: f32 = 236.0;
const MECHA_Y: f32 = 178.0;

/// Punto de donde sale el humo del escape.
pub fn mecha_exhaust() -> Vec2 {
    vec2(MECHA_X + 3.0, MECHA_Y - 46.0)
}

pub fn mecha(v: &View, t: f32) {
    let (x, base_y) = (MECHA_X, MECHA_Y);
    let dark = rgb(44, 50, 42);
    let mid = rgb(96, 108, 86);
    let light = rgb(138, 152, 120);
    let shade = rgb(66, 76, 60);

    // orugas (no vibran)
    v.rect(x + 2.0, base_y - 10.0, 52.0, 10.0, dark);
    for i in 0..5 {
        let cx = x + 8.0 + i as f32 * 10.0;
        v.circle(cx, base_y - 5.0, 4.0, shade);
        v.circle(cx, base_y - 5.0, 1.5, light);
    }

    // idle: el cuerpo vibra por el motor
    let y = base_y - if ((t * 16.0) as i32) % 2 == 0 { 0.0 } else { 0.7 };

    // casco
    v.rect(x + 4.0, y - 26.0, 50.0, 16.0, mid);
    v.rect(x + 4.0, y - 26.0, 50.0, 2.0, light);
    v.rect(x + 4.0, y - 14.0, 50.0, 4.0, shade);
    for i in 0..6 {
        v.rect(x + 8.0 + i as f32 * 8.0, y - 20.0, 2.0, 2.0, dark);
    }
    // cupula
    v.circle(x + 30.0, y - 34.0, 16.0, mid);
    v.circle(x + 26.0, y - 38.0, 7.0, light);
    v.rect(x + 25.0, y - 52.0, 10.0, 3.0, dark);
    // canon
    v.rect(x + 40.0, y - 36.0, 26.0, 8.0, shade);
    v.rect(x + 64.0, y - 39.0, 5.0, 14.0, dark);
    // escape
    v.rect(x + 1.0, y - 44.0, 5.0, 16.0, dark);
}

// ----------------------------------------------------------- SOLDADOS
/// `dir`: 1.0 mira a la derecha, -1.0 a la izquierda. (x, y) = pies.
pub fn soldier(v: &View, x: f32, y: f32, t: f32, dir: f32, walking: bool) {
    let bob = 0.5 * (t * 3.0 + x).sin().abs();
    let y = y - bob;
    let step = if walking {
        if ((t * 7.0) as i32) % 2 == 0 { 1.0 } else { -1.0 }
    } else {
        0.0
    };

    let cloth = rgb(96, 112, 68);
    let pants = rgb(74, 86, 52);
    let boots = rgb(40, 34, 30);

    // piernas
    v.rect(x - 3.0 + step, y - 4.0, 2.0, 4.0, pants);
    v.rect(x + 1.0 - step, y - 4.0, 2.0, 4.0, pants);
    v.rect(x - 3.0 + step, y - 1.0, 2.0, 1.0, boots);
    v.rect(x + 1.0 - step, y - 1.0, 2.0, 1.0, boots);
    // torso y cinturon
    v.rect(x - 4.0, y - 10.0, 8.0, 6.0, cloth);
    v.rect(x - 4.0, y - 5.0, 8.0, 1.0, rgb(56, 46, 34));
    // arma
    let gx = if dir > 0.0 { x + 1.0 } else { x - 10.0 };
    v.rect(gx, y - 8.0, 9.0, 2.0, rgb(50, 50, 54));
    v.rect(gx + if dir > 0.0 { 6.0 } else { 1.0 }, y - 6.0, 2.0, 2.0, rgb(50, 50, 54));
    // cabeza y casco
    v.rect(x - 3.0, y - 14.0, 6.0, 4.0, rgb(214, 164, 120));
    v.rect(x - 4.0, y - 17.0, 8.0, 3.0, rgb(84, 104, 60));
    v.rect(x - 4.0, y - 17.0, 8.0, 1.0, rgb(126, 150, 96));
}

/// Soldado que patrulla de un lado a otro alrededor de `cx`.
pub fn soldier_patrol(v: &View, t: f32, cx: f32, y: f32, range: f32, speed: f32, phase: f32) {
    let a = t * speed + phase;
    soldier(v, cx + range * a.sin(), y, t, a.cos().signum(), true);
}

pub fn sandbags(v: &View, x: f32, y: f32) {
    let bag = rgb(176, 140, 92);
    let shade = rgb(126, 98, 64);
    for row in 0..2 {
        for i in 0..(3 - row) {
            let bx = x + i as f32 * 9.0 + row as f32 * 4.5;
            let by = y - 5.0 - row as f32 * 4.0;
            v.rect(bx, by, 9.0, 5.0, bag);
            v.rect(bx, by + 4.0, 9.0, 1.0, shade);
            v.rect(bx, by, 9.0, 1.0, rgb(206, 172, 120));
        }
    }
}

/// Todo el reparto del fondo, en orden de profundidad.
pub fn draw_all(v: &View, t: f32) {
    ufo(v, t);
    helicopter(v, t);
    mecha(v, t);
    sandbags(v, 40.0, 212.0);
    soldier(v, 62.0, 210.0, t, 1.0, false); // guardia
    soldier_patrol(v, t, 96.0, 204.0, 16.0, 0.6, 0.0);
    soldier_patrol(v, t, 262.0, 206.0, 22.0, 0.5, 2.0);
}
