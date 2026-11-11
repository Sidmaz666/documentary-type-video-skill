// buildlib.mjs — chunk render → concat → mux → publish.
// OOM LAW: chunks render SEQUENTIALLY, never in parallel. Frames stream into
// ffmpeg one by one — nothing accumulates.
// LAW 3: every part is probed (moov/duration check) before concat — ffmpeg
// -c copy concat fails SILENTLY on a corrupt part file. After publishing, the
// FINAL-FILE LAW probe runs numeric verification (frame count + both stream
// durations) and throws on mismatch.
import { spawn } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpegChunkArgs } from './compose.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const outDir = (slug) => join(ROOT, 'studio/projects', slug, 'out');
export const publishPath = (slug) => join(ROOT, 'public/film', `${slug}.mp4`);

function run(cmd, args, { cwd } = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let so = '', se = '';
    p.stdout.on('data', (d) => (so += d));
    p.stderr.on('data', (d) => (se += d));
    p.on('error', rej);
    p.on('close', (code) => (code === 0 ? res({ code, stdout: so, stderr: se }) : rej(new Error(`${cmd} ${args.join(' ')} exited ${code}\n${se.slice(-800)}`))));
  });
}

async function ffprobeJson(path) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', path]);
  return JSON.parse(stdout);
}

// renderChunks — sequential chunk render of the whole film.
// renderFrame: (ctx, W, H, t) => void  (project-bound pipeline)
// T: { W, H, FPS, FRAMES }
export async function renderChunks(renderFrame, T, { chunk = 244, slug } = {}) {
  if (!slug) throw new Error('renderChunks needs { slug }');
  const dir = outDir(slug);
  mkdirSync(dir, { recursive: true });
  const canvas = createCanvas(T.W, T.H);
  const ctx = canvas.getContext('2d');
  const list = [];
  for (let start = 0; start < T.FRAMES; start += chunk) {
    const end = Math.min(T.FRAMES, start + chunk);
    const name = `part_${String(start).padStart(4, '0')}.mp4`;
    const partPath = join(dir, name);
    rmSync(partPath, { force: true }); // never append into a stale part
    const ff = spawn('ffmpeg', ffmpegChunkArgs(T.W, T.H, partPath), { stdio: ['pipe', 'inherit', 'inherit'] });
    await new Promise((res, rej) => {
      ff.on('error', rej);
      ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`chunk ${name} exited ${code}`))));
      (async () => {
        try {
          for (let f = start; f < end; f++) {
            renderFrame(ctx, T.W, T.H, f / T.FPS);
            const buf = canvas.data(); // raw RGBA, streamed — never accumulated
            if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
          }
          ff.stdin.end();
        } catch (e) { ff.kill('SIGKILL'); rej(e); }
      })();
    });
    list.push(name);
    console.log(`[${new Date().toISOString()}] chunk ${name} ok (frames ${start}–${end - 1})`);
  }
  writeFileSync(join(dir, 'list.txt'), list.map((n) => `file '${n}'`).join('\n') + '\n');
  return list;
}

// concatParts — LAW 3: probe EVERY part before concat; fail loudly on a
// corrupt part (missing moov → ffprobe errors or reports no duration).
// ORDERISM (LAW 3b): chunk names are `part_<startFrame>.mp4` — once the start
// frame crosses 4 digits (≥9996 frames ⇒ ~41 s per chunk × 41 chunks), plain
// lexicographic `.sort()` puts `part_10004` BETWEEN `part_0976` and `part_1220`.
// `-c copy` concat is order-blind, frame-count/duration probes are order-blind:
// 003 shipped the final question scene second and every scene after it rewound
// while ALL numeric gates passed ("sudden flash of scenes, misplaced scenes").
// Order is now enforced NUMERICALLY, always, and list.txt is rewritten in that
// order — a stale/poisoned list can never be trusted again.
const partOrder = (name) => {
  const m = /^part_(\d+)\.mp4$/.exec(name);
  if (!m) throw new Error(`LAW 3: unexpected part name ${name}`);
  return Number(m[1]);
};
export async function concatParts(slug, { dir } = {}) {
  dir = dir || outDir(slug);
  const listPath = join(dir, 'list.txt');
  let list;
  if (existsSync(listPath)) {
    list = readFileSync(listPath, 'utf8')
      .split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^file '/, '').replace(/'$/, ''));
  } else {
    list = ((await import('node:fs')).readdirSync(dir))
      .filter((f) => /^part_\d+\.mp4$/.test(f));
  }
  list = [...new Set(list)].sort((a, b) => partOrder(a) - partOrder(b)); // NUMERIC, deduped — LAW 3b
  if (!list.length) throw new Error('no parts listed — nothing to concat');
  if (partOrder(list[0]) !== 0) throw new Error(`LAW 3b: first part must start at frame 0 — got ${list[0]}`);
  for (let k = 1; k < list.length; k++) {
    if (partOrder(list[k]) <= partOrder(list[k - 1])) throw new Error(`LAW 3b: non-ascending part order at ${list[k]}`);
  } // coverage gaps (a deleted middle chunk) show up as an FRAMES count failure at the FINAL-FILE LAW gate
  writeFileSync(listPath, list.map((n) => `file '${n}'`).join('\n') + '\n');
  for (const name of list) {
    const p = join(dir, name);
    if (!existsSync(p)) throw new Error(`LAW 3: missing part ${name} — delete and re-render that chunk`);
    try {
      const meta = await ffprobeJson(p);
      const dur = meta.format?.duration;
      const hasVideo = meta.streams?.some((s) => s.codec_type === 'video');
      if (!hasVideo || !dur || Number(dur) <= 0) throw new Error(`no usable video stream/duration`);
    } catch (e) {
      throw new Error(`LAW 3: corrupt part ${name} (${e.message.split('\n')[0]}) — DELETE it and re-render that chunk before concat.`);
    }
  }
  const videoOnly = join(dir, 'video-only.mp4');
  rmSync(videoOnly, { force: true });
  await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', videoOnly], { cwd: dir });
  return videoOnly;
}

