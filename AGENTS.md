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
├── tools/               ← asr (whisper ASR) · tts (kokoro) · ddg (search) · rotoscope · safearea (LAW 4 sweep) · deliver.mjs (16:9/SRT/stills) · srt.mjs (captions)
├── engine/              ← TOPIC-AGNOSTIC toolchain (imports nothing from projects, ever)
│   ├── style.mjs        house palette / fonts / math helpers
│   ├── camera.mjs       one-continuous-move camera rig (Catmull-Rom rail) + TRANSITION VARIETY bank (LAW 10)
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
│   └── 003-the-oldest-trick-in-history/
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
**Mandatory:** every film MUST contain at least one real, licensed external asset in-frame — see LAW 9.
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

### LAW 3b — Concat order & stale parts (numeric sort, wipe the out-dir)
`ffmpeg -c copy` concat reads the list file **as written** — it is byte-order, order-blind, and silent about both mistakes. Two laws follow:
- **Numeric sort.** The concat list must sort chunks NUMERICALLY (`part_10004` after `part_0244`, never before), be deduped, and the first part must start at frame 0. A lexicographic list shipped project 003 with the last scene in position 2 — every numeric gate passed because durations matched. `buildlib.mjs → concatParts` now enforces this; never hand-write `list.txt`.
- **Wipe the chunk dir on re-render.** Re-rendering a film whose frame count shrank (re-timed VO ⇒ LAW 2 ⇒ new FRAMES) into an old out-dir sweeps stale `part_*.mp4` from the previous render into the new concat. Incident (Nov 2026): 003's 16:9 master published with **+17 phantom frames** (303.633 s vs expected 303.061 s) after the 10,198-frame render's 42 parts met the 9,092-frame re-render's 38 chunks; caught only by the FINAL-FILE LAW probe. `deliver.mjs` now `rmSync`s the out-dir before rendering; project build dirs follow the same rule — delete `out/part_*.mp4` before re-rendering a re-timed film.

### LAW 4 — Safe-Area Law (framing)
No text or bottom element may touch or spill past the viewport edges, on ANY keyframe, during ANY camera pose. Titles keep minimum clearance from the top edge; bottom captions/underlines keep minimum clearance from the bottom edge. The audit command is `bun studio/tools/safearea.mjs --world studio/projects/<slug>/world.mjs --timings studio/projects/<slug>/timings.mjs` (renders stills every 0.25 s, FAILS on any ink-like pixel in the outer 60-design-px band, exit 1) plus `bun render.mjs still <t>` swept across every beat — if an element beheads or clips at any t, fix the world layout or re-time the camera rail; never accept "it only clips for a moment." Prints/props must **fade in situ** — drop-in entries cross the top band and fail the sweep (learned in 002).

### LAW 5 — Nothing floats
Attached parts (tails, ears, limbs) must root **inside** the silhouette they belong to; the root joint is covered by the body fill. A floating tail was a shipped defect once; it is now a banned defect.

### LAW 6 — No stroke crosses type
Underlines, circles and rules must never strike through text. An underline goes **below the last line** of the block it decorates with ≥40px clearance (layout-guard numbers commented in the world file). It must also land **after** the text it underlines has stamped in — re-time the underline, not the text.

### LAW 7 — Publish/archive hygiene
The zip/archive handed off must contain only what the project needs. Exclude node_modules, `models/*` + ASR/HF caches (models are large and re-downloadable), `studio/projects/**/out/` chunks, extracted `frames/`, scratch analysis JSON, `.env`. Rebuild the zip **after** any source change that invalidates it; a stale zip in hand-off is a defect. The published MP4 in `public/film/<slug>.mp4` is the canonical artifact — a file that exists only in the sandbox does not exist (see incident log).

### LAW 8 — Frame/beat craft & zero text collisions
Every beat in `BEATS.md` carries a complete **shot card** (intent, shot size, angle, camera move + easing, composition-grid anchor, hero, text layers with clearances, transition, cues, assets). Every frame must honor the cinematographer grammar (rule of thirds / phi grid / leading lines / headroom / nose room / lead room), the motion grammar (Disney staging, slow in/out, arcs, follow-through, easing discipline), and the layout law — **no text may overlap any other text, hero art, stroke, or the viewport edge, at any frame, in any camera pose**. QC is by still sweep at every beat at pose (±0.5 s) and at every text entry/exit frame, with `--scale 4` crops on each text block. The full bible, binding for all projects: `.agents/skills/cinematic-motion-graphics/SKILL.md`. A beat with an incomplete shot card is not rendered (LAW 8).

