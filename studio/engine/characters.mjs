// characters.mjs — the cast. All line-art in INK with boil; every character
// rotates around its OWN center (translate first, then rotate — pivot bug
// banned). LAW 5 is honored structurally: the cow's tail is rooted INSIDE the
// rump silhouette and the root joint is covered by the body fill.
import { INK, RED, hash, clamp, lerp } from './style.mjs';
import { boilPt, boilWobble, handStroke, handCircle } from './ink.mjs';

const STROKE = { w: 6, color: INK, boil: 2.4 };

// ── stickman ──────────────────────────────────────────────────────────────
// Clean stick figure hunter. Origin (x, y) = ground under the feet. h = height.
// pose: 'stand' | 'alert' | 'spear' | 'walk'. progress ∈ [0,1] draws progressively.
export function stickman(ctx, x, y, opts = {}) {
  const { h = 420, pose = 'stand', t = 0, walk = 0, progress = 1, alpha = 1, w = STROKE.w * 1.55 } = opts;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y);
  ctx.rotate(boilWobble(0.0016)); // pivot = own base center
  const u = clamp(progress);
  const n = (a, b) => clamp((u - a) / (b - a)); // progressive reveal windows

  // proportions
  const headR = h * 0.11;
  const headY = -h + headR;
  const neckY = -h + headR * 2.1;
  const hipY = -h * 0.46;
  const shoulder = { x: 0, y: neckY + h * 0.02 };
  const hip = { x: 0, y: hipY };
  const sw = Math.sin(walk * Math.PI * 2), cw = Math.cos(walk * Math.PI * 2);

  // legs (draw first, behind torso) — hip → knee → foot
  const legSpan = h * 0.16;
  const legPhase = pose === 'walk' ? 1 : 0;
  for (const side of [-1, 1]) {
    const p = n(0.0, 0.45) * (side === 1 ? 1 : 0.92);
    if (p <= 0) continue;
    const swing = legPhase ? sw * side * h * 0.09 : 0;
    const foot = { x: side * legSpan + swing, y: 0 };
    const knee = { x: side * legSpan * 0.55 + swing * 0.5 + cw * side * 4, y: hipY + (0 - hipY) * 0.52 };
    handStroke(ctx, [hip, boilPt(knee.x, knee.y, 1.6), boilPt(foot.x, foot.y, 1.6)], { w, alpha: p, ...STROKE, color: INK, boil: 1.6 });
  }
  // spine
  if (u > 0.25) {
    handStroke(ctx, [boilPt(shoulder.x, shoulder.y, 1.4), boilPt(hip.x, hip.y, 1.4)], { w, alpha: n(0.25, 0.5), color: INK, boil: 1.6 });
  }
  // arms — shoulder → elbow → hand
  if (u > 0.45) {
    const armSpan = h * 0.2;
    const raised = pose === 'alert' || pose === 'spear';
    for (const side of [-1, 1]) {
      const p = n(0.45, 0.72) * (side === 1 ? 1 : 0.9);
      const elbow = raised
        ? { x: side * armSpan * 0.7, y: shoulder.y - h * 0.06 }
        : { x: side * armSpan, y: shoulder.y + h * 0.1 + sw * side * (legPhase ? h * 0.03 : 0) };
      const hand = raised
        ? { x: side * armSpan * 0.5 + h * 0.06, y: shoulder.y - h * 0.16 }
        : { x: side * armSpan * 1.15, y: shoulder.y + h * 0.22 };
      handStroke(ctx, [shoulder, boilPt(elbow.x, elbow.y, 1.6), boilPt(hand.x, hand.y, 1.6)], { w, alpha: p, color: INK, boil: 1.6 });
    }
  }
  // spear (pose 'spear'): shaft + triangular stone head, held in front hand
  if (pose === 'spear' && u > 0.6) {
    const p = n(0.6, 0.85);
    const base = { x: h * 0.03, y: shoulder.y + h * 0.28 };
    const tip = { x: h * 0.26, y: -h * 1.12 };
    // shaft
    handStroke(ctx, [boilPt(base.x, base.y, 1.5), boilPt(tip.x, tip.y, 1.5)], { w: w * 0.95, alpha: p, color: INK, boil: 1.5 });
    // spearhead (filled triangle)
    if (p > 0.3) {
      const a = p > 0.99 ? 1 : (p - 0.3) / 0.7;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y - h * 0.055);
      ctx.lineTo(tip.x - h * 0.028, tip.y + h * 0.012);
      ctx.lineTo(tip.x + h * 0.028, tip.y + h * 0.012);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  // head
  if (u > 0.72) {
    const hp = boilPt(0, headY, 1.4);
    handCircle(ctx, hp.x, hp.y, headR, { w, alpha: n(0.72, 0.95), color: INK, boil: 1.4 });
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// ── cow (Holstein) ────────────────────────────────────────────────────────
// Origin (x, y) = ground under the hooves. s = body length scale unit.
// walk ∈ [0,1) walk-cycle phase. LAW 5: tail root starts INSIDE the rump and
// is drawn BEFORE the body fill, so the root joint is covered by the body.
export function cow(ctx, x, y, opts = {}) {
  const { s = 520, t = 0, walk = 0, alpha = 1, w = 7 } = opts;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y);
  ctx.rotate(boilWobble(0.0014)); // pivot = own center (ground midpoint)
  const bodyW = s, bodyH = s * 0.52;
  const topY = -bodyH - s * 0.1;      // back line
  const bellyY = -s * 0.12;           // belly line
  const rumpX = -bodyW * 0.5;
  const chestX = bodyW * 0.42;
  const swing = Math.sin(walk * Math.PI * 2);
  const swing2 = Math.sin(walk * Math.PI * 2 + Math.PI); // diagonal pair

  // 1) TAIL FIRST — root deep inside the rump top; body fill covers the joint
  //    (LAW 5). The tail then swings OUTSIDE the rump edge and hangs DOWN in
  //    the open (classic cow tail), tuft swishing with the walk.
  const tailRoot = { x: rumpX + bodyW * 0.12, y: topY + bodyH * 0.18 }; // clearly inside
  const tailMid = { x: rumpX - bodyW * 0.055, y: topY + (0 - topY) * 0.6 };
  const tailTipBase = { x: rumpX - bodyW * 0.03, y: -s * 0.11 };
  const swish = Math.sin(walk * Math.PI * 4 + t * 2.2) * s * 0.035;
  const tailTip = { x: tailTipBase.x + swish * 0.7, y: tailTipBase.y };
  handStroke(ctx, [tailRoot, tailMid, tailTip], { w: w * 0.9, color: INK, boil: 2 });
  // tuft at the tail tip (below the body silhouette, clearly hanging)
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(tailTip.x + swish * 0.3, tailTip.y + s * 0.04, s * 0.026, s * 0.05, swish * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // 2) BODY — paper fill first (covers the tail root joint), then patches
  //    clipped inside, then the outline.
  const bodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(chestX, topY + bodyH * 0.22);
    ctx.bezierCurveTo(chestX + bodyW * 0.1, topY - bodyH * 0.02, rumpX + bodyW * 0.16, topY - bodyH * 0.04, rumpX + bodyW * 0.02, topY + bodyH * 0.06);
    ctx.bezierCurveTo(rumpX - bodyW * 0.05, topY + bodyH * 0.3, rumpX - bodyW * 0.02, bellyY + bodyH * 0.12, rumpX + bodyW * 0.1, bellyY + bodyH * 0.02);
    ctx.bezierCurveTo(rumpX + bodyW * 0.34, bellyY - bodyH * 0.06, chestX - bodyW * 0.12, bellyY - bodyH * 0.04, chestX, bellyY);
    ctx.bezierCurveTo(chestX + bodyW * 0.06, bellyY - bodyH * 0.12, chestX + bodyW * 0.07, topY + bodyH * 0.1, chestX, topY + bodyH * 0.22);
    ctx.closePath();
  };
  bodyPath();
  ctx.fillStyle = '#f7f0df';
  ctx.fill();

  // 3) Holstein patches — ink blobs clipped to the body
  ctx.save();
  bodyPath();
  ctx.clip();
  ctx.fillStyle = 'rgba(28,24,20,0.88)';
  const patches = [
    [-0.30, 0.30, 0.16, 0.22, 0.3], [0.05, 0.62, 0.19, 0.26, -0.2], [0.32, 0.28, 0.13, 0.2, 0.5], [-0.05, 0.05, 0.11, 0.16, 0.1],
  ];
  for (const [px, py, pr1, pr2, prr] of patches) {
    ctx.save();
    ctx.translate(rumpX + bodyW * (px + 0.5), topY + bodyH * py);
    ctx.rotate(prr + boilWobble(0.002));
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW * pr1, bodyH * pr2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // 4) body outline on top
  bodyPath();
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 5) udder — filled half-ellipse hanging below the belly, between the rear
  //    legs; drawn BEFORE the legs so the legs read in front of it.
  const ux = rumpX + bodyW * 0.27, uy = bellyY + bodyH * 0.01;
  ctx.beginPath();
  ctx.ellipse(ux, uy, bodyW * 0.085, bodyH * 0.13, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#f7f0df';
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = w * 0.8;
  ctx.stroke();

  // 6) legs with hooves (diagonal pairs swing together). Rear legs sit further
  //    inward so they root under the belly, never outside the rump curve.
  const legY = 0;
  const legXs = [
    { x: rumpX + bodyW * 0.2, ph: swing2 },   // rear-left
    { x: rumpX + bodyW * 0.34, ph: swing },   // rear-right
    { x: chestX - bodyW * 0.12, ph: swing },  // front-left
    { x: chestX + bodyW * 0.0, ph: swing2 },  // front-right
  ];
  for (const L of legXs) {
    const kick = L.ph * s * 0.05;
    handStroke(ctx, [
      boilPt(L.x, bellyY + bodyH * 0.06, 1.6),
      boilPt(L.x + kick * 0.4, lerp(bellyY, legY, 0.55), 1.6),
      boilPt(L.x + kick, legY, 1.6),
    ], { w, color: INK, boil: 1.6 });
    // hoof
    ctx.fillStyle = INK;
    ctx.fillRect(L.x + kick - s * 0.035, legY - s * 0.045, s * 0.07, s * 0.045);
  }

  // 7) head — an OUTLINED oval whose lower half sits INSIDE the body
  //    silhouette over the shoulder (root covered — LAW 5), with horns +
  //    ears + snout + eye on top.
  const hx = chestX - bodyW * 0.02, hy = topY + bodyH * 0.1;
  const nod = Math.sin(walk * Math.PI * 2) * s * 0.012;
  ctx.save();
  ctx.translate(hx, hy + nod);
  ctx.rotate(boilWobble(0.002) + 0.06);
  // head oval (fill first so the body outline seam is covered, then stroke)
  ctx.beginPath();
  ctx.ellipse(0, -bodyH * 0.16, bodyW * 0.135, bodyH * 0.22, -0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#f7f0df';
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
  ctx.stroke();
  // snout
  ctx.fillStyle = '#f7f0df';
  ctx.beginPath();
  ctx.ellipse(bodyW * 0.1, bodyH * 0.05, bodyW * 0.075, bodyH * 0.11, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // nostril
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(bodyW * 0.125, bodyH * 0.06, w * 0.9, 0, Math.PI * 2);
  ctx.fill();
  // horns
  handStroke(ctx, [{ x: -bodyW * 0.05, y: -bodyH * 0.36 }, { x: -bodyW * 0.1, y: -bodyH * 0.54 }], { w: w * 0.85, color: INK, boil: 1.6 });
  handStroke(ctx, [{ x: bodyW * 0.05, y: -bodyH * 0.37 }, { x: bodyW * 0.1, y: -bodyH * 0.54 }], { w: w * 0.85, color: INK, boil: 1.6 });
  // ears
  handStroke(ctx, [{ x: -bodyW * 0.12, y: -bodyH * 0.2 }, { x: -bodyW * 0.19, y: -bodyH * 0.28 }], { w: w * 0.8, color: INK, boil: 1.6 });
  handStroke(ctx, [{ x: bodyW * 0.1, y: -bodyH * 0.22 }, { x: bodyW * 0.16, y: -bodyH * 0.32 }], { w: w * 0.8, color: INK, boil: 1.6 });
  // eye
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(bodyW * 0.015, -bodyH * 0.08, w * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
  ctx.globalAlpha = inherited;
}

// ── DNA double helix ──────────────────────────────────────────────────────
// Proper depth-sorted double helix: two phase-shifted sine strands; rungs
// between them with depth-based width/alpha; one accent RED "mutation" rung;
// draws with progress ∈ [0,1]. Elements are drawn back → front.
export function helix(ctx, x, y, opts = {}) {
  const { w: W = 300, h: H = 620, turns = 2.25, t = 0, progress = 1, alpha = 1, drift = 0, rungV: rungVIn = null, mutation = 3 } = opts;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y);
  ctx.rotate(boilWobble(0.0016)); // own center pivot
  const N = 48; // samples per strand
  const amp = W / 2;
  const phase = drift * Math.PI * 2;

  const strandPt = (i, which) => {
    const v = i / N;
    const a = v * turns * Math.PI * 2 + phase + (which ? Math.PI : 0);
    return { x: Math.sin(a) * amp, y: lerp(-H / 2, H / 2, v), depth: Math.cos(a) }; // depth ∈ [-1(back),1(front)]
  };

  // collect drawables: strand segments + rungs
  const items = [];
  const drawnN = Math.max(2, Math.round(N * clamp(progress)));
  for (let i = 0; i < drawnN; i++) {
    for (const which of [0, 1]) {
      const p1 = strandPt(i, which), p2 = strandPt(i + 1, which);
      items.push({ kind: 'seg', i, which, p1, p2, depth: (p1.depth + p2.depth) / 2, v: (i + 0.5) / N });
    }
  }
  const rungEvery = 6;
  const rungIdxs = rungVIn ? rungVIn.map((v) => Math.round(clamp(v) * N)).filter((i) => i >= 2 && i < drawnN - 2) : null;
  const mutOn = mutation !== false;
  const mutV = typeof mutation === 'number' && mutation < 1 ? mutation : null;
  let rungCount = 0;
  const addRung = (i) => {
    const a = strandPt(i, 0), b = strandPt(i, 1);
    const red = mutV != null ? Math.abs(i / N - mutV) < 0.012 : (mutOn && rungCount === mutation);
    items.push({ kind: 'rung', i, a, b, depth: (a.depth + b.depth) / 2, v: i / N, red });
    rungCount++;
  };
  if (rungIdxs) rungIdxs.forEach(addRung);
  else for (let i = 2; i < drawnN - 2; i += rungEvery) addRung(i);
  items.sort((p, q) => p.depth - q.depth); // back (depth −1) first

  for (const it of items) {
    const front = (it.depth + 1) / 2; // 0 back → 1 front
    if (it.kind === 'seg') {
      handStroke(ctx, [it.p1, it.p2], {
        w: lerp(4.5, 8, front), color: INK, alpha: lerp(0.5, 1, front), boil: 1.8,
      });
    } else {
      handStroke(ctx, [it.a, it.b], {
        w: it.red ? 9 : lerp(3, 6.5, front),
        color: it.red ? RED : INK,
        alpha: it.red ? 1 : lerp(0.32, 0.85, front),
        boil: 1.8,
      });
    }
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// ── spread map ────────────────────────────────────────────────────────────
// Simplified Europe / N-Africa / Arabia coastlines as hand polylines
// (Mediterranean recognizable, Italy boot, Scandinavia, Iberia, Black Sea as
// one stroke), faint graticule, origin dot + ping ring, spread arrows with
// whoosh progress. Origin (x, y) = map center. w = map width.
const MAP_PATHS = {
  iberia: [[-0.48, 0.16], [-0.38, 0.10], [-0.30, 0.13], [-0.24, 0.22], [-0.32, 0.30], [-0.44, 0.32], [-0.48, 0.16]],
  europe: [[-0.46, 0.05], [-0.34, 0.02], [-0.22, 0.04], [-0.10, 0.00], [0.04, 0.02], [0.18, -0.02], [0.30, 0.02], [0.38, -0.06]],
  scandinavia: [[-0.06, -0.42], [0.06, -0.48], [0.14, -0.36], [0.06, -0.24], [-0.04, -0.30], [-0.06, -0.42]],
  italy: [[0.10, 0.04], [0.16, 0.14], [0.20, 0.24], [0.16, 0.30], [0.12, 0.24], [0.13, 0.12], [0.10, 0.04]],
  greece: [[0.30, 0.06], [0.34, 0.16], [0.31, 0.22], [0.28, 0.14], [0.30, 0.06]],
  africa: [[-0.50, 0.38], [-0.28, 0.34], [-0.04, 0.36], [0.20, 0.34], [0.40, 0.38], [0.48, 0.46], [0.2, 0.52], [-0.2, 0.52], [-0.5, 0.48], [-0.50, 0.38]],
  anatolia: [[0.18, -0.06], [0.34, -0.04], [0.40, 0.02], [0.24, 0.04], [0.18, -0.06]],
  arabia: [[0.36, 0.10], [0.46, 0.18], [0.52, 0.30], [0.44, 0.34], [0.38, 0.24], [0.34, 0.14], [0.36, 0.10]],
  blackSea: [[0.16, -0.16], [0.34, -0.20], [0.44, -0.14]], // single stroke
};
const MAP_ARROW = [
  { pts: [[0.06, -0.05], [-0.2, -0.1], [-0.42, -0.14]], w: 7 },   // west into Europe
  { pts: [[0.1, 0.05], [-0.1, 0.18], [-0.3, 0.26]], w: 7 },       // southwest along the Mediterranean
  { pts: [[0.14, 0.0], [0.3, 0.14], [0.44, 0.24]], w: 7 },        // southeast into Arabia
];

export function spreadMap(ctx, x, y, opts = {}) {
  const { w: W = 1300, t = 0, progress = 1, alpha = 1, lw = 5 } = opts;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * alpha;
  ctx.translate(x, y);
  ctx.rotate(boilWobble(0.0012));
  const H = W * 0.72;
  const u = clamp(progress);
  const P = (p) => ({ x: p[0] * W, y: p[1] * H });

  // faint graticule
  const gN = 8, gM = 5;
  for (let i = 1; i < gN; i++) {
    handStroke(ctx, [{ x: -W / 2 + (i * W) / gN, y: -H / 2 }, { x: -W / 2 + (i * W) / gN, y: H / 2 }], { w: 1.6, alpha: 0.12 * u, color: INK, boil: 1 });
  }
  for (let j = 1; j < gM; j++) {
    handStroke(ctx, [{ x: -W / 2, y: -H / 2 + (j * H) / gM }, { x: W / 2, y: -H / 2 + (j * H) / gM }], { w: 1.6, alpha: 0.12 * u, color: INK, boil: 1 });
  }

  // coastlines (each gets its own slice of progress)
  const names = Object.keys(MAP_PATHS);
  names.forEach((name, idx) => {
    const p0 = idx / names.length, p1 = (idx + 0.6) / names.length;
    const pu = clamp((u - p0 * 0.85) / Math.max(0.001, (p1 - p0) * 0.85));
    if (pu <= 0) return;
    const pts = MAP_PATHS[name].map(P);
    handStroke(ctx, pts, { w: lw, color: INK, alpha: 0.9, boil: 2, progress: pu });
  });

  // origin dot (Anatolia/Levant) + ping
  const origin = P([0.08, -0.03]);
  if (u > 0.72) {
    ctx.fillStyle = RED;
    ctx.globalAlpha = inherited * alpha;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  if (u > 0.78) ping(ctx, origin.x, origin.y, W * 0.16, (t * 1.4) % 1.6);

  // spread arrows with whoosh progress
  if (u > 0.8) {
    const au = clamp((u - 0.8) / 0.2);
    MAP_ARROW.forEach((A, i) => {
      const pu = clamp(au * 1.6 - i * 0.25);
      if (pu <= 0) return;
      arrowProgress(ctx, A.pts.map(P), { w: A.w, color: RED, progress: pu, head: 26 });
    });
  }
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// internal: arrow honoring progress (partial shaft + head only when done)
function arrowProgress(ctx, pts, opts) {
  const { w, color, progress, head } = opts;
  handStroke(ctx, pts, { w, color, progress });
  if (progress >= 0.98) {
    const last = pts[pts.length - 1], prev = pts[Math.max(0, pts.length - 3)];
    const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
    for (const d of [Math.PI * 0.82, -Math.PI * 0.82]) {
      handStroke(ctx, [last, { x: last.x + Math.cos(ang + d) * head, y: last.y + Math.sin(ang + d) * head }], { w, color });
    }
  }
}

// ping(ctx, x, y, r, t) — expanding ring: t ∈ [0,1.6), loops with fade.
export function ping(ctx, x, y, r, t) {
  const u = clamp(t / 1.6);
  if (u <= 0 || u >= 1) return;
  const inherited = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = inherited * (1 - u) * 0.9;
  ctx.strokeStyle = RED;
  ctx.lineWidth = lerp(5, 1.5, u);
  ctx.beginPath();
  ctx.arc(x, y, r * u, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = inherited;
}

// deterministic seed helper re-export for world files
export { hash };
