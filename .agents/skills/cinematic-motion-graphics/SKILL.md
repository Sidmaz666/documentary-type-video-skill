---
name: cinematic-motion-graphics
description: Director-of-photography + motion-graphics bible for Opuscar Studio films — per-beat shot cards, rule-of-thirds/golden-ratio framing, shot-size & camera-move grammar, Disney/VFX animation principles, typography & UI/UX layout law, color script, licensed stock-plate compositing, and classical PD music scoring. Use when designing or filling BEATS.md, framing cameras/zones, compositing stock media, laying out on-screen text, QC-ing framing/overlaps, or reviewing a film before publish.
---

# The Cinematic Motion-Graphics Bible

The craft manual behind AGENTS.md LAW 1, 1b, 4, 5, 6 and 8. `AGENTS.md` hard laws win over anything here; this document tells you **how** to satisfy them frame by frame, beat by beat. Nothing in this file permits AI-generated media — ever.

**How to use:** every beat in `BEATS.md` carries a **shot card** (§0). You may not render a beat whose shot card is incomplete. QC stills are judged against this bible, not against vibes.

---

## 0 · The per-beat shot card (mandatory)

Every row of `BEATS.md` declares all of the following. A beat without a complete card is not ready to draw.

| Field | Question it answers | Bad answer |
|-------|--------------------|------------|
| `intent` | The ONE thing the viewer must feel/learn | "many things" |
| `shot` | Shot size + angle (§1.9–1.10) | "normal" |
| `move` | Camera move + easing (§2) | "move around" |
| `grid` | Composition grid + anchor coordinates (§1.2–1.6) | "centered-ish" |
| `hero` | The single focal subject | two co-heroes |
| `text` | Every text layer, size, clearance (§5) | "some text" |
| `transition` | How we enter/leave the beat (§3.7) | none |
| `cues` | SFX + music phrase aligned to picture (§7) | "music" |
| `assets` | Stock/print assets + credits-CSV row ids (§8) | "a cow pic I found" |
| `qc` | The still-sweep timestamps to verify | empty |

Extended `BEATS.md` table format:

```
| Time | Intent | Shot / angle | Move (ease) | Grid anchor | Hero | Text (clearance) | SFX / cues | Assets |
```

Grid anchors are **viewport coordinates at the beat's camera pose**, not world coordinates — verify with a `bun render.mjs still <t>` at the pose, not at rest.

---

## 1 · Framing & composition (cinematography)

### 1.1 Frame formats & safe areas
- House master: **3840×1646 (21:9)** or 1920×1080 (16:9); 9:16 vertical re-frame centers the subject, never letterbox-pads.
- **Action-safe** ≈ inner 90–93% · **title-safe** ≈ inner 80%. House hard law (LAW 4): titles/captions/hero art keep **≥60px** from every viewport edge at every camera pose, every beat. Enforcement sweep: `bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs` (renders stills every 0.25 s, exits 1 on any ink-like pixel in the outer band). Prints/props must **fade in situ** (`alpha:`), never drop across the band (LAW 4; learned in 002).
- Letterboxing (2.39:1 bars) is a style choice, never a hiding place for violations — check safe areas against the *visible* frame.
- Horizon and eyelines are compositional elements: place them deliberately, never "wherever they landed".
- House paper world carries a **subtle two-axis grid** — laid rules (horizontal, α≈0.05) + chain lines (vertical, α≈0.04), 118px, bowed on a fixed world lattice (`drawPaper` in `engine/props.mjs`). Thin enough to never compete with heroes, structured enough to read as designed — treat it as a feature of the frame, never a distraction (LAW 4 spacing still rules: grids are < α 0.1, ink-legal paper texture, never counted as safe-band violations).

### 1.2 Rule of thirds
- Divide the frame into 3×3; power points at the four intersections (≈ 1/3, 2/3).
- Default anchor: the hero's eyes/face or the single most important prop sits **on an intersection**, not dead center — unless the beat *is* symmetry (§1.5).
- Horizons on upper or lower third line, never the middle (except deliberate mirror beats).
- Text blocks anchor to third lines too; a caption riding the lower third line reads as intentional, not accidental.

