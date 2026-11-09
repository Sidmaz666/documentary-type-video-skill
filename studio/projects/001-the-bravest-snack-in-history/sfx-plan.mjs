// sfx-plan.mjs — this film's sound score. Reads the SAME clock T as
// world.mjs, so SFX can never drift from picture (single-clock convention).
// Every event: { t, name|make, gain, pan }.
//
// Finale swell: omitted when the classical music bed is present (MUSIC LAW —
// never two beds). The bed hook lives in musicBed() below; the Satie file
// itself was lost in the wipe and must be re-sourced before a re-mix.
import { T } from './timings.mjs';
import { thud, paperSlap, typewriterKey, pencilScratch, paperDropWhump, hoofCloak, ping, whoosh } from '../../engine/sfx.mjs';

const S = T.scenes;

// typed lines — must match world.mjs TYPED_LINES exactly (single clock)
const TYPED = [
  { text: 'WHAT IF I', t0: S.idea + 2.55, cps: 11 },
  { text: 'DRANK THAT TOO?', t0: S.idea + 4.15, cps: 13 },
];

export function sfxEvents() {
  const E = [];
  const at = (t, fn, gain = 1, pan = 0) => E.push({ t, make: fn, gain, pan });

  // ── stamp thuds on the big stamps (BEATS 0.5–1.7: thud ×2) ──
  at(S.hook + 0.1, thud, 0.9);            // "10,000"
  at(S.hook + 0.5, thud, 0.75);           // "YEARS AGO"
  at(S.milk + 0.12, thud, 1.0);           // "MILK."
  at(S.toast + 2.55, thud, 1.0);          // "THE BRAVEST SNACK"
  at(S.toast + 3.25, thud, 1.0);          // "IN HISTORY."

  // ── typewriter keys for the typed question (one per visible char) ──
  for (const line of TYPED) {
    for (let i = 0; i < line.text.length; i++) {
      if (line.text[i] === ' ') continue;
      at(line.t0 + i / line.cps, typewriterKey, 0.5, (i % 2 ? 0.06 : -0.06));
    }
  }

  // ── pencil scratches for hand-drawn work ──
  at(S.hook + 1.75, () => pencilScratch(0.45), 0.8);         // red line to the aurochs
  at(S.hook + 2.25, () => pencilScratch(0.8), 0.8);          // red circle on the aurochs
  at(S.timeline + 0.22, () => pencilScratch(0.9), 0.9);      // the timeline rule
  at(S.timeline + 2.55, () => pencilScratch(0.7), 0.75);    // red circle on 9000 BC
  at(S.timeline + 4.1, () => pencilScratch(0.5), 0.65);     // red arrow to the cow
  at(T.underlineF[0], () => pencilScratch(0.5), 0.95);       // THE underline (LAW 6 re-time)

  // ── paper drop whumps for the prints ──
  at(S.hook + 0.7, paperDropWhump, 0.9);      // aurochs (01)
  at(S.idea + 0.1, paperDropWhump, 0.9);      // calf (02)
  at(S.timeline + 0.3, paperDropWhump, 0.85);  // goat (04)
  at(S.timeline + 3.35, paperDropWhump, 0.85); // cow pasture (05)
  at(S.toast + 0.16, paperDropWhump, 0.9);    // milk pour (06)
  at(S.timeline + 0.1, paperSlap, 0.5);       // small slap as the rule area wakes

  // ── hoof clops, panned left → right during the milk-scene walk ──
  for (let i = 0; i < 6; i++) {
    at(S.milk + 0.8 + i * 0.58, () => hoofCloak(), 0.8, -0.7 + (i * 1.4) / 5);
  }

  // ── genes: map ping + spread ticks (with "survived and spread") ──
  at(S.genes + 2.1, ping, 0.75);
  for (let i = 0; i < 3; i++) {
    at(S.genes + 2.3 + i * 0.22, () => whoosh(0.3, (u) => u * (1 - u) * 4), 0.45, -0.4 + i * 0.4);
  }

  // ── camera whooshes — timed to actual camera departures (after VO phrases) ──
  at(S.idea - 0.25,  () => whoosh(0.6), 0.35);  // A → B (gentle, hook VO ended)
  at(S.milk - 0.12,  () => whoosh(0.55), 0.3);  // B → C
  at(S.timeline - 0.18, () => whoosh(0.55), 0.3); // C → D
  at(S.genes - 0.15, () => whoosh(0.55), 0.3);  // D → E
  at(S.toast - 0.12, () => whoosh(0.55), 0.3);  // E → F
  at(31.7, () => whoosh(0.8, (u) => Math.sin(u * Math.PI) ** 2), 0.25); // gentle tail settle

  // Finale swell deliberately omitted — the classical bed carries the ending
  // (MUSIC LAW). If a future re-mix drops the bed, restore a soft drone swell
  // here first.
  return E;
}

// ── music bed hook (MUSIC LAW) ────────────────────────────────────────────
// Expected asset: Erik Satie — Gymnopédie No.1 (piano, Teknopazzo, CC0) at
// assets/music/gymnopedie_no1.ogg. The file was LOST in the Nov 2026 wipe —
// re-source it per MUSIC LAW before any re-mix (see assets/music/README.md).
// While it is absent, musicBed() returns null and audio.mjs skips the bed
// with a logged warning: no drone fallback is substituted for this film.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const HERE = dirname(fileURLToPath(import.meta.url));

export function musicBed() {
  const path = join(HERE, 'assets', 'music', 'gymnopedie_no1.ogg');
  if (!existsSync(path)) {
    console.warn('[sfx-plan] music bed absent (lost in the wipe) — mixing VO+SFX only. Re-source Gymnopédie No.1 per MUSIC LAW to restore the bed.');
    return null;
  }
  return {
    path,
    trimTo: T.DUR,   // LAW 2: bed is trimmed to the film length
    gain: 0.34,
    fadeIn: 0.8,
    fadeOut: 1.5,
  };
}
