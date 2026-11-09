// world.mjs — the art of film 001: six zones on one 20,000px laid-paper board.
//
// FRAME-REPLICATED LAYOUT (2026-11-08): every text element, print and stroke
// below was measured from the canonical reference MP4 frame-by-frame
// (studio/tools/analysis/{measure_text_bands,text_probe,geometry}.py) and
// inverted to world coordinates using the beat camera keys in timings.mjs.
// Screen anchor per zone: sx = wx - CAMX + 1920, sy = wy - CAMY + 823.
//
// LAW 4/6 guards: caption rows sit clear of viewport edges at every beat pose;
// underlines/circles land only after their text stamps (t0 offsets below).
import { INK, RED, FONT, clamp, lerp, smoothstep, hash } from '../../engine/style.mjs';
import { boilPt, boilWobble, handStroke, handCircle, applyStroke } from '../../engine/ink.mjs';
import { stampText, maskUpText } from '../../engine/text.mjs';
import { drawPaper, drawPrint } from '../../engine/props.mjs';
import { stickman, cow, helix } from '../../engine/characters.mjs';
import { T } from './timings.mjs';

const S = T.scenes;
// Ref typography uses letterspaced monospace caps for captions/labels.
const MONO = "Consolas, 'Courier New', monospace";

// handEllipse — parametric rx/ry hand-drawn oval (engine handCircle is r-only)
function handEllipse(ctx, x, y, rx, ry, opts = {}) {
  const { w = 4, color = '#1c1814', alpha = 1, progress = 1, boil = 2.4, start = -Math.PI / 2, segs = 30 } = opts;
  if (progress <= 0) return;
  const inherited = applyStroke(ctx, { w, color, alpha });
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(boilWobble(0.002));
  ctx.beginPath();
  const sweep = clamp(progress) * Math.PI * 2;
  const n = Math.max(3, Math.round(segs * clamp(progress)));
  for (let i = 0; i <= n; i++) {
    const aa = start + sweep * (i / n);
    const px = Math.cos(aa) * rx + (hash(Math.imul(i + 1, 668265263) ^ Math.imul(x | 0, 73856093)) * 2 - 1) * boil;
    const py = Math.sin(aa) * ry + (hash(Math.imul(i + 1, 374761393) ^ Math.imul(y | 0, 19349663)) * 2 - 1) * boil;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = inherited;
}
// progressive arrow — polyline grows, head strokes appear when done
function arrowGrow(ctx, pts, opts = {}) {
  const { w = 4, color = '#1c1814', alpha = 1, head = 22, progress = 1 } = opts;
  handStroke(ctx, pts, { w, color, alpha, progress });
  if (progress < 1) return;
  const last = pts[pts.length - 1], prev = pts[Math.max(0, pts.length - 3)];
  const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
  for (const da of [Math.PI * 0.82, -Math.PI * 0.82]) {
    handStroke(ctx, [
      { x: last.x, y: last.y },
      { x: last.x + Math.cos(ang + da) * head, y: last.y + Math.sin(ang + da) * head },
    ], { w, color, alpha });
  }
}

// ── real photo assets as physical printed props (LAW 1) ───────────────────
const ASSET_DIR = new URL('./assets/photo-props-src/', import.meta.url);
let IMG_AUROCHS, IMG_CALF, IMG_GOAT, IMG_PASTURE, IMG_MILK;
{
  const { loadImage } = await import('../../engine/props.mjs');
  IMG_AUROCHS = await loadImage(new URL('aurochs_ur-painting.jpg', ASSET_DIR));
  IMG_CALF = await loadImage(new URL('calf_nursing_beef_cow.jpg', ASSET_DIR));
  IMG_GOAT = await loadImage(new URL('goat_billy.jpg', ASSET_DIR));
  IMG_PASTURE = await loadImage(new URL('pasture_nara.jpg', ASSET_DIR));
  IMG_MILK = await loadImage(new URL('milk_glass.jpg', ASSET_DIR));
}

// ── zone dim-back ─────────────────────────────────────────────────────────
const ZONES = ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast'];
function zoneAlpha(i, t) {
  const last = i === ZONES.length - 1;
  const enter = i === 0 ? -1 : S[ZONES[i]] - 0.25;
  // Fade out well before next camera arrival to prevent edge bleed during moves.
  const exit = last ? Infinity : S[ZONES[i + 1]] - 1.05;
  const a = clamp(smoothstep(enter, enter + 0.3, t) * (last ? 1 : 1 - smoothstep(exit, exit + 0.5, t)));
  return Number.isFinite(a) ? a : 0;
}

// ── letterspaced text (ref style): centered mask-up / stamp ──────────────
function lsWidth(ctx, text, size, track, font) {
  ctx.font = `${size}px ${font}`;
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + track;
  return w - track;
}
function lsMaskUp(ctx, x, y, text, opts = {}) {
  const { size = 100, track = 0, color = INK, font = MONO, t0 = 0, t1 = 1, t, alpha = 1, rot = 0 } = opts;
  if (t < t0 || alpha <= 0.001) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  const u = clamp((t - t0) / Math.max(0.0001, t1 - t0));
  const w = lsWidth(ctx, text, size, track, font);
  ctx.translate(x, y);
  ctx.rotate(rot + 0.0);
  // clip grows left->right (ref reveals left-to-right)
  ctx.beginPath();
  ctx.rect(-w / 2 - 4, -size, (w + 8) * u, size * 2);
  ctx.clip();
  ctx.font = `${size}px ${font}`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  let cx = -w / 2;
  for (const ch of text) {
    ctx.fillText(ch, cx, 0);
    cx += ctx.measureText(ch).width + track;
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
}
function monoStamp(ctx, x, y, text, opts = {}) {
  const { size = 100, track = 0, color = INK, t0 = 0, t, rot = 0, alpha = 1 } = opts;
  if (t < t0) return;
  lsMaskUp(ctx, x, y, text, { size, track, color, t0: t0, t1: t0 + 0.12, t, alpha, rot });
}

// ── genes doc card (ref: big bordered sheet, no tape) ─────────────────────
function docCard(ctx, x, y, w, h, t0, t) {
  if (t < t0) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited;
  const u = clamp((t - t0) / 0.6);
  const dy = lerp(-260, 0, u);
  ctx.translate(x, y + dy);
  ctx.fillStyle = 'rgba(28,24,20,0.15)';
  ctx.fillRect(-w / 2 + 12, -h / 2 + 18, w, h);
  ctx.fillStyle = '#f8f2e2';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = 'rgba(28,24,20,0.28)';
  ctx.lineWidth = 3;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// ── genes map pane: light grid + hand coastlines + red origin dot ─────────
function mapPane(ctx, x, y, w, h, t0, t) {
  if (t < t0) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited;
  ctx.translate(x, y);
  // pane glass
  ctx.fillStyle = 'rgba(250,246,236,0.92)';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = 'rgba(28,24,20,0.30)';
  ctx.lineWidth = 3;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  // grid
  ctx.strokeStyle = 'rgba(28,24,20,0.12)';
  ctx.lineWidth = 2;
  const n = 5;
  for (let i = 1; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + (i * w) / n, -h / 2);
    ctx.lineTo(-w / 2 + (i * w) / n, h / 2);
    ctx.moveTo(-w / 2, -h / 2 + (i * h) / n);
    ctx.lineTo(w / 2, -h / 2 + (i * h) / n);
    ctx.stroke();
  }
  // coastlines (stylized, hand strokes, gray ink)
  const grey = 'rgba(60,54,48,0.75)';
  const coast = (pts, prog) => handStroke(ctx, pts.map(([px, py]) => boilPt(px, py, 1)), { w: 5, color: grey, progress: prog });
  const p = clamp((t - t0) / 1.1);
  coast([[-300, -330], [-180, -400], [-60, -370], [-90, -300], [-40, -280]], p);          // Scandinavia
  coast([[-380, -180], [-300, -240], [-210, -210], [-260, -150], [-330, -120]], p);       // Britain
  coast([[-260, -40], [-120, -60], [0, -30], [120, -50], [200, 20], [150, 90], [40, 60], [-80, 40], [-190, 50]], p); // mainland
  coast([[60, 60], [110, 140], [90, 220], [40, 160]], p);                                  // Italy boot
  coast([[-340, 190], [-220, 230], [-120, 210]], p);                                       // Iberia
  ctx.restore();
  ctx.globalAlpha = inherited;
}

export function drawWorld(ctx, t) {
  drawPaper(ctx, 0, -1000, T.BOARD_W, T.BOARD_H, 7);
  zoneHook(ctx, t, zoneAlpha(0, t));
  zoneIdea(ctx, t, zoneAlpha(1, t));
  zoneMilk(ctx, t, zoneAlpha(2, t));
  zoneTimeline(ctx, t, zoneAlpha(3, t));
  zoneGenes(ctx, t, zoneAlpha(4, t));
  zoneToast(ctx, t, zoneAlpha(5, t));
}

// ── A · HOOK (cam push in timings.mjs): numerals left, aurochs print right,
// hunter aims at print. LAW 4: keep numerals/caption inside safe view at all
// hook camera poses (push 0.76→1.10).
function zoneHook(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // print — keep inside hook view; avoid left-edge during transition
  // aurochs lands during "ten thousand years ago" setup
  drawPrint(ctx, IMG_AUROCHS, 2220, 1120, { w: 1320, rot: 0.01, drop: { t0: 0.55, t, dur: 0.55 } });
  if (t >= 3.75) handCircle(ctx, 2205, 1135, 515, { w: 10, color: RED, progress: clamp((t - 3.75) / 0.65) });
  // numerals — safe at hook cam (z~0.84-0.92): keep y comfortably below top edge
  stampText(ctx, 540, 980,  '10,000',    { size: 330, t0: 0.22, t, rot: -0.004 });
  stampText(ctx, 525, 1215, 'YEARS AGO', { size: 154, t0: 0.58, t, rot: -0.006 });
  // hunter — appears as VO introduces the hunter ("one starving hunter..."), not rushed
  const hunterA = 1 - smoothstep(S.idea - 0.95, S.idea - 0.55, t);
  if (hunterA > 0.01 && t >= 1.25) {
    ctx.save(); ctx.globalAlpha *= hunterA;
    stickman(ctx, 430, 1745, { h: 330, pose: 'spear', t, progress: clamp((t - 1.25) / 0.95) });
    if (t > 4.45) { // arrow lands near "face to face" end of hook
      arrowGrow(ctx, [boilPt(610, 1570, 2), boilPt(980, 1470, 2), boilPt(1380, 1365, 2), boilPt(1720, 1260, 2)], { w: 8, color: RED, head: 28, progress: clamp((t - 4.45) / 0.6) });
    }
    ctx.restore();
  }
  // caption — "face to face with a wild cow" (late in hook VO)
  if (t >= 4.05 && t < S.idea + 0.3) {
    lsMaskUp(ctx, 1560, 1715, 'THE WILD COW', { size: 130, track: 16, t0: 4.15, t1: 4.85, t, alpha: 1 - smoothstep(S.idea - 0.4, S.idea + 0.2, t) });
  }
  ctx.restore();
}

// ── B · IDEA (cam 4366,1200): calf print left, typed stack right ─────────
// Ref (8.33s): calf/photo+circle occupy left; typed lines sit right with clear
// gap (no overlap). Lines revealed in sync with VO, centered on right half.
function zoneIdea(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // calf appears with "watched her calf drink..." (early in idea VO)
  drawPrint(ctx, IMG_CALF, 3180, 1140, { w: 1180, rot: -0.012, drop: { t0: S.idea + 0.35, t, dur: 0.55 } });
  if (t >= S.idea + 0.85) {
    const p = clamp((t - (S.idea + 0.85)) / 0.5);
    handCircle(ctx, 3180, 1140, lerp(640, 515, p), { w: 10, color: RED, progress: p });
  }
  // typed question — paced to VO (line 2 lands on "What if I drank that too?")
  for (const line of TYPED_LINES) typewriterLine(ctx, line, t);
  ctx.restore();
}

// VO idea (5.649–11.625, 5.976s): "Then he watched her calf drink..." (~0-1.8s)
// "...and had the wildest idea in human history." (~1.8-4.15s)
// "What if I drank that too?" (~4.15-5.98s)
const TYPED_LINES = [
  { text: 'WHAT IF I',         x: 5440, y: 995,  t0: S.idea + 2.55, cps: 11, size: 172 }, // builds with "wildest idea..."
  { text: 'DRANK THAT TOO?',   x: 5440, y: 1260, t0: S.idea + 4.15, cps: 13, size: 184 }, // lands on the spoken question
];
function typewriterLine(ctx, line, t) {
  if (t < line.t0) return;
  const n = Math.min(line.text.length, Math.floor((t - line.t0) * line.cps));
  if (n <= 0) return;
  ctx.save();
  const step = Math.floor(t * 8);
  ctx.font = `${line.size}px ${FONT.display}, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = INK;
  let total = 0;
  for (const ch of line.text) total += ctx.measureText(ch).width;
  let cx = line.x - total / 2;
  for (let i = 0; i < n; i++) {
    const ch = line.text[i];
    const jx = (hash(Math.imul(i + 1, 73856093) ^ Math.imul(step + 1, 19349663)) * 2 - 1) * 1.4;
    const jy = (hash(Math.imul(i + 1, 19349663) ^ Math.imul(step + 1, 73856093)) * 2 - 1) * 1.4;
    ctx.fillText(ch, cx + jx, line.y + jy);
    cx += ctx.measureText(ch).width;
  }
  ctx.restore();
}

// ── C · MILK (cam y 1180): "MILK." + caption timed to VO, cow walks in view.
// VO 11.725–16.573: "Milk. Fresh food every single day..."
function zoneMilk(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // red zigzag accent (left, not under text)
  if (t > S.milk + 0.2) {
    handStroke(ctx, [boilPt(5960, 930, 2), boilPt(5910, 1090, 2), boilPt(6030, 1240, 2), boilPt(5940, 1390, 2)], { w: 11, color: RED, progress: clamp((t - (S.milk + 0.2)) / 0.9) });
  }
  // engine cow walks through (paced; fades before timeline transition)
  if (t > S.milk + 0.2) {
    const wt = t - (S.milk + 0.2);
    const ca = clamp(wt / 0.55) * (1 - smoothstep(S.timeline - 0.95, S.timeline - 0.5, t));
    if (ca > 0.01) cow(ctx, 6500 + wt * 38, 1665, { s: 385, t, walk: wt * 0.36, alpha: ca });
  }
  // "Milk." — immediate
  maskUpText(ctx, 7640, 1110, 'MILK.', { size: 500, t0: S.milk + 0.02, t1: S.milk + 0.48, t, rot: -0.007 });
  // "Fresh food every single day..." follows naturally
  if (t >= S.milk + 0.55) {
    lsMaskUp(ctx, 7600, 1345, 'FRESH FOOD. EVERY SINGLE DAY.', {
      size: 84, track: 6, color: 'rgb(96,89,81)', font: FONT.sans,
      t0: S.milk + 0.65, t1: S.milk + 2.45, t, alpha: 1 - smoothstep(S.timeline - 0.45, S.timeline + 0.3, t),
    });
  }
  ctx.restore();
}

// ── D · TIMELINE (cam 11280,1320): rail + goat/pasture + '9000 BC' timed to VO.
// VO 16.673–21.772: "Goats and sheep came first, around nine thousand BC..."
function zoneTimeline(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const ru = clamp((t - (S.timeline + 0.1)) / 0.8);
  // rail kept within timeline camera safe span (extra margin for wobble)
  handStroke(ctx, [boilPt(9720, 1485, 2), boilPt(11280, 1478, 2), boilPt(12760, 1485, 2)], { w: 7, progress: ru });
  // goat print + tick
  // "Goats and sheep came first..." (early)
  drawPrint(ctx, IMG_GOAT, 10350, 1045, { w: 860, rot: -0.015, drop: { t0: S.timeline + 0.3, t, dur: 0.55 } });
  if (t > S.timeline + 0.8) handStroke(ctx, [boilPt(10350, 1435, 1), boilPt(10350, 1535, 1)], { w: 6, progress: clamp((t - (S.timeline + 0.8)) / 0.3) });
  // "around nine thousand BC" (~2.0-3.0s)
  if (t >= S.timeline + 2.0) {
    monoStamp(ctx, 10365, 1655, '9000 BC', { size: 96, track: 22, t0: S.timeline + 2.15, t, rot: -0.004, alpha: 1 - smoothstep(S.genes - 0.45, S.genes + 0.45, t) });
  }
  if (t >= S.timeline + 2.55) {
    handEllipse(ctx, 10355, 1662, 285, 105, { w: 9, color: RED, progress: clamp((t - (S.timeline + 2.55)) / 0.6) });
  }
  // "Cows followed fast." (~3.4-4.9s)
  drawPrint(ctx, IMG_PASTURE, 12220, 1000, { w: 1040, rot: 0.015, drop: { t0: S.timeline + 3.35, t, dur: 0.55 } });
  if (t > S.timeline + 3.85) handStroke(ctx, [boilPt(12220, 1435, 1), boilPt(12220, 1535, 1)], { w: 6, progress: clamp((t - (S.timeline + 3.85)) / 0.28) });
  if (t >= S.timeline + 4.1) {
    handStroke(ctx, [boilPt(10440, 1315, 2), boilPt(11320, 1260, 2), boilPt(12120, 1310, 2)], { w: 10, color: RED, progress: clamp((t - (S.timeline + 4.1)) / 0.5) });
  }
  ctx.restore();
}

// ── E · GENES (cam 12820,1405): card framed safely in view.
// VO 21.872–26.241: "And we even evolved for it..."
function zoneGenes(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // card centered in camera-safe area (top >= ~720 in world at z1)
  docCard(ctx, 12820, 1410, 2360, 1420, S.genes + 0.25, t);
  lsMaskUp(ctx, 12210, 860, 'LACTASE PERSISTENCE', { size: 84, track: 11, t0: S.genes + 0.75, t1: S.genes + 1.35, t });
  const rungV = [-0.0149, 0.0038, 0.0234, 0.077, 0.1111, 0.1451, 0.2489, 0.2838, 0.3179, 0.3528, 0.3868, 0.4557, 0.4906, 0.5247, 0.5587, 0.5936, 0.6966, 0.7315, 0.7664, 0.8004, 0.8345, 0.9383, 0.9723];
  helix(ctx, 12210, 1415, { w: 390, h: 1040, turns: 2.5, t, progress: clamp((t - (S.genes + 0.95)) / 1.25), rungV, mutation: false });
  // red mutation rung
  if (t > S.genes + 1.45) {
    const p = clamp((t - (S.genes + 1.45)) / 0.45);
    handStroke(ctx, [boilPt(12072, 1145, 1), boilPt(12210, 1145, 1), boilPt(12348, 1145, 1)], { w: 10, color: RED, progress: p });
  }
  // "And we even evolved for it." (~0.2-1.4s in VO)
  if (t >= S.genes + 0.2 && t < S.toast + 0.15) {
    const ev = smoothstep(S.genes + 0.2, S.genes + 0.55, t) * (1 - smoothstep(S.toast - 0.4, S.toast + 0.1, t));
    lsMaskUp(ctx, 12210, 970, 'WE EVOLVED FOR IT.', { size: 74, track: 14, t0: S.genes + 0.25, t1: S.genes + 0.85, t, alpha: ev });
  }
  // "Adults who could drink milk survived and spread." (~1.4-4.3s) → map spread
  mapPane(ctx, 13410, 1455, 900, 820, S.genes + 1.45, t);
  if (t > S.genes + 2.1) {
    const dp = clamp((t - (S.genes + 2.1)) / 0.4);
    ctx.save(); ctx.globalAlpha *= 0.18 * dp;
    ctx.strokeStyle = 'rgba(60,54,48,0.45)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(13400, 1415, 52, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= dp; ctx.fillStyle = 'rgb(196,60,46)';
    ctx.beginPath(); ctx.arc(13400,1415,11,0,Math.PI*2); ctx.fill();
    ctx.fillRect(13362,1410,26,9);
    ctx.restore();
  }
  // ghost rows (subtle, inside lower card area)
  if (t > S.genes + 1.1) {
    for (const gy of [1925, 1962, 1999]) {
      ctx.save(); ctx.globalAlpha *= 0.18;
      ctx.strokeStyle = 'rgba(60,54,48,0.75)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(11760, gy); ctx.lineTo(13880, gy); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}


function zoneToast(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // ONE milk pour print (no duplicate). Bottom kept clear of viewport edge.
  drawPrint(ctx, IMG_MILK, 17020, 1335, { w: 980, rot: 0.004, drop: { t0: S.toast + 0.12, t, dur: 0.48 } });
  // VO toast (5.28s): setup ~0-2.3s ("next time you pour... tasting"), punchline ~2.3-5.2s
  stampText(ctx, 17000, 930,  'THE BRAVEST SNACK', { size: 128, t0: S.toast + 2.55, t, rot: -0.008 });
  stampText(ctx, 17000, 1065, 'IN HISTORY.',        { size: 128, t0: S.toast + 3.25, t, rot: -0.005 });
  // Underline below last line, ≥40px clearance (LAW 6), lands on last spoken word.
  const [u0, u1] = T.underlineF;
  if (t >= u0) {
    handStroke(ctx, [boilPt(16720, 1155, 2), boilPt(17000, 1150, 2), boilPt(17280, 1155, 2)], { w: 10, color: RED, progress: clamp((t - u0) / (u1 - u0)) });
  }
  ctx.restore();
}

export const ZONE_X = { hook: 1400, idea: 4366, milk: 7604, timeline: 10900, genes: 13000, toast: 17000 };