### 1.3 Golden ratio & phi grid (φ ≈ 1.618)
- Phi grid lines at **38.2% / 61.8%** — tighter than thirds, calmer eye flow. Use for organic, contemplative, majestic beats (landscapes, archaeology, ritual).
- Golden spiral: seed at a power region, curl the composition inward — large shapes on the outer arc, the hero/payoff at the tight inner curl. Works shot-by-shot for "reveal" beats.
- LeCorbusier's Modulor (φ-derived vertical rhythm) is acceptable for vertical title stacks.
- Rule of thirds vs phi: thirds = journalism/energy; phi = art/quiet. Pick per beat, don't mix randomly within one beat.

### 1.4 Leading lines & convergence
- Roads, rules, fences, timeline bars, the camera rail itself: lines that **converge on the hero** are the cheapest depth cue available.
- Diagonals = dynamism and tension; horizontals = calm; verticals = monumentality; opposing diagonals = conflict.
- A circle/underline/annotation must lead the eye to the hero, never slash across it (LAW 6 applies to *every* stroke).

### 1.5 Symmetry & centered composition
- Reserved for ritual/monument beats (a stamp landing, a monument, a mirror, a door). Break symmetry deliberately everywhere else — centered-everything is a layout bug, not a style.
- If centered, the frame must be *demonstrably* symmetric on the QC still.

### 1.6 Frame within a frame & layered depth
- Doorways, window frames, print borders, note cards, arches: an inner frame focuses attention and hides plate-grading seams.
- Three-layer minimum for hero beats: **foreground** (occludes, fast parallax) / **midground** (the hero) / **background** (plate or paper, slow parallax).
- Occlusion is what sells depth: something must *cut in front* of something. Flat collages read as slides, not cinema.

### 1.7 Negative space & visual weight
- Visual weight ≈ function of size × contrast × saturation × isolation. Counter every heavy element with counter-weight or it tips the frame.
- Negative space is not empty: it is where the eye rests and the power point breathes. Starve-the-hero beats (ECU on small subject in big paper field) are legitimate and strong.
- One visual magnet per beat. Two magnets → two beats. Stage rule, not taste (LAW 8).

### 1.8 Headroom, nose room, lead room
- Headroom: eyes on/above upper third; never behead (LAW 4). Crown-to-frame gap ≥ headroom of the lower frame edge's nose-to-chin gap.
- Nose room / look room: **1.5–2× face width** of clear space in the direction the subject faces. Staring into a wall = tension; staring into open frame = intent.
- Lead room / motion room: moving subject gets more space *ahead* of it than behind. Static-pull-back tails obey this too.
- Never cut body joints (wrists, knees, ankles, neck) at frame edges.

### 1.9 Shot-size grammar
| Code | Name | Content | Emotional register |
|------|------|---------|--------------------|
| EWS/ELS | extreme wide | subject tiny in environment | isolation, scale, "the world doesn't care" |
| WS / LS | wide / long | full figure + environment | context, establishing |
| MLS | medium long | knees up | body language, approach |
| MS | medium | waist up | conversation, neutral |
| MCU | medium close-up | chest up | intimacy begins |
| CU | close-up | face/object fills | empathy, decision |
| ECU | extreme close-up | one feature/detail | obsession, reveal, the stamp of the idea |

House default: **enter a sequence WS → MS → CU** to walk the viewer in; exit CU → WS to walk them out. Mismatched order feels like a jump scare.

### 1.10 Angles
- Eye level = equality/neutral. Low angle = power/menace/monument. High angle = vulnerability/oversight. Bird's eye = fate/map. Worm's eye = awe.
- Dutch tilt 5–15° = unease/wrongness; >15° reads as amateur. Use once per film, maximum, and earn it.
- Overhead / top-down = diagram mode (timelines, maps, process boards) — pairs with the paper world.
- Angle is a claim about power; make it match the narration, not the drawing convenience.

