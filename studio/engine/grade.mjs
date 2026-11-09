// grade.mjs — the film grade: vignette, grain, fades.
// Grain is deterministic per frameIdx (hash-based) and drawn as sparse alpha
// specks with stride sampling (performance-aware at 4K). Per AGENTS.md it is
// per-run deterministic but ORDER-SENSITIVE: the same command shape yields
// identical bytes; a different command shape advances sampling differently.
// Documented, not a bug.
import { clamp, hash } from './style.mjs';

// vignette — warm radial darkening toward the frame corners.
export function vignette(ctx, W, H, { strength = 0.42 } = {}) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.34, W / 2, H / 2, Math.hypot(W, H) * 0.62);
  g.addColorStop(0, 'rgba(30,20,8,0)');
  g.addColorStop(1, `rgba(30,20,8,${clamp(strength)})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// grain — deterministic film grain for this frameIdx. Sparse specks: stride
// sampling on a hashed lattice; alpha tiny (0.02–0.07); warm dark + rare light.
export function grain(ctx, W, H, frameIdx, { amount = 0.5, stride = 7 } = {}) {
  const inherited = ctx.globalAlpha;
  ctx.save();
  const cols = Math.floor(W / stride), rows = Math.floor(H / stride);
  const baseA = inherited * amount;
  for (let gy = 0; gy < rows; gy += 2) {
    for (let gx = 0; gx < cols; gx += 2) {
      const h = hash(Math.imul(gx + 1, 73856093) ^ Math.imul(gy + 1, 19349663) ^ Math.imul(frameIdx + 1, 2654435761));
      if (h > 0.18) continue; // sparse
      const x = gx * stride + h * stride * 3;
      const y = gy * stride + hash(frameIdx * 7919 + gx * 31 + gy) * stride * 3;
      const dark = h < 0.09;
      ctx.globalAlpha = baseA * (dark ? 0.06 : 0.045);
      ctx.fillStyle = dark ? '#1c1814' : '#fff8e8';
      ctx.fillRect(x, y, 2.2, 2.2);
    }
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// fade — black overlay alpha from fadeIn/fadeOut windows [t0, t1].
export function fade(ctx, W, H, t, { fadeIn = [0, 0.4], fadeOut = [31.9, 32.53] } = {}) {
  let a = 0;
  if (fadeIn) {
    const [a0, a1] = fadeIn;
    if (t < a1) a = Math.max(a, 1 - clamp((t - a0) / Math.max(0.0001, a1 - a0)));
  }
  if (fadeOut) {
    const [o0, o1] = fadeOut;
    if (t > o0) a = Math.max(a, clamp((t - o0) / Math.max(0.0001, o1 - o0)));
  }
  if (a <= 0) return 0;
  ctx.save();
  ctx.fillStyle = `rgba(8,6,4,${a})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  return a;
}
