# studio/ — the Opuscar film factory

A **topic-agnostic, code-drawn film studio**. One repo holds many films; each film is one folder under `projects/`. Every frame is drawn frame-by-frame by a canvas program (`@napi-rs/canvas` under Bun) and encoded to MP4 — no AI video, no stock footage. Sound is code-synthesized SFX + real PD/CC0 classical recordings, mixed against the voiceover. The operating manual (hard laws) lives in `/home/z/my-project/AGENTS.md` — read it first; it wins over anything here.

## Repo map

```
studio/
├── README.md            ← you are here (factory manual)
├── ASSETS-AND-CLIPS.md  ← internet/media sourcing (Commons/Pexels/direct) — LAW 1
├── PROJECTS.md          ← index of films (delivered / in production / ideas)
├── new.sh               ← bash studio/new.sh <slug> "<Title>" → scaffold film #002+
├── assets/fonts/        ← house fonts (best-effort downloads; graceful fallbacks)
├── engine/              ← TOPIC-AGNOSTIC toolchain (imports nothing from projects/)
│   ├── style.mjs        palette / fonts / math / deterministic RNG
│   ├── camera.mjs       Catmull-Rom camera rail + handheld noise
│   ├── ink.mjs          the boil (8fps) + hand strokes/circles/arrows
│   ├── text.mjs         stamps / mask-ups / typewriter
│   ├── props.mjs        laid-paper world, photo prints, note cards
│   ├── characters.mjs   the cast: stickman, Holstein cow, DNA helix, spread map
│   ├── grade.mjs        vignette / grain / fades
│   ├── compose.mjs      frame pipeline (motion blur, grade) + render CLI
│   ├── sfx.mjs          synthesized SFX library + VO/SFX/music mix stage
│   ├── buildlib.mjs     chunk render → probe → concat → mux → publish (LAW 3)
│   └── clips.mjs        media search/fetch → assets/clips + manifest + CSV row (LAW 1)
├── projects/
│   └── 001-the-bravest-snack-in-history/   ← delivered film (canonical MP4 in public/film/)
└── templates/project/   ← runnable skeleton copied by new.sh
```


**Pipeline:** canvas frame → raw RGBA piped frame-by-frame into ffmpeg → 244-frame chunks (`part_*.mp4`, sequential — OOM law) → every part ffprobed (LAW 3) → concat `-c copy` → `video-only.mp4` → mux with `mix.wav` (+faststart) → publish to `public/film/<slug>.mp4` → FINAL-FILE LAW numeric probe.

## Quickstart: film #002 end-to-end

```bash
# 1. scaffold
bash studio/new.sh my-slug "My Film Title"
cd studio/projects/002-my-slug

# 2. write the brief (PROJECT.md) — what is the ONE idea?

# 3. drop the narration + anchors (LAW 2: duration = VO length)
#    (your own recording, or Kokoro per AGENTS.md — export word timestamps)
cp /path/to/vo.m4a assets/vo.m4a
cp /path/to/timings.json assets/timings.json

# 4. fill the beat table (creative contract): BEATS.md

# 5. edit timings.mjs — the single clock: scenes, fades, camera keys
#    (one continuous Catmull-Rom move; tail pull-back recommended)

# 6. draw the world: world.mjs zones using the engine cast
#    (stickman, cow, helix, spreadMap, drawPrint, noteCard, stamps, typewriter)

# 7. score it: sfx-plan.mjs reads the same clock T — SFX can never drift

# 8. QC stills (LAW 4 sweep), then build
bun render.mjs stills 0.5,2.0,6.5,12.0,18.0,24.0,28.0,31.5 --scale 4
bun build.mjs
```

## The music stage

Background music is **always real classical music** (MUSIC LAW): actual recordings — not MIDI, not synth — composition **and** performance Public Domain or CC0. Drop the file into `assets/music/`, add a credits row, and set `musicBed()` in `sfx-plan.mjs` to return `{ path, trimTo: T.DUR, gain, fadeIn, fadeOut }`. The mix stage trims, fades and sidechain-ducks it under the VO (≈6–8 dB). **Never two beds:** when a classical asset exists, the synth drone fallback is retired for that film. Project 001's Satie bed was lost in the wipe — see `projects/001-.../assets/music/README.md`.

## Sourcing photos/clips from the internet (LAW 1)

See `ASSETS-AND-CLIPS.md`. `bun studio/engine/clips.mjs` searches/fetches via Wikimedia Commons (no key), Pexels (`PEXELS_API_KEY`), or direct licensed URLs into `assets/clips/` with `manifest.json` + a CSV row — **review and append to `assets-credits.csv` manually**. For Mixkit/Coverr/Videvo/manual pages, use `.skills/get-image` + `agent-browser` to obtain the final licensed URL, then `clips.mjs fetch url`. Use sourced media only as **printed props/documented assets**, never raw stock footage.

## QC checklist (per AGENTS.md)

- [ ] **Still sweep** at every beat: `bun render.mjs still <t>` — nothing beheaded, nothing spilling (LAW 4).
- [ ] **Zoom crops** on characters/underlines: nothing floats (LAW 5), no stroke crosses type (LAW 6).
- [ ] `bun build.mjs` prints `FINAL-FILE LAW ok` (frames + both stream durations, LAW 3).
- [ ] Audio QC: mix ≈ −14.5 LUFS area, TP ≤ −0.9 dBTP, bed audibly ducked.
- [ ] Credits CSV complete; zip rebuilt per LAW 7; git commit.

## House style rules (the short list)

1. **The boil** — every hand line jitters ±2.4px / ±0.002rad, quantized to 8 fps; hashed from world coordinates (deterministic, order-independent). Never shimmer.
2. **Paper has character** — laid paper everywhere: fiber grain, blotches, world-aligned rules every 118px bowed on a fixed lattice (lines never crawl under the camera).
3. **Safe area** — titles/captions keep ≥60px from viewport edges at every camera pose (LAW 4). Check with still sweeps, never "it only clips for a moment".
4. **Nothing floats** — attached parts root inside the silhouette; the joint is covered by body fill (LAW 5).
5. **No stroke crosses type** — underlines go below the last line, ≥40px clearance, timed to land after the text (LAW 6).
6. **Single clock** — `timings.mjs` is the only timing truth; world and sfx-plan both import it.
7. **Zone dim-backs** — when the camera leaves a zone, the zone dims; old heroes never bleed into the next beat.
8. **Alphas multiply** — every draw helper multiplies inherited `globalAlpha`, so dim-backs compose.

## Fonts

`assets/fonts/` holds best-effort downloads of the house fonts (Archivo Black — display stamps, Caveat — handwriting, Noto Serif — serif text; all Google Fonts, OFL). `engine/style.mjs` registers whatever valid TTF/OTF files it finds there and **falls back gracefully** to `sans-serif`/`serif` per family when a file is missing or corrupt, so the engine always runs. Download status is recorded below:

- **Archivo Black** — downloaded OK (`ArchivoBlack-Regular.ttf`)
- **Caveat** — downloaded OK (`Caveat-Regular.ttf`)
- **Noto Serif** — downloaded OK (`NotoSerif-Regular.ttf`)

(Update this list if a download ever fails; the fallbacks cover the gap.)
