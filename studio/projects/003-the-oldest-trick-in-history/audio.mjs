// audio.mjs — rebuild the mix: VO (assets/vo.m4a) + SFX (sfx-plan) + music
// bed when present (MUSIC LAW).   bun audio.mjs  → out/mix.wav
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { mixVoWithBus } from '../../engine/sfx.mjs';
import { sfxEvents, musicBed } from './sfx-plan.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export async function buildAudio() {
  const voPath = join(HERE, 'assets', 'vo.m4a');
  if (!existsSync(voPath)) throw new Error(`assets/vo.m4a missing — drop the narration in first (LAW 2: duration = VO)`);
  const music = musicBed();
  const out = join(HERE, 'out', 'mix.wav');
    const res = await mixVoWithBus(voPath, sfxEvents(), { music, out, tail: 0.05, voGain: 3.0, masterTrim: -0.4 });
  console.log(`mix written → ${res.out} (${res.dur.toFixed(3)}s @48kHz stereo)`);
  return res;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAudio();
}
