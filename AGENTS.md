# AGENTS.md — Opuscar Studio · Operating Manual

**Read this first. These are hard laws, not suggestions.** Every agent (or human) touching this repo works inside them. They exist because each one was learned from a real defect that shipped once and was then banned forever.

---

## 1 · What this repo is

A **topic-agnostic, code-drawn film studio**. One repo can hold many film projects; each project is one folder under `studio/projects/`. Every frame of every film is **drawn frame-by-frame by a canvas program** and encoded to MP4. There is no AI video generation, no stock footage, no screen recordings. Sound is synthesized in code plus real public-domain classical recordings.

```
studio/
├── README.md            ← factory manual: how to make film #002 end-to-end
├── ASSETS-AND-CLIPS.md  ← internet clip/photo sourcing (MediaWiki/Pexels/direct) + LAW 1
├── PROJECTS.md          ← index of every video idea (delivered / in production / ideas)
├── new.sh               ← bash studio/new.sh <slug> "<Title>" → scaffolds the next project
├── engine/              ← TOPIC-AGNOSTIC toolchain (imports nothing from projects, ever)
│   ├── style.mjs        house palette / fonts / math helpers
│   ├── camera.mjs       one-continuous-move camera rig (Catmull-Rom rail)
│   ├── ink.mjs          hand-drawn strokes + the boil (wobble) system
│   ├── text.mjs         stamps / mask-ups / typewriter
│   ├── props.mjs        paper world, photo prints, note cards
│   ├── characters.mjs   the cast: stickman, cow, DNA helix, spread map
│   ├── grade.mjs        vignette / grain / fades
│   ├── compose.mjs      frame compositor + render CLI
│   ├── sfx.mjs          synthesized sound library + mix stage (VO / SFX / music)
│   ├── buildlib.mjs     chunk render → concat → mux → publish
│   └── clips.mjs        internet media sourcing (Wikimedia Commons/Pexels/direct) + manifest/CSV row
├── projects/
│   └── 001-the-bravest-snack-in-history/
│       ├── PROJECT.md   original prompt + decision log + asset manifest
│       ├── BEATS.md     the beat table (creative contract)
│       ├── timings.mjs  THIS film's clock T — the only file to edit when re-timing
│       ├── world.mjs    this film's art (six zones on one 20,000px paper board)
│       ├── sfx-plan.mjs this film's sound score (reads the same clock T)
│       ├── render.mjs / audio.mjs / build.mjs
│       └── assets/      vo.m4a · timings.json · assets-credits.csv · music/ · clips/
└── templates/project/   runnable skeleton copied by new.sh
.agents/skills/opuscar-video-studio/  repo skill for agents (workflow, laws, QC, clip sourcing)
 .agents/skills/get-image/ + agent-browser    assisted browsing/licensing when no API
src/lib/films.ts         site manifest — the showcase page renders every film from here
public/film/             published MP4s served by the Next.js app
```

**Pipeline:** canvas frame → pipe RGBA to ffmpeg → 244-frame chunks (`part_*.mp4`) → concat (`-c copy`) → `video-only.mp4` → mux with `mix.wav` → publish to `public/film/<slug>.mp4`.

---

## 2 · Hard laws

### LAW 1 — No AI video, no stock picture
Every frame must be drawn by the project's canvas program. Never use AI video generators, stock footage, or scraped video. Photos or video clips may enter only as **physical printed props** (prints/cards that drop into the paper world) or other documented non-raw assets, each with a license row in the project's `assets/assets-credits.csv`.

**Internet sourcing (allowed, license-aware):** use `studio/engine/clips.mjs` (Wikimedia Commons API, optional Pexels with `PEXELS_API_KEY`, or explicit direct URLs — Mixkit/Coverr/Videvo/NASA/archives via `.agents/skills/get-image` + `agent-browser` to obtain a final licensed URL). The tool downloads to `assets/clips/`, writes `manifest.json`, and prints a CSV row — **review license/attribution and append to `assets/assets-credits.csv` manually**. Sourced media is still LAW 1: use as prop/reference, never raw stock footage in the timeline.

