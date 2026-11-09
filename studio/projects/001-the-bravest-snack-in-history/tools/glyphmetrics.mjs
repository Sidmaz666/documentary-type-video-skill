// glyphmetrics.mjs — measure blob geometry: per-glyph bbox aspect + counter(=white hole) fraction inside bbox.
// usage: bun frames/glyphmetrics.mjs <image.png> [canon]
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';

GlobalFonts.registerFromPath(process.cwd() + '/frames/fonts_test/Anton.ttf', 'Anton');
GlobalFonts.registerFromPath(process.cwd() + '/frames/fonts_test/PassionOne-Bold.ttf', 'P1B');

const file = process.argv[2];
const isCanon = process.argv[3] === 'canon';
const im = await loadImage(fs.readFileSync(file));
const c = createCanvas(im.width, im.height); const g = c.getContext('2d');
g.fillStyle = '#fff'; g.fillRect(0, 0, im.width, im.height);
g.drawImage(im, 0, 0);
const { width: W, height: H } = c;
const d = g.getImageData(0, 0, W, H).data;
const ink = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const l = d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114;
  ink[i] = l < 110 ? 1 : 0;
}
// connected components (4-neighborhood, BFS)
const lbl = new Int32Array(W * H).fill(-1);
const comps = [];
for (let i = 0; i < W * H; i++) {
  if (!ink[i] || lbl[i] !== -1) continue;
  const id = comps.length;
  let x0 = W, x1 = -1, y0 = H, y1 = -1, area = 0;
  const q = [i]; lbl[i] = id;
  while (q.length) {
    const p = q.pop(); const x = p % W, y = (p / W) | 0;
    area++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const np = ny * W + nx;
      if (ink[np] && lbl[np] === -1) { lbl[np] = id; q.push(np); }
    }
  }
  comps.push({ x0, x1, y0, y1, area, id });
}
// holes: count white pixels fully enclosed per comp bbox — count white components not touching comp border
// simpler: for each comp, white-pixel count inside bbox NOT connected to bbox edge
const out = [];
for (const cp of comps) {
  const bw = cp.x1 - cp.x0 + 1, bh = cp.y1 - cp.y0 + 1;
  if (bw < 8 || bh < 8) continue;
  // fill mask of comp within bbox
  const mask = new Uint8Array(bw * bh);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (lbl[(cp.y0 + y) * W + cp.x0 + x] === cp.id) mask[y * bw + x] = 1;
  // flood white from bbox border
  const outw = new Uint8Array(bw * bh);
  const q = [];
  for (let x = 0; x < bw; x++) { if (!mask[x]) { outw[x] = 1; q.push(x); } if (!mask[(bh - 1) * bw + x]) { outw[(bh - 1) * bw + x] = 1; q.push((bh - 1) * bw + x); } }
  for (let y = 0; y < bh; y++) { if (!mask[y * bw]) { outw[y * bw] = 1; q.push(y * bw); } if (!mask[y * bw + bw - 1] && !outw[y * bw + bw - 1]) { outw[y * bw + bw - 1] = 1; q.push(y * bw + bw - 1); } }
  while (q.length) {
    const p = q.pop(); const x = p % bw, y = (p / bw) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) continue;
      const np = ny * bw + nx;
      if (outw[np]) continue;
      outw[np] = 1; q.push(np);
    }
  }
  let hole = 0;
  for (let i = 0; i < bw * bh; i++) if (!mask[i] && !outw[i]) hole++;
  const aspect = bw / bh;
  const fillFrac = cp.area / (bw * bh);
  const holeFrac = hole / (bw * bh);
  out.push({ x: cp.x0, y: cp.y0, bw, bh, aspect: aspect.toFixed(3), fill: fillFrac.toFixed(3), hole: holeFrac.toFixed(3) });
}
out.sort((a, b) => a.x - b.x);
console.log(file, isCanon ? '(CANON)' : '', out.length, 'glyph blobs');
for (const o of out) console.log(`x=${o.x} y=${o.y} ${o.bw}x${o.bh} aspect=${o.aspect} fill=${o.fill} hole=${o.hole}`);
