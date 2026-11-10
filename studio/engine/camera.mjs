// camera.mjs — the one-continuous-move camera rig.
// A Catmull-Rom rail through camera keys {t,x,y,zoom}: C1-continuous, so the
// move never stops dead — between keys the curve keeps easing toward the next
// key (hold-drift). Handheld noise is damped during fast pushes.
import { hash, clamp } from './style.mjs';

// Catmull-Rom for one component given 4 control values and u∈[0,1].
function catmullRom(p0, p1, p2, p3, u) {
  const u2 = u * u, u3 = u2 * u;
  return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
}

// makeRail(keys) → rail object. Keys sorted by t; endpoints duplicated so the
// spline is defined at the head and tail.
export function makeRail(keys) {
  const k = [...keys].sort((a, b) => a.t - b.t);
  if (k.length < 2) throw new Error('camera rail needs ≥2 keys');
  const t0 = k[0].t, t1 = k[k.length - 1].t;
  return { keys: k, t0, t1 };

}

// camAt(rail, t) → {x, y, zoom}. Finds the segment containing t and runs
// Catmull-Rom per component with clamped neighbor keys.
export function camAt(rail, t) {
  const { keys: k } = rail;
  const tc = clamp(t, k[0].t, k[k.length - 1].t);
  let i = 0;
  while (i < k.length - 2 && tc >= k[i + 1].t) i++;
  const a = k[i], b = k[i + 1];
  const u = b.t === a.t ? 0 : (tc - a.t) / (b.t - a.t);
  const p0 = k[Math.max(0, i - 1)], p3 = k[Math.min(k.length - 1, i + 2)];
  // Ease the parameter inside each segment so holds keep drifting: the pure
  // Catmull-Rom already yields non-zero velocity mid-hold (C1 continuity);
  // the smoothstep remap would create zero-velocity holds, so we do NOT remap.
  return {
    x: catmullRom(p0.x, a.x, b.x, p3.x, u),
    y: catmullRom(p0.y, a.y, b.y, p3.y, u),
    zoom: catmullRom(p0.zoom, a.zoom, b.zoom, p3.zoom, u),
  };
}

// Camera speed magnitude around time t (world px + zoom per second) — used to
// damp handheld shake during fast pushes.
export function camSpeed(rail, t, dt = 0.05) {
  const c1 = camAt(rail, Math.max(rail.t0, t - dt));
  const c2 = camAt(rail, Math.min(rail.t1, t + dt));
  const span = Math.min(rail.t1, t + dt) - Math.max(rail.t0, t - dt) || dt;
  const dx = (c2.x - c1.x) / span, dy = (c2.y - c1.y) / span, dz = (c2.zoom - c1.zoom) / span;
  return Math.hypot(dx, dy, dz * 2000);
}

// Slow handheld drift — like a documentary operator breathing on sticks.
// Two slow sine octaves plus one gentle third; no high-frequency cells, so
// there is nothing to alias into judder at 30 fps. Damped further on pushes.
export function handheld(t, seed = 1) {
  const s = (seed | 0) || 1;
  const TAU = Math.PI * 2;
  const ph = (i) => hash(Math.imul(i + 1013 * s, 2654435761)) * TAU;
  return {
    nx: Math.sin(t * 0.62 + ph(11)) * 0.58 + Math.sin(t * 1.31 + ph(23)) * 0.3 + Math.sin(t * 2.7 + ph(37)) * 0.12,
    ny: Math.cos(t * 0.51 + ph(51)) * 0.56 + Math.cos(t * 1.13 + ph(67)) * 0.32 + Math.cos(t * 2.3 + ph(71)) * 0.12,
    nz: Math.sin(t * 0.43 + ph(91)) * 0.55 + Math.sin(t * 1.02 + ph(97)) * 0.45,
  };
}

// handheldDamped — breath on sticks: a few px at rest, a whisper on pushes.
export function handheldDamped(rail, t, seed = 1) {
  const h = handheld(t, seed);
  const damp = clamp(1 - (camSpeed(rail, t) - 400) / 1600, 0.12, 1); // gentle breath > moving fast
  const A = 4.5; // px of drift at rest (was 14 — that aliased into judder at 30 fps)
  return { nx: h.nx * A * damp, ny: h.ny * A * damp, nz: h.nz * damp };
}

// applyCam(ctx, cam, W, H) — map world coords to viewport, center-focused zoom.
// After this, draw everything in WORLD coordinates.
// viewScale: device-px-per-design-px of the render target (1 at full film
// resolution, 1/8 for a --scale 8 QC preview). It scales the projection so the
// camera always frames the SAME world window regardless of output size —
// without it, a scaled preview would show only 1/scale of the world (found by
// the reconstruction smoke test: --scale stills were near-empty).
export function applyCam(ctx, cam, W, H, shake = { nx: 0, ny: 0, nz: 0 }, viewScale = 1) {
  const zoomW = Math.max(0.05, cam.zoom + shake.nz * cam.zoom * 0.004); // design-space zoom (incl. wobble)
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoomW * viewScale, zoomW * viewScale);
  // handheld offset: 14 design-px of shake → world offset 14/zoom (so the
  // on-screen shake stays proportional at every resolution)
  ctx.translate(-(cam.x + shake.nx * 14 / Math.max(0.05, zoomW)), -(cam.y + shake.ny * 14 / Math.max(0.05, zoomW)));
}
