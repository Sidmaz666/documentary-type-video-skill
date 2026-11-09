# BEATS — Ink & Ember (creative contract)

One continuous camera move across a 4000px ink-black paper board, 1920×822 design space. Times come from `timings.mjs` (VO 24.62 s, Kokoro am_michael; word anchors from `assets/vo-timings.whisper.json`). Every row is a complete shot card (LAW 8); bible: `.agents/skills/cinematic-motion-graphics/SKILL.md`.

| Time | Intent | Shot / angle | Move (ease) | Grid anchor | Hero | Text (clearance) | SFX / cues | Assets |
|------|--------|--------------|-------------|-------------|------|------------------|------------|--------|
| 0.0–3.9 | the hook: ink is memory | WS, eye level | static hold + drift-in | hero at left-third power point (700,411) | red ping seed | `5,000` / `YEARS` stamps center zone; `INK.` bigger, red | whoosh tiny @0.1 · stamp thud @0.9, @1.6 · ping @0.5 | — |
| 3.9–10.0 | how ink is made (China) | MS, eye level | drift L→R (easeInOutCubic) | hero left-third (1650,400) | scribe + mortar | `PINE SOOT + GLUE` typewriter mid, `+ ground into sticks` hand small below | paperDropWhump @4.2 · grind scratch @6.1 · stamp thud @7.7 | — |
| 10.0–19.3 | ink splits the word (Gutenberg) | MS → MCU | drift L→R, damped | hero right-third (2580,400) | press plate + type case | `1440.` stamp, `MOVABLE TYPE` typewriter, `1455.` red stamp on the Bible word | whoosh @10.2 · pencilScratch @12.4 · thud @10.9, @13.1, @15.0 | — |
| 19.3–24.6 | everything you've read | WS → ECU on the drop | push-in, settle | hero center-right (3480,400) | falling ink drop + pool | `EVERYTHING YOU HAVE EVER READ` mask-up → `IT REMEMBERS.` stamp | whoosh @22.3 (fall) · whump @22.6 (land) · thud @22.9 | — |
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
