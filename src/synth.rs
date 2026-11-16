// Sintesis procedural de audio (WAV 16 bit estereo en memoria).
//  - bgm_wav():     loop de rock militar / arcade (4 compases, 140 bpm, La menor)
//  - hover_wav():   clic metalico seco
//  - confirm_wav(): explosion / escopetazo lejano

use std::f32::consts::TAU;

const RATE: u32 = 22_050;

fn midi_to_hz(n: i32) -> f32 {
    440.0 * 2f32.powf((n as f32 - 69.0) / 12.0)
}

/// Generador de ruido determinista (no hace falta calidad criptografica).
struct Noise(u32);

impl Noise {
    fn next(&mut self) -> f32 {
        self.0 = self.0.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
        ((self.0 >> 8) as f32 / 8_388_608.0) - 1.0
    }
}

fn square(phase: f32, duty: f32) -> f32 {
    if phase.fract() < duty {
        1.0
    } else {
        -1.0
    }
}

/// Convierte muestras mono en f32 a un archivo WAV estereo de 16 bits.
fn to_wav(samples: &[f32]) -> Vec<u8> {
    let data_len = samples.len() as u32 * 4;
    let mut b: Vec<u8> = Vec::with_capacity(44 + data_len as usize);
    b.extend_from_slice(b"RIFF");
    b.extend_from_slice(&(36 + data_len).to_le_bytes());
    b.extend_from_slice(b"WAVEfmt ");
    b.extend_from_slice(&16u32.to_le_bytes());
    b.extend_from_slice(&1u16.to_le_bytes()); // PCM
    b.extend_from_slice(&2u16.to_le_bytes()); // canales
    b.extend_from_slice(&RATE.to_le_bytes());
    b.extend_from_slice(&(RATE * 4).to_le_bytes());
    b.extend_from_slice(&4u16.to_le_bytes());
    b.extend_from_slice(&16u16.to_le_bytes());
    b.extend_from_slice(b"data");
    b.extend_from_slice(&data_len.to_le_bytes());
    for s in samples {
        let v = (s.clamp(-1.0, 1.0) * i16::MAX as f32) as i16;
        let bytes = v.to_le_bytes();
        b.extend_from_slice(&bytes); // izquierdo
        b.extend_from_slice(&bytes); // derecho
    }
    b
}

pub fn bgm_wav() -> Vec<u8> {
    const BPM: f32 = 140.0;
    // Bajo: una nota por corchea (Am - G - F - E)
    const BASS: [i32; 32] = [
        45, 45, 45, 45, 45, 45, 48, 50, //
        43, 43, 43, 43, 43, 43, 45, 47, //
        41, 41, 41, 41, 41, 41, 43, 45, //
        40, 40, 40, 40, 43, 43, 45, 47,
    ];
    // Arpegio del lead por compas
    const CHORDS: [[i32; 3]; 4] = [[69, 72, 76], [67, 71, 74], [65, 69, 72], [64, 68, 71]];
    const ARP: [usize; 8] = [0, 1, 2, 1, 0, 1, 2, 1];

    let step_samples = (60.0 / BPM / 2.0 * RATE as f32) as usize;
    let mut out: Vec<f32> = Vec::with_capacity(step_samples * 32);
    let mut noise = Noise(0x1234_5678);
    let (mut bass_ph, mut lead_ph) = (0.0f32, 0.0f32);

    for step in 0..32usize {
        let bar = step / 8;
        let beat = step % 8;
        let lead_hz = midi_to_hz(CHORDS[bar][ARP[beat]]);
        let bass_hz = midi_to_hz(BASS[step]);
        let kick_on = beat == 0 || beat == 4 || (beat == 5 && bar % 2 == 1);
        let snare_on = beat == 2 || beat == 6;
        let mut kick_ph = 0.0f32;

        for i in 0..step_samples {
            let t = i as f32 / RATE as f32;
            let frac = i as f32 / step_samples as f32;
            let n = noise.next();

            bass_ph += bass_hz / RATE as f32;
            let bass = square(bass_ph, 0.5) * (1.0 - frac).powf(0.35) * 0.26;

            lead_ph += lead_hz / RATE as f32;
            let lead = square(lead_ph, 0.25) * (1.0 - frac).powf(0.8) * 0.12;

            // hi-hat en cada corchea
            let mut drums = n * (-t * 70.0).exp() * 0.07;
            if kick_on {
                kick_ph += (45.0 + 110.0 * (-t * 28.0).exp()) / RATE as f32;
                drums += (kick_ph * TAU).sin() * (-t * 9.0).exp() * 0.55;
            }
            if snare_on {
                drums += n * (-t * 20.0).exp() * 0.25
                    + (TAU * 185.0 * t).sin() * (-t * 30.0).exp() * 0.12;
            }

            out.push((bass + lead + drums) * 0.9);
        }
    }
    to_wav(&out)
}

pub fn hover_wav() -> Vec<u8> {
    let n = (0.07 * RATE as f32) as usize;
    let mut noise = Noise(0xC0FFEE);
    let out: Vec<f32> = (0..n)
        .map(|i| {
            let t = i as f32 / RATE as f32;
            noise.next() * (-t * 120.0).exp() * 0.5
                + (TAU * 1500.0 * t).sin() * (-t * 90.0).exp() * 0.4
        })
        .collect();
    to_wav(&out)
}

pub fn confirm_wav() -> Vec<u8> {
    let n = (0.9 * RATE as f32) as usize;
    let mut noise = Noise(0xBEEF);
    let mut lp = 0.0f32;
    let mut out = Vec::with_capacity(n);
    for i in 0..n {
        let t = i as f32 / RATE as f32;
        let nz = noise.next();
        // filtro pasa-bajos que se va cerrando: el "boom" se vuelve grave
        let k = 0.65 * (-t * 7.0).exp() + 0.04;
        lp += (nz - lp) * k;
        let boom = lp * (-t * 4.5).exp() * 1.8;
        let crack = nz * (-t * 50.0).exp() * 0.6;
        let thump = (TAU * (32.0 + 90.0 * (-t * 14.0).exp()) * t).sin() * (-t * 7.0).exp() * 0.9;
        out.push(boom + crack + thump);
    }
    to_wav(&out)
}
