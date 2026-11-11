#!/usr/bin/env node
// Word-level ASR/STT timestamps for Opuscar VO.
// JS stack: @huggingface/transformers (onnxruntime-node) running Whisper tiny.en
// - no native cmake/whisper.cpp build required (works on Windows out of the box).
// First run downloads the model (~116 MB) into ./models/whisper/ (gitignored).
//
// Examples:
//   node studio/tools/asr/transcribe.mjs studio/projects/003-the-oldest-trick-in-history/assets/vo.m4a
//   node studio/tools/asr/transcribe.mjs assets/vo.m4a --out assets/vo-timings.json --model Xenova/whisper-tiny.en
//
// Output JSON: {backend,model,audio,duration,language,text,
//               segments:[{start,end,text,words:[{start,end,word,prob}]}]}
// Word chunks are grouped into sentences (split on . ! ? and on pauses > GAP_SEC).
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';

// Repo root = three levels up from this file (studio/tools/asr/transcribe.mjs).
// The default ASR cache lives in <repo>/models/whisper regardless of CWD —
// running this tool from inside a project folder must NOT re-download 116 MB.
const REPO_ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

function arg(flag, def = null) { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : def; }
function has(flag) { return process.argv.includes(flag); }

function ffmpegConvert(input, output) {
  return new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-i', input, '-ac', '1', '-ar', '16000', output]);
    let se = '';
    ff.stderr.on('data', (d) => se += d);
    ff.on('error', (e) => rej(new Error(`ffmpeg not found on PATH: ${e.message}`)));
    ff.on('close', (code) => code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}: ${se.slice(-400)}`)));
  });
}
function decodeWav16kMono(path) { // parse PCM16 mono WAV -> Float32Array
  const buf = readFileSync(path);
  let off = 12, data = null, sr = 16000;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') sr = buf.readUInt32LE(off + 12);
    if (id === 'data') { data = buf.subarray(off + 8, off + 8 + size); break; }
    off += 8 + size + (size % 2);
  }
  if (!data) throw new Error(`no data chunk in WAV: ${path}`);
  const n = Math.floor(data.length / 2);
  const audio = new Float32Array(n);
  for (let i = 0; i < n; i++) audio[i] = data.readInt16LE(i * 2) / 32768;
  return { audio, sampleRate: sr };
}

const GAP_SEC = 0.8;
function chunkSentences(chunks) { // chunks: [{text, timestamp:[s,e]}]
  const words = chunks.map((c) => ({ start: c.timestamp?.[0] ?? null, end: c.timestamp?.[1] ?? null, word: String(c.text ?? '').trim(), prob: c.probability ?? c.prob ?? null })).filter((w) => w.start != null && w.word);
  const segments = [];
  let cur = null;
  const flush = () => { if (cur && cur.words.length) { cur.text = cur.words.map((w) => w.word).join(' ').replace(/\s+/g, ' ').trim(); segments.push(cur); } cur = null; };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prevEnd = cur && cur.words.length ? cur.words[cur.words.length - 1].end : null;
    if (!cur || (prevEnd != null && w.start - prevEnd > GAP_SEC)) {
      flush();
      cur = { start: w.start, end: w.end, text: '', words: [w] };
    } else {
      cur.words.push(w);
      cur.end = w.end;
    }
    if (/[.!?]["')\]]*$/.test(w.word)) flush(); // sentence end
  }
  flush();
  return segments;
}

export async function transcribe(audioPath, opts = {}) {
  const ext = (audioPath.split('.').pop() || '').toLowerCase();
  let wavPath = resolve(audioPath);
  let cleanup = null;
  if (ext !== 'wav') {
    cleanup = resolve(tmpdir(), `opuscar-asr-${Date.now()}.wav`);
    await ffmpegConvert(resolve(audioPath), cleanup);
    wavPath = cleanup;
  }
  try {
    const { audio, sampleRate } = decodeWav16kMono(wavPath);
    const { pipeline, env } = await import('@huggingface/transformers');
    env.cacheDir = resolve(opts.modelPath || join(REPO_ROOT, 'models', 'whisper'));
    const model = opts.model || 'Xenova/whisper-tiny.en';
    const t = await pipeline('automatic-speech-recognition', model, { dtype: 'q8' });
    const out = await t(audio, { return_timestamps: 'word', chunk_length_s: 30 });
    const segments = chunkSentences(out.chunks || []);
    return { backend: '@huggingface/transformers', model, audio: resolve(audioPath), duration: +(audio.length / sampleRate).toFixed(3), language: 'en', text: String(out.text || '').trim(), segments };
  } finally {
    if (cleanup) rmSync(cleanup, { force: true });
  }
}

async function main() {
  const audio = process.argv.slice(2).find((a) => a && !a.startsWith('-'));
  if (!audio || has('-h') || has('--help')) {
    console.log(`usage: node studio/tools/asr/transcribe.mjs <audio> [--model Xenova/whisper-tiny.en|Xenova/whisper-tiny] [--out file.json] [--modelPath <dir>] (default: <repo>/models/whisper)\n       bun studio/tools/asr/transcribe.mjs <audio> ...\nJS/onnxruntime stack (@huggingface/transformers). First run downloads the model (~116 MB) to ./models/whisper/ (gitignored).\nOutput: JSON with word-level timestamps: segments[].words[].{start,end,word,prob}`);
    process.exit(audio ? 0 : 2);
  }
  const out = arg('--out', resolve(audio).replace(/\.[^.]+$/, '') + '.whisper.json');
  const result = await transcribe(audio, { model: arg('--model'), modelPath: arg('--modelPath') });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(result, null, 2));
  const nwords = result.segments.reduce((n, s) => n + (s.words?.length || 0), 0);
  console.log(JSON.stringify({ ok: true, out, backend: result.backend, model: result.model, duration: result.duration, segments: result.segments.length, words: nwords }));
}
if (import.meta.main || (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)) {
  main().catch((e) => { console.error(e?.stack || e?.message || e); process.exit(1); });
}
