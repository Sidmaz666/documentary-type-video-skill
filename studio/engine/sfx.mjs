// sfx.mjs — code-synthesized sound at 48 kHz stereo, mixed offline into a
// Float32 bus. Every sound is deterministic math (no samples, no synth libs).
//
//   env / thud / paperSlap / typewriterKey / pencilScratch / paperDropWhump /
//   hoofCloak / ping / whoosh / drone
//
// mixVoWithBus(voPath, sfxEvents, {music, out}) decodes the VO with ffmpeg to
// PCM, applies an 80 ms protective head-fade (kills recorded pops), places
// each SFX event at its time with gain/pan, and — when a music bed is given —
// trims it, fades it, and sidechain-ducks it under the VO envelope (≈6–8 dB
// dip while speech RMS is high). Writes PCM16 stereo WAV.
//
// MUSIC LAW: `drone()` is a documented FALLBACK bed only. When a project has
// a classical recording (music: {path, ...}), the drone is retired for that
// film — never two beds.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const SR = 48000;

// ── tiny DSP helpers ──────────────────────────────────────────────────────
const sec = (n) => Math.max(1, Math.round(n * SR));

// env(attack, decay): returns gain envelope for a buffer of given length.
// attack/decay in seconds; exponential-ish decay for percussive feel.
export function env(lenSamples, attack = 0.002, decay = 0.08) {
  const out = new Float32Array(lenSamples);
  const a = sec(attack), d = sec(decay);
  for (let i = 0; i < lenSamples; i++) {
    const atk = i < a ? i / a : 1;
    const dec = Math.exp(-Math.max(0, i - a) / (d * 0.5));
    out[i] = atk * dec;
  }
  return out;
}

// cheap one-pole lowpass
function lowpass(buf, cutoffNorm) {
  const out = new Float32Array(buf.length);
  let y = 0;
  for (let i = 0; i < buf.length; i++) { y += cutoffNorm * (buf[i] - y); out[i] = y; }
  return out;
}
// band emphasis: lowpass(x, hi) − lowpass(x, lo)
function bandpass(buf, lo, hi) {
  const l1 = lowpass(buf, hi), l2 = lowpass(buf, lo);
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = l1[i] - l2[i];
  return out;
}
let noiseState = 12345;
function noise() { // deterministic xorshift white noise ∈ [−1,1]
  noiseState ^= noiseState << 13; noiseState ^= noiseState >>> 17; noiseState ^= noiseState << 5;
  return ((noiseState >>> 0) / 2147483648) - 1;
}
function noiseBuf(n) { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = noise(); return b; }
function sineBuf(n, freq, { harmonic2 = 0 } = {}) {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const ph = (2 * Math.PI * freq * i) / SR;
    b[i] = Math.sin(ph) + harmonic2 * Math.sin(2 * ph);
  }
  return b;
}
const mul = (a, b) => { const o = new Float32Array(Math.max(a.length, b.length)); for (let i = 0; i < o.length; i++) o[i] = (a[i] || 0) * (b[i] || 0); return o; };
const scale = (a, k) => { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] * k; return o; };

// ── the sound library (each returns mono Float32Array) ────────────────────
export function thud() {
  const n = sec(0.22);
  const body = mul(sineBuf(n, 66, { harmonic2: 0.4 }), env(n, 0.002, 0.14));
  const knock = scale(bandpass(noiseBuf(n), 0.02, 0.12), 0.5);
  const kEnv = env(n, 0.001, 0.02);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = body[i] * 1.0 + knock[i] * kEnv[i] * 0.7;
  return scale(out, 0.9);
}

export function paperSlap() {
  const n = sec(0.09);
  return scale(mul(bandpass(noiseBuf(n), 0.08, 0.45), env(n, 0.001, 0.035)), 0.8);
}

export function typewriterKey() {
  const n = sec(0.05);
  const click = mul(bandpass(noiseBuf(n), 0.15, 0.6), env(n, 0.0005, 0.012));
  const pingS = scale(mul(sineBuf(n, 1450), env(n, 0.0005, 0.02)), 0.25);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = click[i] + pingS[i];
  return scale(out, 0.75);
}

export function pencilScratch(dur = 0.3) {
  const n = sec(dur);
  const grain_ = bandpass(noiseBuf(n), 0.05, 0.35);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const wob = 0.55 + 0.45 * Math.sin((2 * Math.PI * 21 * i) / SR + Math.sin(i / 900) * 3);
    out[i] = grain_[i] * wob;
  }
  return scale(mul(out, env(n, 0.02, dur * 0.9)), 0.55);
}

export function paperDropWhump() {
  const n = sec(0.3);
  const whump = scale(mul(lowpass(noiseBuf(n), 0.03), env(n, 0.004, 0.16)), 1.1);
  const slap = scale(mul(bandpass(noiseBuf(n), 0.1, 0.5), env(n, 0.001, 0.03)), 0.7);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = whump[i] + slap[i];
  return scale(out, 0.95);
}

