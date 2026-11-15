// timings.mjs — THE single source of truth clock for The Oldest Trick in the
// History Still Works, Right? Picture (world.mjs) and sound (sfx-plan.mjs) import T.
import { makeVariedRail } from '../../engine/camera.mjs';

export const T = {
  W: 2560,
  H: 1098, // 21:9 (even dims)
  FPS: 30,
  FRAMES: 12398, // round(413.248 * 30) — LAW 2: duration = VO + interlude holds
  DUR: 413.248,
  BOARD_W: 62000,
  BOARD_H: 3600,

  // VO word anchors (assets/vo-timings.whisper.json) — narration v14 (updated Nov 15 2026)
  scenes: {
    hook: 0.0,
    nvidia: 43.42,      // "letter ... unfaithful"
    resignation: 56.0,  // "gone" / Huang resigned Nov 12
    'second-affair': 91.5, // Kimberly Powell / Nvidia exec
    alice: 121.28,      // "The woman at the center is Alice Huang"
    megaspeed: 126.34,  // Megaspeed International
    allegation: 145.0,  // MSS memo / national security
    denials: 160.0,     // Singapore / China / board deny
    history: 200.0,     // Mata Hari / Romeo agents
    why: 240.0,         // export controls H20
    fallout: 300.0,     // Nov twelfth -4.3% / $190B / $490B
    know: 370.0,        // "What do we actually know?"
    final: 392.36,      // "oldest trick" end card
  },

  fadeIn: [0, 0.4],
  fadeOut: [412.0, 413.248],

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
    { t: 0, x: 1780, y: 549, zoom: 0.93 },
    { t: 1.313, x: 1774, y: 548, zoom: 0.93 },
    { t: 24.682, x: 1762, y: 546, zoom: 0.925 },
    { t: 27.308, x: 1762, y: 546, zoom: 0.925 },
    { t: 27.702, x: 5600, y: 540, zoom: 0.93 },
    { t: 29.409, x: 5600, y: 540, zoom: 0.93 },
    { t: 33.085, x: 7400, y: 545, zoom: 0.955 },
    { t: 34.267, x: 7400, y: 545, zoom: 0.955 },
    { t: 43.851, x: 7400, y: 546, zoom: 0.915 },
    { t: 45.951, x: 7400.6, y: 546, zoom: 0.95 },
    { t: 65.907, x: 7400, y: 546, zoom: 0.95 },
    { t: 66.958, x: 8500, y: 540, zoom: 0.93 },
    { t: 68.664, x: 8500, y: 540, zoom: 0.93 },
    { t: 71.159, x: 12980, y: 548, zoom: 0.97 },
    { t: 72.866, x: 12980, y: 548, zoom: 0.97 },
    { t: 93.478, x: 12980, y: 547, zoom: 0.965 },
    { t: 95.185, x: 16660, y: 540, zoom: 0.93 },
    { t: 96.892, x: 16660, y: 540, zoom: 0.93 },
    { t: 99.255, x: 18760, y: 545, zoom: 0.955 },
    { t: 102.668, x: 18760, y: 545, zoom: 0.955 },
    { t: 122.099, x: 18760, y: 545, zoom: 0.92 },
    { t: 124.725, x: 18760.6, y: 545, zoom: 0.955 },
    { t: 140.217, x: 18760, y: 546, zoom: 0.955 },
    { t: 141.793, x: 22000, y: 540, zoom: 0.93 },
    { t: 143.499, x: 22000, y: 540, zoom: 0.93 },
    { t: 145.994, x: 24680, y: 548, zoom: 0.965 },
    { t: 149.539, x: 24680, y: 548, zoom: 0.965 },
    { t: 183.149, x: 24680, y: 548, zoom: 0.96 },
    { t: 187.219, x: 30480, y: 546, zoom: 0.92 },
    { t: 190.895, x: 30480, y: 546, zoom: 0.92 },
    { t: 223.849, x: 30480, y: 545, zoom: 0.915 },
    { t: 227.525, x: 34800, y: 540, zoom: 0.93 },
    { t: 229.231, x: 34800, y: 540, zoom: 0.93 },
    { t: 229.625, x: 36450, y: 543, zoom: 0.925 },
    { t: 233.301, x: 36400, y: 543, zoom: 0.925 },
    { t: 265.861, x: 36820, y: 543, zoom: 0.925 },
    { t: 281.091, x: 38800, y: 544, zoom: 0.925 },
    { t: 282.141, x: 41350, y: 540, zoom: 0.93 },
    { t: 283.848, x: 41350, y: 540, zoom: 0.93 },
    { t: 286.867, x: 44200, y: 546, zoom: 0.955 },
    { t: 289.625, x: 44200, y: 546, zoom: 0.955 },
    { t: 314.832, x: 44200, y: 546, zoom: 0.955 },
    { t: 316.67, x: 46350, y: 540, zoom: 0.93 },
    { t: 318.377, x: 46350, y: 540, zoom: 0.93 },
    { t: 320.609, x: 49060, y: 548, zoom: 0.96 },
    { t: 324.548, x: 49060, y: 548, zoom: 0.96 },
    { t: 337.808, x: 49060, y: 547, zoom: 0.925 },
    { t: 340.565, x: 49060.6, y: 547, zoom: 0.96 },
    { t: 348.048, x: 49060, y: 548, zoom: 0.96 },
    { t: 349.755, x: 50750, y: 540, zoom: 0.93 },
    { t: 351.462, x: 50750, y: 540, zoom: 0.93 },
    { t: 353.956, x: 53880, y: 548, zoom: 0.97 },
    { t: 357.501, x: 53880, y: 548, zoom: 0.97 },
    { t: 376.538, x: 53880, y: 548, zoom: 0.97 },
    { t: 377.457, x: 56450, y: 540, zoom: 0.93 },
    { t: 379.164, x: 56450, y: 540, zoom: 0.93 },
    { t: 382.315, x: 58500, y: 546, zoom: 0.9 },
    { t: 385.203, x: 58500, y: 546, zoom: 0.9 },
    { t: 389.667, x: 58500, y: 546, zoom: 0.872 },
    { t: 392.687, x: 58500.7, y: 546, zoom: 0.9 },
    { t: 407.916, x: 58500, y: 547, zoom: 0.87 },
    { t: 413.248, x: 58150, y: 549, zoom: 0.8 },
  ],
};

T.rail = makeVariedRail(T.cameraKeys, 7);
console.log('[timings] rail variety:', JSON.stringify(T.rail.variety));