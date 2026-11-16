// Fondo multicapa: cielo -> nubes (parallax) -> ruinas lejanas -> torre oxidada -> dunas.

use crate::gfx::*;

pub fn draw(v: &View, t: f32) {
    sky(v);
    clouds(v, t);
    distant_ruins(v);
    tower(v);
    dunes(v);
}

fn sky(v: &View) {
    let top = rgb(22, 70, 104);
    let mid = rgb(78, 132, 148);
    let horizon = rgb(222, 170, 104);
    let mut y = 0.0;
    while y < 170.0 {
        let k = y / 170.0;
        let c = if k < 0.55 {
            mix(top, mid, k / 0.55)
        } else {
            mix(mid, horizon, (k - 0.55) / 0.45)
        };
        v.rect(-8.0, y, VW + 16.0, 2.5, c);
        y += 2.0;
    }
}

// (x inicial, y, ancho, velocidad) - mas lento = mas lejano
const CLOUDS: [(f32, f32, f32, f32); 7] = [
    (20.0, 30.0, 70.0, 3.0),
    (110.0, 52.0, 90.0, 4.0),
    (200.0, 24.0, 80.0, 2.5),
    (260.0, 88.0, 100.0, 5.0),
    (60.0, 100.0, 90.0, 3.5),
    (170.0, 112.0, 70.0, 4.5),
    (300.0, 62.0, 60.0, 2.0),
];

fn clouds(v: &View, t: f32) {
    let span = VW + 160.0;
    for &(bx, y, w, sp) in CLOUDS.iter() {
        let x = (bx + t * sp).rem_euclid(span) - 80.0;
        let k = (sp - 2.0) / 3.0;
        let body = mix(rgb(170, 130, 96), rgb(230, 190, 138), k);
        let shade = mix(rgb(120, 88, 70), rgb(176, 128, 92), k);
        let light = rgb(246, 218, 170);

        v.rect(x + w * 0.1, y + 8.0, w * 0.8, 5.0, shade);
        v.rect(x, y + 4.0, w, 6.0, body);
        v.rect(x + w * 0.12, y, w * 0.45, 6.0, body);
        v.rect(x + w * 0.4, y - 4.0, w * 0.4, 8.0, body);
        v.rect(x + w * 0.45, y - 4.0, w * 0.3, 2.0, light);
        v.rect(x + w * 0.12, y, w * 0.45, 2.0, light);
    }
}

fn distant_ruins(v: &View) {
    let haze = rgb(150, 112, 90);
    let haze2 = rgb(128, 94, 78);
    // grua caida
    v.rect(150.0, 118.0, 6.0, 50.0, haze);
    v.rect(150.0, 118.0, 38.0, 4.0, haze);
    v.tri((188.0, 118.0), (188.0, 146.0), (170.0, 122.0), haze2);
    // pilares rotos
    v.rect(214.0, 132.0, 10.0, 36.0, haze);
    v.rect(232.0, 140.0, 8.0, 28.0, haze2);
    v.rect(126.0, 142.0, 14.0, 26.0, haze2);
    v.tri((126.0, 142.0), (140.0, 142.0), (133.0, 132.0), haze2);
}

fn tower(v: &View) {
    let body = rgb(112, 72, 50);
    let dark = rgb(70, 44, 32);
    let light = rgb(158, 106, 70);
    let hole = rgb(30, 20, 16);

    // aletas rotas
    v.tri((30.0, 96.0), (6.0, 150.0), (30.0, 150.0), dark);
    v.tri((94.0, 110.0), (114.0, 164.0), (94.0, 164.0), dark);

    // cuerpo
    v.rect(30.0, 62.0, 64.0, 126.0, body);
    v.rect(38.0, 40.0, 48.0, 26.0, body);

    // boca del crater
    v.rect(44.0, 34.0, 36.0, 10.0, dark);
    v.rect(48.0, 36.0, 28.0, 6.0, hole);

    // luz y sombra
    v.rect(30.0, 62.0, 6.0, 126.0, light);
    v.rect(38.0, 40.0, 5.0, 26.0, light);
    v.rect(88.0, 62.0, 6.0, 126.0, dark);
    v.rect(81.0, 40.0, 5.0, 26.0, dark);

    // anillos de metal
    for i in 0..6 {
        let y = 70.0 + i as f32 * 20.0;
        v.rect(30.0, y, 64.0, 3.0, dark);
        v.rect(30.0, y + 3.0, 64.0, 1.0, light);
    }

    // vetas de oxido
    for i in 0..40u32 {
        let x = 36.0 + hash01(i, 1) * 50.0;
        let y = 62.0 + hash01(i, 2) * 110.0;
        let h = 3.0 + hash01(i, 3) * 10.0;
        v.rect(x, y, 2.0, h, if i % 2 == 0 { dark } else { light });
    }
}

fn dunes(v: &View) {
    let back = rgb(198, 146, 84);
    let back_hi = rgb(228, 182, 114);
    let front = rgb(160, 110, 62);
    let front_hi = rgb(196, 146, 88);

    let mut x = -8.0f32;
    while x < VW + 8.0 {
        let yb = 168.0 + 7.0 * (x * 0.018 + 1.0).sin() + 4.0 * (x * 0.05).sin();
        v.rect(x, yb, 2.5, VH - yb, back);
        v.rect(x, yb, 2.5, 2.0, back_hi);

        let yf = 192.0 + 8.0 * (x * 0.012 + 2.5).sin() + 3.0 * (x * 0.04).sin();
        v.rect(x, yf, 2.5, VH - yf, front);
        v.rect(x, yf, 2.5, 2.0, front_hi);
        x += 2.0;
    }
}
