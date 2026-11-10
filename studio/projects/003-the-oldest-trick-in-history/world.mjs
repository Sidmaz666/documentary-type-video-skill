// world.mjs — The Oldest Trick in the History Still Works, Right?
// Paper world, ink cast, real licensed prints (LAW 1/9), Song Nian vibe plate.
// Every stroke boils; every alpha multiplies.
import { INK, RED, FONT, clamp, lerp, easeInQuart, easeOutQuart, hash, GOLD } from '../../engine/style.mjs';
import { drawPaper, drawBackgroundPlate, drawPrint, roundRect, noteCard } from '../../engine/props.mjs';
import { handStroke, handCircle, handLine, arrow } from '../../engine/ink.mjs';
import { stampText, typewriter, maskUpText } from '../../engine/text.mjs';
import { ping } from '../../engine/characters.mjs';
import { T } from './timings.mjs';
import { camAt } from '../../engine/camera.mjs';

const S = T.scenes;
const REDF = RED;

// LAW 4: art must never enter the outer 60 design-px band on any frame.
// fadeExit dissolves an element BEFORE its left edge crosses the band
// (sxL = element's left edge, camX = camera center). Camera always moves right.
const camXNow = (t) => camAt(T.rail, t).x;
const fadeExit = (sxL, camX) => clamp((sxL + 1256 - camX) / 300, 0, 1);
const fadeEntry = (sxR, camX) => clamp((1256 - (sxR - camX)) / 130, 0, 1);

const ASSET_DIR = new URL('./assets/clips/', import.meta.url);
const { loadImage } = await import('../../engine/props.mjs');
const IMG = {
  jh: await loadImage(new URL('jh_2023.jpg', ASSET_DIR)),
  mataHari: await loadImage(new URL('mata_hari.jpg', ASSET_DIR)),
  wolf: await loadImage(new URL('markus_wolf.jpg', ASSET_DIR)),
  witt: await loadImage(new URL('monica_witt.png', ASSET_DIR)),
  vibe: await loadImage(new URL('songnian_landscape.jpg', ASSET_DIR)),
};

// zone dim-back (fade in over `dur`, dim after `outT`, optional floor echo)
const zoneAlpha = (t, inT, outT, dur = 0.7, floor = 0) =>
  clamp((t - inT + dur) / dur, 0, 1) * Math.max(floor, clamp(1 - Math.max(0, (t - outT) / 1.1), 0, 1));

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
  // pins (10 per side)
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
  const u = clamp((t - 96.0) / 0.7);
  if (u <= 0) return;
  noteCard(ctx, x, y, { w: 880, h: 470, t0: 96.0, t, dur: 0.6, rot: -0.012, alpha: 1 });
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.012);
  const a = clamp((t - 96.3) / 0.7, 0, 1);
  ctx.globalAlpha *= a;
  ctx.fillStyle = INK;
  ctx.font = '700 34px "Noto Serif", serif';
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
  ctx.restore();
  // caption — honest label
  ctx.save();
  ctx.globalAlpha *= clamp((t - 97.0) / 0.7, 0, 1) * 0.82;
  ctx.fillStyle = INK;
  ctx.font = 'italic 24px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('illustration — no public memo exists', x, y + 268);
  ctx.restore();
}

function chainFlow(ctx, x, y, t) {
  // MEGASPEED -> SPEEDMATRIX chain cards + arrows
  const u1 = clamp((t - 150.5) / 0.5);
  const u2 = clamp((t - 155.5) / 0.5);
  const u3 = clamp((t - 161.0) / 0.5);
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
    ctx.font = '700 44px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -8);
    ctx.font = '26px "Noto Serif", serif';
    ctx.fillText(sub, 0, 46);
    ctx.restore();
  };
  card(x - 700, 'MEGASPEED', 'Singapore · cloud compute', u1, false);
  card(x + 700, 'SPEEDMATRIX', 'Malaysia · the buyer', u2, true);
  if (u1 > 0 && u2 > 0) {
    arrow(ctx, [{ x: x - 440, y }, { x: x + 440, y }], { w: 6, color: INK, progress: clamp((t - 154) / 0.5) });
  }
  const fxB = fadeExit(x - 190, camXNow(t));
  if (fxB > 0.01) {
    ctx.save();
    ctx.globalAlpha *= u3 * fxB;
    ctx.font = '700 120px "Archivo Black", sans-serif';
    ctx.fillStyle = REDF;
    ctx.textAlign = 'center';
    ctx.fillText('$4.8B', x, y + 230);
    ctx.restore();
  }
}

