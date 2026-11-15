// timings.mjs — THE single source of truth clock for this film.
// Picture (world.mjs) and sound (sfx-plan.mjs) both import this file.
// Placeholder: a 10-second demo. Edit DUR/FRAMES to your VO length (LAW 2:
// film duration = VO duration) and lay your camera keys across the board.
// PRODUCTION TARGETS: 5–6 min or 10–12 min essays (001/002 are test reels).
// Boards scale ~10–14k px per minute; use many zones and makeVariedRail (LAW 10)
// so every transit bends diagonally — never a dead straight right.
// LAW 17: derive camera arrivals (camAt) BEFORE timing text — first readable
// content <=1.0s after arrival, every named element landed before its VO word.
import { makeVariedRail } from '../../engine/camera.mjs';

export const T = {
  W: 3840,
  H: 1646, // 21:9 house format
  FPS: 30,
  FRAMES: 300, // 10 s placeholder — keep FRAMES = round(DUR * FPS)
  DUR: 10.0,
  BOARD_W: 12000,
  BOARD_H: 4400,

  scenes: {
    open: 0.5,   // rename to your beats
    mid: 4.0,
    close: 8.0,
  },

  fadeIn: [0, 0.4],
  fadeOut: [9.5, 10.0],

  // LAW 14 preview gate — ~2.5 s sampler windows, one per beat + end card.
  // `bun build.mjs --preview` renders these (video + the same audio windows).
  preview: [[0.5, 3.0], [4.0, 6.5], [7.5, 10.0]],

  // One continuous Catmull-Rom move with VARIED transits (LAW 10): long spans
  // (|dx| ≥ 650 design px) are auto-split and nudged by a deterministic
  // anti-repeat bank (diag-sink/diag-rise/high-arc/low-swoop/stepped-rise/
  // deep-dive); short drifts stay pure. Seed per film (e.g. slug number);
  // if LAW 4 flags a mid-transit beheading, re-seed or pass { dyScale: 0.6 }.
  cameraKeys: [
    { t: 0.0,  x: 1500,  y: 1150, zoom: 1.0 },
    { t: 4.5,  x: 5500,  y: 1100, zoom: 1.02 },
    { t: 8.5,  x: 9500,  y: 1120, zoom: 1.0 },
    { t: 10.0, x: 6000,  y: 1200, zoom: 0.55 }, // tail pull-back
  ],
};

T.rail = makeVariedRail(T.cameraKeys, 1);
console.log('[timings] rail variety:', JSON.stringify(T.rail.variety));