### LAW 9 — External Source Law (source assets are mandatory)
Every film MUST contain **at least one real, licensed external asset in-frame** — a photo/clip/plate/archival still from a human author under a license permitting our use (PD, CC0, CC-BY with attribution, or the usual free-stock licenses), placed as a **printed prop**, a **grade-matched full-frame plate/B-roll**, or a documented asset — with a row in `assets/assets-credits.csv` (license, author, source URL). A film whose timeline contains zero external source material is a **failure**, regardless of polish. License-not-requiring attribution still gets an on-screen micro-credit end-card (house practice; 002 does this). Source via `studio/engine/clips.mjs` + the get-image catalog; verify licenses there; composite so the paper world stays the house identity (never majority-stock; grade-match, contact shadow, film grain, safe-area compliant). Film 003 uses a CC0 CMA handscroll, CC-BY/Wikimedia prints and a CC0 Met plate. New films are not exempt — the DoD gate exists for this.

### LAW 10 — Camera Variety Law (no straight rides)
Every transit between zones MUST carry a **non-horizontal vector**. A film whose camera travels the same axis from scene to scene end-to-end reads as a screensaver, not cinema. Rules:
- Use `makeVariedRail(keys, seed, opts)` from `engine/camera.mjs` (drop-in for `makeRail`): any span with |Δx| ≥ 650 design-px is auto-split at its midpoint and nudged by a deterministic profile from the transition bank (`diag-sink` +150 · `diag-rise` −150 · `high-arc` −215 · `low-swoop` +225 · `stepped-rise` −95 · `deep-dive` +95), with a small zoom bias; short drifts stay pure.
- **Anti-repeat:** consecutive transits NEVER share the sign of their vertical vector (the picker walks the bank forward until the sign flips). No vertical monotone, no repeated profile.
- Hand-authored rails must honor the same law — every long span gets a diagonal/arc component; record the per-transit profile list in the project decision log (`T.rail.variety` when using `makeVariedRail`).
- `makeVariedRail` is deterministic (hash-seeded) — byte-identical for the same seed. Seed by slug number (`002 → 3`, but choose to pass the LAW 4 sweep; the seed picks which windows breathe UP vs DOWN — the shallow board in 002 only tolerates rises where the top band is empty paper).
- **LAW 4 gates the variety**: any mid-transit key that beheads or clips an element fails the sweep; shrink `dyScale` or re-seed — never accept "it only clips for a moment". Seeds are chosen to pass the LAW 4 sweep (003 ships seed 7).
- Shot cards name the transit vector into their beat (bible §2, `BEATS.md` row `move`).

