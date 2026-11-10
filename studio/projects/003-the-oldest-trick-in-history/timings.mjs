// timings.mjs — THE single source of truth clock for The Oldest Trick in the
// History Still Works, Right? Picture (world.mjs) and sound (sfx-plan.mjs) import T.
import { makeVariedRail } from '../../engine/camera.mjs';

export const T = {
  W: 2560,
  H: 1098, // 21:9 (even dims)
  FPS: 30,
  FRAMES: 10198, // round(339.925 * 30) — LAW 2: duration = VO
  DUR: 339.925,
  BOARD_W: 62000,
  BOARD_H: 3600,

  // VO word anchors (assets/vo-timings.whisper.json)
  scenes: {
    hook: 0.0,
    nvidia: 26.6,
    alice: 56.1,
    allegation: 81.1,
    denials: 113.9,
    megaspeed: 148.6,
    history: 181.9,
    why: 233.1,
    fallout: 262.3,
    know: 288.7,
    final: 315.1,
  },

  fadeIn: [0, 0.4],
  fadeOut: [338.9, 339.925],

  // One continuous Catmull-Rom move — every zone transit carries a non-horizontal
  // vector (LAW 10, makeVariedRail, seed 7). Holds end ~4–5 s before each
  // zone's VO-window ends; arrivals land ~1.5–2.5 s before the beat word.
  cameraKeys: [
    { t: 0.0,   x: 1780,  y: 549, zoom: 0.93 },
    { t: 1.0,   x: 1774,  y: 548, zoom: 0.93 },
    { t: 20.0,  x: 1762,  y: 546, zoom: 0.925 },
    { t: 24.8,  x: 7400,  y: 545, zoom: 0.955 },
    { t: 26.2,  x: 7400,  y: 545, zoom: 0.955 },
    { t: 51.5,  x: 7400,  y: 546, zoom: 0.95 },
    { t: 54.3,  x: 12980, y: 548, zoom: 0.97 },
    { t: 55.5,  x: 12980, y: 548, zoom: 0.97 },
    { t: 74.5,  x: 12980, y: 547, zoom: 0.965 },
    { t: 79.3,  x: 18760, y: 545, zoom: 0.955 },
    { t: 80.5,  x: 18760, y: 545, zoom: 0.955 },
    { t: 107.5, x: 18760, y: 546, zoom: 0.955 },
    { t: 112.1, x: 24680, y: 548, zoom: 0.965 },
    { t: 113.3, x: 24680, y: 548, zoom: 0.965 },
    { t: 142.0, x: 24680, y: 548, zoom: 0.96 },
    { t: 146.8, x: 30480, y: 546, zoom: 0.92 },
    { t: 147.8, x: 30480, y: 546, zoom: 0.92 },
    { t: 175.0, x: 30480, y: 545, zoom: 0.915 },
    { t: 180.1, x: 36450, y: 543, zoom: 0.925 },
    { t: 181.3, x: 36468, y: 543, zoom: 0.925 },
    { t: 227.5, x: 39000, y: 544, zoom: 0.925 },
    { t: 233.0, x: 43760, y: 546, zoom: 0.955 },
    { t: 234.5, x: 43760, y: 546, zoom: 0.955 },
    { t: 256.5, x: 43760, y: 546, zoom: 0.955 },
    { t: 260.6, x: 49060, y: 548, zoom: 0.96 },
    { t: 261.8, x: 49060, y: 548, zoom: 0.96 },
    { t: 283.5, x: 49060, y: 548, zoom: 0.96 },
    { t: 287.1, x: 53880, y: 548, zoom: 0.97 },
    { t: 288.2, x: 53880, y: 548, zoom: 0.97 },
    { t: 309.5, x: 53880, y: 548, zoom: 0.97 },
    { t: 313.4, x: 58500, y: 546, zoom: 0.9 },
    { t: 314.6, x: 58500, y: 546, zoom: 0.9 },
    { t: 336.0, x: 58500, y: 547, zoom: 0.87 },
    { t: 339.925, x: 58150, y: 549, zoom: 0.80 },
  ],
};

T.rail = makeVariedRail(T.cameraKeys, 7);
console.log('[timings] rail variety:', JSON.stringify(T.rail.variety));
