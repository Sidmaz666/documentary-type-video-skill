// layouts.mjs — professional video-layout system (house LAW 12/13).
// Region-geometry engine: every scene selects a layout id; the resolver returns
// safe-area-snapped regions (hero, text, cards, captions…) for the target
// aspect ratio, so scenes compose on a shared web/editorial grid instead of
// ad-hoc coordinates. Drawing stays in the project world file.

export const SPACE = { xs: 8, s: 16, m: 24, l: 32, xl: 48, xxl: 64, xxxl: 96 };

export const ASPECTS = {
  '16:9': { w: 2560, h: 1098, safe: { l: 0.06, r: 0.06, t: 0.08, b: 0.10 } },
  '9:16': { w: 1080, h: 1920, safe: { l: 0.07, r: 0.07, t: 0.09, b: 0.18 } },
  '1:1': { w: 1440, h: 1440, safe: { l: 0.07, r: 0.07, t: 0.08, b: 0.08 } },
  '4:5': { w: 1080, h: 1350, safe: { l: 0.07, r: 0.07, t: 0.09, b: 0.12 } },
  '4:3': { w: 1440, h: 1080, safe: { l: 0.06, r: 0.06, t: 0.08, b: 0.10 } },
};

export const FORMATS = Object.keys(ASPECTS);

export function frame(format = '16:9') {
  const a = ASPECTS[format] ?? ASPECTS['16:9'];
  return { w: a.w, h: a.h, safe: a.safe };
}

export function safeRect(format = '16:9') {
  const { w, h, safe } = frame(format);
  const x = Math.round(w * safe.l);
  const y = Math.round(h * safe.t);
  return { x, y, w: Math.round(w * (1 - safe.l - safe.r)), h: Math.round(h * (1 - safe.t - safe.b)) };
}

export function typeScale(format = '16:9') {
  const { w, h } = frame(format);
  const k = Math.min(w, h) / 1080;
  const px = (n) => Math.round(n * k);
  return {
    hero: px(118), h1: px(88), h2: px(60), h3: px(44),
    body: px(34), body2: px(29), label: px(23), source: px(20),
  };
}

export function grid(format = '16:9', cols = 12) {
  const R = safeRect(format);
  const gutter = Math.round(Math.min(R.w, R.h) * 0.014) + SPACE.xs;
  const colW = (R.w - gutter * (cols - 1)) / cols;
  return {
    R, cols, gutter, colW,
    col: (i, span = 1) => ({
      x: Math.round(R.x + i * (colW + gutter)),
      w: Math.round(colW * span + gutter * (span - 1)),
      y: R.y, h: R.h,
    }),
  };
}

function cols(R, n, gutter, gapY = 0) {
  const w = (R.w - gutter * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(R.x + i * (w + gutter)), y: R.y, w: Math.round(w), h: R.h,
  }));
}

function rows(R, n, gutter) {
  const h = (R.h - gutter * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: R.x, y: Math.round(R.y + i * (h + gutter)), w: R.w, h: Math.round(h),
  }));
}

function splitH(R, ratio, gutter) {
  const lw = Math.round((R.w - gutter) * ratio);
  return [
    { x: R.x, y: R.y, w: lw, h: R.h },
    { x: R.x + lw + gutter, y: R.y, w: R.w - lw - gutter, h: R.h },
  ];
}

function splitV(R, ratio, gutter) {
  const th = Math.round((R.h - gutter) * ratio);
  return [
    { x: R.x, y: R.y, w: R.w, h: th },
    { x: R.x, y: R.y + th + gutter, w: R.w, h: R.h - th - gutter },
  ];
}

const G = (format) => grid(format).gutter;

function named(names, rects) {
  const out = {};
  names.forEach((n, i) => { if (rects[i]) out[n] = rects[i]; });
  return out;
}

// ── Layout registry (64) — each entry: id, name, cat, density, aspects, build ──
// build(format) → { regions: {name: rect}, notes? } snapped inside the safe rect.
const HERO = (format) => {
  const R = safeRect(format), g = G(format);
  const portrait = format === '9:16' || format === '4:5' || format === '1:1';
  const parts = portrait ? splitV(R, 0.42, g) : splitH(R, 0.52, g);
  return { note: 'portrait stacks', parts, R, g, portrait };
};