function stockChart(ctx, x, y, t) {
  const u = clamp((t - 270.0) / 2.6);
  if (u <= 0) return;
  const pts = [];
  const n = 46;
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    const jag = (hash(Math.imul(i + 3, 73856093)) - 0.5) * 50;
    let dy = jag;
    if (f > 0.78) dy += (f - 0.78) / 0.22 * 430; // the cliff
    pts.push({ x: x - 1050 + f * 2100, y: y + dy });
  }
  const upto = Math.floor(u * (pts.length - 1)) + 1;
  handStroke(ctx, pts.slice(0, upto), { w: 8, color: INK, boil: 1.2 });
  // $190B annotation at the cliff foot
  const au = clamp((t - 280.5) / 0.6);
  if (au > 0) {
    handLine(ctx, x + 830, y + 445, x + 830, y + 495, { w: 5, color: REDF, boil: 1 });
    ctx.save();
    ctx.globalAlpha *= au;
    ctx.fillStyle = REDF;
    ctx.font = '700 40px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('−4.3%', x + 830, y + 515);
    ctx.restore();
  }
}

function ledgerColumns(ctx, x, y, t) {
  const u = clamp((t - 115.5) / 0.8);
  if (u <= 0) return;
  // one wide card, two columns — fits the viewport (LAW 4)
  noteCard(ctx, x, y, { w: 2050, h: 620, t0: 115.5, t, dur: 0.6, rot: -0.008, alpha: 1 });
  const a = clamp((t - 116.2) / 0.6, 0, 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha *= a;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  handLine(ctx, 0, -240, 0, 240, { w: 3, color: INK, boil: 0.8 });
  ctx.fillStyle = INK;
  ctx.font = '700 40px "Archivo Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REPORTED', -500, -200);
  ctx.fillStyle = REDF;
  ctx.fillText('DENIED / UNCONFIRMED', 500, -200);
  ctx.fillStyle = INK;
  ctx.font = '21px "Noto Serif", serif';
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


function interlude(ctx, x, y, t, t0) {
  // chapter-break flourish for empty transit bands (LAW 8 dead-air rule) — ornament, no claims
  const a = clamp((t - t0) / 0.5) * clamp((t0 + 6.0 - t) / 1.0);
  if (a <= 0.01) return;
  const p = clamp((t - t0) / 0.7);
  ctx.save();
  ctx.globalAlpha *= a;
  handLine(ctx, x - 300, y, x - 70, y, { w: 9, color: INK, boil: 1.6, progress: p });
  handLine(ctx, x + 70, y, x + 300, y, { w: 9, color: INK, boil: 1.6, progress: p });
  ctx.fillStyle = REDF;
  ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(x - 385, y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 385, y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function evidenceWall(ctx, x, y, t) {
  const u = clamp((t - 290.0) / 0.9);
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
    ctx.font = '700 34px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(head, cx, y - 222);
    ctx.fillStyle = INK;
    ctx.font = '20px "Noto Serif", serif';
    ctx.textAlign = 'left';
    lines.forEach((r, i) => ctx.fillText(r, cx - 255, y - 140 + i * 72));
    ctx.restore();
  };
  panel(x - 700, 'CONFIRMED', [
    '— Huang: “I was unfaithful”',
    '— Board: independent probe',
    '— NVDA −4.3% on Nov 9',
  ], false, clamp((t - 290.0) / 0.7));
  panel(x, 'REPORTED', [
    '— MSS asset (NYT / FT / NBC)',
    '— memo, spring 2026',
    '— Singapore MHA: no probes',
  ], false, clamp((t - 291.0) / 0.7));
  panel(x + 700, 'UNKNOWN', [
    '— what, if anything, passed',
    '— whether this was “an op”',
    '— no charge. no admission.',
  ], true, clamp((t - 292.0) / 0.7));
}

function exportStamps(ctx, x, y, t) {
  const camX = camXNow(t);
  const fx = clamp((x - 230 + 1256 - camX) / 320, 0, 1);
  const stamp = (yy, label, t0, red) => {
    ctx.save(); ctx.globalAlpha *= fx;
    stampText(ctx, x, yy, label, { size: 40, t0, t, color: red ? REDF : INK, rot: -0.008, font: FONT.display });
    ctx.restore();
  };
  stamp(y - 140, 'OCT 2022 — BIS RULES', 236.5, false);
  stamp(y - 20, 'APR 2025 — $5.5B CHARGE', 246.0, false);
  stamp(y + 100, 'MAY 2026 — ZERO DELIVERIES', 256.9, true);
  // hand-drawn corridor arc US -> CN
  const au = clamp((t - 241.0) / 1.2);
  if (au > 0) {
    arrow(ctx, [
      { x: x - 900, y: y + 330 }, { x: x - 380, y: y + 180 }, { x: x + 180, y: y + 330 },
    ], { w: 7, color: INK, progress: au });
  }
}

export function drawWorld(ctx, t) {
  drawPaper(ctx, -200, -1200, T.BOARD_W + 400, T.BOARD_H + 2400, 21);
  drawBackgroundPlate(ctx, IMG.vibe, { x: -200, y: -1200, w: T.BOARD_W + 400, h: T.BOARD_H + 2400, alpha: 0.09 });

  // ── S01 · HOOK ──────────────────────────────────────────────
  {
    const a = zoneAlpha(t, 0.0, 19.9, 0.5, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      // seed dot — the question itself
      const u = clamp((t - 0.5) / 0.5);
      if (u > 0) {
        ctx.globalAlpha *= u;
        ctx.fillStyle = REDF;
        ctx.beginPath();
        ctx.arc(1780, 320, 22 + 3 * Math.sin(t * 3.1), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha /= u;
      }
      handCircle(ctx, 1780, 320, 52 + Math.sin(t * 3.1) * 6, { w: 6, color: REDF, alpha: 0.9, progress: clamp((t - 0.5) / 0.7) });
      ping(ctx, 1780, 320, 170, (Math.max(0, t - 0.5) * 1.15) % 1.6);
      typewriter(ctx, 1780, 205, 'NOV 8, 2026', { size: 42, t0: 0.6, t, cps: 12, font: FONT.hand });
      // the quote itself — verbatim, attributed
      maskUpText(ctx, 1780, 480, '“I WAS UNFAITHFUL', { size: 96, t0: 8.0, t1: 8.6, t, font: FONT.display });
      maskUpText(ctx, 1780, 600, 'TO MY WIFE.”', { size: 96, t0: 8.75, t1: 9.35, t, font: FONT.display });
      // underline — below last line, landed AFTER the text (LAW 6)
      if (t > 9.6) handStroke(ctx, [{ x: 1470, y: 668 }, { x: 2095, y: 662 }], { w: 9, color: REDF, progress: clamp((t - 9.6) / 0.4) });
      typewriter(ctx, 1780, 775, '— JENSEN HUANG, TO NVIDIA STAFF', { size: 30, t0: 10.1, t, cps: 22, font: FONT.serif });
      stampText(ctx, 1780, 900, 'AN INDEPENDENT INVESTIGATION', { size: 40, t0: 17.74, t, color: INK, rot: -0.006, font: FONT.display });
      ctx.restore();
    }
  }

  // ── S02 · NVIDIA ────────────────────────────────────────────
  {
    const a = zoneAlpha(t, 23.8, 51.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      chipGlyph(ctx, 7000, 420, 210, t, 27.0);
      stampText(ctx, 7620, 300, '1993', { size: 96, t0: 32.0, t, color: INK, rot: 0.01, font: FONT.display });
      stampText(ctx, 7260, 770, '$4T', { size: 120, t0: 35.9, t, color: INK, rot: -0.012, font: FONT.display });
      stampText(ctx, 7620, 890, 'JUL 2025', { size: 34, t0: 36.6, t, color: INK, font: FONT.serif });
      stampText(ctx, 7970, 770, '$5T', { size: 120, t0: 39.7, t, color: REDF, rot: 0.014, font: FONT.display });
      stampText(ctx, 7970, 890, 'OCT 2025', { size: 34, t0: 40.4, t, color: REDF, font: FONT.serif });
      typewriter(ctx, 7400, 130, 'THE MOST IMPORTANT CHIP ON EARTH', { size: 30, t0: 30.5, t, cps: 26, font: FONT.serif });
      ctx.restore();
      // Jensen Huang print — right of the chip, fades in situ (LAW 4)
      drawPrint(ctx, IMG.jh, 8150, 380, { w: 330, rot: 0.016, alpha: clamp((t - 29.0) / 0.7, 0, 1) * clamp((52.2 - t) / 1.2, 0, 1) });
    }
  }

  // ── S03 · ALICE HUANG ───────────────────────────────────────
  {
    const a = zoneAlpha(t, 53.4, 73.4, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 12980, 240, 'ALICE HUANG', { size: 84, t0: 57.0, t, cps: 12, font: FONT.display });
      typewriter(ctx, 12980, 360, 'MEGASPEED INTERNATIONAL · SINGAPORE', { size: 32, t0: 58.4, t, cps: 26, font: FONT.serif });
      typewriter(ctx, 12980, 415, 'CHINESE CITIZEN · NO RELATION TO JENSEN', { size: 26, t0: 59.6, t, cps: 26, font: FONT.serif });
      // relationship diagram — two circles, dotted ?, NOT a heart
      handCircle(ctx, 12640, 640, 92, { w: 6, color: INK, progress: clamp((t - 61.5) / 0.8) });
      handCircle(ctx, 13320, 640, 92, { w: 6, color: INK, progress: clamp((t - 62.5) / 0.8) });
      ctx.font = '600 34px "Archivo Black", sans-serif';
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      const ta = clamp((t - 63.0) / 0.5, 0, 1);
      ctx.globalAlpha *= ta;
      ctx.fillText('JENSEN', 12640, 640);
      ctx.fillText('ALICE', 13320, 640);
      ctx.globalAlpha /= ta;
      if (t > 63.5) dashedLine(ctx, 12750, 640, 13210, 640, t);
      typewriter(ctx, 12980, 805, 'REPORTED — NEVER CHARGED', { size: 28, t0: 68.0, t, cps: 22, font: FONT.hand });
      ctx.restore();
    }
  }

  // ── S04 · THE ALLEGATION ────────────────────────────────────
  {
    const a = zoneAlpha(t, 80.2, 107.2, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 18760, 165, 'ACCORDING TO US INTELLIGENCE ASSESSMENTS', { size: 32, t0: 81.5, t, cps: 26, font: FONT.serif });
      stampText(ctx, 18760, 260, 'MSS — REPORTED', { size: 88, t0: 91.5, t, color: REDF, rot: -0.012, font: FONT.display, press: false });
      memoCard(ctx, 18760, 520, t);
      typewriter(ctx, 18760, 862, 'SPRING 2026 · RUBIO OVERSAW THE MEMO', { size: 26, t0: 102.5, t, cps: 24, font: FONT.serif });
      ctx.restore();
    }
  }

function dashedLine(ctx, x1, y1, x2, y2, t) {
  const u = clamp((t - 63.5) / 0.8);
  const len = x2 - x1;
  const step = 44;
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
  ctx.font = '700 64px "Archivo Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('?', (x1 + x2) / 2, y1 - 40);
  ctx.restore();
}

  // ── S05 · DENIALS ───────────────────────────────────────────
  {
    const a = zoneAlpha(t, 112.8, 147.6, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      ledgerColumns(ctx, 24680, 480, t);
      stampText(ctx, 24680, 940, 'NO REASON TO BELIEVE', { size: 44, t0: 143.5, t, color: INK, rot: 0.006, font: FONT.serif });
      ctx.restore();
    }
  }

  // ── S06 · MEGASPEED ─────────────────────────────────────────
  {
    const a = zoneAlpha(t, 146.2, 181.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      chainFlow(ctx, 30480, 345, t);
      const qx = fadeExit(30480 - 340, camXNow(t));
      ctx.globalAlpha *= qx;
      typewriter(ctx, 30480, 640, '“NORMAL AND NOT UNUSUAL” — HUANG, BLOOMBERG', { size: 26, t0: 174.0, t, cps: 30, font: FONT.serif });
      typewriter(ctx, 30480, 688, '“THOROUGHLY INVESTIGATED AND DEBUNKED LAST YEAR”', { size: 22, t0: 175.5, t, cps: 30, font: FONT.serif });
      typewriter(ctx, 30480, 728, '— NVIDIA', { size: 20, t0: 176.5, t, cps: 30, font: FONT.serif });
      ctx.globalAlpha /= qx;
      ctx.restore();
    }
  }

  // ── S07 · THE OLDEST TRICK (history wall) ───────────────────
  {
    const a = zoneAlpha(t, 181.0, 232.6, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      // title — camera pans past it; dissolve before its left edge reaches the band
      const txA = clamp((36400 - 400 + 1256 - camXNow(t)) / 600, 0, 1);
      ctx.save(); ctx.globalAlpha *= txA;
      typewriter(ctx, 36400, 180, 'THE PLAYBOOK IS OLDER THAN THE MICROCHIP', { size: 30, t0: 183.0, t, cps: 26, font: FONT.serif });
      ctx.restore();
      // spine timeline — erodes segment-by-segment as the camera passes (LAW 4)
      {
        const camX = camXNow(t);
        const drawProg = clamp((t - 183.5) / 1.4);
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
      const camX = camXNow(t);
      spine.forEach((lab, i) => {
        const u = clamp((t - 184.0 - i * 0.35) / 0.4);
        if (u <= 0) return;
        const fx = fadeExit(sx[i] - sxHalf[i], camX) * fadeEntry(sx[i] + sxHalf[i], camX);
        if (fx <= 0.01) return;
        ctx.save(); ctx.globalAlpha *= u * fx; ctx.fillStyle = INK;
        ctx.font = '700 34px "Archivo Black", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(lab, sx[i], 262); ctx.restore();
      });
      const acA = fadeExit(38600 - 390, camXNow(t));
      ctx.save(); ctx.globalAlpha *= acA;
      typewriter(ctx, 38600, 800, 'ACCESS · INTIMACY · LEVERAGE', { size: 46, t0: 221.3, t, cps: 20, font: FONT.display });
      ctx.restore();
      ctx.restore();
      // three prints — in-situ fades (LAW 4)
      drawPrint(ctx, IMG.mataHari, 35650, 430, { w: 300, rot: -0.02, alpha: clamp((t - 184.5) / 0.7, 0, 1) * clamp((232.8 - t) / 1.0, 0, 1) * fadeExit(35650 - 150, camXNow(t)) });
      drawPrint(ctx, IMG.wolf, 37550, 430, { w: 300, rot: 0.014, alpha: clamp((t - 195.0) / 0.7, 0, 1) * clamp((232.8 - t) / 1.0, 0, 1) * fadeExit(37550 - 150, camXNow(t)) });
      drawPrint(ctx, IMG.witt, 38550, 430, { w: 300, rot: -0.012, alpha: clamp((t - 202.4) / 0.7, 0, 1) * clamp((232.8 - t) / 1.0, 0, 1) * fadeExit(38550 - 150, camXNow(t)) });
      // captions under prints (24px serif)
      const cap = (cx, cap1, u) => {
        if (u <= 0) return;
        const fx = fadeExit(cx - 110, camXNow(t));
        if (fx <= 0.01) return;
        ctx.save(); ctx.globalAlpha *= u * fx * zoneAlpha(t, 181.0, 232.6, 0.6, 0);
        ctx.fillStyle = INK; ctx.font = '22px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText(cap1, cx, 700); ctx.restore();
      };
      cap(35650, 'MATA HARI · 1917', clamp((t - 185.0) / 0.5, 0, 1));
      cap(37550, 'WOLF · STASI “ROMEOS”', clamp((t - 195.5) / 0.5, 0, 1));
      cap(38550, 'WITT · IRAN · 2013', clamp((t - 203.0) / 0.5, 0, 1));
    }
  }

  // Christine Fang — text card (no licensed photo exists; honest choice)
  {
    const u = clamp((t - 214.6) / 0.6, 0, 1) * zoneAlpha(t, 181.0, 232.6, 0.6, 0);
    const fxR = fadeEntry(39830, camXNow(t)) * fadeExit(39530, camXNow(t));
    if (u > 0.01 && fxR > 0.01) {
      ctx.save();
      ctx.globalAlpha *= u * fxR;
      noteCard(ctx, 39680, 480, { w: 300, h: 360, t0: 214.6, t, dur: 0.6, rot: 0.018, alpha: fxR });
      ctx.fillStyle = INK;
      ctx.font = '700 34px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHRISTINE', 39680, 440);
      ctx.fillText('FANG', 39680, 482);
      ctx.font = '20px "Noto Serif", serif';
      ctx.fillText('“FANG FANG”', 39680, 522);
      ctx.fillText('2011–2015', 39680, 552);
      ctx.restore();
      const u2 = clamp((t - 215.2) / 0.5, 0, 1) * zoneAlpha(t, 181.0, 232.6, 0.6, 0);
      const capX = camXNow(t);
      const fx2 = fadeEntry(39755, capX) * fadeExit(39565, capX);
      if (u2 > 0.01 && fx2 > 0.01) {
        ctx.save(); ctx.globalAlpha *= u2 * fx2;
        ctx.fillStyle = INK; ctx.font = '20px "Noto Serif", serif'; ctx.textAlign = 'center';
        ctx.fillText('FANG · 2011–15', 39680, 700); ctx.restore();
      }
    }
  }

  // ── S08 · WHY IT MATTERS ────────────────────────────────────
  {
    const a = zoneAlpha(t, 232.0, 261.3, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      const camX = camXNow(t);
      const tA = clamp((44460 - 330 + 1256 - camX) / 600, 0, 1);
      ctx.save(); ctx.globalAlpha *= tA;
      typewriter(ctx, 44460, 180, 'WHY WASHINGTON CARES', { size: 44, t0: 234.0, t, cps: 20, font: FONT.display });
      ctx.restore();
      exportStamps(ctx, 44460, 400, t);
      // corridor labels
      const ca = clamp((t - 243.0) / 0.6, 0, 1);
      if (ca > 0.01) {
        const lA = clamp((43480 + 1256 - camX) / 420, 0, 1);
        ctx.globalAlpha *= ca * lA;
        ctx.fillStyle = INK;
        ctx.font = '600 26px "Noto Serif", serif';
        ctx.textAlign = 'center';
        ctx.fillText('US', 43550, 770);
        ctx.fillText('CN', 44640, 770);
        ctx.globalAlpha /= ca * lA;
      }
      ctx.restore();
    }
  }

  // ── S09 · FALLOUT ───────────────────────────────────────────
  {
    const a = zoneAlpha(t, 260.0, 283.0, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      typewriter(ctx, 49060, 135, 'NOVEMBER 9, 2026', { size: 30, t0: 263.0, t, cps: 20, font: FONT.serif });
      stockChart(ctx, 49060, 300, t);
      stampText(ctx, 49060, 200, '$178.67', { size: 64, t0: 277.5, t, color: INK, rot: 0.008, font: FONT.display });
      noteCard(ctx, 49060, 935, { w: 980, h: 140, t0: 280.0, t, dur: 0.6, rot: -0.01, alpha: 1 });
      ctx.save();
      ctx.globalAlpha *= clamp((t - 280.8) / 0.5, 0, 1);
      ctx.fillStyle = INK;
      ctx.font = '700 30px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KISTENMACHER v. NVIDIA', 49060, 905);
      ctx.font = '22px "Noto Serif", serif';
      ctx.fillText('N.D. CAL. · disclosure claims only · no finding of espionage', 49060, 952);
      ctx.restore();
      ctx.restore();
    }
  }

  // ── S10 · WHAT WE KNOW ──────────────────────────────────────
  {
    const a = zoneAlpha(t, 286.5, 308.2, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      evidenceWall(ctx, 53880, 470, t);
      ctx.restore();
    }
  }

  // ── S11 · THE FINAL QUESTION ────────────────────────────────
  {
    const a = zoneAlpha(t, 312.8, 340.5, 0.6, 0);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      maskUpText(ctx, 58500, 300, 'THE OLDEST TRICK', { size: 96, t0: 315.6, t1: 316.4, t, font: FONT.display });
      maskUpText(ctx, 58500, 412, 'IN THE HISTORY', { size: 96, t0: 316.5, t1: 317.3, t, font: FONT.display });
      stampText(ctx, 58500, 560, 'STILL WORKS?', { size: 158, t0: 317.6, t, color: REDF, rot: -0.012, font: FONT.display });
      ctx.restore();
    }
  }

  // ── tail pull-back echoes — faint memory of every hero ──────
  {
    const a = clamp((t - 320.0) / 1.6, 0, 1) * 0.16;
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      chipGlyph(ctx, 7000, 420, 210, t, 27.0);
      handCircle(ctx, 12640, 640, 92, { w: 6, color: INK, progress: 1 });
      handCircle(ctx, 13320, 640, 92, { w: 6, color: INK, progress: 1 });
      stampText(ctx, 18760, 250, 'MSS', { size: 88, t0: 0, t, color: REDF, rot: -0.012, font: FONT.display, press: false });
      drawPrint(ctx, IMG.mataHari, 35650, 430, { w: 300, rot: -0.02 });
      drawPrint(ctx, IMG.wolf, 37550, 430, { w: 300, rot: 0.014 });
      drawPrint(ctx, IMG.witt, 39680, 430, { w: 300, rot: -0.012 });
      ctx.restore();
    }
  }

  // ── interlude flourishes — fill empty transit bands ──────────
  interlude(ctx, 2900, 520, t, 20.4);
  interlude(ctx, 8500, 520, t, 51.9);
  interlude(ctx, 16660, 520, t, 76.8);
  interlude(ctx, 22000, 520, t, 109.6);
  interlude(ctx, 33850, 520, t, 176.2);
  interlude(ctx, 41350, 520, t, 229.0);
  interlude(ctx, 46350, 520, t, 258.4);
  interlude(ctx, 50750, 520, t, 283.7);
  interlude(ctx, 57600, 520, t, 310.8);

  // ── END-CARD — strata, ≥40px gaps, top→bottom ───────────────
  // mask-ups 150..330 · question stamp 380..600 · micro-credits 700..980
  {
    const a = clamp((t - 318.5) / 0.8, 0, 1);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = INK;
      ctx.font = 'italic 24px "Noto Serif", serif';
      ctx.textAlign = 'center';
      ctx.fillText('This film reports allegations. It does not assert guilt.', 58500, 700);
      ctx.fillText('Every contested claim is attributed on screen — and in SOURCE_REGISTER.md.', 58500, 736);
      ctx.font = '19px "Noto Serif", serif';
      ctx.fillText('SOURCES — NVIDIA Board statement & Huang memo (Nov 8 2026) · NYT · FT · NBC · WSJ · AP · BBC · ABC · CNA · Reuters · Singapore MHA (denial) · China MFA (denial)', 58500, 800);
      ctx.fillText('CREDITS — Merkelbach (PD) · Bundesarchiv 183-1989-1208-420 Elke Schöps (CC BY-SA 3.0 de) · Office of the President ROC (CC BY 2.0) · DOE/NREL (PD) · FBI (PD) · Met DP204810 Song Nian (CC0)', 58500, 828);
      ctx.fillText('Musopen — Tchaikovsky Op. 74 IV (PD) · Voice: Kokoro-82M (Apache-2.0) · Opuscar Studio · Research cutoff 2026-11-10', 58500, 856);
      ctx.restore();
    }
  }
}
