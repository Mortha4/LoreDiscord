// Utilidades de dibujo. Todo el menu se dibuja en una pantalla virtual de
// 320x240 que se escala (con barras negras si hace falta) a la ventana real.
// Asi los "pixeles" quedan grandes y con look arcade, sin importar el tamano.

use macroquad::prelude::*;

pub const VW: f32 = 320.0;
pub const VH: f32 = 240.0;

pub fn rgb(r: u8, g: u8, b: u8) -> Color {
    Color::from_rgba(r, g, b, 255)
}

pub fn rgba(r: u8, g: u8, b: u8, a: f32) -> Color {
    Color::new(r as f32 / 255.0, g as f32 / 255.0, b as f32 / 255.0, a)
}

pub fn mix(a: Color, b: Color, t: f32) -> Color {
    let t = t.clamp(0.0, 1.0);
    Color::new(
        a.r + (b.r - a.r) * t,
        a.g + (b.g - a.g) * t,
        a.b + (b.b - a.b) * t,
        a.a + (b.a - a.a) * t,
    )
}

/// Ruido determinista 0..1 (para texturas: manchas, oxido, remaches).
pub fn hash01(x: u32, y: u32) -> f32 {
    let mut h = x.wrapping_mul(374_761_393).wrapping_add(y.wrapping_mul(668_265_263));
    h = (h ^ (h >> 13)).wrapping_mul(1_274_126_177);
    ((h ^ (h >> 16)) & 0xffff) as f32 / 65535.0
}

#[derive(Clone, Copy)]
pub struct View {
    pub scale: f32,
    pub ox: f32,
    pub oy: f32,
}

impl View {
    /// `shake` es un desplazamiento en pixeles virtuales (screen shake).
    pub fn new(shake: Vec2) -> Self {
        let scale = (screen_width() / VW).min(screen_height() / VH);
        Self {
            scale,
            ox: (screen_width() - VW * scale) / 2.0 + shake.x * scale,
            oy: (screen_height() - VH * scale) / 2.0 + shake.y * scale,
        }
    }

    fn p(&self, (x, y): (f32, f32)) -> Vec2 {
        vec2(self.ox + x * self.scale, self.oy + y * self.scale)
    }

    pub fn to_virtual(&self, pos: (f32, f32)) -> Vec2 {
        vec2((pos.0 - self.ox) / self.scale, (pos.1 - self.oy) / self.scale)
    }

    pub fn rect(&self, x: f32, y: f32, w: f32, h: f32, c: Color) {
        draw_rectangle(self.ox + x * self.scale, self.oy + y * self.scale, w * self.scale, h * self.scale, c);
    }

    pub fn tri(&self, a: (f32, f32), b: (f32, f32), c: (f32, f32), col: Color) {
        draw_triangle(self.p(a), self.p(b), self.p(c), col);
    }

    pub fn circle(&self, x: f32, y: f32, r: f32, c: Color) {
        draw_circle(self.ox + x * self.scale, self.oy + y * self.scale, r * self.scale, c);
    }

    pub fn line(&self, x1: f32, y1: f32, x2: f32, y2: f32, thickness: f32, c: Color) {
        let (a, b) = (self.p((x1, y1)), self.p((x2, y2)));
        draw_line(a.x, a.y, b.x, b.y, thickness * self.scale, c);
    }

    fn font_px(&self, size: f32) -> u16 {
        (size * self.scale).round().max(1.0) as u16
    }

    pub fn text_width(&self, s: &str, size: f32) -> f32 {
        measure_text(s, None, self.font_px(size), 1.0).width / self.scale
    }

    /// `y` es la linea base del texto.
    pub fn text(&self, s: &str, x: f32, y: f32, size: f32, c: Color) {
        draw_text(
            s,
            self.ox + x * self.scale,
            self.oy + y * self.scale,
            self.font_px(size) as f32,
            c,
        );
    }

    pub fn text_centered(&self, s: &str, cx: f32, y: f32, size: f32, c: Color) {
        let w = self.text_width(s, size);
        self.text(s, cx - w / 2.0, y, size, c);
    }

    /// Franja diagonal negra/naranja de advertencia, con scroll horizontal.
    pub fn hazard_strip(&self, y: f32, h: f32, scroll: f32) {
        self.rect(-8.0, y, VW + 16.0, h, rgb(20, 16, 14));
        let w = h; // ancho de cada franja
        let period = w * 2.0;
        let orange = rgb(228, 116, 22);
        let mut x = -period * 2.0 + scroll.rem_euclid(period);
        while x < VW + period {
            self.tri((x, y + h), (x + w, y + h), (x + w + h, y), orange);
            self.tri((x, y + h), (x + w + h, y), (x + h, y), orange);
            x += period;
        }
    }

    /// Tapa lo que se dibujo fuera de los 320x240 virtuales.
    pub fn letterbox(&self) {
        let (sw, sh) = (screen_width(), screen_height());
        let (w, h) = (VW * self.scale, VH * self.scale);
        draw_rectangle(0.0, 0.0, self.ox.max(0.0), sh, BLACK);
        draw_rectangle(self.ox + w, 0.0, (sw - self.ox - w).max(0.0), sh, BLACK);
        draw_rectangle(0.0, 0.0, sw, self.oy.max(0.0), BLACK);
        draw_rectangle(0.0, self.oy + h, sw, (sh - self.oy - h).max(0.0), BLACK);
    }
}