### 1.11 Lighting
- Three-point vocabulary: **key** (dominant direction — one per scene, ever), **fill** (softens, never casts a second shadow direction), **rim/kicker** (separates from paper).
- Direction consistency: one beat, one key direction. If the aurochs print is lit from upper-left, the shadow on its card is down-right. Switching mid-beat breaks the composite (§4).
- Hard light = ink strokes, drama, high contrast. Soft light = paper fiber, intimacy. Match to beat intent.
- Motivated light only: the window, the lamp, the screen, the projector. No orphan light sources.
- House split: **warm key / cool shadow** (amber ~#e8b04b, ink shadows ~#1a1714) — the 001 palette. One warm source, cool ambient.
- Practical contrast ratio: subject : background ≥ 2:1 on hero beats, or the hero drowns.

### 1.12 Depth of field & focus
- Rack focus > cutting to change attention. In-camera equivalent: defocus the leaving zone (zone dim-back with slight blur is already house style).
- Never blur the hero. Foreground blur is legal (occluding bokeh card edge), background blur via zone dim α.
- T-stop honesty for plates: if you fake shallow DoF in a plate, add matching grain — soft+dirty vs soft+clean must be one material.

---

## 2 · Camera movement grammar

| Move | Meaning | House usage |
|------|---------|-------------|
| Static (hold + 2px drift) | contemplation, verdict | stamp aftermath, tail pull-back |
| Push-in | revelation, empathy, "lean in" | the idea landing; CU "MILK." |
| Pull-back | context, scale, "stand back" | hook open, tail close |
| Pan (horizontal) | reveal space, follow gaze | walking cow L→R |
| Tilt (vertical) | reveal height | monument reveal |
| Truck (lateral dolly) | parallax traverse | crossing zones without a rail bend |
| Track/follow | walk with subject | alongside the cow |
| Crane/boom up | ascension, hope, release | "we evolved" release |
| Handheld | urgency, documentary truth | starving-hunter open (damped §4) |
| Dolly/zoom in (vertigo) | vertigo, dread, realization | "What if I drank that too?" — use sparingly |

House camera law (AGENTS.md §3): **one continuous Catmull-Rom rail per film**, C1-continuous — holds keep drifting toward the next move; the film never stops dead. Sub-sample 1/90s motion blur on fast travel only. Parallax order: foreground > midground > background displacement.

Pacing rules:
- Holds last ≥1.2s before the next move begins (feel, not timing).
- Rail velocity: push-ins 150–400px/s world; fast travel ≤3× that; anything faster needs motion-blur sub-sampling or it ghosts structure (banned).
- Moves have semantic direction — push = closer to truth, pull = bigger truth. Never pan "just to show more paper".
- Every move ends on a composed power point (§1.2/1.3), not mid-gesture.

---

## 3 · Animation principles (adapted for code-drawn film)

### 3.1 Disney's twelve, translated
1. **Squash & stretch** — subtle only: paper props compress ≤5% on landing; never jelly the cast.
2. **Anticipation** — small reverse move before the big one (stamp raises 6–10px before thud; underline draws *after* the stamp, LAW 6).
3. **Staging** — one action at a time; the stage holds one idea (§1.7).
4. **Straight-ahead vs pose-to-pose** — stamps/text = pose-to-pose with an 8fps-quantized boil over the hold; journeys = rail math (straight-ahead).
5. **Follow-through & overlapping action** — tails, ears, underline, typewriter carriage: attach secondary parts with lag ≥2 frames behind the driver; overlapping = parts arrive at different times.
6. **Slow in / slow out** — every move eases; no linear entries, no abrupt stops (unless the beat IS a stop).
7. **Arcs** — projectiles, bobbing walks, cow tail swing: arcs read organic; straight lines read mechanical. Mechanical = reserved for diagrams/scan lines.
8. **Secondary action** — dust poofs, ink bleed, paper fibers, pin sparks: reinforces the primary, never competes ≥30% of frame attention.
9. **Timing** — the clock is meaning; rhythm of cuts to narration sentences (see §3.6).
10. **Exaggeration** — the stamp is 1.15× bigger for 3 frames than its resting size; restrained exaggeration is the house accent.
11. **Solid drawing** — silhouettes read at a glance; attach parts inside silhouettes (LAW 5).
12. **Appeal** — clarity + warmth: readable shapes, hand warmth, no visual clutter.

### 3.2 Easing cookbook (cubic-bezier)
| Motion | Curve | Use |
|--------|-------|-----|
| Entrance / arrival | `(0.165, 0.84, 0.44, 1)` easeOutQuart | stamps, cards, heroes walking in |
| Exit / departure | `(0.5, 0, 0.75, 0)` easeInQuart | elements leaving, dim-backs |
| Standard reposition | `(0.4, 0, 0.2, 1)` | camera rail points, re-layouts |
| Overshoot pop (stamps only) | `(0.34, 1.56, 0.64, 1)` | max 3–5% overshoot, settle in 2–3 frames |
| Mechanical / scan | `linear` | timelines, rules draws *only if* uniform |
| Hold drift | `sin(t·ω)·A`, A ≤ 2px | breathing holds |

**Banned:** linear eases on organic motion; >5% overshoot; cyclic shimmer (the boil is 8fps-quantized, hashed, ±2.4px / ±0.002rad).

### 3.3 Entrance/exit timings
- Stamp in: 150–250ms + 2-frame settle. Mask-up reveal: 350–600ms. Typewriter: 15–20 chars/s. Exits ≈ 60–70% of entrance duration.
- Text appears **on or just before** its VO word (±2 frames), never after the sentence ends.
- Holds after idea-landing: ≥0.8s of stillness for the eye to read before the rail moves on.

### 3.4 Overlapping action recipes
- Card drop: rotation settle 3 keyframes (0° → 1.5° → 0°) with contact-shadow snap at frame N, shadow α doubles for 2 frames.
- Stamp: scale 1.0 → 1.18 (anticipate 1 frame) → 0.97 (impact) → 1.05 → 1.0 (4 keyframes over 8–10 frames @30fps).
- Underline draw: begins on the *last word's* first syllable minus 2 frames, draws over 0.5s, ends 40px below the text bottom (LAW 6).
- Dim-back: 0.6–0.9s ramp to α≈0.05–0.15 once the hero is 30% off-frame.

### 3.5 Secondary action budget
Secondary ≤ 30% of focal attention; never during the stamp's 0.5s; never overlapping two heroes' entrances.

### 3.6 Timing & rhythm
- Cut/stage changes land on VO sentence boundaries ±100ms; stresses on content words, breaths in silence.
- Film rhythm: hook (0–5s) fast, middle (5–26s) breathing, payoff (26s–end) slowest — 001's shape.
- 30 fps master; 8fps boil; stamps settle on integer frames; never blend boil into blur.

### 3.7 Transitions
- House default: **no transitions** (continuous rail) — dissolve only as a 10–14 frame α crossfade inside the paper world, never a swipe/star wipe. Fade-to-black reserved for the tail's last 0.5s.

---

## 4 · VFX & compositing

### 4.1 The grade-before-composite rule
Nothing enters the timeline ungraded. Order of operations for stock plates:
1. **Match black/white point** to paper ink (~#1a1714) / paper highlight (~#f4ead8).
2. **Gamma match** — plate mid-gray vs house paper under key light.
3. **Contrast pull** — plate contrast −10…−20%, house owns the highest contrast in frame.
4. **Split-tone** — warm highlights / desaturated teal-ink shadows toward house palette.
5. **Saturation** — clamp plate sat ≤ house accent colors (red stamp is the saturation ceiling; nothing out-saturates the idea).
6. Then composite; then global grain + vignette; then done.

### 4.2 Stock video (licensed, real) in the timeline
Pipeline (see §8): `ffmpeg -i clip.mp4 -vf scale=...:flags=lanczos assets/clips/frames/<id>/f_%05d.png` → map `{beatStart, localFps, frameCount}` in `manifest.json` → `world.mjs` draws the sequence with `drawImage` inside the beat's time window, under the same grade/boil/vignette as everything else → QC stills at entry, mid, exit frames → delete frames on `build.mjs --clean` (they are regenerable intermediates, not source of truth).
- Ken Burns on plates: ≤5% total scale change per beat; direction must rhyme with the rail (push-in rail + plate push-in, never opposite).
- Plate fps ≠ 30 is fine — resample at draw, never duplicate-frame slideshow.
- Stock **audio** is discarded unless separately licensed and mapped to SFX law; the bed is always classical (§7).

### 4.3 Light wrap & edge treatment
- Edges of plates/prints: 1–2px warm rim at 50% α where house key light rakes across — sells the composite more than any grain.
- Contact shadows: 2–6px offset, α 0.3–0.45, blurred — anything resting on the paper must own its shadow direction (LAW 5's compositing twin).
- Never accept a plate whose key light contradicts the house key (§1.11). Re-light in grade or reject the plate.

### 4.4 Grain, vignette, flicker
- Grain: world-aligned, per-run deterministic, **after** all compositing; stock plates with baked grain must be *quieter* than house grain or re-noised evenly.
- Vignette 12–18% corners; never vignettes that darken captions below 4.5:1 contrast (§5).
- Flicker: 8fps-quantized boil on strokes only; plates get steady α; zero 7–9fps shimmer cycles (epilepsy-safe: no full-frame luminance oscillation >3 Hz at any depth).

### 4.5 180° shutter motion blur
- Blur ∝ angular velocity; shutter = 180° @ 30fps → exposure 16.7ms, sub-sample at 1/90s. Ghosts = structure smear (banned); strobing = 1-sample (banned).

### 4.6 Match-moving (plates + rail)
If the camera rail drifts across a static plate, the plate must parallax or it looks pasted. Either (a) draw plates as pinned props (the 001 solution — prints on paper), or (b) pre-pan/crop the plate in grade opposite the rail, or (c) keep rail velocity low over plates (<80px/s) so drift is sub-perceptual.

---

## 5 · Typography, UI & layout law (on-screen text)

### 5.1 One idea per beat
Display text ≤ **2 lines**, ≤ ~60 chars total; body/caption ≤ 3 lines, ≤ 42 chars/line; reading speed ≤ **15 chars/s** (broadcast standard). If the VO sentence is longer, the text says less than the voice, not more.

### 5.2 Hierarchy & type scale
- Modular scale **1.25** (major third): caption : body : sub-head : display ≈ 1 : 1.25 : 1.6 : 2 (display ≥ 3.5% of frame height; scale up for 21:9).
- Font budget per beat: **≤2 families + 1 accent** (house: Archivo Black display / Noto Serif body / Caveat hand). Never three sans-serifs.
- Weights: display = one weight only; no faux-bold; tracking caps +0.04em; body tracking 0; never justify (rivers); always rag-right.
- Baseline grid: 4px or 8px; consecutive text blocks align to it; never eyeball.
- Casing: CAPS for display stamps (short), sentence case for body — not mixed randomly.

### 5.3 Contrast & legibility (WCAG)
- Text vs its **actual backdrop** (measure, don't guess): ≥ **4.5:1** normal text, ≥ **3:1** for display ≥ 24pt/bold-19pt.
- Busy plates: scrim/divan card behind text, α 0.35–0.55, or move the text — never white-on-busy.
- Max line 60ch; no orphan words (widows) — reflow, don't shrink.
- Color contrast for meaning (red = alarm/circle/underline only in house system).

### 5.4 The no-collision law (LAW 6/8)
Text is a bounding-box system, not vibes. Per frame:
1. Every text layer registers `{x, y, w, h}` (+ 8px pad) into the frame's collision list.
2. No text box may intersect: another text box, the hero's face/eyes, another beat's dimmed-back ghost, frame edges (LAW 4), underlines/circles (LAW 6), safe-area thirds lines **as decoration** (crossing is fine — *sitting on* them invites eye confusion; prefer riding them deliberately).
3. Underlines/circles/annotation strokes: **≥40px clearance** below the last line, drawn after the text stamps in (retime the stroke, not the text).
4. Verification is by **still sweep at pose** (`still`, `--scale 4`) with crop/zoom on every text block — never "it only overlaps for a frame".

### 5.5 Scan patterns & alignment
- Latin audiences scan **Z** (stamps, carousels) and **F** (stacked lines). Place the focal stamp at the Z entry; supporting lines staircase down-left.
- Left alignment beats center for ≥4 lines; center is for stamps/epitaphs only.
- Eye flow check on the QC still: cover the text, find the hero; cover the hero, the text should still scan Z/F.

### 5.6 Type animation
- Mask-up reveals for display lines (bottom-edge baseline mask, 350–600ms); typewriter for dialogue/questions (15–20 c/s, with key SFX); stamps for punches; tracking-in (+0.04em → 0) for titles only.
- Never per-letter wave/bounce (reads toy-like); never animate kerning mid-line; never gradient text on insufficient contrast.

### 5.7 Safe area enforcement
Text lives in title-safe (inner ~80%), ≥60px from every edge — verify at **every camera pose in the beat's window**, including mid-rail poses, not just key poses.

---

## 6 · Color & the color script

- House palette: ink `#1a1714` · paper `#f4ead8` · warm accent `#e8b04b` · alarm red `#c33` (only for alarm/circles/underline) · teal shadow `#22333b` (sparingly).
- **60 / 30 / 10**: 60% paper neutrals, 30% mid-tones, 10% accents — accent discipline is what makes stamps hit.
- Every film writes a **color script**: one dot per beat on a strip (hook=warm ochre → hunter=cool slate → revelation=amber → modern=paper + red → payoff=full paper). If two adjacent beats share a hue, the eye flattens; alternate temperature.
- One dominant hue per zone; the red stamp is reserved — when everything is red, nothing is.
- Deuteranopia/protanopia check on any chart/timeline beat; never encode meaning in red/green alone (add value contrast).
- Grading order: plate match (§4.1) → zone base → props → characters → text → global grade (grain/vignette) — never re-color after text is placed.

---

## 7 · Music & sound (MUSIC LAW, restated and sourced)

- **Only real recordings**; composition **and** performance Public Domain or CC0 (or CC-BY with attribution row). Never MIDI, never synth stand-ins once a classical bed exists (the drone is a documented fallback only).
- **Open public-data sources** (verify both licenses before download):
  - **Wikimedia Commons** — search `File:` audio; filter license = PD/CC0/CC-BY; box `{{PD-release}}`/`{{CC0}}` on the file page.
  - **Openverse** (openverse.org) — queries audio, filter `license = pdm, cc0, cc-by`.
  - **Musopen** — PD classical recordings (public-domain dedication per recording; check the recording page).
  - **archive.org** — PD/CC0 collections (e.g., 78rpm transfers); check rights statements.
  - **IMSLP** — primarily scores; recordings on the site carry their own licenses — verify per file.
  - US/ESA/NASA/LoC archives — federal works are PD in the US.
- Never two beds. Never an uncleared cover/arrangement (a 2020 recording of a 1743 piece is **not** PD).
- Credits row: composer, work, performer/ensemble, license, source URL, date accessed — even for CC0.
- Mix: trim to `T.DUR`, fadeIn/Out 0.5–1.5s, **sidechain duck −6…−8 dB** under VO, bed sits ≈−18 LUFS area, mix anchor ≈−14.5 LUFS, TP ≤ −0.9 dBTP.
- Sweetening order: **VO > classical bed > SFX** — a stamp may poke through the duck; the bed never rides above a word.
- SFX events sync to picture ±1 frame (30fps); SFX that miss their frame by >2 read as slapstick error.

---

## 8 · Stock media law (LAW 1, restated)

### 8.1 Allowed vs banned
| Allowed (real, licensed) | Banned |
|---|---|
| Photographs/video (any genre) under PD/CC0/CC-BY/Pexels/Pixabay/Unsplash/Mixkit/Coverr/paid license | **AI-generated** images/video/audio — even if labeled "free" or CC0 |
| Archival/historical footage with PD status | Stock with watermarks/preview comps left in |
| Screen capture of OUR OWN product/app (documented asset, releases if people appear) | Third-party screen captures, ripped YouTube/TikTok |
| Ken Burns crops, crops/grades/reframes (modification noted in CSV) | Misrepresenting stock as original footage (get-image §7) |
| Music PD-classical (§7) | "Royalty-free" tracks with content-id conflicts — content-id-clean ≠ license-clean |

### 8.2 Source ladder (try in order)
1. Wikimedia Commons / Openverse (PD/CC0) — zero attribution friction, best provenance.
2. Pexels / Pixabay / Unsplash (free license, no attribution required, keep the license page snapshot anyway).
3. Mixkit / Coverr / Videvo (free footage — check per-clip license; Mixkit licenses vary by tier).
4. Paid stock (Storyblocks, Artgrid) — license PDF goes in `assets/licenses/`, row in CSV.
5. NASA / USGS / NOAA / LoC — US federal works, PD.

### 8.3 Pipeline (repo tooling)
```bash
bun studio/engine/clips.mjs search commons "<query>" --limit 5
bun studio/engine/clips.mjs fetch commons "File:<name>" --project <slug> --id N
bun studio/engine/clips.mjs fetch url "<direct-licensed-url>" --project <slug> --license "..." --source "..."
bun studio/engine/clips.mjs manifest --project <slug>
```
- The tool prints a `csvRow`; **you review license + attribution, then append to `assets/assets-credits.csv` yourself.** Non-PD/CC0 → attribution decided by you, documented in the row.
- Complex/download-gated pages: `.agents/skills/get-image` (source + licensing guide) → `.agents/skills/agent-browser` (navigate, snapshot license page, capture final URL) → `clips.mjs fetch url`.
- Imagery enters as **prints/cards/props** (`drawPrint`) or **full-frame plates/B-roll** (ffmpeg frame extraction → `drawImage` in the beat window) — both are LAW 1-legal; raw ungraded stock straight to the timeline is never legal (§4.1).
- License requires attribution → end-card credit block (≤3 lines, exists specifically for this) or tail card; attribution is part of the film, not a comment in a CSV nobody reads.

### 8.4 When to draw instead of source
- **Tracing real plates into house ink** (lithographs, artifacts, species): use the `rotoscope` skill (`studio/tools/rotoscope/trace.py` → `engine/trace.mjs`) — a trace is a derivative of the source; license still applies (LAW 1). Prefer PD/CC0 references.
House identity is the paper world. Pre-drawn in code: all type, diagrams, charts, maps, timelines, characters, icons, paper props. Source only what drawing can't do: real faces/places/events, archival textures, scientific plates. A film that is 80% stock is a compilation, not an Opuscar Studio film — if you reach that ratio, redesign the beat, don't source harder.

---

## 9 · The per-beat QC loop (LAW 8)

Before any build, for **every** beat:
1. `bun render.mjs stills <t1,t2,...>` — one still per beat **plus one at pose ±0.5s** and at every text-layer entry/exit frame.
1a. LAW 4 enforcement: `bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs` — must report `SAFE AREA OK` (exit 0); exit 1 = breach, fix and re-run.
2. At each still: grid overlay check (if available) or thirds/phi mental overlay; collision scan (§5.4); behead check (LAW 4); stroke-through-type check (LAW 6); floats check — attached parts rooted (LAW 5).
3. Zoom crops (`--scale 4`) on: every text block; every stamp; every print edge; every joint.
4. Sample the plate under each caption → compute contrast ≥4.5:1.
5. Fail = fix world/layout/rail/timing. Never accept "it only clips for a moment".

Beat is QC-clean when: card complete (§0) → stills pass (§9.1–4) + safearea sweep OK → **≥1 real licensed external asset in-frame somewhere in the film (LAW 9)** → credits CSV rows exist for everything external → SFX/music cues mapped to the same clock `T`.

---

## 10 · Banned-defect kill list

- Text overlapping text, text over a face/eyes, text outside safe area, stroke through type (LAW 6), underline above the last line.
- Live rectangles of stock uncredited / unlicensed / AI-generated.
- Two music beds; bed audibly above VO; unducked music.
- Shimmer/flicker; linear organic motion; overshoot >5%; per-letter bounce type.
- Mid-frame horizontal horizon on a thirds beat; mandatory-symmetry ignored on monument beats.
- Plate pasted with no grade match, no contact shadow, no light-wrap, contradictory key light.
- Watermarks, comp marks, "preview" banding visible.
- Letterbox bars hiding safe-area violations.
- Any "it only clips for a moment". Any "the viewer won't notice".

---

## 11 · BEATS.md template (shot-card extension)

```markdown
# BEATS — <Title>

| Time | Intent | Shot / angle | Move (ease) | Grid anchor | Hero | Text (clearance) | SFX / cues | Assets |
|------|--------|--------------|-------------|-------------|------|------------------|------------|--------|
| 0.0–4.5 | … | WS, eye level | slow push-in (easeOutQuart) | hero right-third power pt (1490, 620) | hunter | — | wind bed; drum hit @1.2 | aurochs print `#01` |
```
Plus the existing Texture & motion feel section (boil, paper, rail, safe-area, LAW references).

---

## 12 · Law → section map

| Law | Where |
|-----|-------|
| LAW 1 (real licensed stock OK, AI banned) | §4, §8 |
| LAW 1b (classical PD/CC0 bed) | §7 |
| LAW 2 (duration = VO) | unchanged — `T.FRAMES` |
| LAW 3 (final-file probe) | `studio/README.md`, skill opuscar-video-studio |
| LAW 4 (safe area) | §1.1, §5.5, §5.7, LAW 4 sweep |
| LAW 5 (nothing floats) | §3.1(11), §4.3 |
| LAW 6 (no stroke crosses type) | §3.4, §5.4 |
| LAW 7 (publish/zip hygiene) | repo ops, not craft — see `AGENTS.md` |
| LAW 8 (frame/beat craft; no text collisions) | §0–§6, §9, §10 |
| LAW 9 (external source assets mandatory) | §8, §9, §4 |
