# BEATS — Ink & Ember (creative contract)

One continuous camera move across a 4200px ink-black paper board, 1920×822 design space. Times come from `timings.mjs` (VO 24.62 s, Kokoro am_michael; word anchors from `assets/vo-timings.whisper.json`). Every row is a complete shot card (LAW 8); bible: `.agents/skills/cinematic-motion-graphics/SKILL.md`. Transit vectors are **LAW 10** (`makeVariedRail(keys, seed 2)`; in-flight mid-keys: `6.5→8.2 deep-dive (+95) · 8.2→9.75 diag-rise (−150) · 15.5→18.6 low-swoop (+225) · 22.7→24.6 high-arc (−215)` — all hands-verified with the LAW 4 sweep).

| Time | Intent | Shot / angle | Move (ease) | Grid anchor | Hero | Text (clearance) | SFX / cues | Assets |
|------|--------|--------------|-------------|-------------|------|------------------|------------|--------|
| 0.0–3.9 | the hook: ink is memory | WS, eye level | static hold + 12px creep (hook clear) | hero at left-third power point (750,411) | red seed + ping | `INK.` stamp lands ON "ink" @1.7; `five thousand years of memory` types from @0.55 | airSwell @0.0 · ping @0.5 · thud @1.7 | — |
| 3.9–10.0 | how ink is made (China) | MS, eye level | **deep-dive (+95)** into B, arrives BEFORE "In China" | hero left-third (1650,400) | scribe + mortar + ink stick | `PINE SOOT + GLUE` typewriter @6.35 (on "lampblack"); ink stick drops @5.5 | whump @3.95 · thud @5.6 · grind scratch @5.9 · thud @7.5 | ink-cake print (Qing dynasty, CLE 1942.245, CC0) @4.2, left-third (1135,300), fades out by ~7.6 (LAW 4/9) |
| 10.0–19.3 | ink splits the word (Gutenberg) | MS → MCU | **diag-rise (−150)** into C, arrives BEFORE "Around"; **low-swoop (+225)** out of C | hero right-third (2530,398) | press plate + type case | sheet drops @10.15; `1440.` stamp lands ON "fourteen forty" @10.85 · `MOVABLE TYPE` headline of the page @13.0 · `1455.` red stamp lands ON "1455" @14.95 | whoosh @9.6 · thud @10.85 · ping @13.0 · thud @14.95 | Gutenberg Bible leaf print (Harry Ransom Center, PD) fades in @12.1, right-third (3220,300) — held through "poured from the press", gone by ~17.0 (LAW 4/9) |
| 19.3–24.6 | everything you've read | WS → ECU on the drop | **high-arc (−215)** pull-back tail | hero center-right (3480,400) | falling ink drop + pool | `EVERYTHING YOU` / `HAVE EVER READ` mask-up from @19.0 (on the word) → drop falls clear right of the words @19.6–22.6 → `IT REMEMBERS.` stamp lands ON "It remembers." @23.96 | ping @18.98 · whoosh @22.3 · whump @22.65 · thud @23.96 | handscroll print (Ming, Met DP-13230-001, CC0) fades in @22.2 above the pool (3920,392), cropped for print — physical evidence of the memory line (LAW 9) |
| 22.4–24.6 | the board remembers (tail) | WS pull-back | high-arc (−215) easeInOutCubic | — | whole board recedes; heroes echo as low-α memory layer; sources micro-credit block lands under the stamp | `EVERYTHING YOU / HAVE EVER READ` (left) · `IT REMEMBERS.` stamp @23.96 · SOURCES micro-card @23.2→ | whoosh @22.3 · whump @22.65 · thud @23.96 | vibe plate + reprise echoes (stickman/press/stamps/ink-cake print at α≈0.17) — board literally remembers; handscroll print @22.2 (LAW 9); credits rows 14–18 |

## Color script
| Window | Zone | Palette | Temperature |
|--------|------|---------|-------------|
| 0.0–3.9 | A · hook | warm paper cream + red seed dot + INK. brush-black | warm neutral |
| 3.9–10.0 | B · china | soot-slate ink + vermilion groove (ink stick) + grey print (CLE cake) — coolest zone | cool soot |
| 10.0–19.3 | C · gutenberg | warm mid-amber print cream (`#f8f2e0`) + ink + `1455.` vermilion stamp | warm mid |
| 18.98–22.76 | D · everything | stark paper + display-black mask-up + falling drop | stark neutral |
| 22.4–24.62 | remember | warm paper settling fade + ink pool echo + ochre/red handscroll print (seal red rhymes with stamps) | warm settle |

## Texture & motion feel
- Boil: 8 fps quantized, ±2.4px / ±0.002rad, hash-deterministic. (House default, engine enforced.)
- Paper: subtle two-axis grid — laid rules (α≈0.05) + vertical chain lines (α≈0.04), 118px, fixed bowed lattice; constant **ink-wash vibe plate** (Webber, 1779, PD) multiply-blended at α≈0.16 across the whole world (drawBackgroundPlate).
- Camera: one Catmull-Rom rail, **varied transits (LAW 10)** — seed 2: deep-dive (+95) into China, diag-rise (−150) into Gutenberg, low-swoop (+225) out of Gutenberg, high-arc (−215) pull-back tail; tail pull-back @24.62 (zoom 0.60) revealing all four zones; handheld damped on pushes; `T.rail.variety` logged in PROJECT.md.
- Safe area: all text ≥60px from viewport edges at every camera pose (LAW 4) — verified by still sweep at each beat + transitions.
- Underlines/circles: never cross type (LAW 6). `IT REMEMBERS.` carries no underline — terminal beat, clean field.
- No text collisions (LAW 8): every stamp/typewriter/maskUp placed off the hero ink stroke bbox; still-sweep collision check on each.
- Zone dim-backs: zones fade as the camera passes (old heroes never bleed through).
- Sourced media (LAW 1 + LAW 9): ink-cake print (CLE, CC0) and Gutenberg Bible leaf (PD) as physical printed props — credits rows 14–15. Music: Satie Gymnopédie No.1, Teknopazzo, CC0 — reused from 001's verified bed (source SHA-1 `1465775de774068e2d0d24b9ea852b323b4fb0d1`, working copy `df27c1090cfb9cbf66f9493ba053de26680c1a71`), sidechain-ducked, trimmed to T.DUR.
