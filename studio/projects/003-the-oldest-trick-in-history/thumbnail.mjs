// thumbnail.mjs — YouTube packaging for 003 (not part of the film timeline).
//   bun thumbnail.mjs          → out/thumb.png (1280×720) + out/thumb-alt.png
// LAW 15 — packaging must match the cut: the headline is the film's real title
// ("THE OLDEST TRICK / IN THE HISTORY / STILL WORKS?"), the print is the SAME
// licensed in-film Jensen Huang print (jh_2023, CC BY 2.0 — credit rides in the
// video description credit block), and the honesty line stays. No claim or
// image the film does not contain. House style: paper board, ink stamps,
// script subline, grain + vignette.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { PAPER, PAPER_HI, INK, RED, hash } from '../../engine/style.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1280, H = 720;

const display = (size) => `700 ${size}px "Anton", "Archivo Black", sans-serif`;

// grade a photo: warm lift + contrast + slight desaturation toward the film grade
function gradePhoto(img) {
  const c = createCanvas(img.width, img.height);
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, img.width, img.height).data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const sat = 0.6;
    let r = g + (d[i] - g) * sat, gg = g + (d[i + 1] - g) * sat, b = g + (d[i + 2] - g) * sat;
    const cx = (v) => Math.max(0, Math.min(255, 128 + (v - 128) * 1.14));
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
  x0.lineWidth = 10; x0.lineCap = 'round'; x0.strokeStyle = RED; x0.globalAlpha = 0.92;
  x0.beginPath();
  const pts = [];
  for (let k = 0; k < n; k++) {
    const u = (k / n) * Math.PI * 2;
    const w1 = (hash(seed * 131 + k * 7) - 0.5) * 0.05;
    const w2 = (hash(seed * 173 + k * 13) - 0.5) * 0.05;
    pts.push([cx + Math.cos(u) * rx * (1 + Math.abs(w1) * 0.5), cy + Math.sin(u) * ry * (1 + Math.abs(w2) * 0.5)]);
  }
  const a = pts[0], b = pts[n - 1];
  x0.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  for (let k = 0; k < n; k++) {
    const p = pts[k], q = pts[(k + 1) % n];
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

function paper(x) {
  x.fillStyle = PAPER; x.fillRect(0, 0, W, H);
  const grd = x.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 900);
  grd.addColorStop(0, PAPER_HI); grd.addColorStop(1, '#e3d4b8');
  x.fillStyle = grd; x.fillRect(0, 0, W, H);
  // laid-paper grid, house texture
  x.save(); x.globalAlpha = 0.05; x.strokeStyle = INK; x.lineWidth = 1.4;
  for (let gx = 60; gx < W; gx += 118) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
  for (let gy = 40; gy < H; gy += 118) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
  x.restore();
}

function print(x, img, cx, cy, w, rot) {
  const iw = img.width, ih = img.height;
  const pw = w, ph = (w - 68) * (ih / iw) + 68;
  x.save();
  x.translate(cx, cy); x.rotate(rot);
  x.shadowColor = 'rgba(28,24,20,0.45)'; x.shadowOffsetY = 14; x.shadowBlur = 30;
  x.fillStyle = '#faf6ec'; x.fillRect(-pw / 2, -ph / 2, pw, ph);
  x.shadowColor = 'transparent';
  x.drawImage(img, -pw / 2 + 17, -ph / 2 + 17, pw - 34, ph - 34);
  x.restore();
}

async function build({ alt } = {}) {
  const c = createCanvas(W, H);
  const x = c.getContext('2d');
  paper(x);

  // print — the film's own licensed print (jh in S02; palace in the S01 hook)
  const img = alt
    ? gradePhoto(await loadImage(join(HERE, 'assets', 'clips', 'palace.jpg')))
    : gradePhoto(await loadImage(join(HERE, 'assets', 'clips', 'jh_2023.jpg')));
  if (alt) print(x, img, 980, 470, 420, -0.045);
  else print(x, img, 1080, 430, 340, -0.045);

  // kicker
  x.fillStyle = INK; x.globalAlpha = 0.92;
  x.font = '31px "Noto Serif", serif'; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
  x.fillText('N V I D I A   ·   T H E   M S S   ·   N O V   2 0 2 6', 66, 92);
  x.globalAlpha = 1;

  // the film's real title — nothing the cut does not deliver
  x.fillStyle = INK;
  x.font = display(124);
  x.fillText('THE OLDEST TRICK', 60, 240);
  x.fillText('IN THE HISTORY', 60, 372);
  x.fillStyle = RED;
  x.font = display(124);
  const l3w = x.measureText('STILL WORKS?').width;
  x.fillText('STILL WORKS?', 60, 516);
  roughEllipse(x, 60 + l3w / 2, 468, l3w / 2 + 40, 84, 48, 23);

  // script subline + honesty line
  x.font = '44px "Caveat"'; x.fillStyle = INK; x.globalAlpha = 0.85;
  x.fillText('the oldest trick — an investigation', 64, 606);
  x.globalAlpha = 1;
  x.font = '24px "Noto Serif", serif'; x.fillStyle = INK; x.globalAlpha = 0.62;
  x.fillText('ALLEGED, NOT ESTABLISHED  ·  THE REPORTING, TRACED', 64, 668);
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
