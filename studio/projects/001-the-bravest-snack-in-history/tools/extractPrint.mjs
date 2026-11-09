// extractPrint.mjs v3 — photo-interior rescue, fixed & simple.
// Per-scanline edge detection → iterated least-squares line fits → de-rotate → crop.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';

const [file, out, cxS, cyS, wS, hS, dbg] = process.argv.slice(2);
const cx = +cxS, cy = +cyS, aw = +wS, ah = +hS;
const im = await loadImage(fs.readFileSync(file));
const W = im.width, H = im.height;
const c = createCanvas(W, H); const g = c.getContext('2d');
g.drawImage(im, 0, 0);
const data = g.getImageData(0, 0, W, H).data;
const lum = (x, y) => { const i = (y * W + x) * 4; return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114; };

// approx outer box
const padX = aw * 0.10, padY = ah * 0.12;
const ox0 = Math.max(1, Math.round(cx - aw / 2 - padX)), ox1 = Math.min(W - 2, Math.round(cx + aw / 2 + padX));
const oy0 = Math.max(1, Math.round(cy - ah / 2 - padY)), oy1 = Math.min(H - 2, Math.round(cy + ah / 2 + padY));

// border-white threshold: row/col-wise 97th percentile of the approx box borders is border; simplest: fixed bright threshold found from edge samples
// find threshold: look at a horizontal profile across mid-height
const hx = Math.round(cx), hy = Math.round(cy);
const prof = [];
for (let x = ox0; x <= ox1; x += 2) prof.push([x, lum(x, hy)]);
// print border white ~ max of profile
const THenv = process.env.TH ? +process.env.TH : null;
let maxL = 0; for (const [, v] of prof) if (v > maxL) maxL = v;
const TH = THenv ?? Math.min(250, maxL * 0.985);
const isB = (x, y) => { if (x < 1 || y < 1 || x > W - 1 || y > H - 1) return false; return lum(x, y) > TH; };
console.log('white threshold', TH.toFixed(1));

// per-scanline FIRST white-run starts (walk direction given), skipping <run> px
function runStart(x0, y0, dx, dy, maxD) {
  let run = 0, start = null;
  for (let d = 0; d <= maxD; d++) {
    const x = x0 + dx * d, y = y0 + dy * d;
    if (isB(x, y)) { if (run === 0) { start = [x, y]; } run++; if (run >= 10) return start; }
    else { run = 0; start = null; }
  }
  return null;
}
// scan lines for each edge
const step = 3;
const eL = [], eR = [], eT = [], eB = [];
for (let y = oy0; y <= oy1; y += step) {
  const p = runStart(ox0, y, 1, 0, (ox1 - ox0)); if (p) eL.push(p);
  const q = runStart(ox1, y, -1, 0, (ox1 - ox0)); if (q) eR.push(q);
}
for (let x = ox0; x <= ox1; x += step) {
  const p = runStart(x, oy0, 0, 1, (oy1 - oy0)); if (p) eT.push(p);
  const q = runStart(x, oy1, 0, -1, (oy1 - oy0)); if (q) eB.push(q);
}
console.log('edge pts', eL.length, eR.length, eT.length, eB.length);

