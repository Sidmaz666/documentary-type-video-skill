// world.mjs — Ink & Ember: the board. 4000px of ink-black history drifting by
// behind four beats. House ink style; every stroke boils, every alpha multiplies.
import { INK, RED, FONT, clamp, lerp, easeInQuart, easeOutQuart, hash } from '../../engine/style.mjs';
import { drawPaper, roundRect } from '../../engine/props.mjs';
import { handStroke, handCircle } from '../../engine/ink.mjs';
import { stampText, typewriter, maskUpText } from '../../engine/text.mjs';
import { stickman } from '../../engine/characters.mjs';
import { ping } from '../../engine/characters.mjs';
import { T } from './timings.mjs';

const S = T.scenes;
const REDF = '#b3341f';

// zone dim-back: fades in over `inT`, fades out over `inT+dur` … `outT` window
const zoneAlpha = (t, inT, outT, dur = 0.7) =>
  clamp((t - inT + dur) / dur, 0, 1) * clamp(1 - Math.max(0, (t - outT) / 1.0), 0, 1);

// a filled red dot (the seed of every story)
function seedDot(ctx, x, y, r, t, t0) {
  const u = clamp((t - t0) / 0.5);
  if (u <= 0) return;
  ctx.save();
  ctx.globalAlpha *= u;
  ctx.fillStyle = REDF;
  ctx.beginPath();
  ctx.arc(x, y, r * (0.6 + 0.4 * Math.min(1, u + 0.3 * Math.sin(Math.max(0, t - t0) * 4))), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Chinese ink stick — pine-soot slab with a vermilion groove
function inkStick(ctx, x, y, t, t0) {
  const u = clamp((t - t0) / 0.6);
  if (u <= 0) return;
  ctx.save();
  ctx.globalAlpha *= u;
  ctx.translate(x, y);
  ctx.rotate(-0.035 + Math.sin(t * 2.1) * 0.004);
  // slab shadow
  ctx.fillStyle = 'rgba(28,24,20,0.25)';
  roundRect(ctx, -95, -16, 190, 44, 9); ctx.fill();
  // slab body
  ctx.fillStyle = '#241f1b';
  roundRect(ctx, -95, -22, 190, 44, 9); ctx.fill();
  // groove + two red flecks
  ctx.strokeStyle = REDF;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-78, 4); ctx.lineTo(78, 0); ctx.stroke();
  ctx.restore();
}

// grinding bowl — two shallow arc strokes
function mortar(ctx, x, y, t) {
  const u = clamp((t - 4.4) / 0.9);
  if (u <= 0) return;
  handStroke(ctx, [
    { x: x - 95, y }, { x: x - 55, y: y + 40 }, { x, y: y + 52 }, { x: x + 55, y: y + 40 }, { x: x + 95, y },
  ], { w: 9, color: INK, boil: 2, progress: u });
  handStroke(ctx, [
    { x: x - 60, y: y - 8 }, { x, y: y - 24 }, { x: x + 60, y: y - 8 },
  ], { w: 6, color: INK, boil: 2, progress: u });
}

// soot dust — deterministic hash dots above the bowl
function soot(ctx, x, y, t) {
  const u = clamp((t - 5.2) / 1.4);
  if (u <= 0) return;
  const inherited = ctx.globalAlpha;
  for (let i = 0; i < 34; i++) {
    const h1 = hash(Math.imul(i + 1, 73856093));
    const h2 = hash(Math.imul(i + 7, 19349663));
    const h3 = hash(Math.imul(i + 13, 2654435761));
    const appear = clamp((u - h3 * 0.6) / 0.35);
    if (appear <= 0) continue;
    ctx.globalAlpha = inherited * (1 - h3 * 0.55) * appear * 0.85;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(x + (h1 - 0.5) * 150, y - 30 - h2 * 120, 2.2 + h3 * 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = inherited;
}

// Gutenberg press sheet with four lines of "type"
function pressSheet(ctx, x, y, t) {
  const u = clamp((t - 10.3) / 0.7);
  if (u <= 0) return;
  // sheet drop shadow + paper
  ctx.save();
  ctx.globalAlpha *= u;
  ctx.translate(x, y);
  ctx.rotate(0.012);
  ctx.fillStyle = 'rgba(28,24,20,0.22)';
  roundRect(ctx, -195, -155, 390, 330, 7); ctx.fill();
  ctx.fillStyle = '#f8f2e0';
  roundRect(ctx, -195, -165, 390, 330, 7); ctx.fill();
  ctx.restore();
  // four lines of text setting in (staggered)
  for (let r = 0; r < 4; r++) {
    const t0 = 11.0 + r * 0.42;
    const pu = clamp((t - t0) / 0.5);
    if (pu <= 0) continue;
    const w = [330, 290, 315, 235][r];
    handStroke(ctx, [
      { x: x - 165, y: y - 105 + r * 78 },
      { x: x - 165 + w, y: y - 105 + r * 78 },
    ], { w: 7, color: INK, boil: 1.6, progress: pu });
  }
}

// type case — 5×4 standing type blocks above the press
function typeCase(ctx, x, y, t) {
  const u = clamp((t - 10.1) / 0.6);
  if (u <= 0) return;
  const inherited = ctx.globalAlpha;
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 4; r++) {
      const i = c * 4 + r;
      const h = 10 + hash(Math.imul(i + 1, 73856093)) * 26;
      const appear = clamp((u * 1.4 - hash(Math.imul(i + 3, 19349663)) * 0.5) / 0.5);
      if (appear <= 0) continue;
      ctx.globalAlpha = inherited * appear;
      ctx.fillStyle = INK;
      ctx.fillRect(x + c * 44 - 110, y + r * 34 - 74, 34, h);
    }
  }
  ctx.globalAlpha = inherited;
}

// the falling ink drop + pool ripples
function inkDrop(ctx, x, groundY, t) {
  const fallU = clamp((t - 19.5) / 3.1);
  if (t < 19.5) return;
  const y = fallU >= 1 ? groundY : lerp(90, groundY - 8, easeInQuart(fallU));
  const inherited = ctx.globalAlpha;
  if (fallU < 1) {
    // stretching drop while falling (vertical squash at terminal velocity)
    const stretch = 1 + 0.9 * fallU * fallU;
    ctx.save();
    ctx.globalAlpha *= Math.min(1, fallU * 3 + 0.2);
    ctx.translate(x, y);
    ctx.scale(1 / Math.sqrt(stretch), stretch);
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else {
    // pool + three ripples
    const landed = t - 22.6;
    ctx.save();
    ctx.globalAlpha *= 0.96;
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(x, groundY + 6, 120, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const age = landed - i * 0.22;
      if (age <= 0) continue;
      const ru = clamp(age / 1.15);
      const rx = lerp(30, 265, easeOutQuart(ru));
      ctx.globalAlpha = inherited * (1 - ru) * 0.8;
      handStroke(ctx, [
        { x: x - rx, y: groundY + 4 },
        { x, y: groundY + 16 },
        { x: x + rx, y: groundY + 4 },
      ], { w: 5, color: INK, boil: 1.4 });
      ctx.globalAlpha = inherited;
    }
  }
}

export function drawWorld(ctx, t) {
  drawPaper(ctx, -200, -250, T.BOARD_W + 400, T.BOARD_H + 500, 11);

  // ── ZONE A · hook ────────────────────────────────────────────
  {
    const a = zoneAlpha(t, 0.0, 3.9, 0.55) * clamp(1 - Math.max(0, t - 4.6) / 1.1, 0, 1);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      seedDot(ctx, 750, 225, 20, t, 0.5);
      handCircle(ctx, 750, 225, 40 + Math.sin(t * 3.2) * 8, { w: 6, color: REDF, alpha: 0.85, progress: clamp((t - 0.5) / 0.7) });
      ping(ctx, 750, 225, 150, (Math.max(0, t - 0.5) * 1.35) % 1.6);
      stampText(ctx, 750, 440, 'INK.', { size: 250, t0: 0.9, t, color: INK, rot: -0.012 });
      typewriter(ctx, 750, 625, 'five thousand years of memory', { size: 36, t0: 2.35, t, cps: 22, font: FONT.hand, rot: 0.008 });
      ctx.restore();
    }
  }

  // ── ZONE B · china ───────────────────────────────────────────
  {
    const a = zoneAlpha(t, 3.9, 10.0, 0.6) * clamp(1 - Math.max(0, t - 11.2) / 1.2, 0, 1);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      stickman(ctx, 1400, 640, { h: 250, pose: 'stand', t, progress: clamp((t - 4.2) / 1.5) });
      mortar(ctx, 1795, 585, t);
      soot(ctx, 1795, 560, t);
      inkStick(ctx, 1795, 470, t, 4.9);
      typewriter(ctx, 1650, 738, 'PINE SOOT + GLUE', { size: 46, t0: 6.25, t, cps: 18, font: FONT.serif });
      ctx.restore();
    }
  }

  // ── ZONE C · gutenberg ───────────────────────────────────────
  {
    const a = zoneAlpha(t, 10.0, 19.3, 0.6) * clamp(1 - Math.max(0, t - 20.1) / 1.2, 0, 1);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      pressSheet(ctx, 2580, 400, t);
      typeCase(ctx, 2580, 155, t);
      stampText(ctx, 2310, 692, '1440.', { size: 132, t0: 10.9, t, color: INK, rot: 0.015 });
      typewriter(ctx, 2580, 262, 'MOVABLE TYPE', { size: 30, t0: 12.45, t, cps: 22, font: FONT.serif });
      stampText(ctx, 2870, 692, '1455.', { size: 132, t0: 14.98, t, color: REDF, rot: -0.018 });
      ctx.restore();
    }
  }

  // ── ZONE D · everything ──────────────────────────────────────
  {
    const a = zoneAlpha(t, 19.1, 99.0, 0.6);
    if (a > 0.01) {
      ctx.save();
      ctx.globalAlpha *= a;
      maskUpText(ctx, 3300, 180, 'EVERYTHING YOU', { size: 68, t0: 19.0, t1: 20.1, t, font: FONT.display, rot: 0 });
      maskUpText(ctx, 3300, 268, 'HAVE EVER READ', { size: 68, t0: 20.0, t1: 21.1, t, font: FONT.display, rot: 0 });
      inkDrop(ctx, 3920, 560, t);
      stampText(ctx, 3480, 700, 'IT REMEMBERS.', { size: 130, t0: 22.9, t, color: INK, rot: -0.01 });
      ctx.restore();
    }
  }
}
