// world.mjs — this film's art. Draw zones on the paper board with the engine
// cast (engine/characters.mjs) and props (engine/props.mjs). Demo: one zone —
// a stamp, a typed line and a DNA helix. Replace with your own beats.
import { INK, RED, FONT, clamp } from '../../engine/style.mjs';
import { handStroke } from '../../engine/ink.mjs';
import { stampText, typewriter } from '../../engine/text.mjs';
import { drawPaper } from '../../engine/props.mjs';
import { helix } from '../../engine/characters.mjs';
import { T } from './timings.mjs';

const S = T.scenes;

// zone dim-back: content fades as the camera leaves (single-zone demo)
function zoneAlpha(t) {
  return clamp(Math.min(1, (t - (S.open - 0.5)) / 0.6), 0, 1) *
         clamp(1 - Math.max(0, (t - (S.close + 0.3)) / 0.9), 0, 1);
}

export function drawWorld(ctx, t) {
  drawPaper(ctx, 0, -1000, T.BOARD_W, T.BOARD_H, 3);
  const a = zoneAlpha(t);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;

  // the one hero: a DNA helix drawing itself
  helix(ctx, 2200, 1150, { w: 280, h: 620, turns: 2.25, t, progress: clamp((t - S.open) / 2) });
  // rubber-stamp title
  stampText(ctx, 3400, 700, 'YOUR TITLE', { size: 190, t0: S.mid, t, rot: -0.015 });
  // typed caption under it (safe area: keep y ≤ board band minus 60px/zoom)
  typewriter(ctx, 3400, 1000, 'your caption types here', { size: 80, t0: S.mid + 0.8, cps: 14, t, font: FONT.hand });
  // a red accent stroke
  if (t > S.mid + 2) {
    handStroke(ctx, [[3300, 1120], [3500, 1114]], { w: 10, color: RED, progress: clamp((t - (S.mid + 2)) / 0.4) });
  }
  ctx.restore();
  void INK;
}
