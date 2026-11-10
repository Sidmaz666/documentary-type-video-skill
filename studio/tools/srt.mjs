// srt.mjs — generate SubRip (SRT) captions from a whisper ASR word/segment JSON.
//   bun studio/tools/srt.mjs <vo-timings.whisper.json> <out.srt>
// Merges fragments shorter than ~1.3 s (or cues whose combined length is a few
// words) into the previous cue, so captions read as sentences, not crumbs.
import { readFileSync, writeFileSync } from 'node:fs';

const [inPath, outPath] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error('usage: bun studio/tools/srt.mjs <vo-timings.whisper.json> <out.srt>');
  process.exit(2);
}
const d = JSON.parse(readFileSync(inPath, 'utf8'));
const fmt = (t) => {
  const ms = Math.max(0, Math.round(t * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const r = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${s},${r}`;
};
const clean = (s) => s.replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
const segs = (d.segments || []).map((s) => ({
  start: s.start ?? s.t0 ?? 0,
  end: s.end ?? s.t1 ?? 0,
  text: clean(s.text || ''),
}));
const merged = [];
let pendingShort = null; // forward-merge short fragments into the NEXT cue
for (const s of segs) {
  if (!s.text) continue;
  const dur = s.end - s.start;
  if (dur < 1.3) {
    pendingShort = pendingShort
      ? { start: pendingShort.start, end: s.end, text: `${pendingShort.text} ${s.text}`.trim() }
      : { ...s };
    continue;
  }
  if (pendingShort) {
    merged.push(pendingShort); // the short run stands alone as its own cue
    pendingShort = null;
  }
  merged.push(s);
}
if (pendingShort) merged.push(pendingShort);
const srt = merged.map((s, i) => `${i + 1}\n${fmt(s.start)} --> ${fmt(s.end)}\n${s.text}\n`).join('\n');
writeFileSync(outPath, srt, 'utf8');
console.log(`wrote ${outPath} (${merged.length} cues)`);