### LAW 11 — Every scene carries sourced imagery; the plate must be SEEN
Empty text-only zones are a defect, not a style. Rules:
- **One licensed real asset per beat minimum**, placed in situ with the LAW 4 fade helpers (`printA` in 003; `fadeExit`/`fadeEntry`). Text stamps alone never fill a scene for >3 s of hold.
- **The vibe plate must be verified VISIBLE in a still before publish** — multiply-blend, α≈0.07–0.08 (003 ships 0.075 — visible but a whisper), **tiled** (whole-board single-stretch at α 0.09 is invisible on this paper). Build the tile ONCE at module load (feathered L/R edges, ~7000-design-px tiles), **viewport-cull** the tiles every frame (drawing all tiles per frame made the LAW 4 sweep take >1 h), and QC with `bun render.mjs still <t>` — if the ink-wash doesn't read at all, raise α.
- In-reference/illustrative assets must be captioned as such on frame (e.g. "ILLUSTRATIVE: SUPERCOMPUTER-CLASS COMPUTE") — never imply Megaspeed runs on depicted hardware. No licensed photo exists → show an honest absence card (003's NOT PICTURED press-file for Alice Huang) — never a fabricated likeness or another person's face.
- Draw marginalia (annotations, arrows, red herrings) to fill negative space during holds; transit bands carry interlude flourishes.

---

## 3 · Conventions

- **Production targets.** **Shipped films are 5–6-minute or 10–12-minute illustrated essays.** (The 001/002 test reels were retired from the tree and the manifest in Nov 2026 — git history holds them.) Consequences: boards are longer (one zone per ~20–40 s VO beat), `BOARD_W` scales (~10,000–14,000 px per minute of film), the rail uses `makeVariedRail` (LAW 10) because transits repeat many times, QC stills sweep is mandatory at every pose, and delivery includes **SRT captions + key stills** alongside the 21:9 master (a 16:9 paper-extension master only when explicitly requested — via `studio/tools/deliver.mjs`; 003's was retired as redundant in Nov 2026). Shorts are for proving pipeline changes; never ship a 30-second film as "done".
- **Single clock T.** `studio/projects/<slug>/timings.mjs` is the only source of timing truth. Picture (world/zones) and sound (sfx-plan) both import the same clock, so SFX can never drift from picture. Re-timing the film = editing one file, then re-render + re-mix.
- **The boil.** Hand-drawn wobble on strokes/text/cast: jitter quantized to 8 fps steps (pencil-test feel, never shimmer), hashed from world coordinates (byte-deterministic, order-independent), magnitudes ±2.4px / ±0.002rad. Every stroke helper multiplies inherited `globalAlpha` (never assigns absolute alpha) so zone dim-backs survive.
- **Paper has character.** The board is laid paper with a **subtle two-axis grid**: laid rules (horizontal, 118px, α≈0.05) + chain lines (vertical, 118px, α≈0.04), fiber grain, blotches — bowed on a fixed world lattice so lines never crawl as the camera moves.
- **Background vibe plate (optional, encouraged).** A grade-matched, low-alpha plate blended *into* the paper (`drawBackgroundPlate` in `engine/props.mjs`; multiply, α≈0.10–0.20; ink-wash paintings, archival scans, manuscript pages). One constant plate for the whole film — cohesion over variety — never a competing hero, never majority-stock. The plate is an external asset: credits-CSV row required (LAW 1/9).
- **Camera.** One continuous Catmull-Rom spline move for the whole film (C1-continuous — it never stops dead; holds keep drifting toward the next move). Handheld noise is damped during fast pushes. Temporal motion blur: sub-samples at 1/90s spacing (looser spacing ghosts structure during fast travel — banned). **Every transit between zones carries a non-horizontal vector (LAW 10) — never another straight ride; use `makeVariedRail` or an equivalent hand-keyed diagonal bank.**
- **Zone dim-backs.** When the camera leaves a zone, the zone dims back instead of lingering at full ink. Old heroes must never bleed into the next beat's frame.
- **Maps & geospatial plates (optional).** When a beat needs REAL geography (not the ink spreadMap), use the open-source **leafmap** (MIT) via `.agents/skills/leafmap/SKILL.md` — render to a graded plate/print, Natural Earth (PD) for ink-style redraws, NASA GIBS/USGS/NOAA for Earth-science imagery, mandatory attribution end-card when required; credits CSV rows always (LAW 1).
- **Presets.** `studio/engine/presets.mjs` is the single home for cinematic looks: `FILM_PRESETS` (`paper-storybook` house default, `documentary-grade` warm/cool Netflix-doc, `archival-essay`, `night-essay`), `VIDEO_PRESETS` (`master` crf 16 / `web` crf 19 / `qc`; x264 lookahead always ≤ 20 — OOM law), `CAST_PRESETS`, `CAMERA_PRESETS`, `THIRDS`/`PHI_GRID` anchors. All projects should resolve looks through presets, not ad-hoc constants.
- **Cinematic framing (LAW 8).** `BEATS.md` rows are **shot cards** (intent, shot size/angle, camera move + easing, grid anchor, hero, text clearances, cues, assets) — the creative contract, per beat. Compose on thirds/phi grids; one hero; one idea; ≥60px safe area; no text collisions (bible §5.4). The binding craft manual is `.agents/skills/cinematic-motion-graphics/SKILL.md` — load it whenever touching `world.mjs`, camera rail, text layout or BEATS.md. Every beat must name its grid anchor and hero in the shot card; heroes sit ON third/phi lines, never dead-center.
- **Grain is per-run deterministic but order-sensitive.** Same command shape → identical bytes; different command shapes advance the grain RNG differently (documented, not a bug).
- **Voiceover.** If the user provides narration audio, it is canonical (project 001 uses the user's own `vo.m4a` + `timings.json`). For future projects without supplied audio, generate VO locally with Kokoro (kokoro-82m, calm professional male voice by default — `am_michael`): `python studio/tools/tts/kokoro.py --text "…" --out vo.m4a` (offline ONNX weights in `models/kokoro/`; requires `pip install kokoro-onnx`; verified 2026-11-09; word timings via the ASR tool above). For ASR/STT verification/fallback with **word-level timestamps**, use `node studio/tools/asr/transcribe.mjs <audio> --out vo-timings.whisper.json` (JS: @huggingface/transformers + onnx, model Xenova/whisper-tiny.en auto-downloads to `models/whisper/` on first run).
- **Credits.** Every external asset (photo, clip, music recording, font) gets a row in the project's `assets/assets-credits.csv` with license and source URL — no exceptions, including CC0.

---

## 4 · Environment quirks (this 4 GB sandbox — follow or OOM)

- **Render chunks sequentially, never in parallel.** 4 concurrent Skia+ffmpeg instances OOM-kill each other (~75s per 244-frame chunk).
- **Detached background processes may be reaped** when the shell exits. Run chunk renders synchronously inside the tool window, or via `setsid` with explicit progress polling.
- **x264 lookahead capped at 20 + `-preset fast`** (`-x264-params rc-lookahead=20`; a bare `lookahead=` is silently ignored by libx264 — only warns, never applies). The default deep lookahead queues ~400 MB at 4K and contributed to OOM kills.
- **4K H.264 decode can be SIGKILLed** for frame extraction QC; verify picture via render-side stills (`bun render.mjs still <t>`) and the browser, audio via `astats`/`silencedetect` on small windows.

## 5 · Commands

```bash
bun render.mjs still <t>          # one QC still at time t (project dir)
bun render.mjs stills t1,t2,...   # contact sheet
bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs   # LAW 4 sweep (exit 1 on breach)
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
4a. **LAW 4 sweep**: `bun studio/tools/safearea.mjs --world … --timings …` reports `SAFE AREA OK` (no ink in the outer 60 design px at any pose).
4b. **LAW 9 source-asset gate**: ≥1 real licensed external asset in-frame, credits-CSV rows present, attribution composited if the license requires it.
5. LAW 8 sweep: every beat's shot card complete (intent/shot/move/grid/hero/text/cues/assets); no text collisions at pose or at text entry/exit frames; framing matches the grid declared in BEATS.md (bible §9). LAW 10: every transit non-horizontal; profile list logged in the decision log.
5a. Claim ledger green: every factual VO claim traced in SOURCES.md (research-sourcing skill) — no failing rows at render time.
6. Numeric audio QC: mix loudness ≈ VO anchor (−14.5 LUFS area), TP ≤ −0.9 dBTP, bed audibly ducked under speech, **and the bed is audible from second 0** — no leading silence ≥0.3 s at −38 dB (`mixVoWithBus(..., { trimLead: true })` skips bed pre-silence automatically; verify with ebur128/silencedetect).
7. Credits CSV complete; zip rebuilt per LAW 7; git commit.

## 7 · Incident log (do not repeat)

- **Silent concat truncation** — corrupt `part_0244.mp4` (missing moov) shipped 8.1 s of picture under 32.5 s of audio → LAW 3.
- **Floating cow tail** — tail root outside the rump silhouette → LAW 5.
- **Strike-through underline** — the BRAVEST underline dipped onto "IN HISTORY." → LAW 6 (re-timed `underlineF` to land on the last spoken word).
- **Viewport spill** — "WE EVOLVED FOR IT." beheaded at the top edge at t=23.5–26.6 → LAW 4.
- **Zip bloat** — archive reached 146 MB because `studio/models/*` was not excluded → LAW 7.
- **Sandbox wipe (Nov 2026)** — the sandbox reset erased the working tree and git history. Survivors: the user's `upload/` files, including the delivered film itself. The delivered MP4 of project 001 (`001-the-bravest-snack-in-history.mp4`, 976 frames / 32.533 s) is the **canonical artifact**; it was restored from the user's upload. Lesson: publish early, commit often — a file that exists only in the sandbox does not exist.
- **Required source assets (Nov 2026)** — user directive: a film with zero external source material is a failure (002 originally shipped picture with no external asset; fixed with a CC0 Cleveland Museum ink-cake print and a PD Gutenberg Bible leaf; LAW 9 added).
- **Print drop-ins breach LAW 4** — `drawPrint` `drop:` entries travel 340px from above the board and necessarily cross the top safe band; the new `studio/tools/safearea.mjs` flagged them. Fix: prints fade in situ (`alpha:`), never dropped across the band.
- **Silent bed opening** — a 0.2s of leading silence in the CC0 Satie bed left the film opening musically dead; `mixVoWithBus` gained `trimLead: true` to skip bed pre-silence. Verify audibility from 0:00, not just LUFS.
- **Policy change (Nov 2026)** — LAW 1 re-issued: licensed, real (non-AI) stock images/video/clips are now allowed in the timeline (grade-matched plates/B-roll or printed props), not just props. AI-generated media remains banned forever. MUSIC LAW clarified to **open public-domain / openly-licensed classical recordings from public data sources** (Commons/Openverse/Musopen/archive.org/IMSLP/federal archives) with both composition and performance PD/CC0. New **LAW 8** and the binding bible `.agents/skills/cinematic-motion-graphics/SKILL.md` codify per-beat shot cards, thirds/phi framing, animation/VFX/typography law, and zero text collisions.
- **Scene scramble (Nov 2026)** - 003 shipped with scenes out of order: `out/list.txt` was byte-sorted, so the final 244-frame chunk (`part_10004`) played second; concat is order-blind and all duration gates passed. Fixed in `buildlib.mjs` (numeric sort + first-part-0 + list rewrite), verified by frame-diff against `render.mjs stills`. -> LAW 3b.
- **Stale 16:9 parts (Nov 2026)** - re-rendering at a new frame count into `out/16x9/` kept old parts from the previous render; concat swept them in -> +17 phantom frames, caught only by the FINAL-FILE LAW probe. `deliver.mjs` now wipes the out-dir first. -> LAW 3b.
- **Invisible vibe plate + per-frame rebuild freeze (Nov 2026)** - one whole-board Song Nian stretch at alpha 0.09 read as blank paper; the "fix" (tiled feathered plate) rebuilt a 7200x4800 canvas every frame, freezing the LAW 4 sweep past an hour. Fixed by module-load tile construction + viewport culling + alpha ~0.16. -> LAW 11.
- **SRT tool overwrote narration.txt (Nov 2026)** - `srt.mjs <vo-timings.whisper.json> <out.srt>` takes the OUTPUT path as its 2nd arg; following a stale usage guess clobbered `narration.txt`. Recovered from the generated SRT (it was the correct new captions). Arg order is now documented as `bun studio/tools/srt.mjs assets/vo-timings.whisper.json assets/subtitles.en.srt`.
- **Horizontal screensaver camera (Nov 2026)** — 001 and 002 originally rode the board with the same left→right vector through every scene; user directive: transitions must vary (diagonal up/down, arcs). **LAW 10** added: `makeVariedRail()` (deterministic, anti-repeat, sign-alternating) or equivalent hand-keyed diagonals are mandatory; LAW 4 gates the variety.
- **End-card overlap + dead-air void (Nov 2026)** — 002's `IT REMEMBERS.` stamp sat on the ink pool (v10 pass); a ~2.5 s window of blank paper separated zone C's dissolve from the drop. Fix: end cards are laid as banded strata (≥40px gaps, never restack without re-checking bands), zones hand off through **carry-over prints** that fully dissolve into the next hero, and no ≥1.5 s zero-motion/blank window survives the audit — the cinematic bible carries the **end-card stack contract** + **dead-air rule**; templates ship the end-card skeleton.
