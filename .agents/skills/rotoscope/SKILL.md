---
name: rotoscope
description: Rotoscope/stencil real licensed plates into Opuscar Studio ink — auto-trace a reference image or film frame into simplified handStroke polylines (studio/tools/rotoscope/trace.py + engine trace.mjs), or draw over a faint stencil plate by hand (drawPrint underlay → ink over → stencil fades out). Use when a beat needs a photographic subject rendered in house ink (historical figures, artifacts, species, machinery), when faking a "video drawn live" effect, or when the cast lacks the required silhouette. Covers legality (traces are derivatives — source still needs license + credits row), tuning, QC, and the draw-on-reveal engine hook.
---

# Rotoscoping in Opuscar Studio

Two production-tested workflows, both verified end-to-end (Nov 2026). Pick by subject complexity — an aurochs lithograph auto-traces cleanly; a candid street photo does not.

## 0 · Legal first (LAW 1)
A traced contour is a **derivative work of the source image** — the license still applies. PD/CC0 sources pre-clear this (lithographs, NASA, Smithsonian CC0, US-gov). CC-BY → attribution in end-card + credits row. Never trace unlicensed web images, video frames ripped from YouTube, or identifiable faces for the cast without a release. Credits CSV gets a row: `trace of <source>, <license>, <URL>`. Being a trace ≠ "all ours".

## 1 · Workflow A — auto-trace (semi-automated, fastest)
`studio/tools/rotoscope/trace.py` (OpenCV, verified on this machine) → JSON polylines → `studio/engine/trace.mjs` → staggered draw-on ink.

```bash
# 1. get a reference plate (license-clear), frames from video if tracing motion:
ffmpeg -i assets/clips/<clip>.mp4 -vf scale=1920:-1:flags=lanczos assets/clips/frames/<id>/f_%05d.png
# 2. trace
python studio/tools/rotoscope/trace.py assets/clips/aurochs.png --out assets/clips/trace-aurochs.json \
    --canny 50 150 --simplify 0.004 --min-pts 20
```

**Tuning knobs:**
| Flag | Effect | Guidance |
|------|--------|----------|
| `--canny lo hi` | edge sensitivity | raise both for photos, lower for clean lithographs (50 150 good for prints) |
| `--simplify` | polyline simplification (fraction of perimeter) | 0.004 = faithful (test output: 52 lines / 1,445 pts on a QC still); 0.01+ = chunky house-ink look |
| `--min-pts` | drop short contours | raise to 30+ to kill texture noise |
| `--blur` | gaussian pre-blur | 5 for photos |
| `--scale` | downscale before tracing | coords auto-rescaled back; speeds 4K traces |

**Engine side (world.mjs):**
```js
import { loadTrace, drawTrace } from '../../engine/trace.mjs';
const trace = await loadTrace(new URL('./assets/clips/trace-aurochs.json', import.meta.url));
// in drawWorld:
drawTrace(ctx, trace, { x, y, scale: 1, t, t0: S.hook + 2.0, dur: 2.4, stagger: 0.045, w: 5 });
```
`drawTrace` reveals lines longest-first with `stagger` seconds between them — the "ink draws itself over nothing" effect. Everything multiplies inherited `globalAlpha`; boil applies to every stroke.

**Verified:** trace of project 001's QC still → 52 polylines; `drawTrace` rendered onto a paper canvas without error (smoke test Nov 2026). Re-run on any plate before committing to a beat.

## 2 · Workflow B — stencil (hand ink over faint plate)
For complex or character-critical subjects where auto-trace butchers the silhouette:
```js
// faint stencil underlay — alpha low; remove (alpha 0) in final render once ink is approved
drawPrint(ctx, img, x, y, { w: 900, rot: -0.01, alpha: 0.12 });
// your own ink strokes on top, same anchor
handStroke(ctx, [[x-430, y+250], [x-390, y-200], …], { w: 6, progress: drawOn });
```
QC trick: render once with stencil at 0.12 (registration check), then set stencil alpha `0` for publish — world file keeps both paths behind one const. This is how 001's aurochs/goat/cow prints were attacked: lithograph reference → hand contours.

## 3 · "Video drawn live" beat
To make a whole clip appear as living ink: extract frames (ffmpeg, above), auto-trace every Nth frame (every 3rd is plenty — ink never needs 30fps truth), then scrub `t → frameIndex` and `drawTrace` each frame's JSON in the beat window with short `dur`. Cost: ~50 polylines/frame × ~10 frames — cheap. Deliver as plate sequence with contact-shadow print frame around it (LAW 5).

## 4 · Choosing & QC
- Silhouette quality over detail fidelity — one clean outer contour beats 400 noisy inner lines.
- Always smoke-trace BEFORE scripting the beat (`trace.py` on the actual asset, inspect JSON stats: lines < ~120, points sane, no NaN).
- QC stills at draw-on start/mid/end (LAW 8); ink must not strike through type (LAW 6); traced print owns its contact shadow (LAW 5); credits row present (LAW 1).
- Failure modes: photo with busy background → 1,000+ spurious contours (raise `--blur`/`--min-pts` or crop to subject first) · moiré from halftone prints (blur 5, canny up) · traced face uncanny (don't — hand-draw or redesign the beat).

## 5 · Related
`studio/engine/trace.mjs` · `studio/tools/rotoscope/trace.py` · `.agents/skills/cinematic-motion-graphics` (bible §3 animation, §4 plates) · `.agents/skills/get-image` (licensed references) · AGENTS.md LAW 1/5/6/8.
