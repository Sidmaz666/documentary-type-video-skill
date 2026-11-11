# 003 — The Oldest Trick in the History Still Works, Right?

A **5:03 investigative documentary** about the November 2026 NVIDIA / Jensen Huang
affair-and-intelligence allegations — produced entirely inside the Opuscar Studio
pipeline (canvas-drawn paper world, no AI-generated media, licensed real source
assets only). One idea: how does a personal relationship at the top of the world's
most important chip company become a national-security and corporate-governance
crisis — and does the honey-trap hypothesis survive the evidence? (It is explored
as a question; never asserted.)

## Render & build

```bash
cd studio/projects/003-the-oldest-trick-in-history

bun render.mjs still <t>          # QC still at time t
bun render.mjs stills t1,t2,…     # contact sheet
bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs   # LAW 4 sweep (must print SAFE AREA OK)

bun render.mjs chunk <start> <end>   # 244-frame chunks → out/part_*.mp4 (SEQUENTIAL — OOM law)
bun audio.mjs                     # VO + SFX + music bed → out/mix.wav
bun build.mjs                     # probe parts (LAW 3) → concat → mux → publish public/film/
bun build.mjs --no-video          # re-mux/publish from existing out/video-only.mp4

bun thumbnail.mjs                 # YouTube thumbnails → out/thumb.png, out/thumb-alt.png
```

Regenerating the 16:9 alternate from scratch (renders 42 chunks, ~50 min):
`bun studio/tools/deliver.mjs --project 003-the-oldest-trick-in-history
--stills hook@12.0,everything@168.0,remember@322.0` (repo root). For an
AUDIO-ONLY change there is no need: re-mux via `bun build.mjs --no-video`
(21:9) and a small inline `muxAndPublish` call against `out/16x9/video-only.mp4`
(16:9).

## Where the truth lives (read before touching anything)

| File | What it is |
|---|---|
| `sources/SOURCES.md` | claim ledger — every VO claim → source + confidence **(pre-render fact gate: no green, no VO)** |
| `SOURCE_REGISTER.md` | every source URL with publication date and evidence notes |
| `CLAIM_LEDGER.md` | Claim / Classification / Evidence / Confidence table (confirmed vs reported vs alleged vs unknown) |
| `TIMELINE.md` | dated chronology (event dates, not publication dates) |
| `narration.txt` + `SCRIPT.md` | canonical narration (7–810 words) + annotated beats with source refs |
| `BEATS.md` | shot cards (LAW 8 creative contract) |
| `timings.mjs` | THE single clock T — the only file to edit when re-timing |
| `world.mjs` / `sfx-plan.mjs` / `render.mjs` / `audio.mjs` / `build.mjs` | picture / sound / pipeline |
| `VIDEO_METADATA.md` | YouTube title (KEEP EXACTLY), chapters, description, tags, pinned comment |
| `ASSET_MANIFEST.md` + `assets/assets-credits.csv` | LAW 1/9 provenance + licence rows |
| `thumbnail.mjs` | canvas-composed YouTube thumbnails (CC BY 2.0 portrait, attribution rides in the description) |

## Fact-discipline contract (hard laws for this project)

- "Unfaithful" and "independent investigation" — **confirmed** (NVIDIA's own publications) and stated plainly.
- "Suspected MSS asset", "the MSS memo", "Trump briefed" — **reported**; always attributed in-voice and on-screen; never asserted.
- China's and Singapore's denials are given at full length inside the film.
- "Secrets compromised" — **unknown**; NVIDIA's board says it has no reason to believe compromise occurred.
- The honey trap is explored as a **historical parallel** (Mata Hari, Stasi Romeos, Christine Fang, Monica Witt) and the question at the end is left open.
- No fabricated evidence of any kind: every on-screen "document" is labelled an illustration; no AI imagery; no invented quotes.

## Audio law notes (MUSIC LAW 1b + DoD)

Bed: Tchaikovsky Pathétique IV, Musopen Symphony (composition+performance PD),
`assets/music/pathetique_iv.flac`, trimmed to `T.DUR`, `trimLead: true`
(audible from 0:00), sidechain-ducked ≈6–8 dB under VO, tail swell at the final
question. Mix: `voGain 3.0`, `masterTrim −0.4 dB` (headroom for the AAC mux);
publish at AAC **320k** — the native AAC filterbank reconstructs transients
≈ +0.9 dB, which pushed a 192k-muxed master to −0.8 dBFS true peak (over the
−0.9 DoD ceiling). Mix lands ≈ −15.4 LUFS, TP ≈ −1.1 dBFS.

## Deliverables (published, canonical)

- `public/film/003-the-oldest-trick-in-history.mp4` — 21:9 master (2560×1098, 30fps, 9,092 frames)
- `public/film/003-the-oldest-trick-in-history.en.srt` — captions (148 cues)
- `public/film/003-the-oldest-trick-in-history-thumb.png` — YouTube thumbnail
- `public/film/stills/003-the-oldest-trick-in-history-{hook,everything,remember}.png` — key stills

Environment notes: render chunks SEQUENTIALLY (4 GB sandbox — parallel renders
OOM-kill), probe every `part_*.mp4` before concat, verify the published file
numerically after EVERY build (frame count + both stream durations — LAW 3).
