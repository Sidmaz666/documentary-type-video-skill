---
name: opuscar-video-studio
description: Create, fix, render, QC, and publish code-drawn Opuscar Studio films (Bun + @napi-rs/canvas + ffmpeg). Use when working in studio/projects/* or studio/engine/*, making a new film, re-timing/syncing VO to picture/SFX, fixing framing/overlap/safe-area/underline issues, sourcing licensed web media as props (Wikimedia/Pexels/Mixkit via clips tool + get-image/agent-browser), rendering chunks, verifying FINAL-FILE LAW, or preparing multi-project git commits.
---

# Opuscar Video Studio

Follow repo `AGENTS.md` first (hard laws win).

## Layout
- `studio/engine/` topic-agnostic toolchain (never imports projects).
- `studio/projects/<NNN-slug>/` one film: `PROJECT.md`, `BEATS.md`, `timings.mjs` (single clock `T`), `world.mjs` (art), `sfx-plan.mjs` (SFX/music, reads `T`), `render.mjs`, `audio.mjs`, `build.mjs`, `assets/`.
- `studio/templates/project/` + `bash studio/new.sh <slug> "Title"` scaffold next film.
- `public/film/<slug>.mp4` published artifact; `src/lib/films.ts` site manifest.

## Hard laws checklist
- **LAW 1**: every frame code-drawn; no AI video/stock footage. External photos/clips only as **printed props**/documented assets with `assets/assets-credits.csv` rows.
- **LAW 1b MUSIC**: real recordings only, composition+performance PD/CC0, never MIDI/synth. `assets/music/` + credits; trim/fade/sidechain-duck under VO; **never two beds** (classical asset retires drone). `mixVoWithBus(...,{path,trimTo:T.DUR,gain,fadeIn,fadeOut})`.
- **LAW 2**: duration = VO duration (`T.FRAMES = round(T.DUR*FPS)`).
- **LAW 3 FINAL-FILE LAW** (after every build/publish): probe every `out/part_*.mp4` before concat (ffmpeg `-c copy` fails silently on corrupt/moov-missing parts — delete+re-render); verify published MP4 numerically: `nb_read_frames == T.FRAMES±1`, video duration == audio duration.
  ```bash
  ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,duration -of default=noprint_wrappers=1 public/film/<slug>.mp4
  ffprobe -v error -select_streams a:0 -show_entries stream=duration -of default=noprint_wrappers=1 public/film/<slug>.mp4
  ```
- **LAW 4 safe area**: no text/element clips viewport on any beat/camera pose; sweep `bun render.mjs still <t> --scale 4`.
- **LAW 5 nothing floats**: attached parts root inside silhouette, joint covered.
- **LAW 6 no stroke crosses type**: underline/circle below last line, >=40px clearance, timed after text stamps in; retime stroke, not text.

## Workflow (new/fix film)
1. Brief + beat table: `PROJECT.md`, `BEATS.md`.
2. VO canonical: `assets/vo.m4a` + `assets/timings.json` (or Kokoro + timestamps if none supplied).
3. `timings.mjs`: single clock `T` (scenes, fades, camera Catmull-Rom rail). Picture+SFX import `T`.
4. `world.mjs`: draw zones on 20kpx paper board with engine props/cast/ink/text; zone dim-backs; `globalAlpha` multiplied. Use `drawPrint(loadImage(...))` for sourced props.
5. `sfx-plan.mjs`: events at `T` times; `musicBed()` returns PD/CC0 bed or `null`.
6. QC stills at every beat + transitions: `bun render.mjs stills 0.5,... --scale 4` (LAW 4/5/6). Fix world/layout/camera/underline timing.
7. Build/publish (project dir): `bun render.mjs chunk <s> <e>` sequentially if needed; probe parts; `bun audio.mjs`; `bun build.mjs` (or `--no-video`). Confirm `FINAL-FILE LAW ok`.
8. Audio QC: LUFS ~ -14.5 area, TP <= -0.9 dBTP, bed ducked. Credits CSV complete. Update `studio/PROJECTS.md` and `src/lib/films.ts`. Commit.

## Internet clip sourcing (LAW 1)
- `studio/ASSETS-AND-CLIPS.md` and `studio/engine/clips.mjs`:
  - `bun studio/engine/clips.mjs search commons "<query>" --limit 5`
  - `bun studio/engine/clips.mjs fetch commons <File|url> --project <slug> --id N [--as name]`
  - `fetch url <direct> --project <slug> --license "..." --source "..."` (Mixkit/Coverr/Videvo/manual). Pexels: `search pexels ...` needs `PEXELS_API_KEY`.
- Writes `assets/clips/*` + `manifest.json`; prints `csvRow` — **review license/attribution and append to `assets/assets-credits.csv` manually**.
- No API/complex download pages: use `.agents/skills/get-image/SKILL.md` (source/licensing guide) + `agent-browser` skill to navigate/snapshot and obtain the final licensed URL, then `fetch url`.
- Never raw stock footage in the timeline; use as prop/reference and document.

## Git hygiene
- Commit source + canonical small assets + published MP4 per project policy; never commit `node_modules`, `studio/projects/**/out`, `**/frames`, scratch `cmp_*.png`/analysis JSON, `.env`, huge local models/caches (see `.gitignore`).
- `bun run lint` at repo root may be unrelated (check `package.json`); report actual lint/typecheck status honestly.

## Env gotchas (Windows/4GB)
- Render chunks sequentially; x264 lookahead capped/preset fast in engine; detached bg renders may be reaped. Probe parts before concat. Use `$TEMP` not `/tmp` assumptions. Windows `nul` is reserved.
