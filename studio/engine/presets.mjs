// presets.mjs — cinematic presets: film grades, encoder quality ladders, and
// named cast/camera looks. Topic-agnostic; projects opt in via
//   renderFrame(..., { grade: FILM_PRESETS['documentary-grade'].grade })
//   renderChunkFrames(..., { quality: VIDEO_PRESETS.master })
// Defaults stay sandbox-safe: x264 lookahead capped at 20, preset fast
// (AGENTS.md §4). Never raise lookahead for 4K masters — OOM law.
import { INK, PAPER, RED, GOLD, TEAL, WARM } from './style.mjs';

// ── Film grade presets (vignette / grain / split-tone / fade) ─────────────
export const FILM_PRESETS = {
  // House default — matches the delivered 001 look exactly.
  'paper-storybook': {
    label: 'Paper storybook (house default)',
    grade: { vignette: { strength: 0.42 }, grain: { amount: 0.5 } },
  },
  // Netflix-documentary warmth: gentler vignette, heavier grain, split tone.
  'documentary-grade': {
    label: 'Cinematic documentary (warm key / cool shadow)',
    grade: {
      vignette: { strength: 0.34 }, grain: { amount: 0.62 },
      splitTone: { warm: 0.06, cool: 0.065 },
    },
  },
  // Archival essay: stronger vignette, aged grain, heavier split tone.
  'archival-essay': {
    label: 'Archival essay (aged print)',
    grade: {
      vignette: { strength: 0.5 }, grain: { amount: 0.72 },
      splitTone: { warm: 0.08, cool: 0.085 },
    },
  },
  // Noir-ish night essay: deep corners, cool edges, restrained warmth.
  'night-essay': {
    label: 'Night essay (deep vignette, cool edges)',
    grade: {
      vignette: { strength: 0.55 }, grain: { amount: 0.55 },
      splitTone: { warm: 0.03, cool: 0.1 },
    },
  },
};

// Resolve a preset name (or pass-through an object) into a grade object.
// Always merges fade defaults so films can rely on T.fadeIn/T.fadeOut callers.
export function filmGrade(name, fade) {
  const preset = typeof name === 'string' ? FILM_PRESETS[name] : name;
  if (!preset) throw new Error(`unknown film preset: ${name} (have: ${Object.keys(FILM_PRESETS).join(', ')})`);
  const grade = { ...preset.grade };
  if (fade) grade.fade = fade;
  return grade;
}

// ── Encoder quality ladder ────────────────────────────────────────────────
// x264 lookahead ALWAYS ≤ 20 for 4K (AGENTS.md §4 OOM law). `master` is the
// publish default; `web` for smaller builds; `qc` for fast local checks only.
// GPU lane (LAW 15 perf): NVENC presets — when a GPU encoder is detected,
// `masterGpu`/`webGpu`/`qcGpu` free the CPU for the Skia canvas thread (the
// real bottleneck) and encode chunks several× faster. `-cq` at high presets
// (p7/p6) is visually transparent for ink/paper art at publish sizes; verify
// with a still-sweep + file-size sanity gate on the first GPU publish.
export const VIDEO_PRESETS = {
  master: { crf: 16, preset: 'fast', lookahead: 20, pixFmt: 'yuv420p', label: 'Master 4K (publish)' },
  web:    { crf: 19, preset: 'fast', lookahead: 20, pixFmt: 'yuv420p', label: 'Web publish' },
  qc:     { crf: 24, preset: 'fast', lookahead: 12, pixFmt: 'yuv420p', label: 'QC preview (small)' },
  masterGpu: { codec: 'h264_nvenc', preset: 'p7', cq: 18, pixFmt: 'yuv420p', label: 'Master 4K (NVENC GPU)' },
  webGpu:    { codec: 'h264_nvenc', preset: 'p6', cq: 22, pixFmt: 'yuv420p', label: 'Web publish (NVENC GPU)' },
  qcGpu:     { codec: 'h264_nvenc', preset: 'p4', cq: 26, pixFmt: 'yuv420p', label: 'QC preview (NVENC GPU)' },
};
export const DEFAULT_VIDEO_PRESET = 'master';

// ── Named cast looks (characters.mjs defaults tuned for the screen) ───────
export const CAST_PRESETS = {
  // Stickman hunter — the default hero: full height, spear pose, grounded
  // contact shadow on (LAW 5).
  hunter: { h: 430, pose: 'spear', shadow: true },
  'hunter-alert': { h: 430, pose: 'alert', shadow: true },
  traveler: { h: 400, pose: 'walk', shadow: true },
  'holstein-hero': { s: 520, shadow: true },
};

// ── Camera feel presets (rail authoring guides, in world units) ───────────
export const CAMERA_PRESETS = {
  'slow-push': { label: 'Slow revelation push-in', speed: 220 },
  'observational-hold': { label: 'Held observational drift', speed: 0 },
  'travel-traverse': { label: 'Fast lateral traverse (pair with 1/90s blur)', speed: 1400 },
};

// ── Subject placement helpers (bible §1.2/1.3) ────────────────────────────
export const PHI = 1.61803398875;
// Thirds power points as fractions of the viewport — {x,y} ∈ (0,1)².
export const THIRDS = [
  { x: 1 / 3, y: 1 / 3 }, { x: 2 / 3, y: 1 / 3 },
  { x: 1 / 3, y: 2 / 3 }, { x: 2 / 3, y: 2 / 3 },
];
// Phi-grid power points (38.2% / 61.8%).
export const PHI_GRID = [
  { x: 1 - 1 / PHI, y: 1 - 1 / PHI }, { x: 1 / PHI, y: 1 - 1 / PHI },
  { x: 1 - 1 / PHI, y: 1 / PHI },     { x: 1 / PHI, y: 1 / PHI },
];
// Compose world coords for a viewport fraction — world files anchor heroes
// to power points instead of eyeballing.
export const powerPoint = (W, H, p) => ({ x: (p.x - 0.5) * W, y: (p.y - 0.5) * H });

export const PALETTE = { INK, PAPER, RED, GOLD, TEAL, WARM };
