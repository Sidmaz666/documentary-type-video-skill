// sfx-plan.mjs — score for The Oldest Trick. Every cue lands ON the VO beat
// (vo-timings.whisper.json anchors). MUSIC LAW: Tchaikovsky, Pathétique IV,
// Musopen Symphony performance — PD/PD (see assets-credits.csv row 07).
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { T } from './timings.mjs';
import { thud, ping, whoosh, paperDropWhump, paperSlap, airSwell, pencilScratch, drone } from '../../engine/sfx.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export function sfxEvents() {
  const E = [];
  const at = (t, fn, gain = 1, pan = 0) => E.push({ t, make: fn, gain, pan });

  at(0.0, () => airSwell(2.8, 0.55), 0.22);       // the room inhales before the voice
  at(8.55, thud, 0.8);                            // VO "unfaithful" 8.70 — quote stamp lands
  at(17.74, thud, 0.9);                           // VO "independent" 17.74 — board probe stamp
  at(22.5, () => whoosh(0.9), 0.3);                // first transit
  at(35.92, ping, 0.4);                           // VO "$4 trillion"
  at(39.74, thud, 0.75);                          // VO "five" — $5T stamp
  at(56.3, paperSlap, 0.5);                        // identity card
  at(63.5, ping, 0.35);                           // the dotted line closes
  at(81.0, () => whoosh(0.8), 0.3);                // into the allegation
  at(88.0, thud, 0.85);                           // VO "Ministry of State" 92.4 — MSS stamp pre-echo
  at(96.0, paperDropWhump, 0.65);                  // memo card drops in situ
  at(112.0, () => whoosh(0.8), 0.25);              // into the ledger
  at(140.94, () => drone(5.5), 0.18);              // low note under "Which is why…" — tension floor
  at(143.5, ping, 0.3);                            // "no reason to believe" — one held note
  at(147.0, () => whoosh(0.8), 0.28);              // into Megaspeed
  at(150.5, paperDropWhump, 0.5);                  // MEGASPEED card
  at(155.5, paperDropWhump, 0.5);                  // SPEEDMATRIX card
  at(161.44, thud, 0.85);                          // VO "4.8" — $4.8B lands
  at(181.9, () => whoosh(1.1), 0.32);              // into the history wall
  at(184.5, thud, 1.0);                            // VO "Mata Hari" 184.5 — sub boom
  at(221.28, ping, 0.4);                           // VO "playbook is older" — the wall completes
  at(236.5, thud, 0.55);                           // OCT 2022 stamp
  at(246.0, thud, 0.6);                            // APR 2025 stamp
  at(256.9, thud, 0.9);                            // MAY 2026 — ZERO DELIVERIES (red)
  at(262.3, () => whoosh(0.9), 0.3);               // into the fallout
  at(277.5, thud, 0.8);                            // $178.67 stamp
  at(283.6, paperDropWhump, 0.6);                  // Kistenmacher card
  at(290.2, ping, 0.3);                            // CONFIRMED panel
  at(291.2, ping, 0.3);                            // REPORTED panel
  at(292.2, ping, 0.35);                           // UNKNOWN panel
  at(305.4, thud, 0.7);                            // heartbeat 1
  at(307.4, thud, 0.55);                           // heartbeat 2
  at(315.6, () => whoosh(1.2, (u) => u * u), 0.35);// the question returns
  at(339.8, thud, 1.0);                            // VO "patched" — downbeat

  return E;
}

export function musicBed() {
  return {
    path: join(HERE, 'assets', 'music', 'pathetique_iv.flac'),
    trimTo: T.DUR, gain: 0.72, fadeIn: 0.6, fadeOut: 2.6, trimLead: true, // bed enters audibly from 0:00
    swell: { at: 315.6, gain: 1.22, dur: 2.4 }, // the question returns — bed blooms +1.7 dB
  };
}
