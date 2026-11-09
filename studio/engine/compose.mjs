// compose.mjs — the frame pipeline.
// renderFrame: clear PAPER → camera (project rail via callback) → world art →
// grade (vignette, grain, fade). Temporal motion blur: during fast camera
// pushes the world is sub-sampled at 1/90 s spacing into an offscreen buffer
// and composited (looser spacing would ghost structure — banned).
//
// CLI (topic-agnostic — the world/timings come from flags or env, never from
// a hardcoded project):
//   bun compose.mjs still <t>    --world <path.mjs> --timings <path.mjs> [--scale S] [--out p.png]
//   bun compose.mjs stills 1,2,3 --world ... --timings ...
//   bun compose.mjs chunk <start> <end> --world ... --timings ... [--scale S]
// Chunk mode streams raw RGBA frames (canvas.data()) into ffmpeg — frames are
// written one by one, never accumulated (OOM law).
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve as pathResolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PAPER } from './style.mjs';
import { camAt, handheldDamped, applyCam, camSpeed } from './camera.mjs';
import { setBoil } from './ink.mjs';
import { setPaperView } from './props.mjs';
import { vignette, grain, fade } from './grade.mjs';

export const FPS = 30;
const SUB = 1 / 90; // motion-blur sub-sample spacing
const BLUR_SPEED = 1100; // camera speed above which sub-sampling kicks in

