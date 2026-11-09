#!/usr/bin/env node
// Word-level ASR/STT timestamps for Opuscar VO (verification/fallback).
// Uses nodejs-whisper (whisper.cpp binding). Default model: tiny.en (fast).
//
// First run may download the model automatically (network required).
// If auto-download fails, place ggml model in ./whisper-models/ and pass --modelPath.
//
// Examples:
//   node studio/tools/asr/transcribe.mjs studio/projects/001-the-bravest-snack-in-history/assets/vo.m4a
//   node studio/tools/asr/transcribe.mjs assets/vo.m4a --model tiny.en --out assets/vo-timings.json
//   node studio/tools/asr/transcribe.mjs assets/vo.m4a --model tiny --modelPath ./whisper-models
import { pathToFileURL } from 'node:url';
import { resolve, basename } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

function arg(flag, def = null) { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : def; }
function has(flag) { return process.argv.includes(flag); }

function toSec(ts) {
  if (ts == null) return null;
  if (typeof ts === 'number') return ts > 1000 ? ts / 1000 : ts;
  const m = String(ts).trim().match(/(?:(\d+):)?(\d+):(\d+)[,.](\d+)/);
  if (m) return (+m[1] || 0) * 3600 + (+m[2]) * 60 + (+m[3]) + (+`0.${m[4]}`);
  const n = Number(ts); return Number.isFinite(n) ? n : null;
}
function normWord(w) {
  const start = toSec(w.start ?? w.t0 ?? w.from ?? w.offset);
  const end = toSec(w.end ?? w.t1 ?? w.to);
  const word = String(w.word ?? w.text ?? w.speech ?? '').trim();
  return start != null && end != null && word ? { start: +start.toFixed(3), end: +end.toFixed(3), word, prob: w.probability ?? w.prob ?? w.p ?? null } : null;
}
function normalize(res, audio, model) {
  const raw = Array.isArray(res) ? res : (res?.transcription || res?.segments || res?.result || []);
  const segments = [];
  let full = [];
  for (const s of raw) {
    const words = (s.words || s.tokens || []).map(normWord).filter(Boolean);
    const text = String(s.text ?? s.speech ?? '').trim();
    const start = toSec(s.start ?? s.t0 ?? s.from ?? s.offset);
    const end = toSec(s.end ?? s.t1 ?? s.to ?? s.offset_end);
    if (start != null && end != null) segments.push({ start: +start.toFixed(3), end: +end.toFixed(3), text, words });
    if (text) full.push(text);
  }
  const dur = segments.length ? segments[segments.length - 1].end : null;
  return { backend: 'nodejs-whisper', model, audio, duration: dur, language: res?.language || arg('--language', 'en'), text: full.join(' ').replace(/\s+/g, ' ').trim(), segments };
}

export async function transcribe(audioPath, opts = {}) {
  const { nodewhisper } = await import('nodejs-whisper');
  const model = opts.model || 'tiny.en';
  const modelPath = opts.modelPath || resolve('whisper-models');
  mkdirSync(modelPath, { recursive: true });
  const params = {
    modelName: model,
    modelPath,
    autoDownloadModelName: model,
    whisperOptions: {
      outputInJson: true,
      outputInText: false,
      outputInSrt: false,
      outputInVtt: false,
      wordTimestamps: true,
      timestamps_length: 20,
      splitOnWord: true,
    },
  };
  const res = await nodewhisper(resolve(audioPath), params);
  return normalize(res, resolve(audioPath), model);
}

async function main() {
  const audio = process.argv.slice(2).find((a) => a && !a.startsWith('-'));
  if (!audio || has('-h') || has('--help')) {
    console.log(`usage: node studio/tools/asr/transcribe.mjs <audio> [--model tiny.en|tiny|base.en|base] [--out file.json] [--modelPath dir]\n       bun studio/tools/asr/transcribe.mjs <audio> ...\nDefault: model=tiny.en (fast). First run downloads model to ./whisper-models/.\nOutput: JSON {backend,model,audio,duration,segments:[{start,end,text,words:[{start,end,word,prob}]}]}`);
    process.exit(audio ? 0 : 2);
  }
  const model = arg('--model', 'tiny.en');
  const out = arg('--out', resolve(audio).replace(/\.[^.]+$/, '') + '.whisper.json');
  const result = await transcribe(audio, { model, modelPath: arg('--modelPath') });
  mkdirSync(resolve(out, '..'), { recursive: true });
  writeFileSync(out, JSON.stringify(result, null, 2));
  const nwords = result.segments.reduce((n, s) => n + (s.words?.length || 0), 0);
  console.log(JSON.stringify({ ok: true, out, backend: result.backend, model: result.model, duration: result.duration, segments: result.segments.length, words: nwords }));
}
if (import.meta.main || (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)) {
  main().catch((e) => { console.error(e?.stack || e?.message || e); process.exit(1); });
}