### LAW 1b — MUSIC LAW (sound)
Background music is **always real classical music**: actual recordings (not MIDI, not synth) whose composition **and** performance are Public Domain or CC0. Rules:
- Store recordings in `studio/projects/<slug>/assets/music/`, provenance (composer, performer, license, source URL, rejected alternatives) in `assets/assets-credits.csv`.
- Trim the bed to the VO length, fade in/out, and **sidechain-duck it under the voiceover** (≈6–8 dB dip while speech is present).
- **Never two beds.** If a project has a classical asset, the synth drone fallback is retired for that film. The drone exists only as a documented fallback when no classical asset is available.
- Reference implementation: `engine/sfx.mjs → mixVoWithBus(..., { path, trimTo, gain, fadeIn, fadeOut })`.

### LAW 2 — Length = VO length
The film's duration equals the voiceover's duration (plus a short tail if the project's clock defines one). Never stretch, loop, or freeze-frame to pad.

### LAW 3 — FINAL-FILE LAW (numeric, after EVERY build)
After every build, verify the **published** file numerically — never trust build logs alone:

```bash
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames,duration -of default=noprint_wrappers=1 \
  public/film/<slug>.mp4
ffprobe -v error -select_streams a:0 \
  -show_entries stream=duration -of default=noprint_wrappers=1 \
  public/film/<slug>.mp4
```

- Video frames must equal the project's FRAMES (±1).
- **Video stream duration must equal audio stream duration.** A mismatch means a truncated concat.
- Corrupt chunks (missing `moov` atom — an encoder killed mid-write) must be **deleted and re-rendered** before concat. `ffmpeg -c copy` concat **fails silently** on a corrupt part file — it does not error. Probe every `part_*.mp4` before concatenating.
- Historical incident: project 001 once shipped with 244 frames of picture under 32.5 s of audio because of exactly this. This law exists because of that.

### LAW 4 — Safe-Area Law (framing)
No text or bottom element may touch or spill past the viewport edges, on ANY keyframe, during ANY camera pose. Titles keep minimum clearance from the top edge; bottom captions/underlines keep minimum clearance from the bottom edge. The audit command is `bun render.mjs still <t>` swept across every beat — if an element beheads or clips at any t, fix the world layout or re-time the camera rail; never accept "it only clips for a moment."

### LAW 5 — Nothing floats
Attached parts (tails, ears, limbs) must root **inside** the silhouette they belong to; the root joint is covered by the body fill. A floating tail was a shipped defect once; it is now a banned defect.

### LAW 6 — No stroke crosses type
Underlines, circles and rules must never strike through text. An underline goes **below the last line** of the block it decorates with ≥40px clearance (layout-guard numbers commented in the world file). It must also land **after** the text it underlines has stamped in — re-time the underline, not the text.

---

## 3 · Conventions

- **Single clock T.** `studio/projects/<slug>/timings.mjs` is the only source of timing truth. Picture (world/zones) and sound (sfx-plan) both import the same clock, so SFX can never drift from picture. Re-timing the film = editing one file, then re-render + re-mix.
- **The boil.** Hand-drawn wobble on strokes/text/cast: jitter quantized to 8 fps steps (pencil-test feel, never shimmer), hashed from world coordinates (byte-deterministic, order-independent), magnitudes ±2.4px / ±0.002rad. Every stroke helper multiplies inherited `globalAlpha` (never assigns absolute alpha) so zone dim-backs survive.
- **Paper has character.** The 20,000px world board is laid paper: fiber grain, blotches, and faint world-aligned rules (118px spacing, α≈0.05, gently bowed on a fixed lattice so lines never crawl as the camera moves).
- **Camera.** One continuous Catmull-Rom spline move for the whole film (C1-continuous — it never stops dead; holds keep drifting toward the next move). Handheld noise is damped during fast pushes. Temporal motion blur: sub-samples at 1/90s spacing (looser spacing ghosts structure during fast travel — banned).
- **Zone dim-backs.** When the camera leaves a zone, the zone dims back instead of lingering at full ink. Old heroes must never bleed into the next beat's frame.
- **Grain is per-run deterministic but order-sensitive.** Same command shape → identical bytes; different command shapes advance the grain RNG differently (documented, not a bug).
- **Voiceover.** If the user provides narration audio, it is canonical (project 001 uses the user's own `vo.m4a` + `timings.json`). For future projects without supplied audio, generate VO locally with Kokoro (kokoro-82m) using a calm professional male voice by default, export word-level timestamps to `vo-timings.json`. For ASR/STT verification/fallback with **word-level timestamps**, use `node studio/tools/asr/transcribe.mjs <audio> --out vo-timings.whisper.json` (JS: @huggingface/transformers + onnx, model Xenova/whisper-tiny.en auto-downloads to `whisper-models/` on first run).
- **Credits.** Every external asset (photo, clip, music recording, font) gets a row in the project's `assets/assets-credits.csv` with license and source URL — no exceptions, including CC0.

---

## 4 · Environment quirks (this 4 GB sandbox — follow or OOM)

- **Render chunks sequentially, never in parallel.** 4 concurrent Skia+ffmpeg instances OOM-kill each other (~75s per 244-frame chunk).
- **Detached background processes may be reaped** when the shell exits. Run chunk renders synchronously inside the tool window, or via `setsid` with explicit progress polling.
- **x264 lookahead capped at 20 + `-preset fast`.** The default deep lookahead queues ~400 MB at 4K and contributed to OOM kills.
- **4K H.264 decode can be SIGKILLed** for frame extraction QC; verify picture via render-side stills (`bun render.mjs still <t>`) and the browser, audio via `astats`/`silencedetect` on small windows.

## 5 · Commands

```bash
bun render.mjs still <t>          # one QC still at time t (project dir)
bun render.mjs stills t1,t2,...   # contact sheet
bun render.mjs chunk <start> <end>  # frames [start,end) → out/part_<start>.mp4
bun audio.mjs                     # rebuild mix.wav (VO + SFX + music bed)
bun build.mjs                     # concat chunks → mux → publish to public/film/
bun build.mjs --no-video          # re-publish with existing video-only.mp4
bun run lint                      # must be clean before any "done"
```

## 6 · Definition of Done (a film is "done" only when ALL hold)

1. `bun run lint` clean; dev.log clean of new errors.
2. **FINAL-FILE LAW** passes on the published MP4 (frames + stream durations).
3. Browser-verified: page loads, film plays, currentTime advances, zero console errors, footer sticks on desktop and mobile, scrub bar fills.
4. Defect sweep: QC stills at every beat, zoom-in crops on characters/underlines (Laws 4/5/6).
5. Numeric audio QC: mix loudness ≈ VO anchor (−14.5 LUFS area), TP ≤ −0.9 dBTP, bed audibly ducked under speech.
6. Credits CSV complete; zip rebuilt per LAW 7; git commit.

## 7 · Incident log (do not repeat)

- **Silent concat truncation** — corrupt `part_0244.mp4` (missing moov) shipped 8.1 s of picture under 32.5 s of audio → LAW 3.
- **Floating cow tail** — tail root outside the rump silhouette → LAW 5.
- **Strike-through underline** — the BRAVEST underline dipped onto "IN HISTORY." → LAW 6 (re-timed `underlineF` to land on the last spoken word).
- **Viewport spill** — "WE EVOLVED FOR IT." beheaded at the top edge at t=23.5–26.6 → LAW 4.
- **Zip bloat** — archive reached 146 MB because `studio/models/*` was not excluded → LAW 7.
- **Sandbox wipe (Nov 2026)** — the sandbox reset erased the working tree and git history. Survivors: the user's `upload/` files, including the delivered film itself. The delivered MP4 of project 001 (`the-bravest-snack-in-history.mp4`, 976 frames / 32.533 s) is the **canonical artifact**; it was restored from the user's upload. Lesson: publish early, commit often — a file that exists only in the sandbox does not exist.
