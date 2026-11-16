// Efectos visuales reutilizables: particulas ambientales y cortina metalica.

use macroquad::prelude::*;
use macroquad::rand::gen_range;

use crate::gfx::*;

const MAX_PARTICLES: usize = 220;

#[derive(Clone, Copy, PartialEq)]
enum Kind {
    Spark,
    Ash,
    Dust,
    Smoke,
}

struct Particle {
    pos: Vec2,
    vel: Vec2,
    life: f32,
    max_life: f32,
    kind: Kind,
}

pub struct Particles {
    list: Vec<Particle>,
    acc: [f32; 3],
}

impl Particles {
    pub fn new() -> Self {
        Self { list: Vec::new(), acc: [0.0; 3] }
    }

    pub fn update(&mut self, dt: f32) {
        // particulas por segundo: chispas, ceniza, polvo
        const RATES: [f32; 3] = [7.0, 6.0, 10.0];
        for k in 0..3 {
            self.acc[k] += dt * RATES[k];
            while self.acc[k] >= 1.0 {
                self.acc[k] -= 1.0;
                if self.list.len() < MAX_PARTICLES {
                    self.list.push(Self::spawn(k));
                }
            }
        }
        for p in self.list.iter_mut() {
            p.life -= dt;
            p.pos += p.vel * dt;
            match p.kind {
                Kind::Spark => p.vel.x += gen_range(-30.0f32, 30.0) * dt,
                Kind::Smoke => p.vel.x += 4.0 * dt,
                _ => {}
            }
        }
        self.list.retain(|p| p.life > 0.0);
    }

    fn spawn(kind: usize) -> Particle {
        match kind {
            0 => {
                let life = gen_range(1.5f32, 3.0);
                Particle {
                    pos: vec2(gen_range(0.0f32, VW), gen_range(150.0f32, 215.0)),
                    vel: vec2(gen_range(-8.0f32, 8.0), gen_range(-38.0f32, -16.0)),
                    life,
                    max_life: life,
                    kind: Kind::Spark,
                }
            }
            1 => {
                let life = gen_range(5.0f32, 8.0);
                Particle {
                    pos: vec2(gen_range(0.0f32, VW), -4.0),
                    vel: vec2(gen_range(8.0f32, 20.0), gen_range(8.0f32, 18.0)),
                    life,
                    max_life: life,
                    kind: Kind::Ash,
                }
            }
            _ => {
                let life = gen_range(5.0f32, 8.0);
                Particle {
                    pos: vec2(-4.0, gen_range(120.0f32, 210.0)),
                    vel: vec2(gen_range(30.0f32, 60.0), gen_range(-4.0f32, 4.0)),
                    life,
                    max_life: life,
                    kind: Kind::Dust,
                }
            }
        }
    }

    /// Una bocanada de humo (escape del mecha).
    pub fn smoke(&mut self, pos: Vec2) {
        if self.list.len() < MAX_PARTICLES {
            let life = gen_range(1.4f32, 2.2);
            self.list.push(Particle {
                pos,
                vel: vec2(gen_range(-3.0f32, 3.0), gen_range(-16.0f32, -9.0)),
                life,
                max_life: life,
                kind: Kind::Smoke,
            });
        }
    }

    pub fn draw(&self, v: &View) {
        for p in &self.list {
            let a = (p.life / p.max_life).clamp(0.0, 1.0);
            match p.kind {
                Kind::Spark => {
                    let c = mix(rgb(220, 60, 20), rgb(255, 224, 96), a);
                    v.rect(p.pos.x, p.pos.y, 1.5, 1.5, Color::new(c.r, c.g, c.b, a));
                }
                Kind::Ash => v.rect(p.pos.x, p.pos.y, 1.2, 1.2, rgba(70, 64, 60, a * 0.8)),
                Kind::Dust => v.rect(p.pos.x, p.pos.y, 2.0, 1.0, rgba(238, 202, 144, a * 0.5)),
                Kind::Smoke => {
                    let age = 1.0 - a;
                    v.circle(p.pos.x, p.pos.y, 1.5 + age * 5.0, rgba(78, 72, 68, a * 0.6));
                }
            }
        }
    }
}

/// Cortina metalica: `closed` va de 0.0 (abierta) a 1.0 (cerrada).
pub fn draw_curtain(v: &View, closed: f32) {
    if closed <= 0.001 {
        return;
    }
    let half = VH / 2.0 * closed.min(1.0);
    let metal = rgb(80, 82, 90);
    let rib_dark = rgb(48, 50, 56);
    let rib_light = rgb(130, 134, 144);

    for door in 0..2 {
        let top = if door == 0 { 0.0 } else { VH - half };
        v.rect(-8.0, top, VW + 16.0, half + 0.5, metal);

        let mut y = top;
        while y < top + half {
            v.rect(-8.0, y, VW + 16.0, 1.5, rib_dark);
            v.rect(-8.0, y + 1.5, VW + 16.0, 1.0, rib_light);
            y += 10.0;
        }

        // borde de avance con franjas de peligro
        let edge_y = if door == 0 { half - 6.0 } else { VH - half };
        v.hazard_strip(edge_y, 6.0, if door == 0 { 0.0 } else { 6.0 });
    }
}
