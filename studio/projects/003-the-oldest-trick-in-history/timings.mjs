// timings.mjs — THE single source of truth clock for The Oldest Trick in the
// History Still Works, Right? Picture (world.mjs) and sound (sfx-plan.mjs) import T.
import { makeVariedRail } from '../../engine/camera.mjs';

export const T = {
  W: 2560,
  H: 1098, // 21:9 (even dims)
  FPS: 30,
  FRAMES: 9443, // round(314.761 * 30) — LAW 2: duration = VO + interlude holds
  DUR: 314.761,
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
  fadeOut: [313.7, 314.761],

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
    { t: 0.000, x: 1780, y: 549, zoom: 0.93 },
    { t: 1.000, x: 1774, y: 548, zoom: 0.93 },
    { t: 18.800, x: 1762, y: 546, zoom: 0.925 },
    { t: 20.800, x: 1762, y: 546, zoom: 0.925 },
    { t: 21.100, x: 5600, y: 540, zoom: 0.93 },
    { t: 22.400, x: 5600, y: 540, zoom: 0.93 },
    { t: 25.200, x: 7400, y: 545, zoom: 0.955 },
    { t: 26.100, x: 7400, y: 545, zoom: 0.955 },
    { t: 33.400, x: 7400, y: 546, zoom: 0.915 },
    { t: 35.000, x: 7400.6, y: 546, zoom: 0.95 },
    { t: 50.200, x: 7400, y: 546, zoom: 0.95 },
    { t: 51.000, x: 8500, y: 540, zoom: 0.93 },
    { t: 52.300, x: 8500, y: 540, zoom: 0.93 },
    { t: 54.200, x: 12980, y: 548, zoom: 0.97 },
    { t: 55.500, x: 12980, y: 548, zoom: 0.97 },
    { t: 71.200, x: 12980, y: 547, zoom: 0.965 },
    { t: 72.500, x: 16660, y: 540, zoom: 0.93 },
    { t: 73.800, x: 16660, y: 540, zoom: 0.93 },
    { t: 75.600, x: 18760, y: 545, zoom: 0.955 },
    { t: 78.200, x: 18760, y: 545, zoom: 0.955 },
    { t: 93.000, x: 18760, y: 545, zoom: 0.92 },
    { t: 95.000, x: 18760.6, y: 545, zoom: 0.955 },
    { t: 106.800, x: 18760, y: 546, zoom: 0.955 },
    { t: 108.000, x: 22000, y: 540, zoom: 0.93 },
    { t: 109.300, x: 22000, y: 540, zoom: 0.93 },
    { t: 111.200, x: 24680, y: 548, zoom: 0.965 },
    { t: 113.900, x: 24680, y: 548, zoom: 0.965 },
    { t: 139.500, x: 24680, y: 548, zoom: 0.96 },
    { t: 142.600, x: 30480, y: 546, zoom: 0.92 },
    { t: 145.400, x: 30480, y: 546, zoom: 0.92 },
    { t: 170.500, x: 30480, y: 545, zoom: 0.915 },
    { t: 173.300, x: 34800, y: 540, zoom: 0.93 },
    { t: 174.600, x: 34800, y: 540, zoom: 0.93 },
    { t: 174.900, x: 36450, y: 543, zoom: 0.925 },
    { t: 177.700, x: 36400, y: 543, zoom: 0.925 },
    { t: 202.500, x: 36820, y: 543, zoom: 0.925 },
    { t: 214.100, x: 38800, y: 544, zoom: 0.925 },
    { t: 214.900, x: 41350, y: 540, zoom: 0.93 },
    { t: 216.200, x: 41350, y: 540, zoom: 0.93 },
    { t: 218.500, x: 44200, y: 546, zoom: 0.955 },
    { t: 220.600, x: 44200, y: 546, zoom: 0.955 },
    { t: 239.800, x: 44200, y: 546, zoom: 0.955 },
    { t: 241.200, x: 46350, y: 540, zoom: 0.93 },
    { t: 242.500, x: 46350, y: 540, zoom: 0.93 },
    { t: 244.200, x: 49060, y: 548, zoom: 0.96 },
    { t: 247.200, x: 49060, y: 548, zoom: 0.96 },
    { t: 257.300, x: 49060, y: 547, zoom: 0.925 },
    { t: 259.400, x: 49060.6, y: 547, zoom: 0.96 },
    { t: 265.100, x: 49060, y: 548, zoom: 0.96 },
    { t: 266.400, x: 50750, y: 540, zoom: 0.93 },
    { t: 267.700, x: 50750, y: 540, zoom: 0.93 },
    { t: 269.600, x: 53880, y: 548, zoom: 0.97 },
    { t: 272.300, x: 53880, y: 548, zoom: 0.97 },
    { t: 286.800, x: 53880, y: 548, zoom: 0.97 },
    { t: 287.500, x: 56450, y: 540, zoom: 0.93 },
    { t: 288.800, x: 56450, y: 540, zoom: 0.93 },
    { t: 291.200, x: 58500, y: 546, zoom: 0.9 },
    { t: 293.400, x: 58500, y: 546, zoom: 0.9 },
    { t: 296.800, x: 58500, y: 546, zoom: 0.872 },
    { t: 299.100, x: 58500.7, y: 546, zoom: 0.9 },
    { t: 310.700, x: 58500, y: 547, zoom: 0.87 },
    { t: 314.761, x: 58150, y: 549, zoom: 0.8 },
  ],
};

T.rail = makeVariedRail(T.cameraKeys, 7);
console.log('[timings] rail variety:', JSON.stringify(T.rail.variety));