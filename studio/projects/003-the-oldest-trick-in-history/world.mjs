// world.mjs — The Oldest Trick in the History Still Works, Right?
// Paper world, ink cast, real licensed prints (LAW 1/9), retiled Song Nian vibe plate.
// Every stroke boils; every alpha multiplies.
import { INK, RED, FONT, clamp, lerp, easeInQuart, easeOutQuart, hash, GOLD } from '../../engine/style.mjs';
import { drawPaper, drawBackgroundPlate, drawPrint, roundRect, noteCard } from '../../engine/props.mjs';
import { handStroke, handCircle, handLine, arrow } from '../../engine/ink.mjs';
import { stampText, typewriter, maskUpText } from '../../engine/text.mjs';
import { T } from './timings.mjs';
import { camAt } from '../../engine/camera.mjs';

const S = T.scenes;
const REDF = RED;

// LAW 4: art must never enter the outer 60 design-px band on any frame.
// fadeExit dissolves an element BEFORE its left edge crosses the band
// (sxL = element's left edge, camX = camera center). Camera always moves right.
const camXNow = (t) => camAt(T.rail, t).x;
// Frame-edge calibrated: alpha 0 only when the element's edge is within the
// 60px outer band on the CANVAS, full opacity once it is 200 canvas-px inside.
// (The old zoom-1.0 constants ghosted assets that were still well in frame at
// zoom 0.92-0.97 — the "washed-out asset" defect.)
const EDGE_Z = 0.95;
const fadeExit = (sxL, camX) => clamp(((sxL - camX) * EDGE_Z + 1220) / 140, 0, 1);
const fadeEntry = (sxR, camX) => clamp((1220 - (sxR - camX) * EDGE_Z) / 140, 0, 1);

const ASSET_DIR = new URL('./assets/clips/', import.meta.url);
const { loadImage } = await import('../../engine/props.mjs');
const { createCanvas } = await import('@napi-rs/canvas');
// press photo grade-match — lift contrast/saturation once at load (paper-world solidity)
const graded = async (url) => {
  const img = await loadImage(url);
  const c = createCanvas(img.width, img.height);
  const g = c.getContext('2d');
  g.filter = 'contrast(1.22) saturate(1.15) brightness(1.03)';
  g.drawImage(img, 0, 0);
  return c;
};

const IMG = {
  jh: await loadImage(new URL('jh_2023.jpg', ASSET_DIR)),
  mataHari: await loadImage(new URL('mata_hari.jpg', ASSET_DIR)),
  wolf: await loadImage(new URL('markus_wolf.jpg', ASSET_DIR)),
  witt: await loadImage(new URL('monica_witt.png', ASSET_DIR)),
  vibe: await loadImage(new URL('songnian_landscape.jpg', ASSET_DIR)),
  hq: await loadImage(new URL('hq.jpg', ASSET_DIR)),
  sg: await loadImage(new URL('sg.jpg', ASSET_DIR)),
  wh: await loadImage(new URL('wh.jpg', ASSET_DIR)),
  bj: await loadImage(new URL('bj.jpg', ASSET_DIR)),
  hpc: await loadImage(new URL('hpc.jpg', ASSET_DIR)),
  racks: await loadImage(new URL('racks.jpg', ASSET_DIR)),
  nyse: await loadImage(new URL('nyse.jpg', ASSET_DIR)),
  palace: await loadImage(new URL('palace.jpg', ASSET_DIR)),
  alice: await graded(new URL('alice_press.jpg', ASSET_DIR)),
};