// renderFrame(ctx, W, H, t, drawWorld, opts)
//  opts.rail | opts.getRail(t) — camera source (callback form wins)
//  opts.grade = { vignette:{strength}, grain:{amount}, fade:{fadeIn,fadeOut} }
//  opts.design = { W, H } — the film's design resolution when rendering a
//    scaled-down preview (W/H are the canvas's device size); the camera then
//    frames the same world window at every scale. Default: design == canvas.
//  opts.blur = true|false (default: auto from camera speed)
export function renderFrame(ctx, W, H, t, drawWorld, opts = {}) {
  const rail = opts.getRail ? opts.getRail(t) : opts.rail;
  if (!rail) throw new Error('renderFrame needs opts.rail or opts.getRail');
  const grade = opts.grade || {};
  const design = opts.design || { W, H };
  const viewScale = W / design.W; // device px per design px (1 at full res)
  const frameIdx = Math.round(t * FPS);

  // camera + boil state for this frame
  const cam = camAt(rail, t);
  const shake = handheldDamped(rail, t, 1);
  setBoil(t);

  // visible world rect for paper culling (design-space viewport)
  const zoom = Math.max(0.05, cam.zoom);
  setPaperView({
    x: cam.x - design.W / 2 / zoom - 60, y: cam.y - design.H / 2 / zoom - 60,
    w: (design.W / zoom) + 120, h: (design.H / zoom) + 120,
  });

  const wantsBlur = (opts.blur ?? true) && camSpeed(rail, t) > BLUR_SPEED;
  if (!wantsBlur) {
    // single sample — the common case
    ctx.save();
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    applyCam(ctx, cam, W, H, shake, viewScale);
    drawWorld(ctx, t);
    ctx.restore();
    ctx.restore();
  } else {
    // sub-sample motion blur: 3 exposures at 0, −1/90, −2/90, composited at
    // weights that sum to 1 (0.5 / 0.3 / 0.2). Boil is quantized to 8 fps so
    // the exposures are identical in wobble — only the camera ghosts.
    const off = createCanvas(W, H);
    const octx = off.getContext('2d');
    ctx.save();
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    const weights = [0.5, 0.3, 0.2];
    for (let k = 0; k < 3; k++) {
      const tk = t - k * SUB;
      const ck = camAt(rail, tk);
      const sk = handheldDamped(rail, tk, 1);
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.globalAlpha = 1;
      octx.fillStyle = PAPER;
      octx.fillRect(0, 0, W, H);
      octx.save();
      applyCam(octx, ck, W, H, sk, viewScale);
      setBoil(tk);
      drawWorld(octx, tk);
      octx.restore();
      setBoil(t);
      octx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = weights[k];
      ctx.drawImage(off, 0, 0);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  setPaperView(null);
  // grade passes
  if (grade.vignette !== null) vignette(ctx, W, H, grade.vignette || {});
  if (grade.grain !== null) grain(ctx, W, H, frameIdx, grade.grain || {});
  if (grade.fade !== null) fade(ctx, W, H, t, grade.fade || {});
  return frameIdx;
}

// ── ffmpeg chunk writer (raw RGBA piped frame by frame) ───────────────────
export function ffmpegChunkArgs(W, H, outPath) {
  return [
    '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS),
    '-i', '-',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
    '-x264-params', 'lookahead=20', '-pix_fmt', 'yuv420p',
    outPath,
  ];
}

// renderChunkFrames — renders frames [start, end) of T into outPath by
// streaming RGBA buffers into ffmpeg. drawWorld/T come from the caller.
// Returns a promise that resolves when ffmpeg exits 0.
export function renderChunkFrames({ T, drawWorld, grade, start, end, outPath, scale = 1, W, H }) {
  W = W || T.W; H = H || T.H;
  const SW = Math.round(W / scale), SH = Math.round(H / scale);
  const canvas = createCanvas(SW, SH);
  const ctx = canvas.getContext('2d');
  mkdirSync(dirname(outPath), { recursive: true });
  const ff = spawn('ffmpeg', ffmpegChunkArgs(SW, SH, outPath), { stdio: ['pipe', 'inherit', 'inherit'] });
  return new Promise((res, rej) => {
    ff.on('error', rej);
    ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg chunk exited ${code}`))));
    (async () => {
      try {
        for (let f = start; f < end; f++) {
          const t = f / T.FPS;
          renderFrame(ctx, SW, SH, t, drawWorld, { rail: T.rail, grade, design: { W, H } });
          const buf = canvas.data(); // raw RGBA — toBuffer('raw') unavailable
          if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); // backpressure, never accumulate
        }
        ff.stdin.end();
      } catch (e) {
        ff.kill('SIGKILL');
        rej(e);
      }
    })();
  });
}

// ── CLI ───────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--world') args.world = argv[++i];
    else if (a === '--timings') args.timings = argv[++i];
    else if (a === '--scale') args.scale = parseFloat(argv[++i]);
    else if (a === '--out') args.out = argv[++i];
    else args._.push(a);
  }
  return args;
}

export async function cli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const [cmd, ...rest] = args._;
  const worldPath = args.world || process.env.STUDIO_WORLD;
  const timingsPath = args.timings || process.env.STUDIO_TIMINGS;
  if (!cmd || !['still', 'stills', 'chunk'].includes(cmd) || !worldPath || !timingsPath) {
    console.error('usage: bun compose.mjs still <t>|stills t1,t2|chunk <start> <end> --world world.mjs --timings timings.mjs [--scale S] [--out p.png]');
    process.exit(2);
  }
  const Tmod = await import(pathResolve(timingsPath));
  const T = Tmod.T || Tmod.default?.T || Tmod;
  const Wmod = await import(pathResolve(worldPath));
  const drawWorld = Wmod.drawWorld || Wmod.default?.drawWorld;
  if (typeof drawWorld !== 'function') throw new Error('world module must export drawWorld(ctx, t)');
  const grade = { fade: { fadeIn: T.fadeIn || [0, 0.4], fadeOut: T.fadeOut || [31.9, 32.53] } };
  const scale = args.scale || 1;
  const SW = Math.round(T.W / scale), SH = Math.round(T.H / scale);

  if (cmd === 'still' || cmd === 'stills') {
    const times = cmd === 'still' ? [parseFloat(rest[0])] : rest[0].split(',').map(Number);
    const outDir = args.out ? dirname(args.out) : process.cwd();
    mkdirSync(outDir, { recursive: true });
    const canvas = createCanvas(SW, SH);
    const ctx = canvas.getContext('2d');
    for (const t of times) {
      renderFrame(ctx, SW, SH, t, drawWorld, { rail: T.rail, grade, design: { W: T.W, H: T.H } });
      const name = args.out && times.length === 1 ? args.out : join(outDir, `still_${t.toFixed(3).replace('.', '_')}.png`);
      writeFileSync(name, await canvas.encode('png')); // encode is async in @napi-rs/canvas
      console.log(`wrote ${name}`);
    }
    return;
  }
  if (cmd === 'chunk') {
    const [s, e] = rest.map(Number);
    const out = args.out || `part_${String(s).padStart(4, '0')}.mp4`;
    await renderChunkFrames({ T, drawWorld, grade, start: s, end: e, outPath: out, scale });
    console.log(`chunk done → ${out}`);
  }
}

// Run the CLI only when THIS module is the entry point (bun compose.mjs …).
// `import.meta.main` is Bun-native; the URL comparison is the portable
// fallback. NEVER use `process.argv[1] === Bun.main` here — that is true for
// every module imported by the real main (it made compose's CLI hijack
// `bun render.mjs` and exit 2 before the project code ran).
const invokedDirectly = import.meta.main ||
  (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href);
if (invokedDirectly) {
  cli();
}
