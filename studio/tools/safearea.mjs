// safearea.mjs — automated LAW 4 safe-area enforcement.
// Renders stills at pose times and FAILS if any ink-like (dark) pixel enters the
// outer MARGIN-px band on any edge. Paper fibers/grain never reach the ink
// threshold, so this is robust against house paper texture (verified).
//
// usage: bun studio/tools/safearea.mjs --world <world.mjs> --timings <timings.mjs> [--times t1,t2,...] [--margin 60] [--scale 2]
// default sweep: every 0.25 s of T.DUR
import { createCanvas } from '@napi-rs/canvas';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--world') args.world = argv[++i];
  else if (a === '--timings') args.timings = argv[++i];
  else if (a === '--times') args.times = argv[++i].split(',').map(Number);
  else if (a === '--margin') args.margin = parseInt(argv[++i], 10);
  else if (a === '--scale') args.scale = parseFloat(argv[++i]);
}
if (!args.world || !args.timings) {
  console.error('usage: bun safearea.mjs --world world.mjs --timings timings.mjs [--times t1,t2,...] [--margin 60] [--scale 2]');
  process.exit(2);
}
const MARGIN = args.margin ?? 60;   // LAW 4 safe area, design px
const SCALE = args.scale ?? 2;

const Tmod = await import(pathToFileURL(resolve(args.timings)).href);
const T = Tmod.T || Tmod.default?.T || Tmod;
const Wmod = await import(pathToFileURL(resolve(args.world)).href);
const drawWorld = Wmod.drawWorld || Wmod.default?.drawWorld;
const { renderFrame } = await import('../engine/compose.mjs');

const W = T.W, H = T.H;
const SW = Math.round(W / SCALE), SH = Math.round(H / SCALE);
const M = Math.round(MARGIN / SCALE);
const INK = 100; // luminance ceiling for "ink" — paper sits ~230, vignette stays >150
const INK_MIN = 40; // ink ~28, fibers never below ~120; vignette corners ~190
const canvas = createCanvas(SW, SH);
const ctx = canvas.getContext('2d');

const times = args.times || (() => { const a = []; for (let t = 0; t <= T.DUR; t += 0.25) a.push(+t.toFixed(2)); return a; })();
let failures = 0;
for (const t of times) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, SW, SH);
  renderFrame(ctx, SW, SH, t, drawWorld, { rail: T.rail, grade: { fade: { fadeIn: T.fadeIn, fadeOut: T.fadeOut } }, design: { W, H } });
  const data = ctx.getImageData(0, 0, SW, SH).data;
  // whole-frame darkness = deliberate fade (opening black / closing to black) — not a safe-area breach
  let mean = 0;
  for (let i = 0; i < data.length; i += 4) mean += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  mean /= SW * SH;
  if (mean < 180) { console.log(`skip t=${t.toFixed(2)} (dim/fade frame, mean ${mean.toFixed(0)})`); continue; }
  const darkIn = (x0, y0, x1, y1) => {
    let n = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * SW + x) * 4;
        const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        if (lum < INK) n++;
      }
    }
    return n;
  };
  const top = darkIn(0, 0, SW, M);
  const bottom = darkIn(0, SH - M, SW, SH);
  const left = darkIn(0, M, M, SH - M);
  const right = darkIn(SW - M, M, SW, SH - M);
  const worst = Math.max(top, bottom, left, right);
  const ok = worst <= INK_MIN * SCALE * SCALE; // allow a handful of px; a beheaded glyph is thousands
  if (!ok) {
    failures++;
    console.error(`FAIL t=${t.toFixed(2)} top=${top} bottom=${bottom} left=${left} right=${right}`);
  }
}
console.log(failures ? `\nSAFE AREA FAILED: ${failures} of ${times.length} frames breach the ${MARGIN}px margin` : `SAFE AREA OK: ${times.length} frames clean at ${MARGIN}px margin (design), scale ${SCALE}`);
process.exit(failures ? 1 : 0);
