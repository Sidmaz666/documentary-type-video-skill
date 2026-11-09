// ink.mjs — the boil system + hand-drawn strokes.
// The boil: all hand jitter is quantized to 8 fps steps (pencil-test feel,
// never shimmer) and hashed from world coordinates → byte-deterministic and
// order-independent. Every stroke helper MULTIPLIES inherited globalAlpha
// (never assigns absolute) so zone dim-backs survive.
import { hash, clamp } from './style.mjs';

let boilStep = 0;

// setBoil(t): quantize film time to the 8fps boil grid.
export function setBoil(t) { boilStep = Math.floor(t * 8); }
export const currentBoilStep = () => boilStep;

// boilPt(x, y, mag) → jittered point, deterministic from world coords + boil step.
export function boilPt(x, y, mag = 2.4) {
  const h = Math.imul(x * 73856093 | 0, 1) ^ Math.imul(y * 19349663 | 0, 1) ^ Math.imul(boilStep + 1, 9176209);
  const h1 = hash(h), h2 = hash(h ^ 0x9e3779b9);
  return { x: x + (h1 * 2 - 1) * mag, y: y + (h2 * 2 - 1) * mag };
}

// boilWobble(mag) → rotation jitter (radians), same determinism.
export function boilWobble(mag = 0.002) {
  return (hash(Math.imul(boilStep + 1, 2654435761) ^ 0x5bf03635) * 2 - 1) * mag;
}

export function applyStroke(ctx, { w = 3, color = '#1c1814', alpha = 1, cap = 'round', join = 'round' } = {}) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = cap;
  ctx.lineJoin = join;
  const inherited = ctx.globalAlpha;
  ctx.globalAlpha = inherited * alpha; // multiply, never assign absolute
  return inherited;
}

// handStroke(ctx, pts, opts) — polyline with slight per-segment boil.
// progress ∈ [0,1] draws only the first portion of the path.
export function handStroke(ctx, pts, opts = {}) {
  if (!pts || pts.length < 2) return;
  const { w, color, alpha = 1, progress = 1, boil = 2.4 } = opts;
  if (progress <= 0) return; // not started → no stray dot
  const n = Math.max(2, Math.round(pts.length * clamp(progress)));
  const inherited = applyStroke(ctx, { ...opts, alpha });
  ctx.beginPath();
  const p0 = boilPt(pts[0].x ?? pts[0][0], pts[0].y ?? pts[0][1], boil);
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < n; i++) {
    const q = pts[i];
    const p = boilPt(q.x ?? q[0], q.y ?? q[1], boil);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.globalAlpha = inherited;
}

// handLine — two-point convenience over handStroke.
export function handLine(ctx, x1, y1, x2, y2, opts = {}) {
  const { segs = 6, boil = 2.4 } = opts;
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    pts.push({ x: x1 + (x2 - x1) * u, y: y1 + (y2 - y1) * u });
  }
  handStroke(ctx, pts, { boil, ...opts });
}

// handCircle — hand-drawn circle arc with boil; sweep controlled by progress 0..1.
export function handCircle(ctx, x, y, r, opts = {}) {
  const { w = 4, color = '#1c1814', alpha = 1, progress = 1, boil = 2.4, start = -Math.PI / 2, segs = 26 } = opts;
  if (progress <= 0) return; // not started → no stray arc tick
  const inherited = applyStroke(ctx, { w, color, alpha });
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(boilWobble(0.002));
  ctx.beginPath();
  const sweep = clamp(progress) * Math.PI * 2;
  const n = Math.max(3, Math.round(segs * clamp(progress)));
  for (let i = 0; i <= n; i++) {
    const aa = start + sweep * (i / n);
    const px = Math.cos(aa) * r + (hash(Math.imul(i + 1, 668265263) ^ Math.imul(x | 0, 73856093)) * 2 - 1) * boil;
    const py = Math.sin(aa) * r + (hash(Math.imul(i + 1, 374761393) ^ Math.imul(y | 0, 19349663)) * 2 - 1) * boil;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// arrow — polyline with a hand-drawn head (two short strokes) at the end.
export function arrow(ctx, pts, opts = {}) {
  const { w = 4, color = '#1c1814', alpha = 1, head = 22 } = opts;
  handStroke(ctx, pts, { w, color, alpha });
  const last = pts[pts.length - 1], prev = pts[Math.max(0, pts.length - 3)];
  const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
  const a1 = ang + Math.PI * 0.82, a2 = ang - Math.PI * 0.82;
  handStroke(ctx, [
    { x: last.x, y: last.y },
    { x: last.x + Math.cos(a1) * head, y: last.y + Math.sin(a1) * head },
  ], { w, color, alpha });
  handStroke(ctx, [
    { x: last.x, y: last.y },
    { x: last.x + Math.cos(a2) * head, y: last.y + Math.sin(a2) * head },
  ], { w, color, alpha });
}
