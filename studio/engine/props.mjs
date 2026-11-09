// props.mjs — the paper world and physical photo props.
// drawPaper lays the 20,000px board: PAPER base, fiber grain, blotches and
// LAID RULES (118px spacing, α≈0.05, bowed on a fixed world lattice so lines
// NEVER crawl as the camera moves). Photo prints drop in with overshoot
// bounce physics. All alphas MULTIPLY inherited globalAlpha.
//
// Performance: the compositor calls setPaperView() with the visible world
// rect each frame; fibers/blotches/rules are culled to it (with margin) so a
// 20,000px board costs the same as a viewport.
import { PAPER, INK, hash, clamp, lerp, easeOutBack } from './style.mjs';
import { boilPt, boilWobble } from './ink.mjs';

// ── visible-world culling (set by compose each frame) ─────────────────────
let paperView = null; // {x, y, w, h} in world coords, or null (draw all)
export function setPaperView(view) { paperView = view; }
export function clearPaperView() { paperView = null; }
const MARGIN = 300;
function inView(x, y, pad = MARGIN) {
  if (!paperView) return true;
  const v = paperView;
  return x > v.x - pad && x < v.x + v.w + pad && y > v.y - pad && y < v.y + v.h + pad;
}

// ── LAID RULES: fixed world lattice ───────────────────────────────────────
export const RULE_SPACING = 118;
// Bow of one laid rule at world x, for rule index i — fixed lattice: control
// points every 900px, phase seeded by hash(lineIndex). Camera-independent.
function ruleY(y0, x, i) {
  const cp = 900;
  const x0 = Math.floor(x / cp) * cp;
  const u = (x - x0) / cp;
  const a = (hash(Math.imul(i + 1, 668265263) ^ Math.imul(x0, 19349663)) * 2 - 1) * 7;
  const b = (hash(Math.imul(i + 1, 668265263) ^ Math.imul(x0 + cp, 19349663)) * 2 - 1) * 7;
  return y0 + lerp(a, b, u * u * (3 - 2 * u));
}