export const LAYOUTS = [
  // A · hero & headline
  { id: '01-full-bleed-hero', name: 'Full-Bleed Hero', cat: 'hero', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { visual: R, headline: { ...R, h: Math.round(R.h * 0.3), y: R.y + Math.round(R.h * 0.58) }, caption: { ...R, y: R.y + R.h - Math.round(R.h * 0.1), h: Math.round(R.h * 0.06) } }; } },
  { id: '02-centered-hero', name: 'Centered Hero', cat: 'hero', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); const cw = Math.round(R.w * 0.72), x = R.x + Math.round((R.w - cw) / 2); return { headline: { x, y: R.y + Math.round(R.h * 0.18), w: cw, h: Math.round(R.h * 0.3) }, visual: { x, y: R.y + Math.round(R.h * 0.52), w: cw, h: Math.round(R.h * 0.34) }, caption: { x, y: R.y + R.h - Math.round(R.h * 0.08), w: cw, h: Math.round(R.h * 0.05) } }; } },
  { id: '03-left-hero', name: 'Left-Aligned Hero', cat: 'hero', density: 'medium', aspects: 'all',
    build: (f) => { const h = HERO(f); return named(['headline', 'visual'], h.portrait ? [h.parts[0], h.parts[1]] : [h.parts[0], h.parts[1]]); } },
  { id: '04-right-hero', name: 'Right-Aligned Hero', cat: 'hero', density: 'medium', aspects: 'all',
    build: (f) => { const h = HERO(f); return named(['visual', 'headline'], h.portrait ? [h.parts[0], h.parts[1]] : [h.parts[0], h.parts[1]]); } },
  { id: '05-equal-split', name: 'Equal Split Hero 50/50', cat: 'hero', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), p = splitH(R, 0.5, G(f)); return named(['text', 'visual'], p); } },
  { id: '06-asym-split', name: 'Asymmetric Split Hero 62/38', cat: 'hero', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), p = splitH(R, 0.62, G(f)); return named(['primary', 'secondary'], p); } },
  { id: '07-editorial-overlay', name: 'Editorial Image Overlay', cat: 'hero', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { visual: R, copy: { x: R.x, y: R.y + Math.round(R.h * 0.62), w: Math.round(R.w * 0.46), h: Math.round(R.h * 0.28) } }; } },
  { id: '08-headline-strip', name: 'Headline + Feature Strip', cat: 'hero', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [top, rest] = splitV(R, 0.34, g); return { headline: top, visual: { ...rest, h: Math.round(rest.h * 0.6) }, strip: { ...rest, y: rest.y + Math.round(rest.h * 0.64), h: Math.round(rest.h * 0.36) } }; } },
  { id: '09-hero-stat', name: 'Hero + Statistical Proof', cat: 'hero', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [main, side] = splitH(R, 0.66, g); const [vis, stat] = splitV(side, 0.55, g); return { visual: vis, stats: stat, headline: { ...main, h: Math.round(main.h * 0.4) }, caption: { ...main, y: main.y + Math.round(main.h * 0.78), h: Math.round(main.h * 0.2) } }; } },
  { id: '10-pullquote-hero', name: 'Cinematic Pull-Quote Hero', cat: 'hero', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); const y = R.y + Math.round(R.h * 0.34); return { quote: { x: R.x, y, w: R.w, h: Math.round(R.h * 0.34) }, attribution: { x: R.x, y: y + Math.round(R.h * 0.4), w: R.w, h: Math.round(R.h * 0.1) } }; } },

  // B · grid & cards
  { id: '11-two-col', name: 'Two-Column Grid', cat: 'grid', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return named(['left', 'right'], cols(R, 2, G(f))); } },
  { id: '12-three-col', name: 'Three-Column Grid', cat: 'grid', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return named(['c1', 'c2', 'c3'], cols(R, 3, G(f))); } },
  { id: '13-four-col', name: 'Four-Column Grid', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f); return named(['c1', 'c2', 'c3', 'c4'], cols(R, 4, G(f))); } },
  { id: '14-bento', name: 'Bento Grid', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [top, bot] = splitV(R, 0.58, g), [a, b] = splitH(bot, 0.62, g), [c, d] = splitH(a, 0.55, g); return { feature: top, wide: b, card1: c, card2: d }; } },
  { id: '15-feature-cards', name: 'Feature + Supporting Cards', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [main, side] = splitH(R, 0.64, g); return { feature: main, support: side }; } },
  { id: '16-one-plus-two', name: 'One-Plus-Two Grid', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [main, side] = splitH(R, 0.6, g), [s1, s2] = splitV(side, 0.5, g); return { primary: main, secondaryA: s1, secondaryB: s2 }; } },
  { id: '17-two-by-three', name: 'Two-by-Three Matrix', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), rr = rows(R, 2, g); const out = {}; rr.forEach((r, i) => { const cs = cols(r, 3, g); cs.forEach((c, j) => { out[`r${i + 1}c${j + 1}`] = c; }); }); return out; } },
  { id: '18-staggered', name: 'Staggered Grid', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 3, G(f)), off = Math.round(R.h * 0.08); return { a: { ...cs[0], y: cs[0].y + off, h: cs[0].h - off }, b: cs[1], c: { ...cs[2], y: cs[2].y + off * 2, h: cs[2].h - off * 2 } }; } },
  { id: '19-masonry', name: 'Editorial Masonry Grid', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), cs = cols(R, 3, g); return { tall: { ...cs[0], h: Math.round(R.h * 0.72) }, m1: { ...cs[1], h: Math.round(R.h * 0.44) }, m2: { ...cs[1], y: cs[1].y + Math.round(R.h * 0.5), h: Math.round(R.h * 0.5) }, m3: { ...cs[2], h: Math.round(R.h * 0.58) } }; } },
  { id: '20-mosaic', name: 'Image Mosaic', cat: 'grid', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [top, bot] = splitV(R, 0.58, g), [t1, t2] = splitH(top, 0.62, g), [b1, b2, b3] = cols(bot, 3, g); return { hero: t1, side: t2, a: b1, b: b2, c: b3 }; } },

  // C · comparison
  { id: '21-side-by-side', name: 'Side-by-Side Comparison', cat: 'compare', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return named(['left', 'right'], cols(R, 2, G(f))); } },
  { id: '22-central-vs', name: 'Central VS Comparison', cat: 'compare', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), w = Math.round((R.w - g * 3) / 3); return { left: { x: R.x, y: R.y, w, h: R.h }, vs: { x: R.x + w + g, y: R.y, w, h: R.h }, right: { x: R.x + (w + g) * 2, y: R.y, w, h: R.h } }; } },
  { id: '23-before-after', name: 'Before-and-After', cat: 'compare', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [a, b] = splitH(R, 0.5, g); return { before: a, after: b }; } },
  { id: '24-reveal-compare', name: 'Animated Reveal Comparison', cat: 'compare', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { underlay: R, reveal: R, mask: R }; } },
  { id: '25-matrix', name: 'Comparison Matrix', cat: 'compare', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), rr = rows(R, 4, g); return { header: rr[0], r1: rr[1], r2: rr[2], r3: rr[3] }; } },
  { id: '26-pros-cons', name: 'Pros-and-Cons', cat: 'compare', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return named(['pros', 'cons'], cols(R, 2, G(f))); } },
  { id: '27-alternatives', name: 'Multiple Alternatives Cards', cat: 'compare', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 3, G(f)); return named(['a', 'b', 'c'], cs); } },
  { id: '28-evolution', name: 'Historical Evolution Comparison', cat: 'compare', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 3, G(f)), out = {}; cs.forEach((c, i) => { out[`stage${i + 1}`] = c; }); return out; } },
  { id: '29-spectrum', name: 'Spectrum Layout', cat: 'compare', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { track: { x: R.x, y: R.y + Math.round(R.h * 0.46), w: R.w, h: Math.round(R.h * 0.08) }, left: { x: R.x, y: R.y + Math.round(R.h * 0.2), w: Math.round(R.w * 0.3), h: Math.round(R.h * 0.2) }, right: { x: R.x + R.w - Math.round(R.w * 0.3), y: R.y + Math.round(R.h * 0.2), w: Math.round(R.w * 0.3), h: Math.round(R.h * 0.2) } }; } },
  { id: '30-layered-overlay', name: 'Layered Comparison Overlay', cat: 'compare', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { base: R, layer: { ...R, x: R.x + Math.round(R.w * 0.08), y: R.y + Math.round(R.h * 0.08), w: R.w - Math.round(R.w * 0.16), h: R.h - Math.round(R.h * 0.16) } }; } },

  // D · data, timeline, process
  { id: '31-kpi', name: 'KPI / Big-Number', cat: 'data', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { number: { x: R.x, y: R.y + Math.round(R.h * 0.22), w: R.w, h: Math.round(R.h * 0.36) }, context: { x: R.x, y: R.y + Math.round(R.h * 0.62), w: R.w, h: Math.round(R.h * 0.2) }, source: { x: R.x, y: R.y + R.h - Math.round(R.h * 0.1), w: R.w, h: Math.round(R.h * 0.08) } }; } },
  { id: '32-stat-microchart', name: 'Statistics + Microchart', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [stat, chart] = splitH(R, 0.44, g); return { stat, chart }; } },
  { id: '33-hbar', name: 'Horizontal Bar Chart', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f) / 2); return { title: rr[0], bars: rr[1], label: rr[2], source: rr[3] }; } },
  { id: '34-line-chart', name: 'Line Chart', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { title: { x: R.x, y: R.y, w: R.w, h: Math.round(R.h * 0.14) }, plot: { x: R.x, y: R.y + Math.round(R.h * 0.2), w: R.w, h: Math.round(R.h * 0.62) }, axis: { x: R.x, y: R.y + Math.round(R.h * 0.84), w: R.w, h: Math.round(R.h * 0.08) } }; } },
  { id: '35-donut', name: 'Donut / Circular Chart', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [chart, legend] = splitH(R, 0.56, g); return { chart, legend }; } },
  { id: '36-h-timeline', name: 'Horizontal Timeline', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 4, G(f)); return { axis: { x: R.x, y: R.y + Math.round(R.h * 0.42), w: R.w, h: 6 }, e1: cs[0], e2: cs[1], e3: cs[2], e4: cs[3] }; } },
  { id: '37-v-timeline', name: 'Vertical Timeline', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f)); return { axis: { x: R.x + Math.round(R.w * 0.08), y: R.y, w: 6, h: R.h }, e1: rr[0], e2: rr[1], e3: rr[2], e4: rr[3] }; } },
  { id: '38-h-process', name: 'Horizontal Process Steps', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 4, G(f)); return { s1: cs[0], s2: cs[1], s3: cs[2], s4: cs[3] }; } },
  { id: '39-v-process', name: 'Vertical Process Steps', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f)); return { s1: rr[0], s2: rr[1], s3: rr[2], s4: rr[3] }; } },
  { id: '40-funnel', name: 'Funnel Diagram', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f)); return { top: rr[0], upper: rr[1], lower: rr[2], bottom: rr[3] }; } },
  { id: '41-pyramid', name: 'Pyramid / Hierarchy Diagram', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 3, G(f)); return { apex: rr[0], middle: rr[1], base: rr[2] }; } },
  { id: '42-circular-process', name: 'Circular Process Diagram', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { center: R, ring: { ...R, x: R.x + Math.round(R.w * 0.12), y: R.y + Math.round(R.h * 0.12), w: R.w - Math.round(R.w * 0.24), h: R.h - Math.round(R.h * 0.24) } }; } },
  { id: '43-flowchart', name: 'Flowchart / Sankey', cat: 'data', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [a, b] = splitH(R, 0.5, g); return { source: a, sink: b }; } },
  { id: '44-tree', name: 'Tree / Hierarchy Layout', cat: 'data', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [top, bot] = splitV(R, 0.36, g), [b1, b2, b3] = cols(bot, 3, g); return { root: top, b1, b2, b3 }; } },
  { id: '45-map-panel', name: 'Map + Information Panel', cat: 'data', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [map, panel] = splitH(R, 0.62, g); return { map, panel }; } },

  // E · lists & information
  { id: '46-numbered-list', name: 'Numbered List', cat: 'list', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f) / 1.5); return { title: rr[0], r1: rr[1], r2: rr[2], r3: rr[3] }; } },
  { id: '47-checklist', name: 'Checklist Layout', cat: 'list', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f) / 1.5); return { title: rr[0], r1: rr[1], r2: rr[2], r3: rr[3] }; } },
  { id: '48-icon-bullets', name: 'Icon-and-Bullet Layout', cat: 'list', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f) / 1.5); return { title: rr[0], r1: rr[1], r2: rr[2], r3: rr[3] }; } },
  { id: '49-ranked-list', name: 'Ranked List', cat: 'list', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 4, G(f) / 1.5); return { title: rr[0], r1: rr[1], r2: rr[2], r3: rr[3] }; } },
  { id: '50-table', name: 'Structured Table', cat: 'list', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 6, G(f) / 2); return { head: rr[0], r1: rr[1], r2: rr[2], r3: rr[3], r4: rr[4], foot: rr[5] }; } },
  { id: '51-qa-reveal', name: 'Question-and-Answer Reveal', cat: 'list', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [q, a] = splitV(R, 0.4, g); return { question: q, answer: a }; } },
  { id: '52-definition', name: 'Definition Card', cat: 'list', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { term: { x: R.x, y: R.y + Math.round(R.h * 0.2), w: R.w, h: Math.round(R.h * 0.24) }, definition: { x: R.x, y: R.y + Math.round(R.h * 0.5), w: R.w, h: Math.round(R.h * 0.32) } }; } },
  { id: '53-etymology', name: 'Etymology / Word Breakdown', cat: 'list', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 3, G(f)); return { partA: cs[0], partB: cs[1], meaning: cs[2] }; } },
  { id: '54-fact-myth', name: 'Fact-versus-Myth', cat: 'list', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return named(['fact', 'myth'], cols(R, 2, G(f))); } },
  { id: '55-claim-evidence', name: 'Claim-and-Evidence Ladder', cat: 'list', density: 'high', aspects: 'all',
    build: (f) => { const R = safeRect(f), rr = rows(R, 3, G(f)); return { claim: rr[0], evidence: rr[1], verdict: rr[2] }; } },
  { id: '56-source-panel', name: 'Source and Citation Panel', cat: 'list', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { panel: { x: R.x + Math.round(R.w * 0.12), y: R.y + Math.round(R.h * 0.16), w: R.w - Math.round(R.w * 0.24), h: R.h - Math.round(R.h * 0.3) } }; } },

  // F · editorial
  { id: '57-pull-quote', name: 'Large Pull Quote + Attribution', cat: 'editorial', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { quote: { x: R.x, y: R.y + Math.round(R.h * 0.2), w: R.w, h: Math.round(R.h * 0.44) }, attribution: { x: R.x, y: R.y + Math.round(R.h * 0.68), w: R.w, h: Math.round(R.h * 0.12) } }; } },
  { id: '58-portrait-split', name: 'Interview / Portrait Split', cat: 'editorial', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), p = splitH(R, 0.46, G(f)); return named(['portrait', 'copy'], p); } },
  { id: '59-profile-card', name: 'Profile / Biography Card', cat: 'editorial', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [pic, copy] = splitH(R, 0.4, g); return { portrait: pic, name: { ...copy, h: Math.round(copy.h * 0.3) }, bio: { ...copy, y: copy.y + Math.round(copy.h * 0.36), h: Math.round(copy.h * 0.64) } }; } },
  { id: '60-annotated-illustration', name: 'Annotated Illustration', cat: 'editorial', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { figure: { x: R.x + Math.round(R.w * 0.18), y: R.y + Math.round(R.h * 0.14), w: R.w - Math.round(R.w * 0.36), h: R.h - Math.round(R.h * 0.28) }, noteL: { x: R.x, y: R.y + Math.round(R.h * 0.3), w: Math.round(R.w * 0.16), h: Math.round(R.h * 0.2) }, noteR: { x: R.x + R.w - Math.round(R.w * 0.16), y: R.y + Math.round(R.h * 0.5), w: Math.round(R.w * 0.16), h: Math.round(R.h * 0.2) } }; } },
  { id: '61-object-showcase', name: 'Object Showcase', cat: 'editorial', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 3, G(f)); return { object: cs[1], calloutL: cs[0], calloutR: cs[2] }; } },
  { id: '62-screenshot', name: 'Interface / Document Layout', cat: 'editorial', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), g = G(f), [shot, panel] = splitH(R, 0.68, g); return { screenshot: shot, annotations: panel }; } },
  { id: '63-gallery-strip', name: 'Editorial Gallery Strip', cat: 'editorial', density: 'medium', aspects: 'all',
    build: (f) => { const R = safeRect(f), cs = cols(R, 3, G(f)); return { a: cs[0], b: cs[1], c: cs[2] }; } },
  { id: '64-chapter-end', name: 'Chapter Divider / End Card', cat: 'editorial', density: 'low', aspects: 'all',
    build: (f) => { const R = safeRect(f); return { kicker: { x: R.x, y: R.y + Math.round(R.h * 0.1), w: R.w, h: Math.round(R.h * 0.08) }, headline: { x: R.x, y: R.y + Math.round(R.h * 0.3), w: R.w, h: Math.round(R.h * 0.3) }, credits: { x: R.x, y: R.y + Math.round(R.h * 0.7), w: R.w, h: Math.round(R.h * 0.22) } }; } },
];

