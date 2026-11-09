// timings.mjs — THE single source of truth clock for film 001
// "The Bravest Snack in History". Picture (world.mjs zones) and sound
// (sfx-plan.mjs) both import this file, so SFX can never drift from picture.
// Re-timing the film = editing this file, then re-render + re-mix.
//
import { readFileSync } from 'node:fs';
import { makeRail } from '../../engine/camera.mjs';

const anchors = JSON.parse(readFileSync(new URL('./assets/timings.json', import.meta.url), 'utf8'));
const start = (name) => {
  const row = anchors.timings.find((s) => s.scene === name);
  if (!row) throw new Error(`timings.json: missing scene "${name}"`);
  return row.start;
};

export const T = {
  W: 3840,
  H: 1646,
  FPS: 30,
  FRAMES: 976,
  DUR: 32.5333, // 976 / 30
  BOARD_W: 20000,
  BOARD_H: 4400,

  // spoken-scene anchors (from the user's timings.json)
  scenes: {
    hook: start('hook'),       // 0.45  — VO: 0.45 to 5.549 (5.1s)
    idea: start('idea'),       // 5.649 — VO: 5.649 to 11.625 (5.98s)
    milk: start('milk'),       // 11.725 — VO: 11.725 to 16.573 (4.85s)
    timeline: start('timeline'), // 16.673 — VO: 16.673 to 21.772 (5.1s)
    genes: start('genes'),     // 21.872 — VO: 21.872 to 26.241 (4.37s)
    toast: start('toast'),     // 26.341 — VO: 26.341 to 31.622 (5.28s)
  },

  narration: anchors.timings.map(({ scene, start: s, dur, text }) => ({ scene, start: s, dur, text })),

  // LAW 6: underline lands on last spoken word of toast ("…in history.", VO ends ~31.62)
  underlineF: [31.25, 31.55],

  fadeIn: [0, 0.4],
  fadeOut: [31.9, 32.533],

  // Camera keys — PROPER HOLDS on each subject for full VO duration.
  // Safe area: 60px from edges. At zoom=1, world coords map to screen:
  // sx = (wx - cam.x) + 1920, sy = (wy - cam.y) + 823
  // Safe zone: cam.x ± 1860, cam.y ± 763
  cameraKeys: [
    // HOOK (0.45–5.549): gentle push; keep numerals/caption in safe frame.
    { t: 0.00,   x: 1380,  y: 1220, zoom: 0.84 },
    { t: 0.45,   x: 1380,  y: 1220, zoom: 0.84 },
    { t: 1.60,   x: 1390,  y: 1225, zoom: 0.86 },
    { t: 3.20,   x: 1410,  y: 1230, zoom: 0.89 },
    { t: 4.80,   x: 1435,  y: 1240, zoom: 0.92 },
    { t: 5.20,   x: 1480,  y: 1245, zoom: 0.93 },

    // TRANSITION hook→idea (start move only after hook VO ends to avoid rush)
    { t: 5.65,   x: 4366,  y: 1200, zoom: 1.00 },

    // IDEA (5.649–11.625): flat hold
    { t: 6.10,   x: 4366,  y: 1200, zoom: 1.00 },
    { t: 8.33,   x: 4366,  y: 1200, zoom: 1.00 },
    { t: 10.80,  x: 4366,  y: 1200, zoom: 1.00 },
    { t: 11.25,  x: 4366,  y: 1200, zoom: 1.00 }, // hold through VO

    // TRANSITION idea→milk (smooth, after VO)
    { t: 11.73,  x: 7440,  y: 1280, zoom: 1.00 },

    // MILK (11.725–16.573): frame includes cow (left/lower) + MILK/caption
    { t: 12.10,  x: 7440,  y: 1280, zoom: 1.00 },
    { t: 13.50,  x: 7440,  y: 1280, zoom: 1.00 },
    { t: 15.50,  x: 7440,  y: 1280, zoom: 1.00 },
    { t: 16.15,  x: 7440,  y: 1280, zoom: 1.00 },

    // TRANSITION milk→timeline (move after milk VO ends)
    { t: 16.67,  x: 11280, y: 1285, zoom: 1.00 },

    // TIMELINE (16.673–21.772): centered over goat→pasture rail
    { t: 17.20,  x: 11280, y: 1285, zoom: 1.00 },
    { t: 19.00,  x: 11280, y: 1285, zoom: 1.00 },
    { t: 21.25,  x: 11280, y: 1285, zoom: 1.00 },
    { t: 21.45,  x: 11280, y: 1285, zoom: 1.00 },

    // TRANSITION timeline→genes (move after timeline VO ends)
    { t: 21.87,  x: 12820, y: 1405, zoom: 1.00 },

    // GENES (21.872–26.241): keep full doc card in safe area (no top clip)
    { t: 22.30,  x: 12820, y: 1405, zoom: 1.00 },
    { t: 24.00,  x: 12820, y: 1405, zoom: 1.00 },
    { t: 25.93,  x: 12820, y: 1405, zoom: 1.00 },
    { t: 26.05,  x: 12820, y: 1405, zoom: 1.00 },

    // TRANSITION genes→toast
    { t: 26.34,  x: 17000, y: 1320, zoom: 1.00 },

    // TOAST (26.341–31.622): hold; print bottom must stay in safe area
    { t: 27.00,  x: 17000, y: 1175, zoom: 0.95 },
    { t: 29.00,  x: 17000, y: 1175, zoom: 0.96 },
    { t: 31.00,  x: 17000, y: 1175, zoom: 0.97 },
    { t: 31.35,  x: 17000, y: 1175, zoom: 0.97 },

    // TAIL: hold safe framing
    { t: 32.54,  x: 17000, y: 1175, zoom: 0.97 },
  ],
};

T.rail = makeRail(T.cameraKeys);