// drawPaper — the world board. Fibers are short α≈0.03 strokes on a hashed
// lattice; blotches are radial gradients at α≈0.02–0.04; rules every 118px.
export function drawPaper(ctx, x, y, w, h, seed = 7) {
  // 1) base
  ctx.fillStyle = PAPER;
  ctx.fillRect(x, y, w, h);

  // 2) fiber grain — one candidate short stroke per 110px cell (hashed presence)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  const cell = 110;
  const c0x = Math.floor((paperView ? Math.max(x, paperView.x - MARGIN) : x) / cell);
  const c1x = Math.floor((paperView ? Math.min(x + w, paperView.x + paperView.w + MARGIN) : x + w) / cell);
  const c0y = Math.floor((paperView ? Math.max(y, paperView.y - MARGIN) : y) / cell);
  const c1y = Math.floor((paperView ? Math.min(y + h, paperView.y + paperView.h + MARGIN) : y + h) / cell);
  const baseA = ctx.globalAlpha;
  for (let cy = c0y; cy <= c1y; cy++) {
    for (let cx = c0x; cx <= c1x; cx++) {
      const px = cx * cell + cell / 2, py = cy * cell + cell / 2;
      if (px < x || px > x + w || py < y || py > y + h) continue;
      const hh = hash(Math.imul(cx + 11, 73856093) ^ Math.imul(cy + 7, 19349663) ^ Math.imul(seed, 2654435761));
      if (hh > 0.42) continue; // ~42% of cells carry a fiber
      const ang = hh * Math.PI * 2;
      const len = 26 + hh * 34;
      const jx = (hash(cx * 3 + cy) * 2 - 1) * cell * 0.4;
      const jy = (hash(cy * 5 + cx) * 2 - 1) * cell * 0.4;
      ctx.globalAlpha = baseA * 0.03;
      ctx.beginPath();
      ctx.moveTo(px + jx, py + jy);
      ctx.lineTo(px + jx + Math.cos(ang) * len, py + jy + Math.sin(ang) * len);
      ctx.stroke();
    }
  }

  // 3) blotches — radial gradients α≈0.02–0.04 on a coarse 700px lattice
  const bc = 700;
  const b0x = Math.floor((paperView ? Math.max(x, paperView.x - MARGIN) : x) / bc);
  const b1x = Math.floor((paperView ? Math.min(x + w, paperView.x + paperView.w + MARGIN) : x + w) / bc);
  const b0y = Math.floor((paperView ? Math.max(y, paperView.y - MARGIN) : y) / bc);
  const b1y = Math.floor((paperView ? Math.min(y + h, paperView.y + paperView.h + MARGIN) : y + h) / bc);
  for (let by = b0y; by <= b1y; by++) {
    for (let bx = b0x; bx <= b1x; bx++) {
      const px = bx * bc, py = by * bc;
      if (px < x || px > x + w || py < y || py > y + h) continue;
      const hh = hash(Math.imul(bx + 3, 19349663) ^ Math.imul(by + 5, 73856093) ^ Math.imul(seed, 40503));
      if (hh > 0.55) continue;
      const r = 120 + hh * 260;
      const gx = px + (hash(bx * 7 + by) * 2 - 1) * 300;
      const gy = py + (hash(by * 11 + bx) * 2 - 1) * 200;
      const a = 0.02 + hh * 0.02; // 0.02–0.04
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      g.addColorStop(0, `rgba(140,110,70,${a})`);
      g.addColorStop(1, 'rgba(140,110,70,0)');
      ctx.globalAlpha = baseA;
      ctx.fillStyle = g;
      ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
    }
  }

  // 4) laid rules — world-aligned, gently bowed on the fixed lattice
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  const i0 = Math.ceil((paperView ? Math.max(y, paperView.y - MARGIN) : y) / RULE_SPACING) - 1;
  const i1 = Math.floor((paperView ? Math.min(y + h, paperView.y + paperView.h + MARGIN) : y + h) / RULE_SPACING) + 1;
  const vx0 = paperView ? paperView.x - MARGIN : x;
  const vx1 = paperView ? paperView.x + paperView.w + MARGIN : x + w;
  for (let i = i0; i <= i1; i++) {
    const y0 = i * RULE_SPACING;
    if (y0 < y || y0 > y + h) continue;
    ctx.globalAlpha = baseA * 0.05;
    ctx.beginPath();
    const step = 450;
    for (let px = Math.max(x, vx0); px <= Math.min(x + w, vx1); px += step) {
      const py = ruleY(y0, px, i);
      if (px === Math.max(x, vx0)) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = baseA;
}

// ── photo prints ──────────────────────────────────────────────────────────
// drawPrint — a photo as a physical print: white border, soft shadow, slight
// rot, drops in at t0 over dur with easeOutBack overshoot landing.
// img: a decoded @napi-rs/canvas Image (or anything drawImage accepts).
export function drawPrint(ctx, img, x, y, opts = {}) {
  const {
    w = 560, rot = 0.02, drop = null, alpha = 1, border = 34, seed = 1,
  } = opts;
  const inherited = ctx.globalAlpha;
  let u = 1, dy = 0;
  if (drop) {
    const { t0, t, dur = 0.55 } = drop;
    if (t < t0) return; // before t0: not drawn at all
    u = clamp((t - t0) / dur);
    dy = lerp(-H_DROP, 0, easeOutBack(u)); // overshoot bounce landing
  }
  const iw = img && img.width ? img.width : w;
  const ih = img && img.height ? img.height : w * 0.75;
  const pw = w, ph = (w - border * 2) * (ih / iw) + border * 2;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y + dy);
  ctx.rotate(rot + boilWobble(0.0012));
  // soft shadow (lands with the print)
  ctx.fillStyle = 'rgba(28,24,20,0.18)';
  ctx.filter = 'blur(0px)';
  roundRect(ctx, -pw / 2 + 10, -ph / 2 + 14, pw, ph, 6);
  ctx.fill();
  // white print border
  ctx.fillStyle = '#faf6ec';
  roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 6);
  ctx.fill();
  // photo
  if (img) {
    ctx.save();
    roundRect(ctx, -pw / 2 + border / 2, -ph / 2 + border / 2, pw - border, ph - border, 3);
    ctx.clip();
    ctx.drawImage(img, -pw / 2 + border / 2, -ph / 2 + border / 2, pw - border, (pw - border) * (ih / iw));
    ctx.restore();
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
  void iw; void seed;
}
const H_DROP = 340; // drop height in world px

// noteCard — field-note card with tape corners; drops in like a print.
export function noteCard(ctx, x, y, opts = {}) {
  const { w = 900, h = 560, t0 = 0, t = 0, dur = 0.5, rot = -0.015, alpha = 1 } = opts;
  const inherited = ctx.globalAlpha;
  let dy = 0;
  if (t0 > 0 || t > 0) {
    if (t < t0) return;
    const u = clamp((t - t0) / dur);
    dy = lerp(-H_DROP, 0, easeOutBack(u));
  }
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y + dy);
  ctx.rotate(rot + boilWobble(0.0012));
  ctx.fillStyle = 'rgba(28,24,20,0.16)';
  roundRect(ctx, -w / 2 + 9, -h / 2 + 13, w, h, 5);
  ctx.fill();
  ctx.fillStyle = '#f8f2e0';
  roundRect(ctx, -w / 2, -h / 2, w, h, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(28,24,20,0.25)';
  ctx.lineWidth = 2;
  roundRect(ctx, -w / 2, -h / 2, w, h, 5);
  ctx.stroke();
  // tape corners (translucent gold-tinged strips)
  ctx.fillStyle = 'rgba(201,162,39,0.30)';
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate((s * w) / 2 - s * 26, (s * h) / 2 - s * 26);
    ctx.rotate(s * Math.PI / 4);
    ctx.fillRect(-64, -17, 128, 34);
    ctx.restore();
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// roundRect helper shared by props
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// loadImage — decode a raster into a canvas Image for drawPrint.
export async function loadImage(path) {
  const { loadImage: li } = await import('@napi-rs/canvas');
  return li(path);
}

// boilPt re-export for world files that want it directly
export { boilPt };