// vibe tile — built ONCE at module load. The source Song Nian scan is 4000px
// wide; a 7200px tile was an upscale that cost ~50-150ms/frame in Skia's
// multiply path (resample cliff above ~3200px). 2880×1920 is a DOWNscale
// (sharper than before) and draws in ~4ms; the α 0.075 wash hides the softer
// upscale at camera zoom. TILE_W/H are the canvas px; the world rect a tile
// covers is still 7200×(BOARD_H+2400) in world.mjs below.
const TILE_W = 2880, TILE_H = 1920;
const vibeTile = (() => {
  const c = createCanvas(TILE_W, TILE_H);
  const g = c.getContext('2d');
  g.drawImage(IMG.vibe, 0, 0, TILE_W, TILE_H);
  const fw = Math.round(300 * TILE_W / 7200);
  const feather = (x0, out) => {
    const grad = g.createLinearGradient(x0, 0, x0 + fw, 0);
    grad.addColorStop(0, out ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
    grad.addColorStop(1, out ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)');
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = grad;
    g.fillRect(x0, 0, fw, TILE_H);
    g.restore();
  };
  feather(0, false); feather(TILE_W - fw, true);
  return c;
})();

// zone dim-back (fade in over `dur`, dim after `outT`, optional floor echo)
const zoneAlpha = (t, inT, outT, dur = 0.7, floor = 0) =>
  clamp((t - inT + dur) / dur, 0, 1) * Math.max(floor, clamp(1 - Math.max(0, (t - outT) / 1.1), 0, 1));

// photo print with in-situ fade (LAW 4): alpha ramps in at t0, rides the zone,
// and dissolves before its left edge reaches the outer band.
const printA = (t, t0, outT, sxL) =>
  clamp((t - t0) / 0.7, 0, 1) * clamp((outT - t) / 1.2, 0, 1) * fadeExit(sxL, camXNow(t));

function chipGlyph(ctx, x, y, s, t, t0) {
  const u = clamp((t - t0) / 1.6);
  if (u <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  // die body draws itself
  handStroke(ctx, [
    { x: -s, y: -s * 0.72 }, { x: s, y: -s * 0.72 }, { x: s, y: s * 0.72 },
    { x: -s, y: s * 0.72 }, { x: -s, y: -s * 0.72 },
  ], { w: 9, color: INK, boil: 1.8, progress: u });
  // inner die
  const iu = clamp((t - t0 - 0.5) / 1.0);
  if (iu > 0) {
    handStroke(ctx, [
      { x: -s * 0.52, y: -s * 0.34 }, { x: s * 0.52, y: -s * 0.34 },
      { x: s * 0.52, y: s * 0.34 }, { x: -s * 0.52, y: s * 0.34 }, { x: -s * 0.52, y: -s * 0.34 },
    ], { w: 6, color: INK, boil: 1.6, progress: iu });
  }
  // pins (9 per side)
  const pu = clamp((t - t0 - 0.7) / 0.9);
  if (pu > 0) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n;
      const px = -s + f * 2 * s;
      const len = s * 0.34 * pu;
      handLine(ctx, px, -s * 0.72, px, -s * 0.72 - len, { w: 5, color: INK, boil: 1.2 });
      handLine(ctx, px, s * 0.72, px, s * 0.72 + len, { w: 5, color: INK, boil: 1.2 });
    }
  }
  // N-label glyph inside die (our own mark — not NVIDIA's logo)
  ctx.globalAlpha *= clamp((t - t0 - 0.9) / 0.6, 0, 1);
  ctx.fillStyle = INK;
  ctx.font = `700 ${s * 0.52}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', 0, 1);
  ctx.restore();
}

function memoCard(ctx, x, y, t) {
  // Illustrative memo — clearly labelled; NOT a real document.
  const T0 = 80.6;
  const u = clamp((t - T0) / 0.7);
  if (u <= 0) return;
  noteCard(ctx, x, y, { w: 1020, h: 560, t0: T0, t, dur: 0.6, rot: -0.012, alpha: 1 });
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.012);
  const a = clamp((t - T0 - 0.3) / 0.7, 0, 1);
  ctx.globalAlpha *= a;
  ctx.fillStyle = INK;
  ctx.font = '700 52px "Noto Serif", serif';
  ctx.textAlign = 'left';
  ctx.fillText('M E M O R A N D U M', -390, -150);
  ctx.fillText('SPRING 2026', -390, -106);
  // redaction bars
  ctx.fillStyle = INK;
  const bars = [
    [-390, -52, 300], [-60, -52, 170],
    [-390, -6, 220], [-140, -6, 280],
    [-390, 40, 330], [-30, 40, 150],
    [-390, 86, 180], [-180, 86, 260],
  ];
  for (const [bx, by, bw] of bars) roundRect(ctx, bx, by, bw, 22, 3), ctx.fill();
  // slow red scan line sweeping the redacted bars — the file is "live"
  const sweep = ((t - T0) * 0.75) % 1.6;
  if (sweep <= 1) {
    const sy = -52 + sweep * 140;
    ctx.globalAlpha *= 0.5 * clamp(1 - sweep, 0, 1) + 0.25;
    handLine(ctx, -390, sy, 330, sy, { w: 3, color: REDF, boil: 0.5 });
  }
  ctx.restore();
  // caption — honest label
  ctx.save();
  ctx.globalAlpha *= clamp((t - T0 + 1.0) / 0.7, 0, 1) * 0.82;
  ctx.fillStyle = INK;
  ctx.font = 'italic 31px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('illustration — no public memo exists', x, y + 330);
  ctx.restore();
}

function chainFlow(ctx, x, y, t) {
  // MEGASPEED -> SPEEDMATRIX chain cards + arrows
  const u1 = clamp((t - 139.2) / 0.5);
  const u2 = clamp((t - 149.4) / 0.5);
  const u3 = clamp((t - 153.0) / 0.5);
  if (u1 <= 0) return;
  const camX = camXNow(t);
  const card = (cx, label, sub, u, accent) => {
    const fx = fadeExit(cx - 320, camX);
    if (u <= 0 || fx <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= u * fx;
    ctx.translate(cx, y);
    ctx.fillStyle = '#faf3e3';
    roundRect(ctx, -330, -104, 660, 208, 10); ctx.fill();
    ctx.strokeStyle = accent ? REDF : INK;
    ctx.lineWidth = 6;
    roundRect(ctx, -330, -104, 660, 208, 10); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '700 62px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -8);
    ctx.font = '36px "Noto Serif", serif';
    ctx.fillText(sub, 0, 50);
    ctx.restore();
  };
  card(x - 700, 'MEGASPEED', 'Singapore · cloud compute', u1, false);
  card(x + 700, 'SPEEDMATRIX', 'Malaysia · the buyer', u2, true);
  if (u1 > 0 && u2 > 0) {
    arrow(ctx, [{ x: x - 380, y }, { x: x + 380, y }], { w: 6, color: INK, progress: clamp((t - 150.6) / 0.5) });
    // the money literally flows — dashed red rail + travelling $ markers
    const fA = clamp((t - 151.0) / 0.6, 0, 1);
    if (fA > 0.01) {
      ctx.save(); ctx.globalAlpha *= fA;
      ctx.strokeStyle = REDF; ctx.lineWidth = 5; ctx.setLineDash([26, 22]);
      ctx.lineDashOffset = -((t - 151.0) * 150) % 48;
      ctx.beginPath(); ctx.moveTo(x - 372, y + 46); ctx.lineTo(x + 372, y + 46); ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 3; i++) {
        const f = (t * 0.22 + i / 3) % 1;
        ctx.fillStyle = REDF;
        ctx.font = '700 38px "Archivo Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', x - 360 + f * 720, y - 52);
      }
      ctx.restore();
    }
    const mA = clamp((t - 151.4) / 0.5, 0, 1);
    if (mA > 0.01) {
      ctx.save(); ctx.globalAlpha *= mA;
      ctx.translate(x, y - 128); ctx.rotate(-0.05);
      ctx.fillStyle = REDF; ctx.font = '56px "Caveat"'; ctx.textAlign = 'center';
      ctx.fillText('follow the money ↓', 0, 0); ctx.restore();
    }
  }
  const fxB = fadeExit(x - 190, camXNow(t));
  if (fxB > 0.01) {
    ctx.save();
    ctx.globalAlpha *= u3 * fxB;
    ctx.font = '700 184px "Archivo Black", sans-serif';
    ctx.fillStyle = REDF;
    ctx.textAlign = 'center';
    ctx.fillText('$4.8B', x + 160, y + 380);
    ctx.restore();
  }
}

function stockChart(ctx, x, y, t) {
  const u = clamp((t - 243.2) / 2.6);
  if (u <= 0) return;
  const pts = [];
  const n = 46;
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    const jag = (hash(Math.imul(i + 3, 73856093)) - 0.5) * 50;
    let dy = jag;
    if (f > 0.78) dy += (f - 0.78) / 0.22 * 430; // the cliff
    pts.push({ x: x - 800 + f * 1600, y: y + dy });
  }
  const upto = Math.floor(u * (pts.length - 1)) + 1;
  handStroke(ctx, pts.slice(0, upto), { w: 8, color: INK, boil: 1.2 });
  // faint ruled reference grid + plumb leader down to the −4.3% stamp
  ctx.save();
  ctx.globalAlpha *= 0.14;
  for (const gy of [590, 710, 830]) handLine(ctx, 48350, gy, 49600, gy, { w: 2, color: INK, boil: 0.5 });
  ctx.restore();
  const pu = clamp((t - 249.0) / 0.5, 0, 1);
  if (pu > 0) handLine(ctx, 49600, 400, 49600, 400 + 505 * pu, { w: 3, color: REDF, boil: 0.8 });
  // −4.3% annotation at the cliff foot (lands when VO says the number)
  const au = clamp((t - 249.4) / 0.6);
  if (au > 0) {
    handLine(ctx, x + 540, y + 445, x + 540, y + 495, { w: 5, color: REDF, boil: 1 });
    ctx.save();
    ctx.globalAlpha *= au;
    ctx.fillStyle = REDF;
    ctx.font = '700 56px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('−4.3%', x + 540, y + 515);
    ctx.restore();
  }
}

function ledgerDuel(ctx, x, y, t) {
  // THE RECORD, BOTH WAYS — two statement cards (replaces the text-table).
  // Cards fade IN SITU (t0: 0 — never drop across the top safe band, LAW 4).
  const card = (cx, head, sub, rows, accent, inT, rot) => {
    const a = clamp((t - inT) / 0.7);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    noteCard(ctx, cx, y, { w: 820, h: 580, t0: 0, t: 0, rot, alpha: 1 });
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(rot);
    ctx.globalAlpha *= clamp((t - inT - 0.4) / 0.5, 0, 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = accent ? REDF : INK;
    ctx.font = `700 54px "${FONT.display}", sans-serif`;
    ctx.fillText(head, 0, -206);
    ctx.fillStyle = INK;
    ctx.font = 'italic 26px "Noto Serif", serif';
    ctx.fillText(sub, 0, -156);
    ctx.font = '29px "Noto Serif", serif';
    ctx.textAlign = 'left';
    rows.forEach((r, i) => ctx.fillText(r, -342, -88 + i * 82));
    ctx.restore();
    ctx.restore();
  };
  card(x - 560, 'REPORTED', 'anonymous sources', [
    '— CIA: described as an asset',
    '— she vanished, 2026',
    '— FT: a “romance”, reported',
    '— no document, no charge',
  ], false, 110.2, -0.01);
  card(x + 480, 'DENIED / UNCONFIRMED', 'or flatly denied', [
    '— China: “smears… slander”',
    '— Singapore MHA: no probes',
    '— NBC: not independently',
    '— confirmed · CIA silent',
  ], true, 110.8, 0.01);
}

function interlude(ctx, x, y, t, t0, adlib = '') {
  // chapter-break flourish for empty transit bands (LAW 8 dead-air rule) — ornament, no claims
  const a = clamp((t - t0) / 0.5) * clamp((t0 + 6.0 - t) / 1.0);
  if (a <= 0.01) return;
  const p = clamp((t - t0) / 0.7);
  const camX = camXNow(t);
  const fx = fadeExit(x - 520, camX) * fadeEntry(x + 520, camX);
  if (fx <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a * fx;
  handLine(ctx, x - 300, y + 120, x - 70, y + 120, { w: 9, color: INK, boil: 1.6, progress: p });
  handLine(ctx, x + 70, y + 120, x + 300, y + 120, { w: 9, color: INK, boil: 1.6, progress: p });
  if (adlib) {
    ctx.globalAlpha *= clamp((t - t0 - 0.2) / 0.4, 0, 1);
    ctx.translate(x, y - 60); ctx.rotate(-0.06);
    ctx.fillStyle = REDF;
    ctx.font = '86px "Caveat"';
    ctx.textAlign = 'center';
    ctx.fillText(adlib, 0, 0);
  } else {
    ctx.fillStyle = REDF;
    ctx.beginPath(); ctx.arc(x, y + 120, 14, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(x - 385, y + 120, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 385, y + 120, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── v19 hero-art helpers ─────────────────────────────────────────────────
// print geometry (drawPrint border=34) — used to root strings/crop marks
const printH = (img, w) => (w - 68) * (img.height / img.width) + 68;
const printBottom = (img, w, cy) => cy + printH(img, w) / 2;

// wax-seal chop — double square + abstract seal-script bars (no glyph risk)
function sealChop(ctx, x, y, s, t, t0) {
  const u = clamp((t - t0) / 0.6);
  if (u <= 0) return;
  ctx.save();
  ctx.globalAlpha *= u; ctx.translate(x, y); ctx.rotate(-0.02);
  ctx.strokeStyle = REDF; ctx.lineCap = 'square';
  for (const [inset, lw] of [[0, 9], [s * 0.18, 5]]) {
    const e = s - inset;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(-e, -e); ctx.lineTo(e, -e); ctx.lineTo(e, e); ctx.lineTo(-e, e); ctx.closePath();
    ctx.stroke();
  }
  ctx.lineWidth = 6;
  for (const [ry, rx0, rx1] of [[-0.42, -0.4, 0.4], [-0.12, -0.28, 0.1], [0.2, -0.42, 0.42], [0.46, -0.1, 0.3]]) {
    ctx.beginPath(); ctx.moveTo(rx0 * s, ry * s); ctx.lineTo(rx1 * s, ry * s); ctx.stroke();
  }
  ctx.restore();
}

// press-sheet registration ticks around a print (documentary scan feel)
function cropMarks(ctx, x, y, w, h, t, t0) {
  const u = clamp((t - t0) / 0.5);
  if (u <= 0) return;
  ctx.save(); ctx.globalAlpha *= u * 0.7; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  const hw = w / 2 + 14, hh = h / 2 + 14, len = 26;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath();
    ctx.moveTo(x + sx * hw, y + sy * hh - sy * len);
    ctx.lineTo(x + sx * hw, y + sy * hh);
    ctx.lineTo(x + sx * hw - sx * len, y + sy * hh);
    ctx.stroke();
  }
  ctx.restore();
}

// paperclip on the memo (illustration prop, drawn)
function paperclip(ctx, x, y, t, t0) {
  const u = clamp((t - t0) / 0.5);
  if (u <= 0) return;
  ctx.save(); ctx.globalAlpha *= u; ctx.translate(x, y); ctx.rotate(0.38);
  ctx.strokeStyle = 'rgba(58,56,52,0.85)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  roundRect(ctx, -18, -56, 36, 112, 18); ctx.stroke();
  roundRect(ctx, -4, -40, 8, 78, 4); ctx.stroke();
  ctx.restore();
}

// masking tape strip (evidence-wall hold)
function tape(ctx, x, y, w, rot, alpha) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(206,188,150,0.8)';
  roundRect(ctx, -w / 2, -20, w, 40, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(120,105,80,0.3)'; ctx.lineWidth = 1.5;
  roundRect(ctx, -w / 2, -20, w, 40, 3); ctx.stroke();
  ctx.restore();
}

// rough red circle — draws on, wobbles with the boil (S11 closer)
function roughCircle(ctx, cx, cy, rx, ry, t, t0, seed = 23) {
  const u = clamp((t - t0) / 0.8);
  if (u <= 0) return;
  ctx.save(); ctx.globalAlpha *= Math.min(1, u * 1.3);
  ctx.strokeStyle = REDF; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath();
  const n = 60, upto = Math.ceil(n * u);
  for (let k = 0; k <= upto; k++) {
    const a = -Math.PI * 0.62 + (k / n) * Math.PI * 2.0;
    const wob = 1 + (hash(seed * 131 + k * 7) - 0.5) * 0.035;
    const px = cx + Math.cos(a) * rx * wob, py = cy + Math.sin(a) * ry * wob;
    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}

// PCB traces — the chip is wired into the world (S02 hero)
function circuitTraces(ctx, t, t0) {
  const u = clamp((t - t0) / 1.4);
  if (u <= 0) return;
  ctx.save(); ctx.globalAlpha *= 0.7;
  handStroke(ctx, [{ x: 7128, y: 470 }, { x: 6790, y: 470 }, { x: 6650, y: 408 }], { w: 4, color: INK, boil: 1.1, progress: clamp(u * 1.5) });
  handStroke(ctx, [{ x: 7128, y: 560 }, { x: 6840, y: 560 }, { x: 6700, y: 508 }], { w: 4, color: INK, boil: 1.1, progress: clamp(u * 1.5 - 0.35) });
  for (const [tx, ty] of [[6700, 508], [6650, 408]]) {
    if (clamp(u * 1.5 - 0.6) <= 0) continue;
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function evidenceWall(ctx, x, y, t) {
  const u = clamp((t - 261.3) / 0.9);
  if (u <= 0) return;
  const panel = (cx, head, lines, accent, uIn) => {
    if (uIn <= 0) return;
    ctx.save();
    ctx.globalAlpha *= uIn;
    ctx.fillStyle = '#faf3e3';
    roundRect(ctx, cx - 352, y - 312, 704, 512, 12); ctx.fill();
    ctx.strokeStyle = accent ? REDF : INK;
    ctx.lineWidth = 7;
    roundRect(ctx, cx - 352, y - 312, 704, 512, 12); ctx.stroke();
    ctx.fillStyle = accent ? REDF : INK;
    ctx.font = '700 49px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(head, cx, y - 236);
    ctx.fillStyle = INK;
    ctx.font = '28px "Noto Serif", serif';
    ctx.textAlign = 'left';
    lines.forEach((r, i) => ctx.fillText(r, cx - 295, y - 152 + i * 76));
    ctx.restore();
  };
  panel(x - 700, 'CONFIRMED', [
    '— Huang: “I was unfaithful”',
    '— Board: independent probe',
    '— NVDA −4.3% on Nov 9',
  ], false, clamp((t - 262.6) / 0.7));
  panel(x, 'REPORTED', [
    '— MSS asset (NYT / FT / NBC)',
    '— memo, spring 2026',
    '— Singapore MHA: no probes',
  ], false, clamp((t - 267.0) / 0.7));
  panel(x + 700, 'UNKNOWN', [
    '— what, if anything, passed',
    '— whether this was “an op”',
    '— no charge. no admission.',
  ], true, clamp((t - 271.6) / 0.7));
  // masking tape holds each panel up — tied to that panel's own arrival
  const panelT = [262.6, 267.0, 271.6];
  [x - 700, x, x + 700].forEach((cx, i) => {
    const ta = clamp((t - panelT[i]) / 0.5);
    if (ta <= 0.01) return;
    tape(ctx, cx - 250, y - 318, 150, -0.05, ta * 0.9);
    tape(ctx, cx + 250, y - 318, 150, 0.05, ta * 0.9);
  });
  // bottom band — the conclusion rule lands with the UNKNOWN panel (web hero footer band)
  if (t > 271.9) {
    ctx.save();
    ctx.globalAlpha *= clamp((t - 271.9) / 0.5, 0, 1);
    handLine(ctx, x - 830, 862, x + 830, 862, { w: 6, color: INK, boil: 0.8, progress: clamp((t - 272.0) / 0.7) });
    ctx.fillStyle = INK;
    ctx.font = '700 53px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE EVIDENCE DECIDES THE CONCLUSION.', x, 930);
    ctx.restore();
  }
}

function exportStamps(ctx, x, y, t) {
  // Web-hero rebuild of the S08 split scene: headline kicker carries the
  // chokepoint, three dated stamps stack beneath, and a wide hand-drawn
  // US→CN corridor arc (endpoint nodes with in-situ labels) fills the base.
  const camX = camXNow(t);
  const fx = clamp((x + 1026 - camX) / 320, 0, 1);
  const stamp = (yy, label, t0, size, red) => {
    ctx.save(); ctx.globalAlpha *= fx;
    stampText(ctx, x, yy, label, { size, t0, t, color: red ? REDF : INK, rot: -0.008, font: FONT.display });
    ctx.restore();
  };
  // vertical strata — clear of the 175px headline (LAW 6 clearance ≥ 40px margins)
  stamp(y + 4, 'OCT 2022 — BIS RULES', 217.0, 60, false);
  stamp(y + 96, 'APR 2025 — $5.5B CHARGE', 225.8, 60, false);
  stamp(y + 216, 'MAY 2026 — ZERO DELIVERIES', 229.4, 62, true);
  // corridor arc — the chokepoint in one stroke
  const au = clamp((t - 217.2) / 1.4);
  if (au > 0) {
    arrow(ctx, [
      { x: x - 1040, y: y + 430 }, { x: x - 450, y: y + 235 }, { x: x + 180, y: y + 430 },
    ], { w: 9, color: INK, progress: au });
  }
  // BIS chokepoint gate at the crest — the export-controls barrier
  const gu = clamp((t - 218.0) / 0.6);
  if (au > 0 && gu > 0) {
    ctx.save(); ctx.globalAlpha *= gu;
    ctx.strokeStyle = REDF; ctx.lineWidth = 6; ctx.setLineDash([18, 14]);
    ctx.beginPath(); ctx.moveTo(x - 450, y + 300); ctx.lineTo(x - 450, y + 392); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = REDF;
    ctx.font = '700 34px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BIS LICENSE', x - 450, y + 428);
    ctx.restore();
  }
  // endpoint nodes — the two powers, fully in-frame (LAW 12: diagram hero ≥ 35%)
  const node = (nx, label) => {
    ctx.save(); ctx.globalAlpha *= fx * clamp((t - 217.6) / 0.6, 0, 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.fillStyle = '#f4ead8';
    ctx.beginPath(); ctx.arc(nx, y + 520, 96, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.font = '700 56px "Archivo Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, nx, y + 520);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  };
  node(x - 1040, 'US');
  node(x + 180, 'CN');
}

export function drawWorld(ctx, t) {
  drawPaper(ctx, -200, -1200, T.BOARD_W + 400, T.BOARD_H + 2400, 21);
  // vibe plate — TILED (retile: one whole-board stretch was invisible at α 0.09).
  // Tiles are pre-feathered ONCE at module load (L/R edges dissolve to transparent
  // over 390px) so overlaps blend in multiply — no seams, no double-darkening.
  // CULL: only tiles intersecting the viewport are drawn (rebuilding the tile
  // canvas per frame made the LAW 4 sweep take >1h).
  {
    const cam = camAt(T.rail, t);
    const halfW = T.W / 2 / cam.zoom + 400;
    const halfH = T.H / 2 / cam.zoom + 400;
    const vx0 = cam.x - halfW, vx1 = cam.x + halfW;
    const vy0 = cam.y - halfH, vy1 = cam.y + halfH;
    const ty0 = -1200, ty1 = T.BOARD_H + 1200; // world rect a tile covers
    const tw = 7200, th = T.BOARD_H + 2400;
    for (let px = -200; px < T.BOARD_W + 200; px += 6600) {
      const x0 = Math.max(px, vx0), x1 = Math.min(px + tw, vx1);
      const y0 = Math.max(ty0, vy0), y1 = Math.min(ty1, vy1);
      if (x1 <= x0 || y1 <= y0) continue;
      // PERF: draw the visible slice in DEVICE space. Skia rasterises the
      // whole destination rect of a transformed multiply draw (6.6M px here,
      // outside the 2.8M canvas included) — ~160ms/frame. getTransform() maps
      // the live camera exactly (scale+translate only), identity resets the
      // transform so the canvas clip applies, and the crop samples ~1:1.
      // Same tile, same feathering, same multiply alpha — look-identical.
      const sx = (x0 - px) / tw * TILE_W;
      const sy = (y0 - ty0) / th * TILE_H;
      const sw = (x1 - x0) / tw * TILE_W;
      const sh = (y1 - y0) / th * TILE_H;
      const m = ctx.getTransform();
      const dx0 = m.a * x0 + m.e, dy0 = m.d * y0 + m.f;
      const dx1 = m.a * x1 + m.e, dy1 = m.d * y1 + m.f;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Explicit canvas clip: Skia rasterises the full destination rect of a
      // multiply draw even when it is off-canvas (the composite op forces an
      // intermediate layer). Clipping to the canvas bounds keeps the layer at
      // viewport size — the difference between ~200ms and ~10ms per frame.
      ctx.beginPath();
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha *= 0.075;
      ctx.drawImage(vibeTile, sx, sy, sw, sh, dx0, dy0, dx1 - dx0, dy1 - dy0);
      ctx.restore();
    }
  }

  // ── S01 · HOOK — THE ANCIENT COLD OPEN ─────────────────────
  {
    const a = zoneAlpha(t, 0.0, 18.9, 0.5, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      // whole column dissolves before its left edge reaches the band (LAW 4)
      ctx.globalAlpha *= fadeExit(700, camXNow(t));
      // 06-asym-split hero: 62/38 — quote column left, scroll-plate rail right
      const cx = 1345;
      typewriter(ctx, cx, 206, 'THE WU–YUE WARS · C. 500 BC', { size: 60, t0: 0.8, t, cps: 14, font: FONT.hand });
      // the quote itself — the VO's own words, as the ancients tell it
      maskUpText(ctx, cx, 386, '“THE MOST EXPENSIVE', { size: 128, t0: 4.9, t1: 5.5, t, font: FONT.display });
      maskUpText(ctx, cx, 518, 'GIFT EVER WRAPPED.”', { size: 128, t0: 5.7, t1: 6.3, t, font: FONT.display });
      // underline — below last line, landed AFTER the text (LAW 6)
      if (t > 6.4) handStroke(ctx, [{ x: cx - 545, y: 616 }, { x: cx + 545, y: 610 }], { w: 9, color: REDF, progress: clamp((t - 6.4) / 0.4) });
      typewriter(ctx, cx, 682, '— THE STORY AS THE ANCIENTS TELL IT', { size: 38, t0: 7.3, t, cps: 24, font: FONT.serif });
      // ledger band — the war in two strokes, ruled like a docket
      if (t > 13.0) handLine(ctx, cx - 620, 774, cx + 620, 774, { w: 3, color: INK, boil: 0.6, progress: clamp((t - 13.0) / 0.5) });
      ctx.save(); ctx.globalAlpha *= fadeExit(cx - 430, camXNow(t));
      stampText(ctx, cx - 330, 844, 'WU PARTIES.', { size: 50, t0: 13.5, t, color: INK, rot: 0, font: FONT.serif });
      stampText(ctx, cx + 330, 844, 'YUE WINS.', { size: 50, t0: 15.7, t, color: REDF, rot: 0, font: FONT.serif });
      ctx.restore();
      // right rail — the scroll plate, tabbed and labelled on one axis
      drawPrint(ctx, IMG.palace, 2526, 592, { w: 700, rot: -0.012, alpha: printA(t, 2.0, 18.6, 2346) });
      stampText(ctx, 2526, 356, 'STRATAGEM 31 OF 36', { size: 42, t0: 17.2, t, color: INK, rot: 0, font: FONT.serif });
      typewriter(ctx, 2526, 812, '— THE BEAUTY TRAP —', { size: 40, t0: 17.3, t, cps: 30, font: FONT.serif });
      {
        const bA = clamp((t - 17.5) / 0.5, 0, 1) * a * fadeExit(2346, camXNow(t));
        if (bA > 0.01) {
          ctx.save(); ctx.globalAlpha *= bA;
          ctx.fillStyle = REDF;
          ctx.font = `100px "${FONT.brush}"`;
          ctx.textAlign = 'center';
          ctx.fillText('美人计', 2492, 940);
          ctx.restore();
          // red chop beside the brush glyph — the stratagem, sealed
          ctx.save();
          ctx.globalAlpha *= fadeExit(2376, camXNow(t));
          sealChop(ctx, 2690, 912, 46, t, 17.9);
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  // ── S02 · NVIDIA ──────────────────────────────
  {
    const a = zoneAlpha(t, 23.0, 48.9, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      // centered hero: title band → chip → mirrored metric band; prints flank 3/4
      typewriter(ctx, 7400, 128, 'THE MOST IMPORTANT CHIP COMPANY ON EARTH', { size: 84, t0: 27.8, t, cps: 26, font: FONT.serif });
      typewriter(ctx, 7400, 206, 'FOUNDED 1993 · SANTA CLARA', { size: 38, t0: 28.6, t, cps: 24, font: FONT.serif });
      // chip placed so its upward pins (top ≈ y−306) clear the subtitle
      // baseline (LAW 8 — no stroke crosses type).
      chipGlyph(ctx, 7400, 540, 280, t, 27.0);
      // PCB traces — the chip is wired into the world
      circuitTraces(ctx, t, 28.0);
      stampText(ctx, 6920, 862, '$4T', { size: 175, t0: 30.9, t, color: INK, rot: -0.012, font: FONT.display });
      stampText(ctx, 6920, 990, 'JUL 2025', { size: 44, t0: 31.5, t, color: INK, font: FONT.serif });
      stampText(ctx, 8060, 862, '$5T', { size: 175, t0: 32.3, t, color: REDF, rot: 0.014, font: FONT.display });
      stampText(ctx, 8060, 990, 'OCT 2025', { size: 44, t0: 32.9, t, color: REDF, font: FONT.serif });
      // prints — HQ sign (left) + Jensen Huang (right), mirrored gutters (LAW 4 in-situ fades)
      drawPrint(ctx, IMG.hq, 6520, 720, { w: 420, rot: -0.018, alpha: printA(t, 28.2, 48.6, 6340) });
      drawPrint(ctx, IMG.jh, 8000, 415, { w: 420, rot: 0.016, alpha: printA(t, 34.9, 48.6, 7790) });
      ctx.restore();
    }
  }

  // ── S03 · ALICE HUANG ───────────────────
  {
    const a = zoneAlpha(t, 51.6, 68.6, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      // two-column hero — press print LEFT, headline stack + diagram RIGHT
      drawPrint(ctx, IMG.alice, 12140, 550, { w: 800, rot: -0.016, alpha: printA(t, 54.8, 68.3, 11790) });
      cropMarks(ctx, 12140, 550, 800, printH(IMG.alice, 800), t, 55.2);
      const alA = clamp((t - 55.4) / 0.6, 0, 1) * a * fadeExit(11790, camXNow(t));
      if (alA > 0.01) {
        ctx.save(); ctx.globalAlpha *= alA;
        ctx.fillStyle = INK; ctx.textAlign = 'center';
        ctx.font = 'italic 22px "Noto Serif", serif';
        ctx.fillText('identity as reported — not independently verified', 12140, 930);
        ctx.restore();
      }
      typewriter(ctx, 13520, 232, 'ALICE HUANG', { size: 126, t0: 55.2, t, cps: 12, font: FONT.display });
      typewriter(ctx, 13520, 348, 'MEGASPEED INTERNATIONAL', { size: 45, t0: 61.4, t, cps: 24, font: FONT.serif });
      typewriter(ctx, 13520, 392, 'SINGAPORE · NO RELATION TO JENSEN', { size: 37, t0: 56.1, t, cps: 26, font: FONT.serif });
      // relationship diagram — two circles, dotted ?, NOT a heart
      handCircle(ctx, 13140, 620, 88, { w: 6, color: INK, progress: clamp((t - 61.3) / 0.8) });
      handCircle(ctx, 13810, 620, 88, { w: 6, color: INK, progress: clamp((t - 62.3) / 0.8) });
      ctx.font = '600 33px "Archivo Black", sans-serif';
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      const ta = clamp((t - 62.9) / 0.5, 0, 1);
      ctx.globalAlpha *= ta;
      ctx.fillText('JENSEN', 13140, 620);
      ctx.fillText('ALICE', 13810, 620);
      ctx.globalAlpha /= ta;
      if (t > 63.7) dashedLine(ctx, 13240, 620, 13710, 620, t, 63.7);
      // rotating dashed targeting ring — slow, red, never settles (ambient motion)
      {
        const spin = t * 0.55;
        ctx.save();
        ctx.globalAlpha *= clamp((t - 64.9) / 0.6, 0, 1) * a;
        ctx.strokeStyle = REDF; ctx.lineWidth = 7;
        ctx.setLineDash([30, 22]);
        ctx.lineDashOffset = -spin * 160;
        ctx.beginPath(); ctx.arc(13810, 620, 132, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      typewriter(ctx, 13100, 700, 'REPORTED — NEVER CHARGED', { size: 50, t0: 68.4, t, cps: 22, font: FONT.hand });
      // Singapore plate bottom-right — the documented link
      drawPrint(ctx, IMG.sg, 13600, 870, { w: 640, rot: 0.012, alpha: printA(t, 61.9, 68.3, 13330) });
      ctx.restore();
    }
  }

  // ── S04 · THE ALLEGATION ────────────────────────────────────
  {
    const a = zoneAlpha(t, 73.1, 102.9, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 18760, 142, 'ACCORDING TO US INTELLIGENCE ASSESSMENTS', { size: 40, t0: 76.0, t, cps: 26, font: FONT.serif });
      stampText(ctx, 18760, 261, 'MSS — REPORTED', { size: 110, t0: 89.4, t, color: REDF, rot: -0.012, font: FONT.display, press: false });
      memoCard(ctx, 18760, 648, t);
      paperclip(ctx, 19060, 426, t, 81.0);
            // White House print — Washington owns the memo (LAW 4 in-situ fade)
      drawPrint(ctx, IMG.wh, 19540, 755, { w: 360, rot: 0.014, alpha: printA(t, 79.2, 102.6, 19360) });
      ctx.restore();
    }
  }

function dashedLine(ctx, x1, y1, x2, y2, t, t0) {
  const u = clamp((t - t0) / 0.8);
  const len = x2 - x1;
  ctx.save();
  ctx.strokeStyle = REDF;
  ctx.lineWidth = 5;
  ctx.setLineDash([22, 22]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 + len * u, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = REDF;
  ctx.font = '700 83px "Archivo Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('?', (x1 + x2) / 2, y1 - 40);
  ctx.restore();
}

  // ── S05 · DENIALS ───────────────────────────────────────────
  {
    const a = zoneAlpha(t, 107.5, 134.3, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      ledgerDuel(ctx, 24680, 430, t);
      stampText(ctx, 24000, 945, 'NO REASON TO BELIEVE', { size: 74, t0: 133.2, t, color: INK, rot: 0.006, font: FONT.serif });
      // Great Hall print — Beijing's denial (LAW 4 in-situ fade)
      drawPrint(ctx, IMG.bj, 25380, 852, { w: 280, rot: 0.012, alpha: printA(t, 114.9, 135.0, 25240) });
      ctx.restore();
    }
  }

  // ── S06 · MEGASPEED ─────────────────────────────────────────
  {
    const a = zoneAlpha(t, 139.1, 165.3, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      chainFlow(ctx, 30480, 355, t);
      const qx = fadeExit(30480 - 340, camXNow(t));
      ctx.globalAlpha *= qx;
      typewriter(ctx, 31200, 812, 'TRACED · FEB 2024 – FEB 2026 · BLOOMBERG', { size: 30, t0: 155.6, t, cps: 28, font: FONT.serif });
      typewriter(ctx, 31140, 884, '“NORMAL AND NOT UNUSUAL”', { size: 37, t0: 162.9, t, cps: 26, font: FONT.serif });
      typewriter(ctx, 31140, 920, '— HUANG, TO BLOOMBERG', { size: 28, t0: 165.4, t, cps: 26, font: FONT.serif });
      typewriter(ctx, 31140, 966, '“THOROUGHLY INVESTIGATED AND DEBUNKED LAST YEAR”', { size: 26, t0: 166.5, t, cps: 30, font: FONT.serif });
      typewriter(ctx, 31140, 1004, '— NVIDIA', { size: 26, t0: 168.8, t, cps: 30, font: FONT.serif });
      ctx.globalAlpha /= qx;
      // supercomputer plate — illustrative, captioned honestly (LAW 4)
      drawPrint(ctx, IMG.hpc, 29880, 750, { w: 760, rot: -0.014, alpha: printA(t, 143.6, 165.0, 29470) });
      ctx.restore();
    }
  }

  // ── S07 · THE OLDEST TRICK (history wall) ───────────────────
  {
    const a = zoneAlpha(t, 171.2, 210.5, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      // title — camera pans past it; dissolve before its left edge reaches the band
      const txA = fadeExit(35520, camXNow(t));
      ctx.save(); ctx.globalAlpha *= txA;
      typewriter(ctx, 36400, 195, 'THE PLAYBOOK IS OLDER THAN THE MICROCHIP', { size: 72, t0: 171.5, t, cps: 26, font: FONT.serif });
      ctx.restore();
      // spine timeline — erodes segment-by-segment as the camera passes (LAW 4)
      {
        const camX = camXNow(t);
        const drawProg = clamp((t - 172.4) / 1.4);
        if (drawProg > 0) {
          for (let segL = 35500; segL < 39800; segL += 230) {
            const segR = Math.min(39800, segL + 230);
            const segA = clamp((segL + 1256 - camX) / 260, 0, 1) * fadeEntry(segL + 230, camX);
            if (segA <= 0.01) continue;
            const midDraw = clamp((drawProg * (39800 - 35500) - (segL - 35500)) / 230, 0, 1);
            if (midDraw <= 0) continue;
            ctx.save(); ctx.globalAlpha *= segA * 0.45;
            handLine(ctx, segL, 280, segL + (segR - segL) * midDraw, 280, { w: 6, color: INK, boil: 1.4 });
            ctx.restore();
          }
        }
      }
      const spine = ['1917', '1950s–80s', '2013', '2011–15'];
      const sx = [35650, 37550, 38550, 39650];
      const sxHalf = [46, 110, 46, 62];
      const st0 = [175.3, 188.1, 195.6, 199.1];
      const camX = camXNow(t);
      spine.forEach((lab, i) => {
        const u = clamp((t - st0[i]) / 0.4);
        if (u <= 0) return;
        const fx = fadeExit(sx[i] - sxHalf[i], camX) * fadeEntry(sx[i] + sxHalf[i], camX);
        if (fx <= 0.01) return;
        ctx.save(); ctx.globalAlpha *= u * fx; ctx.fillStyle = INK;
        ctx.font = '700 44px "Archivo Black", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(lab, sx[i], 248); ctx.restore();
      });
      const acA = fadeExit(38600 - 390, camXNow(t));
      ctx.save(); ctx.globalAlpha *= acA;
      ctx.restore();
      ctx.restore();
      // three prints — in-situ fades (LAW 4)
      drawPrint(ctx, IMG.mataHari, 36050, 552, { w: 470, rot: -0.02, alpha: printA(t, 175.3, 210.3, 35815) * fadeEntry(36285, camXNow(t)) });
      drawPrint(ctx, IMG.wolf, 37550, 566, { w: 470, rot: 0.014, alpha: printA(t, 188.2, 210.3, 37360) * fadeEntry(37740, camXNow(t)) });
      drawPrint(ctx, IMG.witt, 38550, 552, { w: 450, rot: -0.012, alpha: printA(t, 195.7, 210.3, 38360) * fadeEntry(38740, camXNow(t)) });
      // red-string detective board — thread the wall together as it lands
      {
        const camXp = camXNow(t);
        const pin = (cx, img, w, cy, t0) => ({
          cx,
          py: printBottom(img, w, cy) - 16,
          u: clamp((t - t0) / 0.5),
          fx: fadeExit(cx - (w / 2 + 30), camXp) * fadeEntry(cx + (w / 2 + 30), camXp),
        });
        const P = [
          pin(36050, IMG.mataHari, 470, 552, 175.6),
          pin(37550, IMG.wolf, 470, 566, 188.6),
          pin(38550, IMG.witt, 450, 552, 196.1),
          {
            cx: 39680, py: 640,
            u: clamp((t - 199.7) / 0.5),
            fx: clamp(fadeEntry(39830, camXp) * fadeExit(39530, camXp) * 2, 0, 1),
          },
        ];
        for (let i = 0; i < P.length - 1; i++) {
          const A = P[i], B = P[i + 1];
          const u = Math.min(A.u, B.u), fx = Math.min(A.fx, B.fx);
          if (u <= 0.01 || fx <= 0.01) continue;
          ctx.save();
          ctx.globalAlpha *= u * fx * 0.8;
          ctx.strokeStyle = REDF; ctx.lineWidth = 4; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(A.cx, A.py);
          ctx.quadraticCurveTo((A.cx + B.cx) / 2, Math.max(A.py, B.py) + 26, B.cx, B.py);
          ctx.stroke();
          ctx.restore();
        }
        for (const Pn of P) {
          if (Pn.u <= 0.01 || Pn.fx <= 0.01) continue;
          ctx.save(); ctx.globalAlpha *= Pn.u * Pn.fx;
          ctx.fillStyle = REDF;
          ctx.beginPath(); ctx.arc(Pn.cx, Pn.py, 9, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      // transit candy: a modern data-center rack — the playbook ships (PDM)
      drawPrint(ctx, IMG.racks, 40480, 480, { w: 415, rot: 0.016, alpha: printA(t, 207.5, 211.4, 40310) * fadeEntry(40650, camXNow(t)) });
    }
  }

  // Christine Fang — text card (no licensed photo exists; honest choice)
  {
    const u = clamp((t - 199.1) / 0.6, 0, 1) * zoneAlpha(t, 171.2, 210.5, 0.6, 0);
    const fxR = fadeEntry(39830, camXNow(t)) * fadeExit(39530, camXNow(t));
    if (u > 0.01 && fxR > 0.01) {
      ctx.save();
      ctx.globalAlpha *= u * fxR;
      noteCard(ctx, 39680, 480, { w: 300, h: 360, t0: 199.1, t, dur: 0.6, rot: 0.018, alpha: fxR });
      ctx.fillStyle = INK;
      ctx.font = '700 44px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHRISTINE', 39680, 440);
      ctx.fillText('FANG', 39680, 482);
      ctx.font = '26px "Noto Serif", serif';
      ctx.fillText('“FANG FANG”', 39680, 522);
      ctx.fillText('2011–2015', 39680, 552);
      ctx.restore();
    }
  }

  // ── S08 · WHY IT MATTERS ────────────────────────────────────
  {
    const a = zoneAlpha(t, 211.6, 232.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      const camX = camXNow(t);
      const tA = clamp((44200 - 700 + 1256 - camX) / 600, 0, 1);
      // kicker marginalia — the subject, before the claim
      {
        const kA = clamp((t - 215.2) / 0.5, 0, 1);
        if (kA > 0.01) {
          ctx.save(); ctx.globalAlpha *= kA * tA; ctx.translate(44200, 128); ctx.rotate(-0.045);
          ctx.fillStyle = REDF; ctx.font = '54px "Caveat"'; ctx.textAlign = 'center';
          ctx.fillText('the choke point', 0, 0);
          ctx.restore();
        }
      }
      ctx.save(); ctx.globalAlpha *= tA;
      typewriter(ctx, 44200, 300, 'WHY WASHINGTON CARES', { size: 150, t0: 214.4, t, cps: 16, font: FONT.display });
      ctx.restore();
      exportStamps(ctx, 44200, 400, t);
      ctx.restore();
    }
  }

  // ── S09 · FALLOUT ───────────────────────────────────────────
  {
    const a = zoneAlpha(t, 236.9, 256.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 49060, 122, 'NOVEMBER 9, 2026', { size: 46, t0: 241.6, t, cps: 20, font: FONT.serif });
      stockChart(ctx, 49060, 470, t);
      stampText(ctx, 49060, 330, '$178.67', { size: 188, t0: 253.3, t, color: INK, rot: 0.008, font: FONT.display });
      noteCard(ctx, 48620, 960, { w: 940, h: 140, t0: 254.3, t, dur: 0.6, rot: -0.01, alpha: 1 });
      ctx.save();
      ctx.globalAlpha *= clamp((t - 255.1) / 0.5, 0, 1);
      ctx.fillStyle = INK;
      ctx.font = '700 39px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KISTENMACHER v. NVIDIA', 48620, 934);
      ctx.font = '30px "Noto Serif", serif';
      ctx.fillText('N.D. CAL. · disclosure claims only · no finding of espionage', 48620, 979);
      ctx.restore();
      // NYSE floor print — where the math happens (LAW 4 in-situ fade)
      drawPrint(ctx, IMG.nyse, 49980, 655, { w: 400, rot: 0.018, alpha: printA(t, 239.8, 256.2, 49750) });
      ctx.restore();
    }
  }

  // ── S10 · WHAT WE KNOW ──────────────────────────────────────
  {
    const a = zoneAlpha(t, 260.8, 276.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 53880, 130, 'CASE FILE 003 — THE PROOF BOARD', { size: 40, t0: 262.0, t, cps: 30, font: FONT.serif });
      evidenceWall(ctx, 53880, 500, t);
      ctx.restore();
    }
  }

  // ── S11 · THE FINAL QUESTION ────────────────────────────────
  {
    const a = zoneAlpha(t, 280.7, 303.5, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      maskUpText(ctx, 58500, 330, 'THE OLDEST TRICK', { size: 142, t0: 283.0, t1: 283.8, t, font: FONT.display });
      maskUpText(ctx, 58500, 462, 'IN THE HISTORY', { size: 142, t0: 283.9, t1: 284.7, t, font: FONT.display });
      stampText(ctx, 58500, 700, 'STILL WORKS?', { size: 175, t0: 285.2, t, color: REDF, rot: -0.012, font: FONT.display });
      // the question, circled by hand — the closer
      roughCircle(ctx, 58500, 700, 660, 150, t, 285.6, 23);
      ctx.restore();
    }
  }

  // ── interlude flourishes — fill empty transit bands ──────────
  interlude(ctx, 3480, 520, t, 20.0, 'sound familiar?');
  interlude(ctx, 8500, 520, t, 49.8, 'the other Huang');
  interlude(ctx, 16660, 520, t, 70.0, 'alleged. allegedly.');
  interlude(ctx, 22000, 520, t, 104.2, 'denials on the table');
  interlude(ctx, 34800, 520, t, 168.2, 'this has happened before');
  interlude(ctx, 41350, 520, t, 208.5, 'access. intimacy.');
  interlude(ctx, 46350, 520, t, 233.5, 'chips ≠ dating');
  interlude(ctx, 50750, 520, t, 257.4, 'the market did the math');
  interlude(ctx, 56450, 520, t, 277.2, 'so what do we know');

  // END-CARD — title + question only (user directive: no credit/license text on frame)
}
