// audit-collision.mjs — LAW 6/8 geometric audit of every text layer vs every
// other text layer and every solid obstacle (print / card) in the film.
import { createCanvas } from '@napi-rs/canvas';
import { FONT } from '../../engine/style.mjs';

const F = { display: FONT.display, serif: FONT.serif, hand: FONT.hand, brush: FONT.brush, black: FONT.black ?? 'Archivo Black' };
const cardSolid = [
  ['memo card', 18760, 648, 1020, 560],
  ['S05 card REPORTED', 24120, 430, 820, 580],
  ['S05 card DENIED', 25160, 430, 820, 580],
  ['Fang card', 39680, 480, 300, 360],
  ['KISTENMACHER card', 48620, 960, 940, 150],
  ['S06 card MEGASPEED', 29780, 355, 660, 208],
  ['S06 card SPEEDMATRIX', 31180, 355, 660, 208],
  ['S10 panel 1', 53100, 500, 704, 512],
  ['S10 panel 2', 53880, 500, 704, 512],
  ['S10 panel 3', 54660, 500, 704, 512],
];
const prints = [
  ['S01 palace print', 2526, 592, 700, 265],
  ['S02 hq print', 6520, 720, 420, 354],
  ['S02 jh print', 8000, 415, 420, 450],
  ['S03 alice print', 12140, 550, 800, 579],
  ['S03 sg print', 13600, 870, 640, 283],
  ['S04 wh print', 19540, 755, 360, 302],
  ['S05 bj print', 25380, 852, 280, 209],
  ['S06 hpc print', 29880, 750, 760, 457],
  ['S07 mataHari print', 36050, 552, 470, 611],
  ['S07 wolf print', 37550, 566, 470, 607],
  ['S07 witt print', 38550, 552, 450, 505],
  ['S07 racks print', 40480, 480, 415, 616],
  ['S09 nyse print', 49980, 655, 400, 510],
];
const ops = [
  ['S01', 'kicker', 1345, 206, 60, 'hand', 'THE WU–YUE WARS · C. 500 BC'],
  ['S01', 'quote L1', 1345, 386, 128, 'display', '“THE MOST EXPENSIVE'],
  ['S01', 'quote L2', 1345, 518, 128, 'display', 'GIFT EVER WRAPPED.”'],
  ['S01', 'attribution', 1345, 682, 38, 'serif', '— THE STORY AS THE ANCIENTS TELL IT'],
  ['S01', 'WU PARTIES.', 1015, 844, 50, 'serif', 'WU PARTIES.'],
  ['S01', 'YUE WINS.', 1675, 844, 50, 'serif', 'YUE WINS.'],
  ['S01', 'stratagem tab', 2526, 356, 42, 'serif', 'STRATAGEM 31 OF 36'],
  ['S01', 'beauty trap', 2526, 812, 40, 'serif', '— THE BEAUTY TRAP —'],
  ['S01', '美人计', 2492, 940, 100, 'brush', '美人计'],
  ['S02', 'title', 7400, 128, 84, 'serif', 'THE MOST IMPORTANT CHIP COMPANY ON EARTH'],
  ['S02', 'subtitle', 7400, 206, 38, 'serif', 'FOUNDED 1993 · SANTA CLARA'],
  ['S02', '$4T', 6920, 862, 175, 'display', '$4T'],
  ['S02', 'JUL 2025', 6920, 990, 44, 'serif', 'JUL 2025'],
  ['S02', '$5T', 8060, 862, 175, 'display', '$5T'],
  ['S02', 'OCT 2025', 8060, 990, 44, 'serif', 'OCT 2025'],
  ['S03', 'ALICE HUANG', 13520, 232, 126, 'display', 'ALICE HUANG'],
  ['S03', 'MEGASPEED INTERNATIONAL', 13520, 348, 45, 'serif', 'MEGASPEED INTERNATIONAL'],
  ['S03', 'SINGAPORE line', 13520, 392, 37, 'serif', 'SINGAPORE · NO RELATION TO JENSEN'],
  ['S03', 'JENSEN', 13140, 620, 33, 'black', 'JENSEN'],
  ['S03', 'ALICE', 13810, 620, 33, 'black', 'ALICE'],
  ['S03', '?', 13475, 580, 83, 'black', '?'],
  ['S03', 'REPORTED — NEVER CHARGED', 13100, 700, 50, 'hand', 'REPORTED — NEVER CHARGED'],
  ['S03', 'photo caption 2', 12140, 930, 22, 'serif', 'identity as reported — not independently verified'],
  ['S04', 'kicker', 18760, 142, 40, 44, 'serif', 'ACCORDING TO US INTELLIGENCE ASSESSMENTS'],
  ['S04', 'MSS — REPORTED', 18760, 261, 110, 'display', 'MSS — REPORTED'],
  ['S04', 'illustration caption', 18760, 978, 31, 'serif', 'illustration — no public memo exists'],
  ['S05', 'REPORTED', 24120, 224, 54, 'display', 'REPORTED'],
  ['S05', 'DENIED / UNCONFIRMED', 25160, 224, 54, 'display', 'DENIED / UNCONFIRMED'],
  ['S05', 'sub L', 24120, 274, 26, 'serif', 'anonymous sources'],
  ['S05', 'sub R', 25160, 274, 26, 'serif', 'or flatly denied'],
  ['S05', 'L row 1', 23778, 342, 29, 'serif', '— CIA: described as an asset'],
  ['S05', 'L row 2', 23778, 424, 29, 'serif', '— she vanished, 2026'],
  ['S05', 'L row 3', 23778, 506, 29, 'serif', '— FT: a “romance”, reported'],
  ['S05', 'L row 4', 23778, 588, 29, 'serif', '— no document, no charge'],
  ['S05', 'R row 1', 24818, 342, 29, 'serif', '— China: “smears… slander”'],
  ['S05', 'R row 2', 24818, 424, 29, 'serif', '— Singapore MHA: no probes'],
  ['S05', 'R row 3', 24818, 506, 29, 'serif', '— NBC: not independently'],
  ['S05', 'R row 4', 24818, 588, 29, 'serif', '— confirmed · CIA silent'],
  ['S05', 'stamp', 24000, 945, 74, 'serif', 'NO REASON TO BELIEVE'],
  ['S06', 'MEGASPEED', 29780, 347, 62, 'black', 'MEGASPEED'],
  ['S06', 'cloud compute', 29780, 405, 36, 'serif', 'Singapore · cloud compute'],
  ['S06', 'SPEEDMATRIX', 31180, 347, 62, 'black', 'SPEEDMATRIX'],
  ['S06', 'the buyer', 31180, 405, 36, 'serif', 'Malaysia · the buyer'],
  ['S06', 'follow the money ↓', 30480, 227, 56, 'hand', 'follow the money ↓'],
  ['S06', '$4.8B', 30640, 735, 184, 'display', '$4.8B'],
  ['S06', 'TRACED line', 31200, 812, 30, 'serif', 'TRACED · FEB 2024 – FEB 2026 · BLOOMBERG'],
  ['S06', 'NORMAL AND NOT UNUSUAL', 31140, 884, 37, 'serif', '“NORMAL AND NOT UNUSUAL”'],
  ['S06', '— HUANG, TO BLOOMBERG', 31140, 920, 28, 'serif', '— HUANG, TO BLOOMBERG'],
  ['S06', 'THOROUGHLY quote', 31140, 966, 26, 'serif', '“THOROUGHLY INVESTIGATED AND DEBUNKED LAST YEAR”'],
  ['S06', '— NVIDIA', 31140, 1004, 26, 'serif', '— NVIDIA'],
  ['S07', 'title', 36400, 195, 72, 'serif', 'THE PLAYBOOK IS OLDER THAN THE MICROCHIP'],
  ['S07', 'tick 1917', 35650, 248, 44, 'black', '1917'],
  ['S07', 'tick 1950s', 37550, 248, 44, 'black', '1950s–80s'],
  ['S07', 'tick 2013', 38550, 248, 44, 'black', '2013'],
  ['S07', 'tick 2011–15', 39650, 248, 44, 'black', '2011–15'],
  ['S07', 'CHRISTINE', 39680, 440, 44, 'black', 'CHRISTINE'],
  ['S07', 'FANG', 39680, 482, 44, 'black', 'FANG'],
  ['S07', '“FANG FANG”', 39680, 522, 26, 'serif', '“FANG FANG”'],
  ['S07', '2011–2015', 39680, 552, 26, 'serif', '2011–2015'],
  ['S08', 'kicker', 44200, 128, 54, 'hand', 'the choke point'],
  ['S08', 'WHY WASHINGTON CARES', 44200, 300, 150, 'display', 'WHY WASHINGTON CARES'],
  ['S08', 'OCT 2022 — BIS RULES', 44200, 404, 60, 'display', 'OCT 2022 — BIS RULES'],
  ['S08', 'APR 2025 — $5.5B CHARGE', 44200, 496, 60, 'display', 'APR 2025 — $5.5B CHARGE'],
  ['S08', 'MAY 2026 — ZERO DELIVERIES', 44200, 616, 62, 'display', 'MAY 2026 — ZERO DELIVERIES'],
  ['S08', 'BIS LICENSE', 43750, 828, 34, 'black', 'BIS LICENSE'],
  ['S08', 'US node', 43160, 920, 56, 'black', 'US'],
  ['S08', 'CN node', 44380, 920, 56, 'black', 'CN'],
  ['S09', 'kicker', 49060, 122, 46, 'serif', 'NOVEMBER 9, 2026'],
  ['S09', '$178.67', 49060, 330, 188, 'display', '$178.67'],
  ['S09', '−4.3%', 49600, 985, 52, 'display', '−4.3%'],
  ['S09', 'KISTENMACHER v. NVIDIA', 48620, 934, 42, 'black', 'KISTENMACHER v. NVIDIA'],
  ['S09', 'N.D. CAL. line', 48620, 979, 30, 'serif', 'N.D. CAL. · disclosure claims only · no finding of espionage'],
  ['S10', 'case-file header', 53880, 130, 40, 'serif', 'CASE FILE 003 — THE PROOF BOARD'],
  ['S10', 'CONFIRMED', 53100, 264, 49, 'black', 'CONFIRMED'],
  ['S10', 'REPORTED', 53880, 264, 49, 'black', 'REPORTED'],
  ['S10', 'UNKNOWN', 54660, 264, 49, 'black', 'UNKNOWN'],
  ['S10', 'c1 r1', 52805, 348, 28, 'serif', '— Huang: “I was unfaithful”'],
  ['S10', 'c1 r2', 52805, 424, 28, 'serif', '— Board: independent probe'],
  ['S10', 'c1 r3', 52805, 500, 28, 'serif', '— NVDA −4.3% on Nov 9'],
  ['S10', 'c2 r1', 53585, 348, 28, 'serif', '— MSS asset (NYT / FT / NBC)'],
  ['S10', 'c2 r2', 53585, 424, 28, 'serif', '— memo, spring 2026'],
  ['S10', 'c2 r3', 53585, 500, 28, 'serif', '— Singapore MHA: no probes'],
  ['S10', 'c3 r1', 54365, 348, 28, 'serif', '— what, if anything, passed'],
  ['S10', 'c3 r2', 54365, 424, 28, 'serif', '— whether this was “an op”'],
  ['S10', 'c3 r3', 54365, 500, 28, 'serif', '— no charge. no admission.'],
  ['S10', 'conclusion', 53880, 930, 53, 'display', 'THE EVIDENCE DECIDES THE CONCLUSION.'],
  ['S11', 'mask-up L1', 58500, 330, 142, 'display', 'THE OLDEST TRICK'],
  ['S11', 'mask-up L2', 58500, 462, 142, 'display', 'IN THE HISTORY'],
  ['S11', 'STILL WORKS?', 58500, 700, 175, 'display', 'STILL WORKS?'],
  ['INT', 'sound familiar?', 3480, 460, 86, 'hand', 'sound familiar?'],
  ['INT', 'the other Huang', 8500, 460, 86, 'hand', 'the other Huang'],
  ['INT', 'alleged. allegedly.', 16660, 460, 86, 'hand', 'alleged. allegedly.'],
  ['INT', 'denials on the table', 22000, 460, 86, 'hand', 'denials on the table'],
  ['INT', 'this has happened before', 34800, 460, 86, 'hand', 'this has happened before'],
  ['INT', 'access. intimacy.', 41350, 460, 86, 'hand', 'access. intimacy.'],
  ['INT', 'chips ≠ dating', 46350, 460, 86, 'hand', 'chips ≠ dating'],
  ['INT', 'the market did the math', 50750, 460, 86, 'hand', 'the market did the math'],
  ['INT', 'so what do we know', 56450, 460, 86, 'hand', 'so what do we know'],
];
const obstacles = [
  ...prints.map(([n, x, y, w, h]) => ({ name: n, x, y, w, h })),
  ...cardSolid.map(([n, x, y, w, h]) => ({ name: n, x, y, w, h })),
];

