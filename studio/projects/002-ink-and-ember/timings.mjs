// timings.mjs — THE single source of truth clock for Ink & Ember.
// Picture (world.mjs) and sound (sfx-plan.mjs) both import this file.
import { makeRail } from '../../engine/camera.mjs';

export const T = {
  W: 1920,
  H: 822, // 21:9 class (even dims) — test-resolution master, not the 4K format
  FPS: 30,
  FRAMES: 739, // round(24.619 * 30) — LAW 2: duration = VO
  DUR: 24.619,
  BOARD_W: 4200,
  BOARD_H: 900,

  // VO anchors (ASR word timestamps, assets/vo-timings.whisper.json)
  scenes: {
    hook: 0.5,      // "Five thousand years ago," (word 0.52)
    china: 3.9,     // "In China," (word 3.90)
    gutenberg: 10.0,// "Around fourteen forty," (word 10.0)
    everything: 18.98, // "Everything you have ever read" (word 18.98)
    remember: 22.76,   // "This is ink." (word 22.76)
  },

  fadeIn: [0, 0.4],
  fadeOut: [24.0, 24.619],

  // One continuous Catmull-Rom move: A (hold) → B (drift) → C (drift) → D (settle) → tail pull-back.
  cameraKeys: [
    { t: 0.0,  x: 750,  y: 411, zoom: 0.94 },
    { t: 4.4,  x: 1650, y: 400, zoom: 0.97 },
    { t: 10.5, x: 2580, y: 400, zoom: 1.0 },
    { t: 19.6, x: 3480, y: 400, zoom: 0.92 },
    { t: 22.8, x: 3480, y: 400, zoom: 0.88 },
    { t: 24.619, x: 2700, y: 400, zoom: 0.58 },
  ],
};

T.rail = makeRail(T.cameraKeys);
