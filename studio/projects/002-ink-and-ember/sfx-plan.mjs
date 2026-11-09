// sfx-plan.mjs — Ink & Ember score. Reads the same clock T as world.mjs.
// MUSIC LAW: Satie Gymnopédie No.1, Teknopazzo, CC0 — reused from 001's verified
// bed (source SHA-1 identical; see assets-credits.csv row 01 in this project).
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { T } from './timings.mjs';
import { thud, whoosh, ping, pencilScratch, paperDropWhump } from '../../engine/sfx.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const S = T.scenes;

export function sfxEvents() {
  const E = [];
  const at = (t, fn, gain = 1, pan = 0) => E.push({ t, make: fn, gain, pan });

  at(0.1, () => whoosh(0.5), 0.25);            // board wake
  at(0.9, thud, 0.85);                        // INK. stamp
  at(1.6, thud, 0.6);                         // ping ring punctuates
  at(0.5, ping, 0.5);                         // the seed dot
  at(4.2, paperDropWhump, 0.8);               // china zone drops in
  at(6.1, () => pencilScratch(0.5), 0.7);     // grinding the pine soot
  at(7.7, thud, 0.9);                         // ink stick lands
  at(10.2, () => whoosh(0.6), 0.35);          // camera drifts to Gutenberg
  at(10.9, thud, 0.8);                        // 1440. stamp
  at(12.4, () => pencilScratch(0.45), 0.6);   // type sets in
  at(13.1, thud, 0.55);                       // MOVABLE TYPE typewriter
  at(15.0, thud, 0.9);                        // 1455. stamp — the Bible line
  at(19.0, ping, 0.35);                       // everything mask-up begins
  at(22.3, () => whoosh(0.8, (u) => u * u), 0.4); // the ink drop accelerates
  at(22.6, paperDropWhump, 1.0);              // the drop lands
  at(22.9, thud, 0.95);                       // IT REMEMBERS. stamp
  at(24.15, () => whoosh(0.9), 0.3);          // tail pull-back air

  return E;
}

export function musicBed() {
  return {
    path: join(HERE, 'assets', 'music', 'gymnopedie_no1.ogg'),
    trimTo: T.DUR, gain: 0.3, fadeIn: 0.8, fadeOut: 2.0,
  };
}
