# Assets & Internet Clip Sourcing (LAW 1 compliant)

> **LAW 9 — External Source Law:** every film MUST contain **at least one** real, licensed external asset in-frame (photo/clip/archival). A film with zero external source material is a **failure**. Source below, credit everything, grade-match, composite — see repo `AGENTS.md` §LAW 9 and Definition of Done gate 4b.

Opuscar films ban **AI-generated media** outright (LAW 1). Licensed, real
(non-AI) stock images and video **are** allowed in the timeline — as physical
printed props/cards (`drawPrint`/`noteCard`), as **grade-matched full-frame
plates / B-roll** (ffmpeg frame extraction → `drawImage` inside the beat's time
window — bible `.agents/skills/cinematic-motion-graphics/SKILL.md` §4), or as
documented assets. Raw, ungraded, uncredited stock straight to the timeline
is never allowed. Every external asset gets a row in the project's
`assets/assets-credits.csv` (license + source URL + modification notes),
including CC0/Public Domain.

## Preferred: `studio/engine/clips.mjs` (API/URL, automatable)

Run from repo root. Requires Bun + network (no key for Commons).

```bash
# search
bun studio/engine/clips.mjs search commons "wild aurochs lithograph" --limit 5
bun studio/engine/clips.mjs search pexels "holstein cow" --limit 5   # needs PEXELS_API_KEY

# fetch into a project (writes assets/clips/* + manifest.json, prints csvRow)
bun studio/engine/clips.mjs fetch commons "File:Ur-painting.jpg" --project 003-the-oldest-trick-in-history --id 20 --as aurochs.jpg
bun studio/engine/clips.mjs fetch url "https://..." --project <slug> --license "Public Domain" --source "https://..." --id 21

# inspect manifest
bun studio/engine/clips.mjs manifest --project <slug>
```

**Always review the printed `csvRow`** (license, attribution, author) and append
it to `assets/assets-credits.csv` before publishing. The tool warns on non-PD/CC0
licenses but does not block — you must verify.

## Agent-assisted browsing (when no API / complex pages)

Use the repo skills in `.agents/skills/` (get-image, agent-browser):

- **`.agents/skills/get-image/SKILL.md`** — curated free/public sources (Unsplash,
  Pexels, Pixabay, Wikimedia Commons, Mixkit, Coverr, Openverse, archives,
  NASA/USGS, museums) and licensing checklist. Start here to pick a source.
- **`agent-browser`** (` .agents/skills/agent-browser/SKILL.md`) — headless browser
  automation for navigating pages, handling downloads/interactions on sites like
  Mixkit/Videvo that don't have simple free APIs. Snapshot → find download link →
  capture the final URL → pass it to `clips.mjs fetch url --license ... --source ...`.

## Using a sourced image as a print prop

```js
import { drawPrint, loadImage } from '../../engine/props.mjs';
import { clamp } from '../../engine/style.mjs';
const img = await loadImage(new URL('./assets/clips/aurochs.jpg', import.meta.url));
// LAW 4: prints must fade in SITU — a drop-in crosses the top safe band and fails safearea.mjs
drawPrint(ctx, img, 2200, 1120, { w: 1320, rot: -0.01, alpha: clamp((t - S.hook - 1.2) / 0.6, 0, 1) });
```

Never let a print travel through the 60px safe band (no `drop:` entries for prints that start above the board edge); the `bun studio/tools/safearea.mjs` sweep fails on any ink-like pixel in the band.

## Using a sourced clip/photo as a full-frame plate or B-roll

```bash
# extract to a frame sequence the canvas program can drawImage() inside the beat window
ffmpeg -i assets/clips/<clip>.mp4 -vf scale=3840:-1:flags=lanczos assets/clips/frames/<id>/f_%05d.png
```

Then in `world.mjs` draw the sequence (mapped from the beat's `t0`/`t1` + local
fps) with `drawImage`, after grade matching to the house palette
(black/white/gamma/contrast/split-tone — bible §4.1), with light-wrap/contact
shadow/grain. Ken Burns ≤5% scale per beat, direction rhyming with the camera
rail. QC stills at entry/mid/exit frames (LAW 8). Name the folder in
`assets/clips/manifest.json` so `build.mjs --clean` can drop the regenerable
frames. License requires attribution → end-card credit block in the film.

For historical/photo reference, you may also redraw the subject in code (project
001 did this when source images were lost) — still credit the reference if used.

## Music beds

MUSIC LAW: real classical recordings from open public-domain / openly-licensed
sources only (Commons, Openverse, Musopen, archive.org, IMSLP — verify both
composition and performance are PD/CC0; or CC-BY with credits row + attribution),
never MIDI/synth, never two beds. Store in `assets/music/`, trim/fade/duck in
`sfx-plan.mjs` → `musicBed()`. See `projects/003-the-oldest-trick-in-history/sfx-plan.mjs` for
the provenance template.