// muxAndPublish — mux video-only + mix.wav (faststart, video copied), publish
// to public/film/<slug>.mp4 (or { publishAs }), then run the FINAL-FILE LAW probe.
// Audio: AAC 320k — the native AAC filterbank reconstructs transients up to
// ~+0.9 dB above the WAV true peak; at 192k the published TP measured -0.8..-0.5
// on 003 (DoD ceiling: TP <= -0.9 dBTP against mixes limited at -1.0..-1.4 dBTP).
// 320k restores the headroom (measured: WAV -1.4 dBTP -> published -1.1 dBTP).
export async function muxAndPublish(slug, { mixWav, frames, dur, fps = 30, publishAs, dir } = {}) {
  dir = dir || outDir(slug);
  const videoOnly = join(dir, 'video-only.mp4');
  if (!mixWav || !existsSync(mixWav)) throw new Error(`mix.wav not found at ${mixWav} — run the audio stage first`);
  const pub = publishAs ? join(ROOT, 'public/film', publishAs) : publishPath(slug);
  mkdirSync(join(ROOT, 'public/film'), { recursive: true });
  await run('ffmpeg', ['-y', '-i', videoOnly, '-i', mixWav,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k',
    '-movflags', '+faststart', '-shortest', pub]);
  await finalFileLaw(pub, { frames, dur, fps });
  return pub;
}

// FINAL-FILE LAW: numeric verification of the PUBLISHED file.
export async function finalFileLaw(path, { frames, dur, fps = 30 } = {}) {
  const meta = await ffprobeJson(path);
  const v = meta.streams.find((s) => s.codec_type === 'video');
  const a = meta.streams.find((s) => s.codec_type === 'audio');
  if (!v || !a) throw new Error(`LAW 3: ${path} missing a stream (v=${!!v} a=${!!a})`);
  const { stdout } = await run('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_read_frames,duration', '-of', 'default=noprint_wrappers=1', path]);
  const got = Object.fromEntries(stdout.split('\n').filter(Boolean).map((l) => l.split('=')));
  const nFrames = Number(got.nb_read_frames);
  const vDur = Number(v.duration ?? got.duration);
  const aDur = Number(a.duration);
  const problems = [];
  if (frames && Math.abs(nFrames - frames) > 1) problems.push(`video frames ${nFrames} ≠ expected ${frames} (±1)`);
  if (dur && vDur && Math.abs(vDur - dur) > 0.15) problems.push(`video duration ${vDur.toFixed(3)}s off expected ${dur}s`);
  if (Math.abs(vDur - aDur) > 0.1) problems.push(`stream duration mismatch video=${vDur?.toFixed(3)}s audio=${aDur?.toFixed(3)}s (truncated concat?)`);
  if (problems.length) throw new Error(`FINAL-FILE LAW FAILED for ${path}:\n  - ${problems.join('\n  - ')}`);
  console.log(`FINAL-FILE LAW ok: ${nFrames} frames, video ${vDur?.toFixed(3)}s == audio ${aDur?.toFixed(3)}s`);
  return { nFrames, vDur, aDur };
}
