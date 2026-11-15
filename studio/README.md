# studio/ — **documentary-type-video-skill** (the Opuscar film factory)

A **topic-agnostic, code-drawn film studio**. One repo holds many films; each film is one folder under `projects/`. Frames are composited frame-by-frame by a canvas program (`@napi-rs/canvas` under Bun) and encoded to MP4 — never AI-generated media; licensed, real (non-AI) stock images/video/clips are allowed as grade-matched plates, B-roll or printed props (LAW 1) — and **at least one such external asset is mandatory in every film (LAW 9)** — and **every beat carries sourced imagery (LAW 11)**: in-situ prints from licensed assets, vibe plate built once at module load (~7200-px feathered tiles, α≈0.16, viewport-culled), never a bare text-only zone; a film with zero source assets is a failure. Sound is synthesized SFX + real public-domain/openly-licensed classical recordings from open public-data sources, mixed against the voiceover (LAW 1b). The operating manual (hard laws) lives in `AGENTS.md` at the repo root — read it first; it wins over anything here.

## Project name

This project is **`documentary-type-video-skill`** — not "extest". All files, commits, and the published master reference this slug. The canonical video artifact for 003 is `public/film/003-the-oldest-trick-in-history/003-the-oldest-trick-in-history.mp4`.

## Showcase film — 003 · The Oldest Trick in History Still Works, Right?

| | |
|---|---|
| **Title** | The Oldest Trick in History Still Works, Right? |
| **Runtime** | ~5:15 · 2560×1098 (21:9) · 30 fps |
| **Master** | [`public/film/003-the-oldest-trick-in-history/003-the-oldest-trick-in-history.mp4`](../public/film/003-the-oldest-trick-in-history/003-the-oldest-trick-in-history.mp4) |
| **Thumbnail** | `public/film/003-the-oldest-trick-in-history/003-the-oldest-trick-in-history-thumb.png` |
| **Scene sheet** | `public/film/003-the-oldest-trick-in-history/stills/overview-v20.png` |
| **Captions** | `assets/subtitles.en.srt` |

A code-drawn illustrated essay on the reported intelligence scandal around Nvidia and Megaspeed — the beauty-trap stratagem (美人計) as the oldest recruitment playbook in history. Every frame composited by canvas; licensed CC0/CC-BY plates as printed props; Pathétique IV as the classical PD bed. The published MP4 is the canonical artifact.

## Repo map

```
studio/
├── README.md            ← you are here (factory manual)
├── ASSETS-AND-CLIPS.md  ← internet/media sourcing (Commons/Pexels/direct) — LAW 1
├── PROJECTS.md          ← index of films (delivered / in production / ideas)
├── new.sh               ← bash studio/new.sh <slug> "<Title>" → scaffold film #002+
├── assets/fonts/        ← house fonts (best-effort downloads; graceful fallbacks)
├── tools/               ← asr (whisper) · tts (kokoro) · ddg (DDG search) · rotoscope · safearea (LAW 4 sweep) · deliver.mjs (16:9 alternate + key stills + SRT copy) · srt.mjs (captions from ASR)
├── engine/              ← TOPIC-AGNOSTIC toolchain (imports nothing from projects/)
│   ├── style.mjs        palette / fonts / math / deterministic RNG
│   ├── camera.mjs       Catmull-Rom rail + handheld noise + TRANSITION VARIETY bank (LAW 10)
│   ├── ink.mjs          the boil (8fps) + hand strokes/circles/arrows
│   ├── text.mjs         stamps / mask-ups / typewriter
│   ├── props.mjs        two-axis-grid paper world, photo prints, note cards
│   ├── characters.mjs   the cast: stickman, Holstein cow, DNA helix, spread map
│   ├── grade.mjs        vignette / grain / fades
│   ├── compose.mjs      frame pipeline (motion blur, grade) + render CLI (--preset/--quality)
│   ├── presets.mjs      cinematic presets: FILM_PRESETS (grades), VIDEO_PRESETS (x264 ladder, lookahead ≤20), CAST_PRESETS, CAMERA_PRESETS, phi/thirds helpers
│   ├── sfx.mjs          synthesized SFX library + VO/SFX/music mix stage
│   ├── buildlib.mjs     chunk render → probe → concat → mux → publish (LAW 3)
│   └── clips.mjs        media search/fetch → assets/clips + manifest + CSV row (LAW 1)
├── projects/
│   └── 003-the-oldest-trick-in-history/    ← shipped film (canonical MP4 in public/film/)
└── templates/project/   ← runnable skeleton copied by new.sh
```


