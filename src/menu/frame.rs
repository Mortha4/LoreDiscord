// Marco arcade industrial: barras arriba y abajo con chapa oxidada y franjas
// de advertencia que se desplazan como una cinta transportadora.

use crate::gfx::*;

pub const BAR_H: f32 = 26.0;

pub fn draw(v: &View, t: f32) {
    bar(v, 0.0, t * 20.0, 0); // arriba: va hacia la derecha
    bar(v, VH - BAR_H, -t * 20.0, 1); // abajo: va hacia la izquierda
}

fn bar(v: &View, y0: f32, scroll: f32, seed: u32) {
    v.rect(-8.0, y0, VW + 16.0, BAR_H, rgb(62, 30, 22));

    // paneles remachados
    for i in 0..22u32 {
        let x = i as f32 * 16.0;
        v.rect(x, y0, 1.0, BAR_H, rgb(30, 14, 10));
        v.rect(x + 1.0, y0, 1.0, BAR_H, rgb(92, 50, 36));
        v.rect(x + 4.0, y0 + 1.5, 2.0, 2.0, rgb(120, 70, 50));
        v.rect(x + 4.0, y0 + BAR_H - 3.5, 2.0, 2.0, rgb(120, 70, 50));
    }

    // desgaste / manchas de oxido
    for k in 0..160u32 {
        let x = hash01(k, seed) * VW;
        let y = y0 + hash01(k, seed + 7) * BAR_H;
        let c = if k % 2 == 0 { rgb(28, 12, 8) } else { rgb(110, 64, 44) };
        v.rect(x, y, 1.0, 1.0, c);
    }

    // franja de peligro en el centro de la barra
    let sy = y0 + 5.0;
    let sh = BAR_H - 10.0;
    v.hazard_strip(sy, sh, scroll);
    v.rect(-8.0, sy - 1.0, VW + 16.0, 1.0, rgb(150, 128, 110));
    v.rect(-8.0, sy + sh, VW + 16.0, 1.0, rgb(24, 12, 8));
}