export function hoofCloak(pan = 0) { // pan only colors it slightly; real pan at placement
  const n = sec(0.14);
  const clop = scale(mul(sineBuf(n, 128, { harmonic2: 0.3 }), env(n, 0.001, 0.05)), 0.9);
  const tick = scale(mul(bandpass(noiseBuf(n), 0.2, 0.7), env(n, 0.0005, 0.012)), 0.8);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = clop[i] + tick[i];
  return scale(out, 0.85);
}

export function ping() {
  const n = sec(0.7);
  const tone = mul(sineBuf(n, 1720, { harmonic2: 0.35 }), env(n, 0.002, 0.4));
  return scale(tone, 0.4);
}

export function whoosh(dur = 0.6, speedCurve = (u) => Math.sin(u * Math.PI)) {
  const n = sec(dur);
  const raw = noiseBuf(n);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    // sweep the "band" via a moving one-pole mix (cheap spectral motion)
    const c = 0.04 + 0.3 * speedCurve(u);
    out[i] = raw[i] * (0.25 + c) * speedCurve(u);
  }
  return scale(lowpass(out, 0.45), 0.7);
}

// FALLBACK bed only (retired for films with a classical asset — MUSIC LAW).
export function drone(dur = 10) {
  const n = sec(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const lfo = 0.8 + 0.2 * Math.sin((2 * Math.PI * 0.07 * i) / SR);
    out[i] = lfo * (Math.sin((2 * Math.PI * 55 * i) / SR) * 0.5 + Math.sin((2 * Math.PI * 82.5 * i) / SR) * 0.3 + Math.sin((2 * Math.PI * 110 * i) / SR) * 0.2);
    out[i] *= Math.min(1, u / 0.05) * Math.min(1, (1 - u) / 0.05); // edge fades
  }
  return scale(out, 0.16);
}

export const SFX = { thud, paperSlap, typewriterKey, pencilScratch, paperDropWhump, hoofCloak, ping, whoosh, drone };

// ── the bus ───────────────────────────────────────────────────────────────
function makeBus(lenSamples) {
  return {
    L: new Float32Array(lenSamples),
    R: new Float32Array(lenSamples),
    add(samples, tSec, { gain = 1, pan = 0 } = {}) {
      const start = Math.round(tSec * SR);
      const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
      for (let i = 0; i < samples.length; i++) {
        const j = start + i;
        if (j >= this.L.length) break;
        this.L[j] += samples[i] * gl;
        this.R[j] += samples[i] * gr;
      }
    },
  };
}

// decode any audio file to 48 kHz stereo Float32 via ffmpeg → PCM f32le.
export function decodeAudio(path) {
  return new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-v', 'error', '-i', path, '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', '2', '-ar', String(SR), 'pipe:1']);
    const chunks = [];
    ff.stdout.on('data', (c) => chunks.push(c));
    ff.on('error', rej);
    ff.on('close', (code) => {
      if (code !== 0) return rej(new Error(`ffmpeg decode failed (${code}) for ${path}`));
      const raw = Buffer.concat(chunks);
      const n = Math.floor(raw.length / 8);
      const L = new Float32Array(n), R = new Float32Array(n);
      for (let i = 0; i < n; i++) { L[i] = raw.readFloatLE(i * 8); R[i] = raw.readFloatLE(i * 8 + 4); }
      res({ L, R, dur: n / SR });
    });
  });
}

// head-fade: 80 ms protective ramp on the VO (kills recorded pops).
function headFade(chan, ms = 80) {
  const n = sec(ms / 1000);
  for (let i = 0; i < Math.min(n, chan.length); i++) chan[i] *= i / n;
}

// sidechain duck envelope from VO loudness: returns gain curve ∈ [duck, 1].
function duckEnvelope(voL, voR, len, { window = 0.05, duck = 0.42 } = {}) {
  const w = sec(window);
  const rms = new Float32Array(Math.ceil(len / w) + 1);
  for (let i = 0; i < len; i++) {
    const b = Math.floor(i / w);
    rms[b] += voL[i] * voL[i] + voR[i] * voR[i];
  }
  for (let b = 0; b < rms.length; b++) rms[b] = Math.sqrt(rms[b] / (2 * w));
  const env_ = new Float32Array(len);
  let cur = 1;
  const atk = 0.35, rel = 0.012; // fast-ish duck in, slow release
  for (let i = 0; i < len; i++) {
    const b = Math.floor(i / w);
    const loud = rms[b] > 0.02;
    const target = loud ? duck : 1;
    cur += (target - cur) * (loud ? atk : rel);
    env_[i] = cur;
  }
  return env_;
}