**Pipeline:** canvas frame → raw RGBA piped frame-by-frame into ffmpeg → 244-frame chunks (`part_*.mp4`, sequential — OOM law) → every part ffprobed (LAW 3) → concat `-c copy` (list numerically sorted, chunk dirs wiped on re-render — LAW 3b) → `video-only.mp4` → mux with `mix.wav` (+faststart) → publish to `public/film/<slug>/<slug>.mp4` → FINAL-FILE LAW numeric probe.

## Production targets

**Production films are 5–6-minute** or **10–12-minute** illustrated essays: VO-driven (Kokoro/verified-wav), one zone per ~20–40 s of narration, long paper boards (~10–14k px per minute), many transits — every one of them diagonal or arc'd (**LAW 10**: `makeVariedRail` in `engine/camera.mjs`, never a dead straight ride; record `T.rail.variety`), **interlude holds** — every chapter-break flourish gets a **≥1.3 s hold key** at its center so it reads before the camera moves on (LAW 17 §5.13), **zoom choreography** — holds push in slightly (zoom 0.92→0.96), transits pull back (zoom 0.97→0.85), end card pulls back to 0.8 for a full-board reveal; QC still sweep at every pose, LAW 4 sweep mandatory, and **SRT captions + key stills** delivered alongside the 21:9 master (a 16:9 alternate only when explicitly requested — `studio/tools/deliver.mjs`). Zone counts, durations, and rail length all scale from the VO — nothing is stretched to a target runtime (LAW 2).

## Quickstart: film #002 end-to-end

```bash
# 1. scaffold
bash studio/new.sh my-slug "My Film Title"
cd studio/projects/002-my-slug

# 2. write the brief (PROJECT.md) — what is the ONE idea?
#    claims → SOURCES.md ledger first (research-sourcing skill); no green ledger, no VO

# 3. drop the narration + anchors (LAW 2: duration = VO length)
#    (your own recording, or generate with Kokoro: python ../../studio/tools/tts/kokoro.py --text-file script.txt --out assets/vo.m4a)
#    verify/align: node studio/tools/asr/transcribe.mjs assets/vo.m4a --out assets/vo-timings.whisper.json
#    (or bun studio/tools/asr/transcribe.mjs assets/vo.m4a ...)
cp /path/to/vo.m4a assets/vo.m4a
cp /path/to/timings.json assets/timings.json

# 4. fill the beat table (creative contract): BEATS.md

# 5. edit timings.mjs — the single clock: scenes, fades, camera keys
#    (one continuous Catmull-Rom move; every zone transit diagonal/arc — LAW 10,
#    makeVariedRail(keys, seed); tail pull-back recommended)

# 6. draw the world: world.mjs zones using the engine cast
#    (stickman, cow, helix, spreadMap, drawPrint, noteCard, stamps, typewriter)

# 7. score it: sfx-plan.mjs reads the same clock T — SFX can never drift

# 8. QC stills + LAW 4 safe-area sweep, then build
bun render.mjs stills 0.5,2.0,6.5,12.0,18.0,24.0,28.0,31.5 --scale 4
bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs   # must print SAFE AREA OK (exit 0)
bun build.mjs
```

## The music stage

