// timings.mjs — THE single source of truth clock for this film.
// Picture (world.mjs) and sound (sfx-plan.mjs) both import this file.
// Placeholder: a 10-second demo. Edit DUR/FRAMES to your VO length (LAW 2:
// film duration = VO duration) and lay your camera keys across the board.
import { makeRail } from '../../engine/camera.mjs';

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

  // One continuous Catmull-Rom move: start → drift → pull-back.
  cameraKeys: [
    { t: 0.0,  x: 1500,  y: 1150, zoom: 1.0 },
    { t: 4.5,  x: 5500,  y: 1100, zoom: 1.02 },
    { t: 8.5,  x: 9500,  y: 1120, zoom: 1.0 },
    { t: 10.0, x: 6000,  y: 1200, zoom: 0.55 }, // tail pull-back
  ],
};

T.rail = makeRail(T.cameraKeys);
