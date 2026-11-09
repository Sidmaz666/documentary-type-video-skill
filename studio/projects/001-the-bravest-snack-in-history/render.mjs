// render.mjs — project 001 render CLI (QC stills + chunks).
//   bun render.mjs still <t>            → frames/still_<t>.png
//   bun render.mjs stills t1,t2,...     → frames/still_<t>.png × n
//   bun render.mjs chunk <start> <end>  → out/part_<start>.mp4
//   [--scale S] renders at 1/S linear size (fast QC at small scales).
// Imports the engine pipeline + THIS project's world and clock.
import { createCanvas } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderFrame, renderChunkFrames } from '../../engine/compose.mjs';
import { T } from './timings.mjs';
import { drawWorld } from './world.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GRADE = { fade: { fadeIn: T.fadeIn, fadeOut: T.fadeOut } };

function stillAt(t, scale = 1, out) {
  const W = Math.round(T.W / scale), H = Math.round(T.H / scale);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  renderFrame(ctx, W, H, t, drawWorld, { rail: T.rail, grade: GRADE, design: { W: T.W, H: T.H } });
  const p = out || join(HERE, 'frames', `still_${t.toFixed(3).replace('.', '_')}.png`);
  mkdirSync(dirname(p), { recursive: true });
  return canvas.encode('png').then((png) => { writeFileSync(p, png); console.log(`wrote ${p}`); }); // encode is async
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const scaleIdx = rest.indexOf('--scale');
  const scale = scaleIdx >= 0 ? parseFloat(rest.splice(scaleIdx, 2)[1]) || 1 : 1;
  if (cmd === 'still' && rest[0] !== undefined) {
    stillAt(parseFloat(rest[0]), scale);
  } else if (cmd === 'stills' && rest[0]) {
    for (const t of rest[0].split(',').map(Number)) stillAt(t, scale);
  } else if (cmd === 'chunk' && rest.length >= 2) {
    const [s, e] = rest.map(Number);
    await renderChunkFrames({
      T, drawWorld, grade: GRADE, start: s, end: e,
      outPath: join(HERE, 'out', `part_${String(s).padStart(4, '0')}.mp4`), scale,
    });
    console.log(`chunk [${s}, ${e}) → out/`);
  } else {
    console.error('usage: bun render.mjs still <t> | stills t1,t2 | chunk <start> <end> [--scale S]');
    process.exit(2);
  }
}

main();
