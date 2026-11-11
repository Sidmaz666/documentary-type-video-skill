// sfx-plan.mjs — score for The Oldest Trick. Every cue lands ON the VO beat
// (vo-timings.whisper.json anchors, narration v13). MUSIC LAW: Tchaikovsky,
// Pathétique IV, Musopen Symphony performance — PD/PD (see assets-credits.csv row 07).
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { T } from './timings.mjs';
import { thud, ping, whoosh, paperDropWhump, paperSlap, airSwell, pencilScratch, drone } from '../../engine/sfx.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export function sfxEvents() {
  const E = [];
  const at = (t, fn, gain = 1, pan = 0) => E.push({ t, make: fn, gain, pan });

  at(0.0, () => airSwell(2.8, 0.55), 0.22);        // the room inhales before the voice
  at(4.9, thud, 0.8);                              // VO "expensive" 4.76 — quote mask-up lands
  at(17.3, thud, 0.9);                             // VO "Stratagem 31" 17.1 — the trap is named
  at(19.0, () => whoosh(0.9), 0.3);                // first transit
  at(30.9, ping, 0.4);                             // VO "five trillion" — $4T→$5T growth stamps
  at(32.3, thud, 0.75);                            // $5T stamp (red)
  at(55.3, paperSlap, 0.5);                        // ALICE HUANG title
  at(63.7, ping, 0.35);                            // the dotted line closes
  at(69.0, () => whoosh(0.8), 0.3);                // into the allegation
  at(89.4, thud, 0.85);                            // VO "Ministry of State" 89.18 — MSS stamp
  at(93.6, paperDropWhump, 0.65);                  // memo card drops in situ
  at(103.2, () => whoosh(0.8), 0.25);              // into the ledger
  at(133.1, () => drone(5.5), 0.18);               // low note under "no reason to believe" — tension floor
  at(133.2, ping, 0.3);                            // the board's line, one held note
  at(134.6, () => whoosh(0.8), 0.28);              // into Megaspeed
  at(142.8, paperDropWhump, 0.5);                  // MEGASPEED card
  at(149.4, paperDropWhump, 0.5);                  // SPEEDMATRIX card
  at(153.0, thud, 0.85);                           // VO "$4.8 billion" 152.86 — $4.8B lands
  at(165.6, () => whoosh(1.1), 0.32);              // into the history wall
  at(175.3, thud, 1.0);                            // VO "Mata Hari" 175.18 — sub boom
  at(206.2, ping, 0.4);                            // VO "access, intimacy, leverage" — the wall completes
  at(217.0, thud, 0.55);                           // OCT 2022 stamp
  at(225.8, thud, 0.6);                            // APR 2025 stamp
  at(229.4, thud, 0.9);                            // MAY 2026 — ZERO DELIVERIES (red)
  at(232.3, () => whoosh(0.9), 0.3);               // into the fallout
  at(253.3, thud, 0.8);                            // $178.67 stamp
  at(254.3, paperDropWhump, 0.6);                  // Kistenmacher card
  at(264.5, ping, 0.3);                            // CONFIRMED panel
  at(269.5, ping, 0.3);                            // REPORTED panel
  at(275.4, ping, 0.35);                           // UNKNOWN panel
  at(294.1, thud, 0.7);                            // heartbeat 1 — "maybe it was love"
  at(295.5, thud, 0.55);                           // heartbeat 2 — "maybe it was tradecraft"
  at(285.2, () => whoosh(1.2, (u) => u * u), 0.35);// the question returns
  at(302.5, thud, 1.0);                            // VO "patched" — downbeat

  return E;
}

export function musicBed() {
  return {
    path: join(HERE, 'assets', 'music', 'pathetique_iv.flac'),
    trimTo: T.DUR, gain: 0.72, fadeIn: 0.6, fadeOut: 2.6, trimLead: true, // bed enters audibly from 0:00
    swell: { at: 285.2, gain: 1.22, dur: 2.4 }, // the question returns — bed blooms +1.7 dB
  };
}
