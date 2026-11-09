// text.mjs — stamps, mask-ups, typewriter.
// All helpers respect inherited globalAlpha by MULTIPLYING (never assigning
// absolute alpha), so zone dim-backs survive. All rotation boils around the
// text's own center (translate first, then rotate — pivot bug banned).
import { FONT, INK, clamp, hash, easeOutBack, lerp } from './style.mjs';
import { boilWobble, setBoil } from './ink.mjs';

function centeredFont(ctx, size, font) {
  ctx.font = `${size}px ${font}, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

// stampText — rubber-stamp: pops in at t0 over ~0.12s with overshoot scale +
// rotation, then boils subtly. Before t0: nothing.
export function stampText(ctx, x, y, text, opts = {}) {
  const {
    size = 120, color = INK, font = FONT.display, rot = 0, alpha = 1,
    t0 = 0, t = 0, pop = 0.12, boil = true,
  } = opts;
  if (t < t0) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y);
  // pivot at own center, never the canvas origin
  ctx.rotate(rot + (boil ? boilWobble(0.002) : 0));
  const u = clamp((t - t0) / pop);
  const s = 1.35 - 0.35 * easeOutBack(u); // overshoot → settle at 1
  ctx.scale(s, s);
  ctx.fillStyle = color;
  centeredFont(ctx, size, font);
  ctx.fillText(text, 0, 0);
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// maskUpText — masked wipe reveal: clip rect grows left→right between t0..t1.
export function maskUpText(ctx, x, y, text, opts = {}) {
  const {
    size = 90, color = INK, font = FONT.display, align = 'center',
    t0 = 0, t1 = 1, t = 0, alpha = 1, rot = 0,
  } = opts;
  if (t < t0) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  centeredFont(ctx, size, font);
  const tw = ctx.measureText(text).width;
  const anchorX = align === 'left' ? x : align === 'right' ? x : x - tw / 2;
  const u = clamp((t - t0) / Math.max(0.0001, t1 - t0));
  ctx.beginPath();
  ctx.rect(align === 'center' ? x - tw / 2 : anchorX, y - size, tw * u + 2, size * 2);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(rot + boilWobble(0.0015));
  ctx.fillStyle = color;
  if (align === 'center') ctx.fillText(text, 0, 0);
  else { ctx.textAlign = align; ctx.fillText(text, 0, 0); }
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// typewriter — types floor((t-t0)*cps) chars with per-char jitter; optional
// block cursor while typing.
export function typewriter(ctx, x, y, text, opts = {}) {
  const {
    size = 64, color = INK, font = FONT.hand, cps = 14,
    t0 = 0, t = 0, alpha = 1, cursor = true, rot = 0,
  } = opts;
  if (t < t0) return;
  const n = Math.min(text.length, Math.floor((t - t0) * cps));
  if (n <= 0) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  centeredFont(ctx, size, font);
  ctx.fillStyle = color;
  // draw per-char with deterministic per-char jitter (boil-quantized by t)
  const step = Math.floor(t * 8);
  let cx = 0;
  const tw = ctx.measureText(text.slice(0, n)).width;
  let startX = -tw / 2;
  ctx.textAlign = 'left';
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    const jx = (hash(Math.imul(i + 1, 73856093) ^ Math.imul(step + 1, 19349663)) * 2 - 1) * 1.6;
    const jy = (hash(Math.imul(i + 1, 19349663) ^ Math.imul(step + 1, 73856093)) * 2 - 1) * 1.6;
    ctx.fillText(ch, startX + cx + jx, jy);
    cx += ctx.measureText(ch).width;
  }
  if (cursor && t - t0 < text.length / cps + 0.8 && Math.floor(t * 2.5) % 2 === 0) {
    ctx.fillRect(startX + cx + 8, -size * 0.42, size * 0.08, size * 0.84);
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// re-export so projects can import one text module for all text needs
export { setBoil, lerp };
