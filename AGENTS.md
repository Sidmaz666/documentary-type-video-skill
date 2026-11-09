# AGENTS.md — Opuscar Studio · Operating Manual

**Read this first. These are hard laws, not suggestions.** Every agent (or human) touching this repo works inside them. They exist because each one was learned from a real defect that shipped once and was then banned forever.

---

## 1 · What this repo is

A **topic-agnostic, code-drawn film studio**. One repo can hold many film projects; each project is one folder under `studio/projects/`. Every frame of every film is composited frame-by-frame by a canvas program and encoded to MP4. **No AI-generated media of any kind** (no AI video, images, voices or music). **Licensed, real (non-AI) stock images/videos/clips are allowed** in the timeline — grade-matched plates, B-roll, or printed props (LAW 1). Sound is synthesized SFX plus real public-domain/openly-licensed classical recordings (LAW 1b).

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
models/              ALL model weights (whisper ASR + kokoro VO) — single dir, gitignored
.agents/skills/cinematic-motion-graphics/  the cinematographer/motion-director bible (LAW 8, per-beat shot cards)
 .agents/skills/get-image/    the full open-media catalog (images/video/audio/fonts/3D/datasets; NASA→Unsplash) + licensing
.agents/skills/leafmap/         open-source geospatial mapping (MIT) — real map plates/flythroughs, attribution-aware
.agents/skills/agent-browser/   assisted browsing/licensing when no API
.agents/skills/rotoscope/       ink-trace real plates (trace.py + trace.mjs) — "video drawn live" beats
.agents/skills/research-sourcing/ real-source claim ledger (SOURCES.md) — pre-render fact-check gate
src/lib/films.ts         film manifest (per-film metadata/credits; no app in-repo)
public/film/             published MP4s (canonical artifacts)
```

**Pipeline:** canvas frame → pipe RGBA to ffmpeg → 244-frame chunks (`part_*.mp4`) → concat (`-c copy`) → `video-only.mp4` → mux with `mix.wav` → publish to `public/film/<slug>.mp4`.

---

## 2 · Hard laws

### LAW 1 — No AI-generated media; licensed real stock IS allowed
**Banned forever:** AI-generated or synthesized video, images, voices and music — even if labeled "free"/CC0. No scraped/ripped third-party video. No uncredited media of any kind.

**Allowed (real, licensed, documented):** stock images, stock video and B-roll clips, archival footage, photos — anything shot/drawn by a human, under a license that permits our use (PD, CC0, CC-BY with attribution, or Pexels/Pixabay/Unsplash/Mixkit/Coverr-style free licenses, or paid stock with the license on file). They may enter the timeline in three ways:
1. **Printed props** (prints/cards dropped into the paper world) — the classic use;
2. **Full-frame plates / B-roll** — extracted to a frame sequence (`ffmpeg … -vf scale=…:flags=lanczos assets/clips/frames/<id>/f_%05d.png`) and composited by the canvas program inside the beat's time window, after grade matching (bible §4);
3. **Documented assets** (charts, maps, our own screen captures) — same credits discipline.

Every external asset — photo, clip, plate, music recording, font — gets a row in the project's `assets/assets-credits.csv` (license, author/performer, source URL, modification note; attribution rows documented, including CC0). No exceptions. License requiring attribution → attribution is composited into the film (end-card credit block), not left in a CSV.

**Internet sourcing (license-aware):** use `studio/engine/clips.mjs` (Wikimedia Commons API, optional Pexels with `PEXELS_API_KEY`, or explicit direct URLs — Mixkit/Coverr/Videvo/NASA/archives via `.agents/skills/get-image` + `agent-browser` to obtain a final licensed URL). The tool downloads to `assets/clips/`, writes `manifest.json`, and prints a CSV row — **review license/attribution and append to `assets/assets-credits.csv` manually**. Raw ungraded stock straight to the timeline is never acceptable: grade-match (black/white/gamma/contrast/split-tone), composite with light-wrap/contact shadow/grain, QC-still at entry/mid/exit. The paper world and its typography remain the house identity — if a film is majority stock, redesign the beats (bible §8.4).

### LAW 1b — MUSIC LAW (sound)
Background music is **always real classical music from open public-domain / openly-licensed sources**: actual recordings (not MIDI, not synth) whose composition **and** performance are Public Domain or CC0 (or CC-BY with a credits row + attribution). Rules:
- **Open public-data sources:** Wikimedia Commons (`{{PD}}`/`{{CC0}}` audio files), Openverse (filter pdm/cc0/cc-by), Musopen, archive.org PD collections, IMSLP-hosted recordings with PD/CC0 dedication, US federal archives (NASA/LoC/USGS). Verify **both** the composition's and the performance's license on the actual file page before download — a 2020 recording of a PD composition is not PD.
- Store recordings in `studio/projects/<slug>/assets/music/`, provenance (composer, work, performer/ensemble, license, source URL, date accessed, rejected alternatives) in `assets/assets-credits.csv`.
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

### LAW 7 — Publish/archive hygiene
The zip/archive handed off must contain only what the project needs. Exclude node_modules, `models/*` + ASR/HF caches (models are large and re-downloadable), `studio/projects/**/out/` chunks, extracted `frames/`, scratch analysis JSON, `.env`. Rebuild the zip **after** any source change that invalidates it; a stale zip in hand-off is a defect. The published MP4 in `public/film/<slug>.mp4` is the canonical artifact — a file that exists only in the sandbox does not exist (see incident log).

### LAW 8 — Frame/beat craft & zero text collisions
Every beat in `BEATS.md` carries a complete **shot card** (intent, shot size, angle, camera move + easing, composition-grid anchor, hero, text layers with clearances, transition, cues, assets). Every frame must honor the cinematographer grammar (rule of thirds / phi grid / leading lines / headroom / nose room / lead room), the motion grammar (Disney staging, slow in/out, arcs, follow-through, easing discipline), and the layout law — **no text may overlap any other text, hero art, stroke, or the viewport edge, at any frame, in any camera pose**. QC is by still sweep at every beat at pose (±0.5 s) and at every text entry/exit frame, with `--scale 4` crops on each text block. The full bible, binding for all projects: `.agents/skills/cinematic-motion-graphics/SKILL.md`. A beat with an incomplete shot card is not rendered (LAW 8).

---

## 3 · Conventions

- **Single clock T.** `studio/projects/<slug>/timings.mjs` is the only source of timing truth. Picture (world/zones) and sound (sfx-plan) both import the same clock, so SFX can never drift from picture. Re-timing the film = editing one file, then re-render + re-mix.
- **The boil.** Hand-drawn wobble on strokes/text/cast: jitter quantized to 8 fps steps (pencil-test feel, never shimmer), hashed from world coordinates (byte-deterministic, order-independent), magnitudes ±2.4px / ±0.002rad. Every stroke helper multiplies inherited `globalAlpha` (never assigns absolute alpha) so zone dim-backs survive.
- **Paper has character.** The 20,000px world board is laid paper: fiber grain, blotches, and faint world-aligned rules (118px spacing, α≈0.05, gently bowed on a fixed lattice so lines never crawl as the camera moves).
- **Camera.** One continuous Catmull-Rom spline move for the whole film (C1-continuous — it never stops dead; holds keep drifting toward the next move). Handheld noise is damped during fast pushes. Temporal motion blur: sub-samples at 1/90s spacing (looser spacing ghosts structure during fast travel — banned).
- **Zone dim-backs.** When the camera leaves a zone, the zone dims back instead of lingering at full ink. Old heroes must never bleed into the next beat's frame.
- **Maps & geospatial plates (optional).** When a beat needs REAL geography (not the ink spreadMap), use the open-source **leafmap** (MIT) via `.agents/skills/leafmap/SKILL.md` — render to a graded plate/print, Natural Earth (PD) for ink-style redraws, NASA GIBS/USGS/NOAA for Earth-science imagery, mandatory attribution end-card when required; credits CSV rows always (LAW 1).
- **Presets.** `studio/engine/presets.mjs` is the single home for cinematic looks: `FILM_PRESETS` (`paper-storybook` house default, `documentary-grade` warm/cool Netflix-doc, `archival-essay`, `night-essay`), `VIDEO_PRESETS` (`master` crf 16 / `web` crf 19 / `qc`; x264 lookahead always ≤ 20 — OOM law), `CAST_PRESETS`, `CAMERA_PRESETS`, `THIRDS`/`PHI_GRID` anchors. All projects should resolve looks through presets, not ad-hoc constants.
- **Cinematic framing (LAW 8).** `BEATS.md` rows are **shot cards** (intent, shot size/angle, camera move + easing, grid anchor, hero, text clearances, cues, assets) — the creative contract, per beat. Compose on thirds/phi grids; one hero; one idea; ≥60px safe area; no text collisions (bible §5.4). The binding craft manual is `.agents/skills/cinematic-motion-graphics/SKILL.md` — load it whenever touching `world.mjs`, camera rail, text layout or BEATS.md.
- **Grain is per-run deterministic but order-sensitive.** Same command shape → identical bytes; different command shapes advance the grain RNG differently (documented, not a bug).
- **Voiceover.** If the user provides narration audio, it is canonical (project 001 uses the user's own `vo.m4a` + `timings.json`). For future projects without supplied audio, generate VO locally with Kokoro (kokoro-82m, calm professional male voice by default — `am_michael`): `python studio/tools/tts/kokoro.py --text "…" --out vo.m4a` (offline ONNX weights in `models/kokoro/`; requires `pip install kokoro-onnx`; verified 2026-11-09; word timings via the ASR tool above). For ASR/STT verification/fallback with **word-level timestamps**, use `node studio/tools/asr/transcribe.mjs <audio> --out vo-timings.whisper.json` (JS: @huggingface/transformers + onnx, model Xenova/whisper-tiny.en auto-downloads to `models/whisper/` on first run).
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
5. LAW 8 sweep: every beat's shot card complete (intent/shot/move/grid/hero/text/cues/assets); no text collisions at pose or at text entry/exit frames; framing matches the grid declared in BEATS.md (bible §9).
5a. Claim ledger green: every factual VO claim traced in SOURCES.md (research-sourcing skill) — no failing rows at render time.
6. Numeric audio QC: mix loudness ≈ VO anchor (−14.5 LUFS area), TP ≤ −0.9 dBTP, bed audibly ducked under speech.
7. Credits CSV complete; zip rebuilt per LAW 7; git commit.

## 7 · Incident log (do not repeat)

- **Silent concat truncation** — corrupt `part_0244.mp4` (missing moov) shipped 8.1 s of picture under 32.5 s of audio → LAW 3.
- **Floating cow tail** — tail root outside the rump silhouette → LAW 5.
- **Strike-through underline** — the BRAVEST underline dipped onto "IN HISTORY." → LAW 6 (re-timed `underlineF` to land on the last spoken word).
- **Viewport spill** — "WE EVOLVED FOR IT." beheaded at the top edge at t=23.5–26.6 → LAW 4.
- **Zip bloat** — archive reached 146 MB because `studio/models/*` was not excluded → LAW 7.
- **Sandbox wipe (Nov 2026)** — the sandbox reset erased the working tree and git history. Survivors: the user's `upload/` files, including the delivered film itself. The delivered MP4 of project 001 (`001-the-bravest-snack-in-history.mp4`, 976 frames / 32.533 s) is the **canonical artifact**; it was restored from the user's upload. Lesson: publish early, commit often — a file that exists only in the sandbox does not exist.
- **Policy change (Nov 2026)** — LAW 1 re-issued: licensed, real (non-AI) stock images/video/clips are now allowed in the timeline (grade-matched plates/B-roll or printed props), not just props. AI-generated media remains banned forever. MUSIC LAW clarified to **open public-domain / openly-licensed classical recordings from public data sources** (Commons/Openverse/Musopen/archive.org/IMSLP/federal archives) with both composition and performance PD/CC0. New **LAW 8** and the binding bible `.agents/skills/cinematic-motion-graphics/SKILL.md` codify per-beat shot cards, thirds/phi framing, animation/VFX/typography law, and zero text collisions.
