// fontscore.mjs — score candidate display/mono fonts against a canon text crop via IoU.
// usage: bun frames/fontscore.mjs <canoncrop.png> "TEXT" [display|mono]
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';

const [canonFile, text, list] = process.argv.slice(2);

for (const [file, alias] of [
  ['Anton.ttf', 'Anton'], ['ArchivoBlack.ttf', 'Archivo Black'],
  ['PassionOne-Black.ttf', 'Passion One Black'], ['PassionOne-Bold.ttf', 'Passion One Bold'],
  ['Oswald.ttf', 'Oswald'], ['FjallaOne.ttf', 'Fjalla One'], ['BebasNeue.ttf', 'Bebas'],
  ['Archivo.ttf', 'ArchivoVar'], ['Inter.ttf', 'InterVar'],
  ['JBMono.ttf', 'JBVar'], ['JB700.ttf', 'JB700'], ['JB800.ttf', 'JB800'],
  ['PlexMono.ttf', 'IBM Plex Mono'], ['SpaceMono.ttf', 'Space Mono'],
  ['DMMono.ttf', 'DM Mono'], ['CourierPrime.ttf', 'Courier Prime'],
]) GlobalFonts.registerFromPath(process.cwd() + '/frames/fonts_test/' + file, alias);

const fonts = list === 'mono'
  ? ['JBVar', 'JB700', 'JB800', 'IBM Plex Mono', 'Space Mono', 'DM Mono', 'Courier Prime']
  : ['Anton', 'Archivo Black', 'Passion One Black', 'Passion One Bold', 'Oswald', 'Fjalla One', 'Bebas', 'ArchivoVar', 'InterVar'];

const canon = await loadImage(fs.readFileSync(canonFile));
// binarize canon: dark<110 = ink
function binarize(im, W, H, dx = 0, dy = 0, dw = im.width, dh = im.height) {
  const c = createCanvas(W, H); const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.drawImage(im, dx, dy, dw, dh, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  return { W, H, ink: Uint8Array.from(Array(W * H), (_, i) => (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114 < 110 ? 1 : 0)) };
}
// tight-crop canon to ink bbox
{
  const b = binarize(canon, canon.width, canon.height);
  let x0 = b.W, x1 = 0, y0 = b.H, y1 = 0;
  for (let y = 0; y < b.H; y++) for (let x = 0; x < b.W; x++) if (b.ink[y * b.W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  var cb = binarize(canon, x1 - x0 + 1, y1 - y0 + 1, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}
const CW = 480;
const cbS = binarize(canon, CW, Math.round(cb.H * CW / cb.W));

function iou(a, b) {
  let inter = 0, union = 0;
  for (let i = 0; i < a.ink.length; i++) { const A = a.ink[i], B = b.ink[i]; if (A && B) inter++; if (A || B) union++; }
  return inter / union;
}

const results = [];
for (const alias of fonts) {
  const sizes = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]; // letter-spacing factors
  let best = 0, bestLS = 0;
  for (const ls of sizes) {
    // render text on white, tight-crop to ink bbox, scale to cbS box
    const tW = 1600, tH = 420;
    const c = createCanvas(tW, tH); const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, tW, tH);
    g.fillStyle = '#000'; g.font = `300px "${alias}"`;
    if (ls !== 1) {
      // manual letter-spacing
      const cs = text.split('').map(ch => {
        const m = g.measureText(ch); return { ch, w: m.width };
      });
      const total = cs.reduce((s, x) => s + x.w, 0) * ls + (ls - 1) * 40;
      let pen = 20; g.fillStyle = '#000'; g.font = `300px "${alias}"`;
      for (const { ch, w } of cs) { g.fillText(ch, pen, 340); pen += w * ls + (ls - 1) * 40; }
    } else g.fillText(text, 20, 340);
    const b0 = binarize(c, tW, tH);
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; let any = false;
    for (let y = 0; y < tH; y++) for (let x = 0; x < tW; x++) if (b0.ink[y * tW + x]) { any = true; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (!any) continue;
    const bb = binarize(c, x1 - x0 + 1, y1 - y0 + 1, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    const bS = binarize(c, CW, Math.round(bb.H * CW / bb.W));
    const score = iou(cbS, bS);
    if (score > best) { best = score; bestLS = ls; }
  }
  results.push([alias, best, bestLS]);
}
results.sort((a, b) => b[1] - a[1]);
for (const [a, s, ls] of results) console.log(s.toFixed(4), 'ls=' + ls, a);