// robust fit v = a + b u (u horizontal for T/B; vertical for L/R)
function fit(ptsV, vertical) {
  // fit v = a + b*u ; vertical: u=y, v=x ; horizontal: u=x, v=y
  let P = vertical ? ptsV.map(([x, y]) => [y, x]) : ptsV.map(([x, y]) => [x, y]);
  for (let it = 0; it < 8; it++) {
    let su = 0, sv = 0, suu = 0, suv = 0;
    for (const [u, v] of P) { su += u; sv += v; suu += u * u; suv += u * v; }
    const b = (P.length * suv - su * sv) / Math.max(1e-9, P.length * suu - su * su);
    const a = (sv - b * su) / P.length;
    const resid = P.map(([u, v]) => Math.abs(v - (a + b * u)));
    const mx = Math.max(...resid);
    if (mx < 3.5) return { a, b, vertical, n: P.length };
    const order = resid.map((r, i) => [r, i]).sort((p, q) => q[0] - p[0]);
    const drop = new Set(order.slice(0, Math.max(1, Math.floor(P.length * 0.3))).map(p => p[1]));
    const P2 = P.filter((_, i) => !drop.has(i));
    if (P2.length < 12) return null;
    P = P2;
  }
  return null;
}
const fL = fit(eL, true), fR = fit(eR, true), fT = fit(eT, false), fB = fit(eB, false);
if (!fL || !fR || !fT || !fB) throw new Error('fit failed: ' + [fL, fR, fT, fB].map(v => !!v).join(','));
console.log(`L x=${fL.a.toFixed(1)}${fL.b >= 0 ? '+' : ''}${fL.b.toFixed(5)}y n=${fL.n}`);
console.log(`R x=${fR.a.toFixed(1)}${fR.b >= 0 ? '+' : ''}${fR.b.toFixed(5)}y n=${fR.n}`);
console.log(`T y=${fT.a.toFixed(1)}${fT.b >= 0 ? '+' : ''}${fT.b.toFixed(5)}x n=${fT.n}`);
console.log(`B y=${fB.a.toFixed(1)}${fB.b >= 0 ? '+' : ''}${fB.b.toFixed(5)}x n=${fB.n}`);
// corners
function corn(fV, fH) {
  const d = 1 - fV.b * fH.b;
  const x = (fV.a + fV.b * fH.a) / d;
  const y = fH.vertical ? (fH.a + fH.b * x) : (fH.a + fH.b * x);
  return [x, y];
}
const TL = corn(fL, fT), TR = corn(fR, fT), BL = corn(fL, fB), BR = corn(fR, fB);
console.log('TL', TL.map(v => v.toFixed(1)), 'TR', TR.map(v => v.toFixed(1)), 'BL', BL.map(v => v.toFixed(1)), 'BR', BR.map(v => v.toFixed(1)));
const ang = (Math.atan(fL.b || 0) ? 0 : 0);
const theta = (Math.atan2(fB.b + fT.b, 2));
console.log('rotation deg', (theta * 180 / Math.PI).toFixed(3));
const cxr = (TL[0] + BR[0]) / 2, cyr = (TL[1] + BR[1]) / 2;
const iw = (Math.hypot(TR[0] - TL[0], TR[1] - TL[1]) + Math.hypot(BR[0] - BL[0], BR[1] - BL[1])) / 2;
const ih = (Math.hypot(BL[0] - TL[0], BL[1] - TL[1]) + Math.hypot(BR[0] - TR[0], BR[1] - TR[1])) / 2;
const inset = +(process.env.INSET || 0);
const outW = Math.max(2, Math.round(iw - inset * 2)), outH = Math.max(2, Math.round(ih - inset * 2));
const oc = createCanvas(outW, outH); const og = oc.getContext('2d');
og.save();
og.translate(outW / 2, outH / 2); og.rotate(-theta);
if (inset) og.scale(outW / iw, outH / ih);
og.translate(-cxr, -cyr);
og.drawImage(c, 0, 0);
og.restore();
fs.writeFileSync(out, await oc.encode('png'));
console.log('wrote', out, outW + 'x' + outH, fs.statSync(out).size, 'bytes');
if (dbg) {
  const dc = createCanvas(W, H); const dg = dc.getContext('2d');
  dg.drawImage(c, 0, 0);
  dg.strokeStyle = 'red'; dg.lineWidth = 4;
  dg.beginPath(); dg.moveTo(TL[0], TL[1]); dg.lineTo(TR[0], TR[1]); dg.lineTo(BR[0], BR[1]); dg.lineTo(BL[0], BL[1]); dg.closePath(); dg.stroke();
  fs.writeFileSync(dbg, await dc.encode('png'));
}
