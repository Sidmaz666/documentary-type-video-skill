# BEATS — Ink & Ember (creative contract)

One continuous camera move across a 4000px ink-black paper board, 1920×822 design space. Times come from `timings.mjs` (VO 24.62 s, Kokoro am_michael; word anchors from `assets/vo-timings.whisper.json`). Every row is a complete shot card (LAW 8); bible: `.agents/skills/cinematic-motion-graphics/SKILL.md`.

| Time | Intent | Shot / angle | Move (ease) | Grid anchor | Hero | Text (clearance) | SFX / cues | Assets |
|------|--------|--------------|-------------|-------------|------|------------------|------------|--------|
| 0.0–3.9 | the hook: ink is memory | WS, eye level | static hold + 12px creep | hero at left-third power point (750,411) | red seed + ping | `INK.` stamp lands ON "ink" @1.7; `five thousand years of memory` types from @0.55 | ping @0.5 · thud @1.7 | — |
| 3.9–10.0 | how ink is made (China) | MS, eye level | drift L→R, ≤250px/s, arrives BEFORE "In China" | hero left-third (1650,400) | scribe + mortar + ink stick | `PINE SOOT + GLUE` typewriter @6.35 (on "lampblack"); ink stick drops @5.5 | whump @3.95 · thud @5.6 · grind scratch @5.9 · thud @7.5 | — |
| 10.0–19.3 | ink splits the word (Gutenberg) | MS → MCU | drift L→R, ≤200px/s, arrives BEFORE "Around" | hero right-third (2530,398) | press plate + type case | sheet drops @10.15; `1440.` stamp lands ON "fourteen forty" @10.85 · `MOVABLE TYPE` headline of the page @13.0 · `1455.` red stamp lands ON "1455" @14.95 | whoosh @9.6 · thud @10.85 · ping @13.0 · thud @14.95 | — |
| 19.3–24.6 | everything you've read | WS → ECU on the drop | push-in, arrives BEFORE "Everything" | hero center-right (3480,400) | falling ink drop + pool | `EVERYTHING YOU` / `HAVE EVER READ` mask-up from @19.0 (on the word) → drop falls clear right of the words @19.6–22.6 → `IT REMEMBERS.` stamp lands ON "It remembers." @23.96 | ping @18.98 · whoosh @22.3 · whump @22.65 · thud @23.96 | — |
| 24.62 | tail | pull-back | easeInOutCubic | — | whole board recedes | — | soft whoosh @24.1 | — |

## Texture & motion feel
- Boil: 8 fps quantized, ±2.4px / ±0.002rad, hash-deterministic. (House default, engine enforced.)
- Paper: laid rules 118px, α≈0.05, fixed bowed lattice.
- Camera: one Catmull-Rom rail; tail pull-back @24.62 (zoom 0.58) revealing all four zones; handheld damped on pushes.
- Safe area: all text ≥60px from viewport edges at every camera pose (LAW 4) — verified by still sweep at each beat + transitions.
- Underlines/circles: never cross type (LAW 6). `IT REMEMBERS.` carries no underline — terminal beat, clean field.
- No text collisions (LAW 8): every stamp/typewriter/maskUp placed off the hero ink stroke bbox; still-sweep collision check on each.
- Zone dim-backs: zones fade as the camera passes (old heroes never bleed through).
- Sourced media (LAW 1): none in frame. Music: Satie Gymnopédie No.1, Teknopazzo, CC0 — reused from 001's verified bed (source SHA-1 `1465775de774068e2d0d24b9ea852b323b4fb0d1`, working copy `df27c1090cfb9cbf66f9493ba053de26680c1a71`), sidechain-ducked, trimmed to T.DUR.
