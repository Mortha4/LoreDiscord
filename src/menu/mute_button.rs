// Boton de silenciar: icono de parlante sobre la barra superior.
// Con sonido muestra ondas; muteado se pone gris con una raya roja.

use macroquad::prelude::Rect;

use crate::gfx::*;

pub fn rect() -> Rect {
    Rect::new(VW - 26.0, 4.0, 18.0, 18.0)
}

pub fn draw(v: &View, muted: bool, hovered: bool, t: f32) {
    let r = rect();
    let (x, y, w, h) = (r.x, r.y, r.w, r.h);

    // fondo y bisel (mismo estilo que los botones del menu)
    v.rect(x + 1.0, y + 1.0, w, h, rgba(0, 0, 0, 0.5));
    v.rect(x, y, w, h, rgb(10, 10, 12));
    let (hi, lo) = (rgb(236, 236, 242), rgb(104, 104, 116));
    v.rect(x, y, w, 1.0, hi);
    v.rect(x, y, 1.0, h, hi);
    v.rect(x, y + h - 1.0, w, 1.0, lo);
    v.rect(x + w - 1.0, y, 1.0, h, lo);

    let pulse = mix(rgb(238, 138, 12), rgb(255, 205, 70), 0.5 + 0.5 * (t * 9.0).sin());
    let icon = if hovered {
        pulse
    } else if muted {
        rgb(130, 130, 140)
    } else {
        rgb(240, 240, 244)
    };

    // parlante
    v.rect(x + 3.0, y + 7.0, 4.0, 4.0, icon);
    v.tri((x + 7.0, y + 7.0), (x + 12.0, y + 3.0), (x + 12.0, y + 15.0), icon);
    v.tri((x + 7.0, y + 7.0), (x + 12.0, y + 15.0), (x + 7.0, y + 11.0), icon);

    if muted {
        v.line(x + 3.0, y + 3.0, x + 15.0, y + 15.0, 2.0, rgb(220, 40, 36));
    } else {
        v.rect(x + 13.5, y + 6.0, 1.0, 6.0, icon);
        v.rect(x + 15.0, y + 4.0, 1.0, 10.0, icon);
    }
}
