// trace.mjs — engine loader/renderer for studio/tools/rotoscope/trace.py output.
// A traced reference becomes handStroke polylines with staggered draw-on
// reveals, so ink "draws itself" over a hidden or faint stencil. The stencil
// itself is drawn only while `stencil` is set (QC) — final passes use alpha 0
// (LAW 1: real art drawn by us, referencing a licensed plate).
import { readFileSync } from 'node:fs';
import { INK, clamp } from './style.mjs';
import { handStroke } from './ink.mjs';

// loadTrace(path) → parsed trace JSON (throws on bad input).
export function loadTrace(path) {
  const t = JSON.parse(readFileSync(path, 'utf-8'));
  if (!Array.isArray(t.polylines)) throw new Error('trace JSON missing polylines[]');
  return t;
}

// drawTrace(ctx, trace, { x, y, scale, rot, t, t0, dur = 1.2, stagger = 0.02,
//   w = 5, color = INK, alpha = 1, boil = 2.2, maxLines = Infinity, progress = clamp((t - t0) / dur) })
// Lines reveal in the order trace.py emitted (longest first), each delayed by
// `stagger` seconds — the self-drawing ink effect.
export function drawTrace(ctx, trace, opts = {}) {
  const {
    x = 0, y = 0, scale = 1, rot = 0,
    t = 0, t0 = 0, dur = 1.2, stagger = 0.02,
    w = 5, color = INK, alpha = 1, boil = 2.2, maxLines = Infinity,
  } = opts;
  if (t < t0) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  const lines = trace.polylines.slice(0, maxLines);
  const reveal = clamp((t - t0) / Math.max(0.0001, dur));
  lines.forEach((line, i) => {
    const start = i * stagger;
    const u = clamp((reveal * (dur + lines.length * stagger) - start) / Math.max(0.0001, dur));
    if (u <= 0) return;
    handStroke(ctx, line.map(([px, py]) => ({ x: px - trace.width / 2, y: py - trace.height / 2 })), { w, color, boil, progress: u });
  });
  ctx.restore();
  ctx.globalAlpha = inherited;
}
