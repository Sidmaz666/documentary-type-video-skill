// build.mjs — full build: chunk render → concat → audio mix → mux → publish.
//   bun build.mjs              render everything, verify, publish to public/film/
//   bun build.mjs --no-video   re-publish from the existing out/video-only.mp4
// Note: existsSync is imported correctly here (a historical build once failed
// at the final gate for exactly this missing import — keep it).
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderChunks, concatParts, muxAndPublish } from '../../engine/buildlib.mjs';
import { renderFrame as engineFrame } from '../../engine/compose.mjs';
import { T } from './timings.mjs';
import { drawWorld } from './world.mjs';
import { buildAudio } from './audio.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = '001-the-bravest-snack-in-history';
const GRADE = { fade: { fadeIn: T.fadeIn, fadeOut: T.fadeOut } };

// bind the engine pipeline to THIS film's world + clock
const renderFrame = (ctx, W, H, t) => engineFrame(ctx, W, H, t, drawWorld, { rail: T.rail, grade: GRADE });

async function main() {
  const noVideo = process.argv.includes('--no-video');
  if (!noVideo) {
    await renderChunks(renderFrame, T, { slug: SLUG }); // sequential — OOM law
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
