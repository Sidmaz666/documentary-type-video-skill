// timings.mjs — THE single source of truth clock for The Oldest Trick in the
// History Still Works, Right? Picture (world.mjs) and sound (sfx-plan.mjs) import T.
import { makeVariedRail } from '../../engine/camera.mjs';

export const T = {
  W: 2560,
  H: 1098, // 21:9 (even dims)
  FPS: 30,
  FRAMES: 9092, // round(303.061 * 30) — LAW 2: duration = VO
  DUR: 303.061,
  BOARD_W: 62000,
  BOARD_H: 3600,

  // VO word anchors (assets/vo-timings.whisper.json) — narration v13
  scenes: {
    hook: 0.0,
    nvidia: 25.34,
    alice: 53.42,
    allegation: 74.88,
    denials: 109.24,
    megaspeed: 140.86,
    history: 171.8,
    why: 213.36,
    fallout: 238.68,
    know: 262.56,
    final: 282.28,
  },

  fadeIn: [0, 0.4],
  fadeOut: [302.0, 303.061],

  // LAW 14 (preview gate): scene sampler — 12 × 2.5 s windows (one per beat +
  // end card) = 30.0 s. Rendered before ANY full render and shown with the
  // scene sheet; the full build refuses to start until the user confirms.
  preview: [
    [5.6, 8.1], [31.0, 33.5], [59.5, 62.0], [88.6, 91.1], [123.6, 126.1],
    [151.2, 153.7], [185.6, 188.1], [224.8, 227.3], [252.2, 254.7], [263.8, 266.3],
    [285.2, 287.7], [293.8, 296.3],
  ],

  // One continuous Catmull-Rom move — every zone transit carries a non-horizontal
  // vector (LAW 10, makeVariedRail, seed 7). Holds end ~4–5 s before each
  // zone's VO-window ends; arrivals land ~1.5–2.5 s before the beat word.
  cameraKeys: [
    { t: 0.0,  x: 1780,  y: 549, zoom: 0.93 },
    { t: 1.0,  x: 1774,  y: 548, zoom: 0.93 },
    { t: 18.8,  x: 1762,  y: 546, zoom: 0.925 },
    { t: 20.8,  x: 1762,  y: 546, zoom: 0.925 },
    { t: 23.9,  x: 7400,  y: 545, zoom: 0.955 },
    { t: 24.8,  x: 7400,  y: 545, zoom: 0.955 },
    { t: 32.1,  x: 7400,  y: 546, zoom: 0.915 },
    { t: 33.7,  x: 7400.6,  y: 546, zoom: 0.95 },
    { t: 48.9,  x: 7400,  y: 546, zoom: 0.95 },
    { t: 51.6,  x: 12980,  y: 548, zoom: 0.97 },
    { t: 52.9,  x: 12980,  y: 548, zoom: 0.97 },
    { t: 68.6,  x: 12980,  y: 547, zoom: 0.965 },
    { t: 71.7,  x: 18760,  y: 545, zoom: 0.955 },
    { t: 74.3,  x: 18760,  y: 545, zoom: 0.955 },
    { t: 89.1,  x: 18760,  y: 545, zoom: 0.92 },
    { t: 91.1,  x: 18760.6,  y: 545, zoom: 0.955 },
    { t: 102.9,  x: 18760,  y: 546, zoom: 0.955 },
    { t: 106.0,  x: 24680,  y: 548, zoom: 0.965 },
    { t: 108.7,  x: 24680,  y: 548, zoom: 0.965 },
    { t: 134.3,  x: 24680,  y: 548, zoom: 0.96 },
    { t: 137.4,  x: 30480,  y: 546, zoom: 0.92 },
    { t: 140.2,  x: 30480,  y: 546, zoom: 0.92 },
    { t: 165.3,  x: 30480,  y: 545, zoom: 0.915 },
    { t: 168.4,  x: 36450,  y: 543, zoom: 0.925 },
    { t: 171.2,  x: 36400,  y: 543, zoom: 0.925 },
    { t: 196.0,  x: 36820,  y: 543, zoom: 0.925 },
    { t: 207.6,  x: 38800,  y: 544, zoom: 0.925 },
    { t: 210.7,  x: 44200,  y: 546, zoom: 0.955 },
    { t: 212.8,  x: 44200,  y: 546, zoom: 0.955 },
    { t: 232.0,  x: 44200,  y: 546, zoom: 0.955 },
    { t: 235.1,  x: 49060,  y: 548, zoom: 0.96 },
    { t: 238.1,  x: 49060,  y: 548, zoom: 0.96 },
    { t: 248.2,  x: 49060,  y: 547, zoom: 0.925 },
    { t: 250.3,  x: 49060.6,  y: 547, zoom: 0.96 },
    { t: 256.0,  x: 49060,  y: 548, zoom: 0.96 },
    { t: 259.2,  x: 53880,  y: 548, zoom: 0.97 },
    { t: 261.9,  x: 53880,  y: 548, zoom: 0.97 },
    { t: 276.4,  x: 53880,  y: 548, zoom: 0.97 },
    { t: 279.5,  x: 58500,  y: 546, zoom: 0.9 },
    { t: 281.7,  x: 58500,  y: 546, zoom: 0.9 },
    { t: 285.1,  x: 58500,  y: 546, zoom: 0.872 },
    { t: 287.4,  x: 58500.7,  y: 546, zoom: 0.9 },
    { t: 299.0,  x: 58500,  y: 547, zoom: 0.87 },
    { t: 303.061,  x: 58150,  y: 549, zoom: 0.8 },
  ],
};

T.rail = makeVariedRail(T.cameraKeys, 7);
console.log('[timings] rail variety:', JSON.stringify(T.rail.variety));