const ctx = createCanvas(16, 16).getContext('2d');
function boxFor(o) {
  const [scene, label, x, y, size, fontKey, text] = o;
  const fam = F[fontKey] ?? F.serif;
  ctx.font = `${size}px "${fam}"`;
  const m = ctx.measureText(text);
  const asc = m.actualBoundingBoxAscent ?? size * 0.75;
  const desc = m.actualBoundingBoxDescent ?? size * 0.25;
  return { scene, label, x, y, size, text, x0: x - m.width / 2, x1: x + m.width / 2, y0: y - asc, y1: y + desc, w: m.width, asc, desc };
}
const boxes = ops.map(o => ({ o, b: boxFor(o) }));
let fails = 0;
const hits = [];
const INTERNAL = {
  S04: ['memo card'],
  S05: ['S05 card REPORTED', 'S05 card DENIED'],
  S06: ['S06 card MEGASPEED', 'S06 card SPEEDMATRIX'],
  S07: ['Fang card'],
  S09: ['KISTENMACHER card'],
  S10: ['S10 panel 1', 'S10 panel 2', 'S10 panel 3'],
};
const INTERNAL_TEXTS = {
  S05: ['REPORTED', 'DENIED / UNCONFIRMED', 'sub L', 'sub R', 'L row 1', 'L row 2', 'L row 3', 'L row 4', 'R row 1', 'R row 2', 'R row 3', 'R row 4'],
  S06: ['MEGASPEED', 'cloud compute', 'SPEEDMATRIX', 'the buyer'],
  S07: ['CHRISTINE', 'FANG', '“FANG FANG”', '2011–2015'],
  S09: ['KISTENMACHER v. NVIDIA', 'N.D. CAL. line'],
  S10: ['CONFIRMED', 'REPORTED', 'UNKNOWN', 'c1 r1', 'c1 r2', 'c1 r3', 'c2 r1', 'c2 r2', 'c2 r3', 'c3 r1', 'c3 r2', 'c3 r3'],
};
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j];
    if (A.o[0] !== B.o[0]) continue;
    const ox = Math.min(A.b.x1, B.b.x1) - Math.max(A.b.x0, B.b.x0);
    const oy = Math.min(A.b.y1, B.b.y1) - Math.max(A.b.y0, B.b.y0);
    if (ox > 6 && oy > 6) {
      hits.push(`text×text [${A.o[0]}] ${A.o[1]} ↔ ${B.o[1]}  (x ${ox.toFixed(0)}, y ${oy.toFixed(0)})`);
      fails++;
    }
  }
}
for (const { o, b } of boxes) {
  for (const ob of obstacles) {
    if ((INTERNAL[o[0]] ?? []).includes(ob.name) && (INTERNAL_TEXTS[o[0]] ?? []).includes(o[1])) continue;
    const ox0 = ob.x - ob.w / 2, ox1 = ob.x + ob.w / 2, oy0 = ob.y - ob.h / 2, oy1 = ob.y + ob.h / 2;
    const ox = Math.min(b.x1, ox1) - Math.max(b.x0, ox0);
    const oy = Math.min(b.y1, oy1) - Math.max(b.y0, oy0);
    if (ox > 10 && oy > 10) {
      hits.push(`text×obstacle [${o[0]}] ${o[1]} ↔ ${ob.name}  (x ${ox.toFixed(0)}, y ${oy.toFixed(0)})`);
      fails++;
    }
  }
}
console.log('=== COLLISION AUDIT ===');
for (const h of hits) console.log('FAIL', h);
console.log(fails === 0 ? 'NO COLLISIONS' : `${fails} COLLISION(S)`);
console.log('');
console.log('=== ALL VERTICAL GAPS (sorted by y) ===');
const byScene = {};
for (const { o, b } of boxes) (byScene[o[0]] ??= []).push({ o, b });
for (const [scene, list] of Object.entries(byScene)) {
  list.sort((a, b) => a.b.y0 - b.b.y0);
  console.log('[' + scene + ']');
  for (let i = 0; i < list.length; i++) {
    const { o, b } = list[i];
    console.log(`   y ${String(o[3]).padStart(4)}  asc ${b.asc?.toFixed?.(1) ?? '?'}  box ${b.y0.toFixed(0)}..${b.y1.toFixed(0)}  ${o[1]}`);
  }
  for (let i = 1; i < list.length; i++) {
    const gap = list[i].b.y0 - list[i - 1].b.y1;
    console.log(`   gap ${gap.toFixed(0).padStart(4)}px  '${list[i - 1].o[1]}' ↓ '${list[i].o[1]}'`);
  }
}
