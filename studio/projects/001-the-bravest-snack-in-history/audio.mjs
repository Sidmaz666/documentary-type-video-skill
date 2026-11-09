// audio.mjs — rebuild the mix: VO (the user's own narration, assets/vo.m4a)
// + the SFX score (sfx-plan) + the classical music bed when the file is
// present (MUSIC LAW). The Satie bed was lost in the wipe; while it is
// absent this stage logs a warning and mixes VO+SFX only — the drone
// fallback is NOT substituted (finale swell stays omitted for this film).
//   bun audio.mjs   → out/mix.wav
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mixVoWithBus } from '../../engine/sfx.mjs';
import { sfxEvents, musicBed } from './sfx-plan.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export async function buildAudio() {
  const voPath = join(HERE, 'assets', 'vo.m4a');
  const music = musicBed();
  const out = join(HERE, 'out', 'mix.wav');
  const res = await mixVoWithBus(voPath, sfxEvents(), { music, out, tail: 0.05 });
  console.log(`mix written → ${res.out} (${res.dur.toFixed(3)}s @48kHz stereo)`);
  return res;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAudio();
}