Background music is **always real classical music from open public-domain / openly-licensed sources** (MUSIC LAW): actual recordings — not MIDI, not synth — composition **and** performance Public Domain or CC0 (or CC-BY with attribution). Sourced from open public data: Wikimedia Commons, Openverse, Musopen, archive.org PD collections, IMSLP (verify each recording's license page), NASA/US federal archives. Drop the file into `assets/music/`, add a credits row, and set `musicBed()` in `sfx-plan.mjs` to return `{ path, trimTo: T.DUR, gain, fadeIn, fadeOut, trimLead: true }`. The mix stage trims (including any leading silence), fades and sidechain-ducks it under the VO (≈6–8 dB) — **the bed must be audible from second 0** (verify no ≥0.3 s run at −38 dB at open). **Never two beds:** when a classical asset exists, the synth drone fallback is retired for that film. Project 003 ships a Pathétique IV bed ducked under the VO — the pattern is the same.

## Sourcing photos/clips from the internet (LAW 1)

**Every film MUST ship with at least one licensed real (non-AI) external asset in-frame (LAW 9)** — verify this before sign-off. See `ASSETS-AND-CLIPS.md`. `bun studio/engine/clips.mjs` searches/fetches via Wikimedia Commons (no key), Pexels (`PEXELS_API_KEY`), or direct licensed URLs into `assets/clips/` with `manifest.json` + a CSV row — **review and append to `assets-credits.csv` manually**. For Mixkit/Coverr/Videvo/manual pages, use `.agents/skills/get-image` + `.agents/skills/agent-browser` to obtain the final licensed URL, then `clips.mjs fetch url`. Sourced media may enter as **printed props**, **grade-matched full-frame plates / B-roll** (ffmpeg frame extraction → `drawImage` in the beat window — see the bible `.agents/skills/cinematic-motion-graphics/SKILL.md` §4/§8), or documented assets. Never raw, ungraded, uncredited stock; never AI-generated media.

## QC checklist (per AGENTS.md)

- [ ] **Still sweep** at every beat **at pose and at text entry/exit frames**: `bun render.mjs still <t>` — nothing beheaded, nothing spilling, no text collisions (LAW 4/6/8).
- [ ] **Shot cards complete** in `BEATS.md` for every beat (intent/shot/move/grid/hero/text/cues/assets).
- [ ] **Zoom crops** on characters/underlines: nothing floats (LAW 5), no stroke crosses type (LAW 6).
- [ ] **LAW 4 safe-area sweep**: `bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs` prints `SAFE AREA OK` (exit 0).
- [ ] **LAW 9 source-asset gate**: ≥1 real licensed external asset in-frame; credits-CSV rows present.
- [ ] **LAW 10 transit variety**: every zone-to-zone transit carries a diagonal/arc vector (`makeVariedRail`; `T.rail.variety` logged in PROJECT.md); no straight horizontal rides end-to-end.
- [ ] `bun build.mjs` prints `FINAL-FILE LAW ok` (frames + both stream durations, LAW 3).
- [ ] Audio QC: mix ≈ −14.5 LUFS area, TP ≤ −0.9 dBTP, bed audibly ducked **and audible from 0:00 (no leading silence ≥0.3 s at −38 dB)**.
- [ ] Deliverables: SRT sidecar (`studio/tools/srt.mjs`), 16:9 paper-extension master + key stills (`studio/tools/deliver.mjs --project <slug>`), films.ts manifest rows + sizes.
- [ ] Credits CSV complete; zip rebuilt per LAW 7; git commit.

## House style rules (the short list)

1. **The boil** — every hand line jitters ±2.4px / ±0.002rad, quantized to 8 fps; hashed from world coordinates (deterministic, order-independent). Never shimmer.
2. **Paper has character** — laid paper with a **subtle two-axis grid**: laid rules (horizontal, α≈0.05) + chain lines (vertical, α≈0.04), 118px, bowed on a fixed lattice (lines never crawl under the camera).
3. **Safe area** — titles/captions/hero art keep ≥60px from viewport edges at every camera pose (LAW 4). Check with `bun studio/tools/safearea.mjs` (exit 1 on breach), never "it only clips for a moment".
4. **Nothing floats** — attached parts root inside the silhouette; the joint is covered by body fill (LAW 5).
5. **No stroke crosses type** — underlines go below the last line, ≥40px clearance, timed to land after the text (LAW 6).
6. **Single clock** — `timings.mjs` is the only timing truth; world and sfx-plan both import it.
7. **Zone dim-backs** — when the camera leaves a zone, the zone dims; old heroes never bleed into the next beat.
8. **Alphas multiply** — every draw helper multiplies inherited `globalAlpha`, so dim-backs compose.
9. **One idea per beat, framed deliberately** — every beat declares a shot card (shot size, move, thirds/phi grid anchor, hero, text clearances); no text collisions (LAW 8 — see `.agents/skills/cinematic-motion-graphics/SKILL.md`).
11. **Background vibe plate** — one constant, grade-matched, low-alpha plate multiply-blended into the paper (`drawBackgroundPlate`, α≈0.10–0.20 — ink-wash or archival wash works best). Never per-beat, never a second hero; always a credits-CSV row (LAW 1/9). Films close with a micro-credit end-card.
10. **Cinematic grade by preset** — `engine/presets.mjs` ships `documentary-grade` (warm key/cool shadow, heavier grain), `archival-essay`, `night-essay` and the house `paper-storybook`; encode with `VIDEO_PRESETS` (`master` crf 16, lookahead ≤ 20 — OOM law). Characters are grounded by contact shadows (draw before the cast).

## Fonts

`assets/fonts/` holds best-effort downloads of the house fonts (Archivo Black — display stamps, Caveat — handwriting, Noto Serif — serif text; all Google Fonts, OFL). `engine/style.mjs` registers whatever valid TTF/OTF files it finds there and **falls back gracefully** to `sans-serif`/`serif` per family when a file is missing or corrupt, so the engine always runs. Download status is recorded below:

- **Archivo Black** — downloaded OK (`ArchivoBlack-Regular.ttf`)
- **Caveat** — downloaded OK (`Caveat-Regular.ttf`)
- **Noto Serif** — downloaded OK (`NotoSerif-Regular.ttf`)
- **Liu Jian Mao Cao** — downloaded OK (`LiuJianMaoCao-Regular.ttf`) — brush stamps (002 hook INK.)

(Update this list if a download ever fails; the fallbacks cover the gap.)
