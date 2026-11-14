// _overview.mjs — all-scenes contact sheet for visual QC (not published).
// Renders each scene pose at scale 3 in-memory and lays out a 3×4 grid with
// labels (scene · layout id · t). Output: public/.../stills/overview-v20.png
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
import { renderFrame } from '../../../studio/engine/compose.mjs';
import { filmGrade } from '../../../studio/engine/presets.mjs';
import { T } from './timings.mjs';
import { drawWorld } from './world.mjs';

const GRADE = filmGrade('documentary-grade', { fadeIn: T.fadeIn, fadeOut: T.fadeOut });
const SCENE_META = [
  ['S01 · HOOK', '06-asym-split', 18.2],
  ['S02 · NVIDIA', '09-hero-stat', 34],
  ['S03 · ALICE HUANG', '05-equal-split', 66],
  ['S04 · THE MEMO', '62-screenshot', 90],
  ['S05 · DENIALS', '50-table', 125],
  ['S06 · MEGASPEED', '43-flowchart', 163],
  ['S07 · HISTORY', '36-h-timeline', 203],
  ['S08 · WHY', '41-pyramid', 230.5],
  ['S09 · FALLOUT', '34-line-chart', 255.5],
  ['S10 · WHAT WE KNOW', '12-three-col', 276],
  ['S11 · FINAL QUESTION', '64-chapter-end', 294],
];
const SCALE = 3, SW = Math.round(T.W / SCALE), SH = Math.round(T.H / SCALE);
const cell = SW, capH = 66, gap = 32, margin = 44;
const COLS = 3, ROWS = 4;
const GW = COLS * cell + (COLS - 1) * gap + margin * 2;
const GH = ROWS * (SH + capH) + (ROWS - 1) * gap + margin * 2;
const grid = createCanvas(GW, GH);
const gc = grid.getContext('2d');
gc.fillStyle = '#f4ead8';
gc.fillRect(0, 0, GW, GH);

for (let i = 0; i < SCENE_META.length; i++) {
  const [name, layout, t] = SCENE_META[i];
  const c = createCanvas(SW, SH);
  renderFrame(c.getContext('2d'), SW, SH, t, drawWorld, { rail: T.rail, grade: GRADE, design: { W: T.W, H: T.H } });
  const col = i % COLS, row = Math.floor(i / COLS);
  const x = margin + col * (cell + gap), y = margin + row * (SH + capH + gap);
  gc.drawImage(c, x, y, SW, SH);
  gc.strokeStyle = '#1a1714'; gc.lineWidth = 2;
  gc.strokeRect(x + 0.5, y + 0.5, SW - 1, SH - 1);
  gc.fillStyle = '#1a1714';
  gc.font = '700 30px sans-serif';
  gc.fillText(name, x, y + SH + 34);
  gc.fillStyle = '#7a3a26';
  gc.font = '22px sans-serif';
  gc.fillText(`${layout} · t=${t}s`, x, y + SH + 60);
}
const out = join(HERE, '..', '..', '..', 'public', 'film', '003-the-oldest-trick-in-history', 'stills', 'overview-v20.png');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, await grid.encode('png'));
console.log('wrote', out, `${GW}x${GH}`);
