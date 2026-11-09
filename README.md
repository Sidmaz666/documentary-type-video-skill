# Opuscar Studio (ExTest)

Code-drawn, topic-agnostic film studio (Bun + `@napi-rs/canvas` + ffmpeg). Each frame is drawn by a canvas program; no AI video or stock footage (see `AGENTS.md`).

## Start here
- **`AGENTS.md`** — hard laws and operating manual (wins).
- **`studio/README.md`** — factory manual / film #002 quickstart.
- **`studio/ASSETS-AND-CLIPS.md`** — license-aware internet media sourcing for props.
- **`.agents/skills/opuscar-video-studio/SKILL.md`** — agent workflow/commands/QC.

## Layout
- `studio/engine/` topic-agnostic toolchain (`clips.mjs` for sourced media)
- `studio/projects/<NNN-slug>/` films (001 delivered)
- `studio/templates/project/` + `bash studio/new.sh <slug> "Title"`
- `public/film/` published MP4s, `src/lib/films.ts` site manifest

## Commands (project dir)
```bash
bun render.mjs still <t> | stills t1,t2 [--scale 4]
bun render.mjs chunk <start> <end>
bun audio.mjs
bun build.mjs
```
Render chunks sequentially (OOM), probe parts before concat, verify FINAL-FILE LAW (AGENTS.md).
