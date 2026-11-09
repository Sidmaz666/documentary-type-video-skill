# PROJECT 001 — The Bravest Snack in History

**Status: DELIVERED.** The canonical artifact is `/home/z/my-project/public/film/the-bravest-snack-in-history.mp4` (976 frames / 32.533 s, 3840×1646 21:9, 30 fps). After the Nov 2026 sandbox wipe (section ③), the delivered MP4 was **restored from the user's upload** and is the film of record. The exact v5 render source was lost; `world.mjs` in this folder is an honest, documented reconstruction of its art, **not** a byte-equivalent copy.

---

## ① The original prompt (recorded verbatim-in-substance)

The user asked for a **Lemo-Opuscar-style, code-drawn documentary short about the history of milk / lactase persistence**:

- Format: **3840×1646 (21:9), 30 fps**, one film ≈ 33 s — duration locked to the voiceover (LAW 2).
- **One continuous camera move** across a single giant paper board (20,000 px wide) — no cuts.
- Every frame **drawn by a canvas program** — no AI video, no stock footage (LAW 1). Photos may enter only as **physical printed props** dropping onto the paper, each with a credits row.
- Narration: **the user's own voiceover recording** (`upload/audio.m4a`) with their `timings.json` scene anchors — canonical, not to be replaced by TTS.
- Hand-drawn feel: ink on laid paper, rubber-stamp titles, typewriter reveals, 8 fps boil.
- Follow-up feedback rounds (summarized): proper DNA helix instead of the first sketch, a real stickman hunter instead of a scribble, a recognizable Europe map, a proper Holstein cow (the first cow read as a generic blob), the cow's tail must attach inside the body, the red underline must never strike through "IN HISTORY.", and the film needed sound (SFX + music).

## ② Decision log v1 → v7

| v | Decision |
|---|----------|
| **v1** | First render: six zones on one paper board, Catmull-Rom camera rail, VO-locked timings. |
| **v2** | Art audit: proper depth-sorted DNA double helix (replaced a flat squiggle), stickman hunter with joints and spear (replaced a scribble), real simplified Europe/N-Africa/Arabia coastlines with Italy boot + Black Sea single stroke (replaced a blob map), Holstein cow redrawn with horns/ears/udder/patches/walk cycle. |
| **v3** | SFX layer added (code-synthesized: stamp thuds, typewriter keys, pencil scratches, paper whumps, 7 panned hoof clops, map ping, camera whooshes); studio docs written; `studio/` reorg (engine separated from projects). |
| **v4** | Studio made **topic-agnostic**: engine/ imports nothing from projects/; templates + `new.sh` scaffolding for film 002. |
| **v5** | Cow **tail re-rooted inside the rump silhouette** (root joint covered by body fill → LAW 5); underline **re-timed** to land on the last spoken word (LAW 6); paper texture enriched (fiber grain + blotches + bowed laid rules); boil system quantized to 8 fps and hash-deterministic. |
| **v6** | **Silent-concat incident**: a corrupt chunk (missing moov) shipped 8.1 s of picture under 32.5 s of audio. → **FINAL-FILE LAW** (LAW 3): probe every part before concat; numeric verification of the published file after every build. |
| **v7** | **MUSIC LAW** (LAW 1b): real classical recordings only (PD/CC0), sidechain-ducked under the VO, never two beds. Erik Satie Gymnopédie No.1 (Teknopazzo, CC0) selected as the bed. A Kokoro TTS voiceover framework was **prepared but rejected by the user — the delivered film keeps the user's own narration.** |

## ③ The wipe incident (Nov 2026)

The sandbox reset erased the working tree **and git history**. Survivors: the user's `upload/` files — including **the delivered film itself** and its voiceover + timings. The delivered MP4 (`the-bravest-snack-in-history.mp4`, 976 frames / 32.533 s) was restored from the user's upload into `public/film/` and is the **canonical artifact** of this film. The v5 render source (this project's exact `world.mjs`/engine code at delivery time) is **lost**; what stands in `studio/` now is a faithful reconstruction for future films (002+), documented as such. It does **not** claim byte-equivalence with the lost source, and the canonical MP4 is never re-rendered or overwritten.

Lesson (now in AGENTS.md §7): publish early, commit often — a file that exists only in the sandbox does not exist.

### Reconstruction verification log (post-rebuild smoke test, Nov 2026)

The rebuilt sources were smoke-tested (engine import, Catmull-Rom/boil determinism units, pixel-level QC stills, audio mix). Four defects were found and fixed in the **reconstruction only** — the canonical MP4 was never touched:

1. `engine/compose.mjs` ran its CLI on every import (`process.argv[1] === Bun.main` is true for any imported module) — hijacked `bun render.mjs`. Fixed with an `import.meta.main` guard.
2. `world.mjs → zoneAlpha` returned **NaN** for the last zone (`smoothstep(Infinity, …)`), and NaN `globalAlpha` silently erased the entire finale (zones F stills were blank). Fixed: the last zone never dims back.
3. `--scale` QC renders framed only 1/scale of the world (camera viewport was in device px). Fixed: `applyCam` gained a `viewScale` and the pipeline passes the design resolution, so a scaled preview frames the same world window.
4. The tail camera key aimed at x 12300, letting "IN HISTORY." spill past the right viewport edge during the pull-back (31.7–32.5). Re-aimed to x 14500 (zoom 0.5 unchanged) — LAW 4 now holds to the last frame (layout guard commented in `timings.mjs`).

## ④ Asset manifest

| id | asset | source | license | status |
|----|-------|--------|---------|--------|
| 01 | aurochs lithograph print | public-domain lithograph | Public Domain | **LOST in wipe** — world.mjs draws the print art in code |
| 02 | calf drinking photo | Unsplash | Unsplash License | **LOST** — code redraw |
| 03 | milk glass photo | Unsplash | Unsplash License | **LOST** — code redraw (finale milk pour) |
| 04 | goat photo | Pexels | Pexels License | **LOST** — code redraw |
| 05 | cow pasture photo | Pexels | Pexels License | **LOST** — code redraw |
| 06 | music bed: Erik Satie — Gymnopédie No.1 (piano) | perf. Teknopazzo, via Wikimedia Commons | CC0 | **LOST** — re-source per MUSIC LAW before any re-mix (`assets/music/README.md`) |
| 07 | voiceover (user's own narration) | `upload/audio.m4a` → `assets/vo.m4a` | user-owned | **SURVIVED** — canonical |
| 08 | fonts: Archivo Black / Caveat / Noto Serif | Google Fonts | OFL | re-downloaded into `studio/assets/fonts/` |
| 09 | scene anchors | `upload/timings.json` → `assets/timings.json` | user-owned | **SURVIVED** — canonical |

Full credits table: `assets/assets-credits.csv`.

## ⑤ Grain determinism note

Film grain is **hash-based per frame index** (`grade.mjs → grain(ctx, W, H, frameIdx)`): the same command shape (same CLI, same args) produces **identical bytes** run-to-run. It is, however, **order-sensitive**: a different command shape (different chunk boundaries, different scale, still vs. chunk) advances the shared hash sampling differently, so bytes differ between *different* command shapes. This is documented, not a bug — never diff two renders made with different command shapes.
