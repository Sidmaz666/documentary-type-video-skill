// sfx-plan.mjs — this film's sound score. Reads the SAME clock T as
// world.mjs. Demo score: one stamp thud + a short whoosh at the pull-back.
// When you add a classical music bed (MUSIC LAW): drop the PD/CC0 recording
// into assets/music/ and fill musicBed() below — the drone fallback then
// stays retired for this film (never two beds).
import { T } from './timings.mjs';
import { thud, whoosh } from '../../engine/sfx.mjs';

const S = T.scenes;

export function sfxEvents() {
  const E = [];
  const at = (t, fn, gain = 1, pan = 0) => E.push({ t, make: fn, gain, pan });

  at(S.mid, thud, 0.9); // the title stamp
  at(T.fadeOut[0] - 0.3, () => whoosh(0.9), 0.4); // pull-back air

  return E;
}

// music bed hook — null until you drop a PD/CC0 recording into assets/music/
export function musicBed() {
  return null; // e.g. { path: <assets/music/bed.ogg>, trimTo: T.DUR, gain: 0.34, fadeIn: 0.8, fadeOut: 1.5 }
}
