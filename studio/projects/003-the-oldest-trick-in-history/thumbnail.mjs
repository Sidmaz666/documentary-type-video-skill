// thumbnail.mjs — YouTube packaging for 003 (not part of the film timeline).
//   bun thumbnail.mjs          → out/thumb.png + out/thumb-alt.png (1280×720)
// House style: paper board, ink stamps, grade-matched print of the SAME licensed
// in-film portrait (jh_2023, CC BY 2.0 — attribution rides in the video
// description credit block, per house practice for packaging).
// Minimal text: "HONEY TRAP?" (a question — never a conclusion) + honesty kicker.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { PAPER, PAPER_HI, INK, RED, TEAL, hash } from '../../engine/style.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1280, H = 720;

const font = (size, family = 'Archivo Black') => `${size}px "${family}"`;

// grade a photo: warm lift + contrast + slight desaturation toward the film grade
function gradePhoto(img) {
  const c = createCanvas(img.width, img.height);
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, img.width, img.height).data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // desaturate 40% toward luminance, then contrast + warm-cream tint
    const sat = 0.6;
    let r = g + (d[i] - g) * sat, gg = g + (d[i + 1] - g) * sat, b = g + (d[i + 2] - g) * sat;
    const cx = (v) => Math.max(0, Math.min(255, 128 + (v - 128) * 1.14)); // contrast
    r = cx(r); gg = cx(gg); b = cx(b);
    r = r * 0.97 + 244 * 0.08; gg = gg * 0.97 + 234 * 0.08; b = b * 0.97 + 216 * 0.08;
    d[i] = r; d[i + 1] = gg; d[i + 2] = b;
  }
  const out = x.createImageData(img.width, img.height);
  out.data.set(d);
  x.putImageData(out, 0, 0);
  return c;
}

// rough hand-ellipse (the boil look, quantized jitter from world coords)
function roughEllipse(x0, cx, cy, rx, ry, n = 44, seed = 11) {
  x0.lineWidth = 11; x0.lineCap = 'round'; x0.strokeStyle = RED; x0.globalAlpha = 0.92;
  x0.beginPath();
  const pts = [];
  for (let k = 0; k < n; k++) {
    const u = (k / (n - 1)) * Math.PI * 2;
    const w1 = (hash(seed * 131 + k * 7) - 0.5) * 0.052;
    const w2 = (hash(seed * 173 + k * 13) - 0.5) * 0.052;
    pts.push([cx + Math.cos(u) * rx * (1 + Math.abs(w1) * 0.5), cy + Math.sin(u) * ry * (1 + Math.abs(w2) * 0.5)]);
  }
  pts[pts.length - 1][0] = pts[0][0]; pts[pts.length - 1][1] = pts[1][1];
  x0.moveTo(pts[0][0], pts[0][1]);
  for (let k = 0; k < pts.length; k++) {
    const p = pts[k], q = pts[(k + 1) % pts.length];
    x0.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  x0.stroke(); x0.globalAlpha = 1;
}

// deterministic grain tile → pattern overlay
function grain(ctx, w, h, alpha, seed = 3) {
  const t = createCanvas(256, 256).getContext('2d');
  const image = t.createImageData(256, 256);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 118 + Math.floor(hash(seed * 977 + i) * 44);
    image.data[i] = v; image.data[i + 1] = v; image.data[i + 2] = v; image.data[i + 3] = 255;
  }
  t.putImageData(image, 0, 0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(t.canvas, 'repeat'); ctx.fillRect(0, 0, w, h); ctx.restore();
}

async function build({ stamp, alt } = {}) {
  const c = createCanvas(W, H);
  const x = c.getContext('2d');
  // paper
  x.fillStyle = PAPER; x.fillRect(0, 0, W, H);
  const grd = x.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 900);
  grd.addColorStop(0, PAPER_HI); grd.addColorStop(1, '#e3d4b8');
  x.fillStyle = grd; x.fillRect(0, 0, W, H);
  // portrait print (graded) — right side, slight rotation, bleeding right edge
  const img = gradePhoto(await loadImage(join(HERE, 'assets', 'clips', 'jh_2023.jpg')));
  const cw = 560, ch = 607; // cover proportions
  x.save();
  x.translate(1020, 358); x.rotate(-0.045);
  x.shadowColor = 'rgba(28,24,20,0.45)'; x.shadowOffsetY = 16; x.shadowBlur = 34;
  x.fillStyle = PAPER_HI; x.fillRect(-cw / 2, -ch / 2, cw, ch);
  x.shadowColor = 'transparent';
  x.drawImage(img, -cw / 2 + 13, -ch / 2 + 13, cw - 26, ch - 26);
  x.restore();
  x.save(); x.globalAlpha = 0.20; const coal = x.createLinearGradient(760, 0, W, 0);
  coal.addColorStop(0, 'rgba(34,51,59,0)'); coal.addColorStop(1, 'rgba(34,51,59,1)');
  x.fillStyle = coal; x.fillRect(760, 0, 520, H); x.restore();
  // kicker
  x.fillStyle = INK; x.globalAlpha = 0.92; x.font = font(31, 'Noto Serif'); x.textBaseline = 'alphabetic';
  x.fillText('N V I D I A   ·   T H E   M S S   ·   N O V   2 0 2 6', 74, 102);
  x.globalAlpha = 1;
  // big question — two compositions: the hook stamp or the title echo
  if (alt) {
    x.font = font(82); x.fillStyle = INK;
    x.fillText('AN AFFAIR?', 66, 268);
    x.fillStyle = RED;
    x.font = font(70);
    x.fillText('AN OPERATION?', 66, 400);
    roughEllipse(x, 330, 352, 262, 58, 48, 23);
    x.font = '46px "Caveat"'; x.fillStyle = INK; x.globalAlpha = 0.85;
    x.fillText('the oldest trick in the history — still works?', 70, 502);
    x.globalAlpha = 1;
  } else {
    x.font = font(168); x.fillStyle = INK;
    x.fillText('HONEY', 66, 308);
    x.fillStyle = RED;
    x.fillText('TRAP?', 66, 500);
    roughEllipse(x, 268, 452, 205, 62, 48, 23);
    x.font = '44px "Caveat"'; x.fillStyle = INK; x.globalAlpha = 0.85;
    x.fillText('the oldest trick — an investigation', 70, 584);
    x.globalAlpha = 1;
  }
  x.font = font(24, 'Noto Serif'); x.fillStyle = INK; x.globalAlpha = 0.62;
  x.fillText('ALLEGED, NOT ESTABLISHED  ·  THE REPORTING, TRACED', 72, 648);
  x.globalAlpha = 1;
  grain(x, W, H, 0.055, 5);
  // vignette
  const vg = x.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 860);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(28,24,20,0.28)');
  x.fillStyle = vg; x.fillRect(0, 0, W, H);
  mkdirSync(join(HERE, 'out'), { recursive: true });
  const name = alt ? 'thumb-alt.png' : 'thumb.png';
  writeFileSync(join(HERE, 'out', name), await c.encode('png'));
  console.log(`written → out/${name}`);
}

await build({ alt: false });
await build({ alt: true });