export const LAYOUT_IDS = LAYOUTS.map((l) => l.id);

export function getLayout(id) {
  return LAYOUTS.find((l) => l.id === id || l.id.startsWith(id + '-'));
}

export function resolveLayout(id, format = '16:9') {
  const layout = getLayout(id);
  if (!layout) return { ok: false, error: `unknown layout ${id}` };
  const regions = layout.build(format);
  const safe = safeRect(format);
  const issues = [];
  for (const [name, r] of Object.entries(regions)) {
    if (typeof r !== 'object' || r == null || !('x' in r)) continue;
    if (r.x < safe.x - 1 || r.y < safe.y - 1 || r.x + r.w > safe.x + safe.w + 1 || r.y + r.h > safe.y + safe.h + 1) {
      issues.push(`${name} out of safe area`);
    }
  }
  return { ok: issues.length === 0, layout: { id: layout.id, name: layout.name, cat: layout.cat }, regions, safe, type: typeScale(format), issues };
}

export function validateAll() {
  const problems = [];
  for (const f of FORMATS) {
    for (const l of LAYOUTS) {
      const r = resolveLayout(l.id, f);
      if (!r.ok) problems.push({ format: f, id: l.id, issues: r.issues });
    }
  }
  return { layouts: LAYOUTS.length, formats: FORMATS.length, problems };
}

export const MOTION = {
  fade: { dur: 0.3, ease: 'out' },
  text: { dur: 0.45, ease: 'out' },
  card: { dur: 0.5, ease: 'out', stagger: 0.08 },
  transition: { dur: 0.6, ease: 'inout' },
  exit: { dur: 0.3, ease: 'in' },
};

// Scene → layout records (LAW 13: every scene names its layout).
export const SCENE_LAYOUTS = {
  'S01': '10-pullquote-hero',
  'S02': '09-hero-stat',
  'S03': '05-equal-split',
  'S04': '62-screenshot',
  'S05': '50-table',
  'S06': '43-flowchart',
  'S07': '36-h-timeline',
  'S08': '41-pyramid',
  'S09': '34-line-chart',
  'S10': '12-three-col',
  'S11': '64-chapter-end',
};
