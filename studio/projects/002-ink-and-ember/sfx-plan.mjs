// sfx-plan.mjs — Ink & Ember score. Every cue lands ON the VO beat (ASR anchors).
// MUSIC LAW: Satie Gymnopédie No.1, Teknopazzo, CC0 — reused from 001's verified bed.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { T } from './timings.mjs';
import { thud, whoosh, ping, pencilScratch, paperDropWhump } from '../../engine/sfx.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const S = T.scenes;

export function sfxEvents() {
  const E = [];
  const at = (t, fn, gain = 1, pan = 0) => E.push({ t, make: fn, gain, pan });

  at(0.5, ping, 0.45);                          // VO "Five…" 0.52 — the seed answers
  at(1.7, thud, 0.9);                           // VO "ink" 1.76 — INK. stamp lands on the word
  at(3.45, paperDropWhump, 0.75);               // zone B drops in — lands on the drift, not after the word
  at(5.6, thud, 0.85);                          // VO "lamp-black" 5.96 — ink stick lands
  at(5.9, () => pencilScratch(0.5), 0.7);       // VO "ground lampblack with glue" — grinding
  at(7.5, thud, 0.55);                          // VO "sticks" 7.44
  at(9.6, () => whoosh(0.7), 0.3);              // camera begins drift to Gutenberg
  at(10.85, thud, 0.9);                         // VO "fourteen forty" 10.86 — 1440. stamp lands ON the word
  at(13.0, ping, 0.3);                          // VO "movable type" 13.02 — type set
  at(14.95, thud, 0.95);                        // VO "1455" 14.88–15.78 — 1455. stamp lands on the number
  at(19.0, ping, 0.4);                          // VO "Everything…" 18.98 — mask-up begins
  at(22.3, () => whoosh(0.8, (u) => u * u), 0.4); // drop accelerates (VO silence → swoosh of the fall)
  at(22.65, paperDropWhump, 1.0);               // the drop lands
  at(23.96, thud, 0.95);                        // VO "It remembers." 23.96 — stamp lands ON the words
  at(24.2, () => whoosh(0.9), 0.28);            // tail pull-back air

  return E;
}

export function musicBed() {
  return {
    path: join(HERE, 'assets', 'music', 'gymnopedie_no1.ogg'),
    trimTo: T.DUR, gain: 0.44, fadeIn: 0.8, fadeOut: 2.0,
  };
}
