// build.mjs — full build: chunk render → concat → audio mix → mux → publish.
//   bun build.mjs              render everything, verify, publish to public/film/
//   bun build.mjs --no-video   re-publish from the existing out/video-only.mp4
// Note: existsSync is imported correctly here (a historical build failed at
// the final gate for exactly this missing import — keep it).
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderChunks, concatParts, muxAndPublish } from '../../engine/buildlib.mjs';
import { renderFrame as engineFrame } from '../../engine/compose.mjs';
import { filmGrade } from '../../engine/presets.mjs';
import { T } from './timings.mjs';
import { drawWorld } from './world.mjs';
import { buildAudio } from './audio.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = '003-the-oldest-trick-in-history'; // replaced by new.sh
const GRADE = filmGrade('documentary-grade', { fadeIn: T.fadeIn, fadeOut: T.fadeOut });

const renderFrame = (ctx, W, H, t) => engineFrame(ctx, W, H, t, drawWorld, { rail: T.rail, grade: GRADE });

async function main() {
  const noVideo = process.argv.includes('--no-video');
  if (!noVideo) {
    // Bounded parallel pool for this workstation (6c/12t, 16GB): 2 workers ×
    // 5 x264 threads keeps the encoders from starving the canvas thread.
    // The old "sequential only" law was written for the 4GB Linux sandbox.
    await renderChunks(renderFrame, T, { slug: SLUG, workers: 2, threads: 5 });
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