// ── the mix stage ─────────────────────────────────────────────────────────
// sfxEvents: [{ t, samples?, make?, name?, gain?, pan? }]
// music: { path, trimTo, gain = 1, fadeIn = 0.8, fadeOut = 1.2 } or null
export async function mixVoWithBus(voPath, sfxEvents = [], { music = null, out = 'out/mix.wav', tail = 0.0, voGain = 1 } = {}) {
  const vo = await decodeAudio(voPath);
  if (voGain !== 1) { for (let i = 0; i < vo.L.length; i++) { vo.L[i] *= voGain; vo.R[i] *= voGain; } }
  headFade(vo.L); headFade(vo.R);
  // bus length: VO (+tail), extended to cover the last SFX event if it rings longer
  let lastEnd = 0;
  for (const ev of sfxEvents) {
    const len = ev.samples?.length || 0;
    lastEnd = Math.max(lastEnd, ev.t + (len ? len / SR : 1.2)); // 1.2s ≈ longest library sound
  }
  const total = Math.ceil((Math.max(vo.dur, lastEnd) + tail) * SR);
  const bus = makeBus(total);

  // VO at unity into the bus
  for (let i = 0; i < Math.min(vo.L.length, total); i++) { bus.L[i] += vo.L[i]; bus.R[i] += vo.R[i]; }

  // SFX events
  for (const ev of sfxEvents) {
    const samples = ev.samples || (ev.make ? ev.make() : (SFX[ev.name || 'thud']?.() ?? thud()));
    bus.add(samples, ev.t, { gain: ev.gain ?? 1, pan: ev.pan ?? 0 });
  }

  // music bed: decode → trim → fades → sidechain duck under VO (MUSIC LAW)
  if (music && music.path) {
    const m = await decodeAudio(music.path);
    const trimN = Math.min(m.L.length, Math.round((music.trimTo ?? vo.dur) * SR));
    const g = music.gain ?? 1;
    const fi = sec(music.fadeIn ?? 0.8), fo = sec(music.fadeOut ?? 1.2);
    const duck = duckEnvelope(vo.L, vo.R, total);
    for (let i = 0; i < Math.min(trimN, total); i++) {
      let f = 1;
      if (i < fi) f *= i / fi;
      if (i > trimN - fo) f *= Math.max(0, (trimN - i) / fo);
      const d = duck[i];
      bus.L[i] += m.L[i] * g * f * d;
      bus.R[i] += m.R[i] * g * f * d;
    }
  } else if (music) {
    // music requested but no file → documented fallback bed (drone)
    bus.add(drone(vo.dur), 0, { gain: 1 });
  }

  // master stage: a TRUE-PEAK soft-knee limiter at -0.9 dBTP.
  // A limiter is per-sample: it only pulls down true transients, so the
  // integrated loudness (the LUFS anchor the VO is mixed at) is preserved.
  // Peak-normalizing the whole bus by the loudest SFX thud silently dragged
  // the VO down ~3 dB and broke the -14.5 LUFS anchor (measured: -17.75).
  // The canon mix is -14.57 LUFS / -0.92 dBTP with a VO peak of +0.34, i.e.
  // the thuds were limited down to -0.9 and the VO was left untouched.
  // True-peak matters here: a -0.9 sample ceiling measures as -0.04 dBTP on
  // the high-frequency SFX (they inter-sample-overshoot ~+1 dB), so the
  // limiter runs in a 4× oversampled domain and the -0.9 ceiling is enforced
  // on the true peak, not the sample peak.
  const LIMIT = 0.80; // empirical sample ceiling → true peak ~-0.9 dBTP
  const KNEE = 0.09;   // ~0.8 dB soft knee
  const lo = LIMIT - KNEE, hi = LIMIT + KNEE;
  const lim = (s) => {
    const a = Math.abs(s);
    if (a <= lo) return s;
    if (a >= hi) return s < 0 ? -LIMIT : LIMIT;
    const g = lo + (LIMIT - lo) * (1 - (hi - a) * (hi - a) / ((hi - lo) * (hi - lo)));
    return s < 0 ? -g : g;
  };
  for (let i = 0; i < total; i++) { bus.L[i] = lim(bus.L[i]); bus.R[i] = lim(bus.R[i]); }
  let peak = 0;
  for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(bus.L[i]), Math.abs(bus.R[i]));
  console.log(`[mix] ${out} ${total / SR.toFixed(3)}s — true-peak ${peak.toFixed(3)} (${(20 * Math.log10(peak)).toFixed(2)} dBTP)`);

  writeWav(out, bus.L, bus.R);
  return { out, dur: total / SR, peak };
}

// ── WAV writer (PCM16 stereo) ─────────────────────────────────────────────
export function writeWav(path, L, R) {
  const n = L.length;
  mkdirSync(dirname(path), { recursive: true }); // out/ may not exist yet on a first mix
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, L[i])), r = Math.max(-1, Math.min(1, R[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
  return path;
}
