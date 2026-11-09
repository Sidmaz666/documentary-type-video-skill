# Assets & Internet Clip Sourcing (LAW 1 compliant)

Opuscar films are **code-drawn** (LAW 1). External media may enter only as
**documented assets/physical printed props** (e.g. photos dropped onto the paper
world via `drawPrint`/`noteCard`) — never as raw stock footage played as video.
Every external asset gets a row in the project's `assets/assets-credits.csv`
(license + source URL + notes), including CC0/Public Domain.

## Preferred: `studio/engine/clips.mjs` (API/URL, automatable)

Run from repo root. Requires Bun + network (no key for Commons).

```bash
# search
bun studio/engine/clips.mjs search commons "wild aurochs lithograph" --limit 5
bun studio/engine/clips.mjs search pexels "holstein cow" --limit 5   # needs PEXELS_API_KEY

# fetch into a project (writes assets/clips/* + manifest.json, prints csvRow)
bun studio/engine/clips.mjs fetch commons "File:Ur-painting.jpg" --project 001-the-bravest-snack-in-history --id 20 --as aurochs.jpg
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
const img = await loadImage(new URL('./assets/clips/aurochs.jpg', import.meta.url));
drawPrint(ctx, img, 2200, 1120, { w: 1320, t0: S.hook + 1.2, t, rot: -0.01 });
```

For historical/photo reference, you may also redraw the subject in code (project
001 did this when source images were lost) — still credit the reference if used.

## Music beds

MUSIC LAW: real recordings only, composition+performance PD/CC0, never MIDI/synth,
never two beds. Source via Wikimedia Commons/Openverse, verify SHA/license, store
in `assets/music/`, trim/fade/duck in `sfx-plan.mjs` → `musicBed()`. See
`projects/001-.../assets/music/README.md` for the provenance template.
