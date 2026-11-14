// build.mjs — full build: chunk render → concat → audio mix → mux → publish.
//   bun build.mjs --preview     LAW 14 gate: render the ~30 s scene sampler
//                               (windows from T.preview) → out/preview-30s.mp4
//   bun build.mjs --yes         full render — ONLY after the user confirmed the
//                               scene sheet + 30 s preview. Refuses otherwise.
//   bun build.mjs --no-video    re-publish from the existing out/video-only.mp4
// Note: existsSync is imported correctly here (a historical build failed at
// the final gate for exactly this missing import — keep it).
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import { renderChunks, concatParts, muxAndPublish, detectGpuEncode } from '../../engine/buildlib.mjs';
import { renderFrame as engineFrame, ffmpegChunkArgs } from '../../engine/compose.mjs';
import { T } from './timings.mjs';
import { drawWorld } from './world.mjs';
import { buildAudio } from './audio.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = 'NNN-your-slug'; // replaced by new.sh
const GRADE = { fade: { fadeIn: T.fadeIn, fadeOut: T.fadeOut } };

const renderFrame = (ctx, W, H, t) => engineFrame(ctx, W, H, t, drawWorld, { rail: T.rail, grade: GRADE });

function ffprobeRun(args) {
  return new Promise((res, rej) => {
    const p = spawn('ffprobe', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let so = '', se = '';
    p.stdout.on('data', (d) => (so += d));
    p.stderr.on('data', (d) => (se += d));
    p.on('error', rej);
    p.on('close', (c) => (c === 0 ? res(so) : rej(new Error(se.slice(-400)))));
  });
}

// LAW 14 preview — sampler windows from T.preview, video + the same audio
// windows from out/mix.wav, one muxed file. Full render resolution; GPU lane
// (NVENC) when available, qc profile otherwise.
async function preview() {
  const wins = T.preview;
  if (!wins?.length) throw new Error('T.preview missing — LAW 14 needs sampler windows in timings.mjs');
  const totalS = wins.reduce((s, [a, b]) => s + (b - a), 0);
  const gpu = await detectGpuEncode();
  const qual = gpu ? 'qcGpu' : 'qc';
  const mixWav = join(HERE, 'out', 'mix.wav');
  if (!existsSync(mixWav)) throw new Error('out/mix.wav missing — run `bun audio.mjs` first');
  const videoOnly = join(HERE, 'out', 'preview-video.mp4');
  const audioOnly = join(HERE, 'out', 'preview-audio.m4a');
  const pub = join(HERE, 'out', 'preview-30s.mp4');

  console.log(`[preview] ${wins.length} windows · ${totalS.toFixed(2)} s · lane=${gpu ? 'GPU/NVENC' : 'CPU/x264'} (${qual})`);
  const canvas = createCanvas(T.W, T.H);
  const ctx = canvas.getContext('2d');
  const ff = spawn('ffmpeg', ffmpegChunkArgs(T.W, T.H, videoOnly, qual), { stdio: ['pipe', 'inherit', 'inherit'] });
  await new Promise((res, rej) => {
    ff.on('error', rej);
    ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`preview video ffmpeg exited ${c}`))));
    (async () => {
      try {
        for (const [a, b] of wins) {
          const f0 = Math.round(a * T.FPS), f1 = Math.round(b * T.FPS);
          for (let f = f0; f < f1; f++) {
            renderFrame(ctx, T.W, T.H, f / T.FPS);
            if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r));
          }
        }
        ff.stdin.end();
      } catch (e) { ff.kill('SIGKILL'); rej(e); }
    })();
  });

  const segs = wins.map(([a, b], i) => `[0:a]atrim=${a}:${b},asetpts=PTS-STARTPTS[a${i}]`).join(';');
  const cat = wins.map((_, i) => `[a${i}]`).join('') + `concat=n=${wins.length}:v=0:a=1[aout]`;
  await new Promise((res, rej) => {
    const p = spawn('ffmpeg', ['-y', '-i', mixWav, '-filter_complex', `${segs};${cat}`, '-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', audioOnly], { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('error', rej);
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(`preview audio ffmpeg exited ${c}`))));
  });
  await new Promise((res, rej) => {
    const p = spawn('ffmpeg', ['-y', '-i', videoOnly, '-i', audioOnly, '-map', '0:v', '-map', '1:a', '-c', 'copy', '-movflags', '+faststart', pub], { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('error', rej);
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(`preview mux ffmpeg exited ${c}`))));
  });
  const d = await ffprobeRun(['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', pub]);
  console.log(`[preview] written → ${pub} (${Number(d).toFixed(2)} s)`);
}

async function main() {
  if (process.argv.includes('--preview')) { await preview(); return; }

  const noVideo = process.argv.includes('--no-video');
  if (!noVideo) {
    // LAW 14 — the preview gate. A full render requires explicit confirmation.
    if (!process.argv.includes('--yes') && process.env.FILM_CONFIRM !== '1') {
      console.error('LAW 14 preview gate: show the scene sheet + 30 s preview (`bun build.mjs --preview`),\n' +
        'get explicit user confirmation, then re-run as `bun build.mjs --yes`.');
      process.exit(2);
    }
    // Bounded parallel pool, sized by renderPlan inside renderChunks: GPU lane
    // (NVENC) when available frees the CPU for the canvas; CPU lane caps x264
    // threads so encoders never starve the canvas thread.
    await renderChunks(renderFrame, T, { slug: SLUG });
    await concatParts(SLUG);                            // probes every part first — LAW 3
  } else {
    const vo = join(HERE, 'out', 'video-only.mp4');
    if (!existsSync(vo)) throw new Error(`--no-video: ${vo} missing — run a full build first`);
    console.log('reusing existing out/video-only.mp4');
  }
  const { out: mixWav } = await buildAudio();
  const pub = await muxAndPublish(SLUG, { mixWav, frames: T.FRAMES, dur: T.DUR, fps: T.FPS });
  console.log(`published → ${pub}`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
