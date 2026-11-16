// Logo: emblema circular dentado (gira lento) + titulo rojo biselado.

use std::f32::consts::TAU;

use crate::gfx::*;

pub fn draw(v: &View, t: f32) {
    let (cx, cy) = (VW / 2.0, 44.0);
    gear(v, cx, cy, t);

    let bob = (t * 2.0).sin() * 0.6;
    bevel_text(v, "LORE DEL", cx, 42.0 + bob, 26.0);
    bevel_text(v, "DISCORD", cx, 72.0 + bob, 36.0);
}

fn gear(v: &View, cx: f32, cy: f32, t: f32) {
    let teeth = 16;
    let (r_in, r_out) = (44.0f32, 52.0f32);
    let rot = t * 0.12;
    let pt = |r: f32, a: f32| (cx + r * a.cos(), cy + r * a.sin());

    for i in 0..teeth {
        let a = rot + i as f32 * TAU / teeth as f32;
        let w = 0.13;
        let (p1, p2, p3, p4) = (
            pt(r_in, a - w),
            pt(r_out, a - w * 0.5),
            pt(r_out, a + w * 0.5),
            pt(r_in, a + w),
        );
        v.tri(p1, p2, p3, rgb(46, 48, 56));
        v.tri(p1, p3, p4, rgb(46, 48, 56));
    }
    v.circle(cx, cy, r_in + 1.0, rgb(22, 22, 26));
    v.circle(cx, cy, r_in - 2.0, rgb(84, 88, 98));
    v.circle(cx, cy, r_in - 5.0, rgb(36, 38, 44));
    v.circle(cx, cy, r_in - 9.0, rgb(28, 28, 34));
}

const DIRS: [(f32, f32); 8] = [
    (1.0, 0.0),
    (-1.0, 0.0),
    (0.0, 1.0),
    (0.0, -1.0),
    (0.7, 0.7),
    (-0.7, 0.7),
    (0.7, -0.7),
    (-0.7, -0.7),
];

/// Texto rojo con contorno plateado y borde oscuro, como el logo de Metal Slug.
fn bevel_text(v: &View, s: &str, cx: f32, baseline: f32, size: f32) {
    let x = cx - v.text_width(s, size) / 2.0;

    for (dx, dy) in DIRS {
        v.text(s, x + dx * 2.4, baseline + dy * 2.4, size, rgb(8, 6, 8));
    }
    for (dx, dy) in DIRS {
        v.text(s, x + dx * 1.3, baseline + dy * 1.3, size, rgb(206, 210, 222));
    }
    v.text(s, x, baseline + 1.3, size, rgb(104, 8, 12)); // sombra del bisel
    v.text(s, x, baseline - 0.8, size, rgb(255, 104, 90)); // brillo superior
    v.text(s, x, baseline, size, rgb(214, 24, 30));
    v.text(s, x + 0.5, baseline, size, rgb(214, 24, 30)); // "negrita"
}
