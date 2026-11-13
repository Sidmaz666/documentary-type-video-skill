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
  noteCard(ctx, x, y, { w: 880, h: 470, t0: T0, t, dur: 0.6, rot: -0.012, alpha: 1 });
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.012);
  const a = clamp((t - T0 - 0.3) / 0.7, 0, 1);
  ctx.globalAlpha *= a;
  ctx.fillStyle = INK;
  ctx.font = '700 44px "Noto Serif", serif';
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
  ctx.fillText('illustration — no public memo exists', x, y + 268);
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
    roundRect(ctx, -320, -96, 640, 192, 10); ctx.fill();
    ctx.strokeStyle = accent ? REDF : INK;
    ctx.lineWidth = 5;
    roundRect(ctx, -320, -96, 640, 192, 10); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '700 57px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -8);
    ctx.font = '34px "Noto Serif", serif';
    ctx.fillText(sub, 0, 46);
    ctx.restore();
  };
  card(x - 700, 'MEGASPEED', 'Singapore · cloud compute', u1, false);
  card(x + 700, 'SPEEDMATRIX', 'Malaysia · the buyer', u2, true);
  if (u1 > 0 && u2 > 0) {
    arrow(ctx, [{ x: x - 380, y }, { x: x + 380, y }], { w: 6, color: INK, progress: clamp((t - 150.6) / 0.5) });
    const mA = clamp((t - 151.4) / 0.5, 0, 1);
    if (mA > 0.01) {
      ctx.save(); ctx.globalAlpha *= mA;
      ctx.translate(x, y - 118); ctx.rotate(-0.05);
      ctx.fillStyle = REDF; ctx.font = '44px "Caveat"'; ctx.textAlign = 'center';
      ctx.fillText('follow the money ↓', 0, 0); ctx.restore();
    }
  }
  const fxB = fadeExit(x - 190, camXNow(t));
  if (fxB > 0.01) {
    ctx.save();
    ctx.globalAlpha *= u3 * fxB;
    ctx.font = '700 156px "Archivo Black", sans-serif';
    ctx.fillStyle = REDF;
    ctx.textAlign = 'center';
    ctx.fillText('$4.8B', x, y + 355);
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
  // −4.3% annotation at the cliff foot (lands when VO says the number)
  const au = clamp((t - 249.4) / 0.6);
  if (au > 0) {
    handLine(ctx, x + 630, y + 445, x + 630, y + 495, { w: 5, color: REDF, boil: 1 });
    ctx.save();
    ctx.globalAlpha *= au;
    ctx.fillStyle = REDF;
    ctx.font = '700 52px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('−4.3%', x + 630, y + 515);
    ctx.restore();
  }
}

