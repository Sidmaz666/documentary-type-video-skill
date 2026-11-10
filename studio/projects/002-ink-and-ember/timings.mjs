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
    hook: 0.5,       // "Five thousand years ago," (word 0.52)
    inkStamp: 1.7,   // "ink" (word 1.76)
    china: 3.9,      // "In China," (word 3.90)
    press: 10.0,     // "Around fourteen forty," (word 10.0)
    stamp1440: 10.85,// VO "1440," lands 10.86–11.52
    movable: 13.0,   // VO "movable type" 13.02–14.02
    stamp1455: 14.95,// VO "1455," lands 14.88–15.78
    everything: 18.98, // "Everything you have ever read" (word 18.98)
    remember: 23.96,   // VO "It remembers." 23.96–24.68
  },

  fadeIn: [0, 0.4],
  fadeOut: [24.0, 24.619],

  // One continuous Catmull-Rom move: A (hold) → B (drift) → C (drift) → D (settle) → tail pull-back.
  cameraKeys: [
    { t: 0.0,  x: 750,  y: 411, zoom: 0.94 },   // hook holds
    { t: 1.2,  x: 780,  y: 408, zoom: 0.935 },  // sub-px creep
    { t: 3.75, x: 1650, y: 400, zoom: 0.965 },  // arrive China BEFORE "In China," (3.90)
    { t: 6.0,  x: 1700, y: 401, zoom: 0.97 },
    { t: 9.7,  x: 2550, y: 398, zoom: 1.0 },    // arrive Gutenberg BEFORE "Around" (10.0)
    { t: 12.3, x: 2530, y: 398, zoom: 1.002 },
    { t: 16.0, x: 2750, y: 399, zoom: 0.985 },
    { t: 18.6, x: 3480, y: 400, zoom: 0.9 },    // arrive zone D BEFORE "Everything" (18.98)
    { t: 22.7, x: 3520, y: 399, zoom: 0.86 },
    { t: 24.619, x: 2720, y: 400, zoom: 0.58 }, // tail pull-back
  ],
};

T.rail = makeRail(T.cameraKeys);
