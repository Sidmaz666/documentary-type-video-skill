// style.mjs — house palette, math helpers, deterministic RNG, font registration.
// Topic-agnostic: knows nothing about any film. Imported by every engine module.
import { GlobalFonts } from '@napi-rs/canvas';
import { readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── House palette ─────────────────────────────────────────────────────────
export const PAPER = '#f4ead8'; // warm cream board
export const PAPER_HI = '#faf3e3'; // paper highlight (key-light face of cards/prints)
export const INK   = '#1c1814'; // near-black warm ink
export const RED   = '#b3341f'; // accent red (circles, underlines, mutation)
export const GOLD  = '#c9a227'; // accent gold
export const TEAL  = '#22333b'; // cool shadow split-tone
export const WARM  = '#e8b04b'; // warm key split-tone
export const SHADOW = 'rgba(28,24,20,0.18)'; // print drop shadows

// ── Math helpers ──────────────────────────────────────────────────────────
export const lerp = (a, b, u) => a + (b - a) * u;
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const smoothstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
export const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
export const easeOutBack = (u, s = 1.70158) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
export const easeOutQuart = (u) => 1 - Math.pow(1 - clamp(u), 4);
export const easeInQuart = (u) => Math.pow(clamp(u), 4);
export const easeInOutCubic = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

// ── Deterministic hashing (byte-stable, order-independent per call) ──────
// hash(n): integer → [0,1). Used everywhere the boil needs a stable jitter.
export function hash(n) {
  let h = Math.imul(n | 0, 0x27d4eb2d);
  h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export const hash2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));

// mulberry32 — tiny deterministic PRNG for per-run sequences.
export function rng(seed) {
  let s = (seed | 0) + 0x6d2b79f5;
  const next = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.seed = s;
  return next;
}
export const rand = (seed) => rng(seed)(); // one draw

// ── Fonts ─────────────────────────────────────────────────────────────────
// Try to register every .ttf/.otf in the repo's studio/assets/fonts. Path is
// resolved relative to THIS file, so the engine works on any machine/checkout.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FONT_DIRS = [join(REPO_ROOT, 'studio', 'assets', 'fonts')];
const FAMILY_BY_FILE = [
  ['archivoblack', 'Archivo Black'],
  ['anton', 'Anton'],
  ['archivo', 'Archivo'],
  ['caveat', 'Caveat'],
  ['noto', 'Noto Serif'],
  ['liujianmaocao', 'Liu Jian Mao Cao'],
];

export const FONT = { display: 'sans-serif', hand: 'sans-serif', serif: 'serif', sans: 'sans-serif', black: 'sans-serif', brush: 'serif' };
const registered = [];

for (const dir of FONT_DIRS) {
  if (!existsSync(dir)) continue;
  let files = [];
  try { files = readdirSync(dir).filter((f) => /\.(ttf|otf)$/i.test(f)); } catch { /* unreadable dir → skip */ }
  for (const f of files) {
    const path = join(dir, f);
    try {
      const ok = GlobalFonts.registerFromPath(path, guessFamily(f));
      if (ok) registered.push({ file: f, family: guessFamily(f) });
    } catch { /* bad font file → skip, fallback covers us */ }
  }
}

function guessFamily(file) {
  const low = file.toLowerCase();
  for (const [needle, family] of FAMILY_BY_FILE) if (low.includes(needle)) return family;
  return file.replace(/\.(ttf|otf)$/i, '').replace(/[^a-z0-9]+/gi, ' ').trim();
}

// Only trust the real families when a matching font actually registered.
const fams = new Set(registered.map((r) => r.family));
if (fams.has('Archivo Black')) FONT.display = 'Archivo Black';
if (fams.has('Caveat'))        FONT.hand = 'Caveat';
if (fams.has('Noto Serif'))    FONT.serif = 'Noto Serif';
if (fams.has('Archivo'))       FONT.sans = 'Archivo';
if (fams.has('Liu Jian Mao Cao')) FONT.brush = 'Liu Jian Mao Cao';
// Anton is the house CONDENSED display face (ref numerals/titles). When it is
// present it takes over FONT.display; Archivo Black stays reachable as
// FONT.black for any occasional wide-stamp need.
if (fams.has('Anton'))         FONT.display = 'Anton';
if (fams.has('Archivo Black')) FONT.black = 'Archivo Black';

export const fontsRegistered = registered;
