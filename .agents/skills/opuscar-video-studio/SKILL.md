---
name: opuscar-video-studio
description: Create, fix, render, QC, and publish Opuscar Studio films (Bun + @napi-rs/canvas + ffmpeg). Use when working in studio/projects/* or studio/engine/*, making a new film, re-timing/syncing VO to picture/SFX, fixing framing/overlap/safe-area/underline issues, sourcing licensed web media as props or grade-matched plates/B-roll (Wikimedia/Pexels/Mixkit via clips tool + get-image/agent-browser), rendering chunks, verifying FINAL-FILE LAW, or preparing multi-project git commits. Pair with .agents/skills/cinematic-motion-graphics for framing/animation/typography craft (LAW 8).
---

# Opuscar Video Studio

Follow repo `AGENTS.md` first (hard laws win).

## Layout
- `studio/engine/` topic-agnostic toolchain (never imports projects).
- `.agents/skills/cinematic-motion-graphics/` the cinematographer/motion-director bible (LAW 8) — load it whenever framing, animating text, compositing stock, or writing BEATS.md.
- `studio/projects/<NNN-slug>/` one film: `PROJECT.md`, `BEATS.md`, `timings.mjs` (single clock `T`), `world.mjs` (art), `sfx-plan.mjs` (SFX/music, reads `T`), `render.mjs`, `audio.mjs`, `build.mjs`, `assets/`.
- `studio/templates/project/` + `bash studio/new.sh <slug> "Title"` scaffold next film.
- `public/film/<slug>/<slug>.mp4` published artifact (one dir per film); `src/lib/films.ts` film manifest.

## Hard laws checklist
- **LAW 1**: no AI-generated media, ever. Licensed, **real** (non-AI) stock images/video/clips ARE allowed: as printed props, as grade-matched full-frame plates/B-roll (ffmpeg frame extraction → `drawImage`, bible §4), or documented assets — every one with `assets/assets-credits.csv` rows (license, author, source URL, modification). Never raw/ungraded stock to the timeline.
- **LAW 1b MUSIC**: real classical recordings from open public-domain/openly-licensed sources only (Wikimedia Commons, Openverse, Musopen, archive.org, IMSLP, NASA/US federal archives — verify BOTH composition and performance PD/CC0, or CC-BY + attribution). Never MIDI/synth. `assets/music/` + credits; trim/fade/sidechain-duck under VO (−6…−8 dB, anchor ≈−14.5 LUFS, TP ≤ −0.9 dBTP); **never two beds** (classical asset retires drone). `mixVoWithBus(...,{path,trimTo:T.DUR,gain,fadeIn,fadeOut,trimLead:true})` — the bed must be **audible from second 0** (trimLead skips leading silence; verify no ≥0.3 s run at −38 dB at open).
- **LAW 2**: duration = VO duration (`T.FRAMES = round(T.DUR*FPS)`).
- **LAW 3b concat order & stale parts**: concat lists sort chunks NUMERICALLY (never lexicographic — `part_10004` after `part_0244`), dedupe, first part at frame 0; `concatParts` enforces this. Before re-rendering a re-timed film (new FRAMES) WIPE the out-dir (`rmSync` chunks first) — stale parts are swept into the new concat silently (+17-frame phantom-master incident). `deliver.mjs` does this.
- **LAW 3 FINAL-FILE LAW** (after every build/publish): probe every `out/part_*.mp4` before concat (ffmpeg `-c copy` fails silently on corrupt/moov-missing parts — delete+re-render); verify published MP4 numerically: `nb_read_frames == T.FRAMES±1`, video duration == audio duration.
  ```bash
  ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,duration -of default=noprint_wrappers=1 public/film/<slug>.mp4
  ffprobe -v error -select_streams a:0 -show_entries stream=duration -of default=noprint_wrappers=1 public/film/<slug>.mp4
  ```
- **LAW 4 safe area**: no text/element clips viewport on any beat/camera pose; sweep every 0.25 s: `bun studio/tools/safearea.mjs --world studio/projects/<slug>/world.mjs --timings studio/projects/<slug>/timings.mjs` (exit 1 on breach); supplement with `bun render.mjs still <t> --scale 4` per beat. Prints must **fade in situ** — drop-in entries cross the top safe band.
- **LAW 12 thumbnail grammar**: every scene's key pose must hold up as a thumbnail (key art is the density bar). Hero asset **≥35–45% of frame width** or headline **≥18% of frame height**; name the **web hero layout** per beat (split-hero / centered hero / two-up / 3-up grid / full-width band); prints at **full opacity at hold**, never under text, captions ≤24px below print bottom with ≥20px clearance; **frame-edge-calibrated fade helpers** (alpha 0 only inside the outer 60px band, 1.0 by ~200 canvas-px inside — world-offset constants ghost assets at zoom<1); **transit budget ≤3.2s**, arrival ≥1.2s before the beat's first VO word; no quarter-frame empty >1.5s in a hold. Episode 2026-11: 003 S01 shipped type under the palace print, assets ghosted at zoom 0.92–0.97, 19s empty S04 window, 4.5–4.8s transits — all fixed; the law exists.
- **LAW 5 nothing floats**: attached parts root inside silhouette, joint covered.
- **LAW 6 no stroke crosses type**: underline/circle below last line, >=40px clearance, timed after text stamps in; retime stroke, not text.
- **LAW 7 publish hygiene**: zip hand-off excludes models/caches/chunks/.env; rebuild after source changes; `public/film/<slug>/<slug>.mp4` is canonical.
- **LAW 8 craft**: every BEATS.md row is a complete shot card (intent/shot/move/grid/hero/text-clearance/cues/assets); thirds/phi framing; no text collisions at any frame/pose; still sweep + `--scale 4` crops per beat; binding manual `.agents/skills/cinematic-motion-graphics/SKILL.md`.
- **LAW 11 scene-fill & visible plates**: every beat carries ≥1 licensed real asset (in-situ fade helpers, never `drop:` across the band); background vibe plate must be verified **visible** in a still — multiply α≈0.15–0.20, TILED ~7000-px feathered-edge tiles built ONCE at module load (never rebuilt per frame; draw only viewport-intersecting tiles). Epoch: 003 shipped a blank-looking plate at α 0.09 and a >1h LAW 4 sweep before both were fixed. Honest-absence card when no licensed photo exists (003: redacted PRESS FILE / NOT PICTURED) — never a fabricated likeness.
- **LAW 10 camera variety**: every zone-to-zone transit carries a non-horizontal vector (diagonal up/down, arc) — never a dead straight horizontal ride. Use `makeVariedRail(keys, seed)` (engine/camera.mjs) instead of `makeRail`: any span with |Δx| ≥ 650 px is auto-split and nudged by a deterministic anti-repeat bank; record `T.rail.variety` in PROJECT.md. Hand-keyed rails need the same diagonal discipline. LAW 4 still gates — re-seed or shrink `dyScale` on breach.
- **Production targets**: 001/002 are test reels. Production films are **5–6 min** or **10–12 min** illustrated essays (VO-driven, one zone per ~20–40 s, long boards, many varied transits, mandatory QC still sweeps, SRT + 16:9 alternate + key stills on publish).
- **LAW 9 external source law**: every film MUST contain ≥1 real, licensed external asset in-frame (photo/clip/archival; human author; PD/CC0/CC-BY-with-attribution or free-stock licenses) — a film with zero source material FAILS. Name it in the beat's Assets cell; credits-CSV row mandatory; grade-match/composite so the paper world stays the house identity.

## Workflow (new/fix film)
1. Brief + beat table: `PROJECT.md`, `BEATS.md` — every BEATS row is a full **shot card** (LAW 8); load `.agents/skills/cinematic-motion-graphics/SKILL.md` for craft rules (framing grids, shot sizes, easing, typography, color script, QC loop).
2. VO canonical: `assets/vo.m4a` + `assets/timings.json` (or Kokoro + timestamps if none supplied). VO without supplied narration: `python studio/tools/tts/kokoro.py --text "…" --out assets/vo.m4a [--voice am_michael]` (local Kokoro-82M, offline, Apache-2.0; verified). ASR/STT verify/fallback (word-level): `node studio/tools/asr/transcribe.mjs assets/vo.m4a --out assets/vo-timings.whisper.json` (JS: @huggingface/transformers + onnx; model Xenova/whisper-tiny.en auto-downloads to `models/whisper/` on first run).
3. `timings.mjs`: single clock `T` (scenes, fades, camera Catmull-Rom rail — use `makeVariedRail(keys, seed)` so zone transits vary diagonally, LAW 10). Picture+SFX import `T`.
4. `world.mjs`: draw zones on 20kpx paper board with engine props/cast/ink/text; zone dim-backs; `globalAlpha` multiplied. Use `drawPrint(loadImage(...))` for sourced props — prints **fade in situ** (`alpha: clamp((t - t0)/0.6, 0, 1)`), never `drop:` entries that cross the top safe band. Optional but encouraged: a constant **background vibe plate** (`drawBackgroundPlate(ctx, img, {x, y, w, h, alpha: 0.15})`) multiply-blended into the paper for atmospheric depth — one constant plate per film, credits-CSV row mandatory (LAW 9). Cast presets & thirds/phi anchors: `engine/presets.mjs` (CAST_PRESETS, THIRDS, PHI_GRID).
5. `sfx-plan.mjs`: events at `T` times; `musicBed()` returns PD/CC0 bed or `null`.
6. QC stills at every beat + transitions, at pose and at text entry/exit frames: `bun render.mjs stills 0.5,... --scale 4` (LAW 4/5/6/8/12) **plus the LAW 4 sweep** `bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs` (must report `SAFE AREA OK`) **plus the dead-air scan** (list every ≥1.5 s window with no hero/text on screen — bridge it with in-situ fading carry-over prints, or retime the next hero — never ship blank paper). **Thumbnail test per beat:** every hold still must pass the hero-scale test and the web-hero layout named in its shot card — no small props on empty paper., at pose and at text entry/exit frames: `bun render.mjs stills 0.5,... --scale 4` (LAW 4/5/6/8) **plus the LAW 4 sweep** `bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs` (must report `SAFE AREA OK`) **plus the dead-air scan** (list every ≥1.5 s window with no hero/text on screen — bridge it with in-situ fading carry-over prints, or retime the next hero — never ship blank paper).
6b. **End-card gate** (LAW 8): render stills at `t_end−1.0`, `t_end−0.3`, `t_end` and inspect the banded stack (bible §5.8) — mask-ups / artifact print / pool|falling prop / terminal stamp / credits must never overlap; also verify the deepest **pull-back view** doesn't clip the ghost reprisals (bible §5.9.6), and that nothing enters across the top safe band before the camera clears a dip transit (§5.9.5).
7. Build/publish (project dir): `bun render.mjs chunk <s> <e>` sequentially if needed (cinematic defaults: `filmGrade('documentary-grade')` in scaffolded projects, `quality: 'master'` crf 16, lookahead ≤ 20); probe parts; `bun audio.mjs`; `bun build.mjs` (or `--no-video`). Confirm `FINAL-FILE LAW ok`.
8. Audio QC: LUFS ~ -14.5 area, TP <= -0.9 dBTP, bed ducked **and audible from 0:00 (no leading silence ≥0.3 s at −38 dB; verify with ebur128/silencedetect)**. Credits CSV complete (≥1 external asset row — LAW 9). Update `studio/PROJECTS.md` and `src/lib/films.ts` (film manifest). Commit.

## Internet clip sourcing (LAW 1)
- `studio/ASSETS-AND-CLIPS.md` and `studio/engine/clips.mjs`:
  - `bun studio/engine/clips.mjs search commons "<query>" --limit 5`
  - `bun studio/engine/clips.mjs fetch commons <File|url> --project <slug> --id N [--as name]`
  - `fetch url <direct> --project <slug> --license "..." --source "..."` (Mixkit/Coverr/Videvo/manual). Pexels: `search pexels ...` needs `PEXELS_API_KEY`.
- Writes `assets/clips/*` + `manifest.json`; prints `csvRow` — **review license/attribution and append to `assets/assets-credits.csv` manually**.
- No API/complex download pages: use `.agents/skills/get-image/SKILL.md` (the complete open-media catalog — images, video, archives, museums, music, SFX, fonts, 3D, datasets; source/licensing guide) + `agent-browser` skill to navigate/snapshot and obtain the final licensed URL, then `fetch url`.
- Factual claims need a ledger: `.agents/skills/research-sourcing/SKILL.md` — `SOURCES.md` per project, ≥2 primaries for contested numbers, pre-render fact-check gate; templates/project ships the ledger.
- Tracing a licensed plate into house ink: `.agents/skills/rotoscope/SKILL.md` — `trace.py` → engine `trace.mjs` draw-on polylines (verified).
- Real geography for a beat (routes, coastlines, satellite, choropleth): `.agents/skills/leafmap/SKILL.md` — leafmap (MIT, `pip install leafmap`) → HTML/matplotlib plate → grade-match → `drawPrint` or ffmpeg frame extraction (bible §4) → credits row.
- Raw/ungraded stock never reaches the timeline. Grade-match (black/white/gamma/contrast/split-tone), light-wrap/contact shadow/grain, Ken Burns ≤5%/beat, QC still at entry/mid/exit; attribution-required licenses get an on-screen credit block. See bible §4/§8 for the plate pipeline and §4.6 for plates + camera rail.

## Git hygiene
- Commit source + canonical small assets + published MP4 per project policy; never commit `node_modules`, `studio/projects/**/out`, `**/frames`, scratch `cmp_*.png`/analysis JSON, `.env`, huge local models/caches (see `.gitignore`).
- `bun run lint` at repo root may be unrelated (check `package.json`); report actual lint/typecheck status honestly.

## Env gotchas (Windows/4GB)
- Render chunks sequentially; `-x264-params rc-lookahead=20` + `-preset fast` in engine (a bare `lookahead=` is ignored by libx264 with only a stderr warning — verified 2026-11); detached bg renders may be reaped. Probe parts before concat. Use `$TEMP` not `/tmp` assumptions. Windows `nul` is reserved.