function ledgerColumns(ctx, x, y, t) {
  const T0 = 109.3;
  const u = clamp((t - T0) / 0.8);
  if (u <= 0) return;
  // one wide card, two columns — fits the viewport (LAW 4)
  noteCard(ctx, x, y, { w: 2050, h: 550, t0: T0, t, dur: 0.6, rot: -0.008, alpha: 1 });
  const a = clamp((t - T0 - 0.7) / 0.6, 0, 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha *= a;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  handLine(ctx, 0, -240, 0, 240, { w: 3, color: INK, boil: 0.8 });
  ctx.fillStyle = INK;
  ctx.font = '700 52px "Archivo Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REPORTED', -500, -200);
  ctx.fillStyle = REDF;
  ctx.fillText('DENIED / UNCONFIRMED', 500, -200);
  ctx.fillStyle = INK;
  ctx.font = '27px "Noto Serif", serif';
  ctx.textAlign = 'left';
  const L = [
    'US intel: MSS asset',
    'memo, spring 2026',
    'Trump briefed ~1 yr before',
    'FT: romance described',
  ];
  const R = [
    'China: “smears… slander”',
    'Singapore MHA: no probes',
    'NBC: not independently',
    'confirmed · CIA silent',
  ];
  L.forEach((r, i) => ctx.fillText('— ' + r, -960, -80 + i * 88));
  R.forEach((r, i) => ctx.fillText('— ' + r, 60, -80 + i * 88));
  ctx.restore();
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

function evidenceWall(ctx, x, y, t) {
  const u = clamp((t - 261.3) / 0.9);
  if (u <= 0) return;
  const panel = (cx, head, lines, accent, uIn) => {
    if (uIn <= 0) return;
    ctx.save();
    ctx.globalAlpha *= uIn;
    ctx.fillStyle = '#faf3e3';
    roundRect(ctx, cx - 310, y - 300, 620, 470, 10); ctx.fill();
    ctx.strokeStyle = accent ? REDF : INK;
    ctx.lineWidth = 6;
    roundRect(ctx, cx - 310, y - 300, 620, 470, 10); ctx.stroke();
    ctx.fillStyle = accent ? REDF : INK;
    ctx.font = '700 44px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(head, cx, y - 222);
    ctx.fillStyle = INK;
    ctx.font = '26px "Noto Serif", serif';
    ctx.textAlign = 'left';
    lines.forEach((r, i) => ctx.fillText(r, cx - 255, y - 140 + i * 72));
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
  // bottom band — the conclusion rule lands with the UNKNOWN panel (web hero footer band)
  if (t > 271.9) {
    ctx.save();
    ctx.globalAlpha *= clamp((t - 271.9) / 0.5, 0, 1);
    handLine(ctx, x - 760, 862, x + 760, 862, { w: 5, color: INK, boil: 0.8, progress: clamp((t - 272.0) / 0.7) });
    ctx.fillStyle = INK;
    ctx.font = '700 44px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE EVIDENCE DECIDES THE CONCLUSION.', x, 930);
    ctx.restore();
  }
}

function exportStamps(ctx, x, y, t) {
  const camX = camXNow(t);
  const fx = clamp((x - 230 + 1256 - camX) / 320, 0, 1);
  const stamp = (yy, label, t0, red) => {
    ctx.save(); ctx.globalAlpha *= fx;
    stampText(ctx, x, yy, label, { size: 52, t0, t, color: red ? REDF : INK, rot: -0.008, font: FONT.display });
    ctx.restore();
  };
  stamp(y - 140, 'OCT 2022 — BIS RULES', 217.0, false);
  stamp(y - 20, 'APR 2025 — $5.5B CHARGE', 225.8, false);
  stamp(y + 100, 'MAY 2026 — ZERO DELIVERIES', 229.4, true);
  // hand-drawn corridor arc US -> CN
  const au = clamp((t - 217.2) / 1.2);
  if (au > 0) {
    arrow(ctx, [
      { x: x - 900, y: y + 330 }, { x: x - 380, y: y + 180 }, { x: x + 180, y: y + 330 },
    ], { w: 7, color: INK, progress: au });
  }
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
      typewriter(ctx, 1780, 205, 'THE WU–YUE WARS · C. 500 BC', { size: 55, t0: 0.8, t, cps: 14, font: FONT.hand });
      // the quote itself — the VO's own words, as the ancients tell it
      maskUpText(ctx, 1780, 480, '“THE MOST EXPENSIVE', { size: 125, t0: 4.9, t1: 5.5, t, font: FONT.display });
      maskUpText(ctx, 1780, 600, 'GIFT EVER WRAPPED.”', { size: 125, t0: 5.7, t1: 6.3, t, font: FONT.display });
      // underline — below last line, landed AFTER the text (LAW 6)
      if (t > 6.4) handStroke(ctx, [{ x: 1470, y: 668 }, { x: 2095, y: 662 }], { w: 9, color: REDF, progress: clamp((t - 6.4) / 0.4) });
      typewriter(ctx, 1340, 740, '— THE STORY AS THE ANCIENTS TELL IT', { size: 39, t0: 7.3, t, cps: 24, font: FONT.serif });
      // left margin: the fall of Wu
      stampText(ctx, 980, 880, 'WU PARTIES.', { size: 44, t0: 13.5, t, color: INK, rot: -0.01, font: FONT.serif });
      stampText(ctx, 980, 950, 'YUE WINS.', { size: 44, t0: 15.7, t, color: REDF, rot: 0.012, font: FONT.serif });
      // right column: Xi Shi + the palace scroll print (in-situ fade, LAW 4)
      typewriter(ctx, 2380, 340, 'XI SHI', { size: 83, t0: 6.5, t, cps: 9, font: FONT.display });
      typewriter(ctx, 2380, 392, 'GIFT OF THE KING OF YUE', { size: 31, t0: 7.0, t, cps: 22, font: FONT.serif });
      drawPrint(ctx, IMG.palace, 2330, 840, { w: 780, rot: -0.014, alpha: printA(t, 2.0, 18.6, 2330 - 310) });
      const capA = clamp((t - 2.7) / 0.6, 0, 1) * a * fadeExit(2330 - 310, camXNow(t));
      if (capA > 0.01) {
        ctx.save(); ctx.globalAlpha *= capA;
        ctx.fillStyle = INK; ctx.font = '23px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText('COURT LADIES · CLEVELAND MUSEUM · CC0', 2330, 1010);
        ctx.restore();
      }
      // the stratagem, named when the VO names it (LAW 6)
      stampText(ctx, 1340, 800, 'STRATAGEM 31 OF 36 — THE BEAUTY TRAP', { size: 39, t0: 17.2, t, color: INK, rot: -0.006, font: FONT.serif });
      {
        const bA = clamp((t - 17.4) / 0.5, 0, 1) * a * fadeExit(1780 - 160, camXNow(t));
        if (bA > 0.01) {
          ctx.save(); ctx.globalAlpha *= bA;
          ctx.fillStyle = REDF;
          ctx.font = `83px "${FONT.brush}"`;
          ctx.textAlign = 'center';
          ctx.fillText('美人计', 1700, 990);
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
      typewriter(ctx, 7400, 150, 'THE MOST IMPORTANT CHIP COMPANY ON EARTH', { size: 70, t0: 27.8, t, cps: 26, font: FONT.serif });
      typewriter(ctx, 7400, 228, 'FOUNDED 1993 · SANTA CLARA', { size: 36, t0: 28.6, t, cps: 24, font: FONT.serif });
      // chip dropped 80px: its upward pins (top ≈ y−212) must clear the
      // subtitle baseline (LAW 8 — no stroke crosses type).
      chipGlyph(ctx, 7400, 500, 200, t, 27.0);
      stampText(ctx, 6920, 780, '$4T', { size: 150, t0: 30.9, t, color: INK, rot: -0.012, font: FONT.display });
      stampText(ctx, 6920, 896, 'JUL 2025', { size: 40, t0: 31.5, t, color: INK, font: FONT.serif });
      stampText(ctx, 8060, 780, '$5T', { size: 150, t0: 32.3, t, color: REDF, rot: 0.014, font: FONT.display });
      stampText(ctx, 8060, 896, 'OCT 2025', { size: 40, t0: 32.9, t, color: REDF, font: FONT.serif });
      // prints — HQ sign (left) + Jensen Huang (right), mirrored gutters (LAW 4 in-situ fades)
      drawPrint(ctx, IMG.hq, 6520, 700, { w: 360, rot: -0.018, alpha: printA(t, 28.2, 48.6, 6340) });
      drawPrint(ctx, IMG.jh, 8240, 410, { w: 420, rot: 0.016, alpha: printA(t, 34.9, 48.6, 8030) });
      const cA = clamp((t - 28.9) / 0.6, 0, 1) * a * fadeExit(6340, camXNow(t));
      if (cA > 0.01) {
        ctx.save(); ctx.globalAlpha *= cA;
        ctx.fillStyle = INK; ctx.font = '23px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText('HQ SIGN · CC BY 2.0', 6520, 930);
        ctx.restore();
      }
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
      drawPrint(ctx, IMG.alice, 12140, 560, { w: 700, rot: -0.016, alpha: printA(t, 54.8, 68.3, 11790) });
      const alA = clamp((t - 55.4) / 0.6, 0, 1) * a * fadeExit(11790, camXNow(t));
      if (alA > 0.01) {
        ctx.save(); ctx.globalAlpha *= alA;
        ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = '23px "Noto Serif", serif';
        ctx.fillText('PHOTO AS PUBLISHED BY NEWS OUTLETS', 12140, 900);
        ctx.font = 'italic 22px "Noto Serif", serif';
        ctx.fillText('identity as reported — not independently verified', 12140, 930);
        ctx.restore();
      }
      typewriter(ctx, 13520, 240, 'ALICE HUANG', { size: 109, t0: 55.2, t, cps: 12, font: FONT.display });
      typewriter(ctx, 13520, 352, 'MEGASPEED INTERNATIONAL', { size: 42, t0: 61.4, t, cps: 24, font: FONT.serif });
      typewriter(ctx, 13520, 402, 'SINGAPORE · NO RELATION TO JENSEN', { size: 34, t0: 56.1, t, cps: 26, font: FONT.serif });
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
      typewriter(ctx, 13520, 750, 'REPORTED — NEVER CHARGED', { size: 36, t0: 68.4, t, cps: 22, font: FONT.hand });
      // Singapore plate bottom-right — the documented link
      drawPrint(ctx, IMG.sg, 13600, 900, { w: 430, rot: 0.012, alpha: printA(t, 61.9, 68.3, 13330) });
      const sA = clamp((t - 62.6) / 0.6, 0, 1) * a * fadeExit(13330, camXNow(t));
      if (sA > 0.01) {
        ctx.save(); ctx.globalAlpha *= sA;
        ctx.fillStyle = INK; ctx.font = '23px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText('MARINA BAY · CC BY-SA 4.0', 13600, 1024);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  // ── S04 · THE ALLEGATION ────────────────────────────────────
  {
    const a = zoneAlpha(t, 73.1, 102.9, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 18760, 165, 'ACCORDING TO US INTELLIGENCE ASSESSMENTS', { size: 42, t0: 76.0, t, cps: 26, font: FONT.serif });
      stampText(ctx, 18760, 260, 'MSS — REPORTED', { size: 114, t0: 89.4, t, color: REDF, rot: -0.012, font: FONT.display, press: false });
      memoCard(ctx, 18760, 520, t);
      typewriter(ctx, 18760, 862, 'SPRING 2026 · RUBIO OVERSAW THE MEMO', { size: 34, t0: 100.8, t, cps: 24, font: FONT.serif });
      // White House print — Washington owns the memo (LAW 4 in-situ fade)
      drawPrint(ctx, IMG.wh, 18040, 790, { w: 440, rot: -0.016, alpha: printA(t, 79.2, 102.6, 17820) });
      const wA = clamp((t - 79.9) / 0.6, 0, 1) * a * fadeExit(17820, camXNow(t));
      if (wA > 0.01) {
        ctx.save(); ctx.globalAlpha *= wA;
        ctx.fillStyle = INK; ctx.font = '23px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText('WHITE HOUSE · CC BY 2.0', 18040, 992);
        ctx.restore();
      }
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
      ledgerColumns(ctx, 24680, 480, t);
      stampText(ctx, 24680, 940, 'NO REASON TO BELIEVE', { size: 57, t0: 133.2, t, color: INK, rot: 0.006, font: FONT.serif });
      // Great Hall print — Beijing's denial (LAW 4 in-situ fade)
      drawPrint(ctx, IMG.bj, 25380, 905, { w: 280, rot: 0.012, alpha: printA(t, 114.9, 134.0, 25215) });
      ctx.restore();
    }
  }

  // ── S06 · MEGASPEED ─────────────────────────────────────────
  {
    const a = zoneAlpha(t, 139.1, 165.3, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      chainFlow(ctx, 30480, 345, t);
      const qx = fadeExit(30480 - 340, camXNow(t));
      ctx.globalAlpha *= qx;
      typewriter(ctx, 30620, 812, 'TRACED · FEB 2024 – FEB 2026 · BLOOMBERG', { size: 32, t0: 155.6, t, cps: 28, font: FONT.serif });
      typewriter(ctx, 31140, 880, '“NORMAL AND NOT UNUSUAL”', { size: 34, t0: 162.9, t, cps: 26, font: FONT.serif });
      typewriter(ctx, 31140, 920, '— HUANG, TO BLOOMBERG', { size: 28, t0: 165.4, t, cps: 26, font: FONT.serif });
      typewriter(ctx, 31140, 966, '“THOROUGHLY INVESTIGATED AND DEBUNKED LAST YEAR”', { size: 26, t0: 166.5, t, cps: 30, font: FONT.serif });
      typewriter(ctx, 31140, 1004, '— NVIDIA', { size: 26, t0: 168.8, t, cps: 30, font: FONT.serif });
      ctx.globalAlpha /= qx;
      // supercomputer plate — illustrative, captioned honestly (LAW 4)
      drawPrint(ctx, IMG.hpc, 29880, 800, { w: 600, rot: -0.014, alpha: printA(t, 143.6, 165.0, 29700) });
      {
        const hA = clamp((t - 144.3) / 0.6, 0, 1) * a * fadeExit(29700, camXNow(t));
        if (hA > 0.01) {
          ctx.save(); ctx.globalAlpha *= hA;
          ctx.fillStyle = INK; ctx.font = '23px "Noto Serif", serif'; ctx.textAlign = 'center';
          ctx.fillText('ILLUSTRATIVE: SUPERCOMPUTER-CLASS COMPUTE', 29880, 1006);
          ctx.restore();
        }
      }
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
      const txA = clamp((36400 - 400 + 1256 - camXNow(t)) / 600, 0, 1);
      ctx.save(); ctx.globalAlpha *= txA;
      typewriter(ctx, 36400, 190, 'THE PLAYBOOK IS OLDER THAN THE MICROCHIP', { size: 56, t0: 171.5, t, cps: 26, font: FONT.serif });
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
      typewriter(ctx, 38600, 900, 'ACCESS · INTIMACY · LEVERAGE', { size: 60, t0: 206.2, t, cps: 20, font: FONT.display });
      ctx.restore();
      ctx.restore();
      // three prints — in-situ fades (LAW 4)
      drawPrint(ctx, IMG.mataHari, 35650, 552, { w: 380, rot: -0.02, alpha: printA(t, 175.3, 210.3, 35460) * fadeEntry(35840, camXNow(t)) });
      drawPrint(ctx, IMG.wolf, 37550, 552, { w: 380, rot: 0.014, alpha: printA(t, 188.2, 210.3, 37360) * fadeEntry(37740, camXNow(t)) });
      drawPrint(ctx, IMG.witt, 38550, 552, { w: 380, rot: -0.012, alpha: printA(t, 195.7, 210.3, 38360) * fadeEntry(38740, camXNow(t)) });
      // captions under prints (29px serif)
      const cap = (cx, cap1, u, sxL) => {
        if (u <= 0) return;
        const fx = fadeExit(sxL, camXNow(t)) * fadeEntry(cx + 260, camXNow(t));
        if (fx <= 0.01) return;
        ctx.save(); ctx.globalAlpha *= u * fx * zoneAlpha(t, 171.2, 210.5, 0.6, 0);
        ctx.fillStyle = INK; ctx.font = '29px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText(cap1, cx, 852); ctx.restore();
      };
      cap(35650, 'MATA HARI · 1917', clamp((t - 175.6) / 0.5, 0, 1), 35500);
      cap(37550, 'WOLF · STASI “ROMEOS”', clamp((t - 188.6) / 0.5, 0, 1), 37400);
      cap(38550, 'WITT · IRAN · 2013', clamp((t - 196.1) / 0.5, 0, 1), 38400);
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
      const u2 = clamp((t - 199.7) / 0.5, 0, 1) * zoneAlpha(t, 171.2, 210.5, 0.6, 0);
      const capX = camXNow(t);
      const fx2 = fadeEntry(39755, capX) * fadeExit(39565, capX);
      if (u2 > 0.01 && fx2 > 0.01) {
        ctx.save(); ctx.globalAlpha *= u2 * fx2;
        ctx.fillStyle = INK; ctx.font = '26px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText('FANG · 2011–15', 39680, 700); ctx.restore();
      }
    }
  }

  // ── S08 · WHY IT MATTERS ────────────────────────────────────
  {
    const a = zoneAlpha(t, 211.6, 232.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      const camX = camXNow(t);
      const tA = clamp((44200 - 330 + 1256 - camX) / 600, 0, 1);
      ctx.save(); ctx.globalAlpha *= tA;
      typewriter(ctx, 44200, 180, 'WHY WASHINGTON CARES', { size: 57, t0: 214.4, t, cps: 20, font: FONT.display });
      ctx.restore();
      exportStamps(ctx, 44200, 400, t);
      // corridor labels
      const ca = clamp((t - 216.4) / 0.6, 0, 1);
      if (ca > 0.01) {
        const lA = clamp((43480 + 1256 - camX) / 420, 0, 1);
        ctx.globalAlpha *= ca * lA;
        ctx.fillStyle = INK;
        ctx.font = '600 34px "Noto Serif", serif';
        ctx.textAlign = 'center';
        ctx.fillText('US', 43340, 770);
        ctx.fillText('CN', 44380, 770);
        ctx.globalAlpha /= ca * lA;
      }
      ctx.restore();
    }
  }

  // ── S09 · FALLOUT ───────────────────────────────────────────
  {
    const a = zoneAlpha(t, 236.9, 256.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 49060, 135, 'NOVEMBER 9, 2026', { size: 39, t0: 241.6, t, cps: 20, font: FONT.serif });
      {
        const mA = clamp((t - 252.0) / 0.6, 0, 1);
        if (mA > 0.01) {
          ctx.save(); ctx.globalAlpha *= mA * 0.9; ctx.translate(49060, 78); ctx.rotate(-0.04);
          ctx.fillStyle = REDF; ctx.font = '46px "Caveat"'; ctx.textAlign = 'center';
          ctx.fillText('a billion-dollar day', 0, 0); ctx.restore();
        }
      }
      stockChart(ctx, 49060, 300, t);
      stampText(ctx, 49060, 200, '$178.67', { size: 83, t0: 253.3, t, color: INK, rot: 0.008, font: FONT.display });
      noteCard(ctx, 48620, 960, { w: 940, h: 140, t0: 254.3, t, dur: 0.6, rot: -0.01, alpha: 1 });
      ctx.save();
      ctx.globalAlpha *= clamp((t - 255.1) / 0.5, 0, 1);
      ctx.fillStyle = INK;
      ctx.font = '700 39px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KISTENMACHER v. NVIDIA', 48620, 930);
      ctx.font = '29px "Noto Serif", serif';
      ctx.fillText('N.D. CAL. · disclosure claims only · no finding of espionage', 48620, 977);
      ctx.restore();
      // NYSE floor print — where the math happens (LAW 4 in-situ fade)
      drawPrint(ctx, IMG.nyse, 49860, 640, { w: 400, rot: 0.018, alpha: printA(t, 239.8, 256.2, 49660) });
      {
        const nA = clamp((t - 240.5) / 0.6, 0, 1) * a * fadeExit(49660, camXNow(t));
        if (nA > 0.01) {
          ctx.save(); ctx.globalAlpha *= nA;
          ctx.fillStyle = INK; ctx.font = '23px "Noto Serif", serif'; ctx.textAlign = 'center';
          ctx.fillText('NYSE FLOOR · CC BY-SA 2.0', 49860, 933);
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  // ── S10 · WHAT WE KNOW ──────────────────────────────────────
  {
    const a = zoneAlpha(t, 260.8, 276.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      evidenceWall(ctx, 53880, 470, t);
      ctx.restore();
    }
  }

  // ── S11 · THE FINAL QUESTION ────────────────────────────────
  {
    const a = zoneAlpha(t, 280.7, 303.5, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      maskUpText(ctx, 58500, 300, 'THE OLDEST TRICK', { size: 125, t0: 283.0, t1: 283.8, t, font: FONT.display });
      maskUpText(ctx, 58500, 412, 'IN THE HISTORY', { size: 125, t0: 283.9, t1: 284.7, t, font: FONT.display });
      stampText(ctx, 58500, 570, 'STILL WORKS?', { size: 190, t0: 285.2, t, color: REDF, rot: -0.012, font: FONT.display });
      ctx.restore();
    }
  }

  // ── interlude flourishes — fill empty transit bands ──────────
  interlude(ctx, 2900, 520, t, 20.0, 'sound familiar?');
  interlude(ctx, 8500, 520, t, 49.8, 'the other Huang');
  interlude(ctx, 16660, 520, t, 70.0, 'alleged. allegedly.');
  interlude(ctx, 22000, 520, t, 104.2, 'denials on the table');
  interlude(ctx, 34800, 520, t, 168.2, 'this has happened before');
  interlude(ctx, 41350, 520, t, 208.5, 'access. intimacy.');
  interlude(ctx, 46350, 520, t, 233.5, 'chips ≠ dating');
  interlude(ctx, 50750, 520, t, 257.4, 'the market did the math');
  interlude(ctx, 56450, 520, t, 277.2, 'so what do we know');

  // ── END-CARD — strata, ≥36px gaps, top→bottom ───────────────
  // mask-ups 300..476 · question stamp 560 · micro-credits 700..890
  {
    const a = clamp((t - 288.5) / 0.8, 0, 1);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = INK;
      ctx.font = 'italic 31px "Noto Serif", serif';
      ctx.textAlign = 'center';
      ctx.fillText('This film reports allegations. It does not assert guilt.', 58500, 790);
      ctx.fillText('Every contested claim is attributed on screen — and in SOURCE_REGISTER.md.', 58500, 826);
      ctx.font = '25px "Noto Serif", serif';
      ctx.fillText('SOURCES — NVIDIA Board statement & Huang memo (Nov 8 2026) · NYT · FT · NBC · WSJ · AP · BBC · ABC · CNA · Reuters · Singapore MHA (denial) · China MFA (denial) · Xi Shi & Stratagem 31: traditional narrative (SOURCES.md)', 58500, 868);
      ctx.fillText('CREDITS — Merkelbach (PD) · Bundesarchiv 183-1989-1208-420, E. Schöps (CC BY-SA 3.0 de) · Office of the President ROC (CC BY 2.0) · FBI (PD) · Met DP204810 Song Nian (CC0) · CMA 1976.1 (CC0)', 58500, 892);
      ctx.fillText('Will Buckner (CC BY 2.0) · Benh LIEU SONG (CC BY-SA 4.0) · pteron60 (CC BY 2.0) · IQRemix (CC BY-SA 2.0) · ORNL (CC BY 2.0) · Jefferson Lab (PDM) · aherrero (CC BY-SA 2.0)', 58500, 916);
      ctx.fillText('Musopen — Tchaikovsky Op. 74 IV (PD) · Voice: Kokoro-82M (Apache-2.0) · Opuscar Studio · Research cutoff 2026-11-10', 58500, 940);
      ctx.restore();
    }
  }
}
