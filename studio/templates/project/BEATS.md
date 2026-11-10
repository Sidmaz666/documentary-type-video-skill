# BEATS — <Title> (creative contract)

One continuous camera move across the board. Times come from `timings.mjs`.
Every row is a complete **shot card** (LAW 8) — a beat without one is not rendered. Craft bible: `.agents/skills/cinematic-motion-graphics/SKILL.md`.

| Time | Intent | Shot / angle | Move (ease) | Grid anchor | Hero | Text (clearance) | SFX / cues | Assets |
|------|--------|--------------|-------------|-------------|------|------------------|------------|--------|
| — | — | — | — | — | — | — | — | — |

## Texture & motion feel

- Boil: 8 fps quantized, ±2.4px / ±0.002rad, hash-deterministic.
- Paper: subtle two-axis grid — laid rules (horizontal, α≈0.05) + chain lines (vertical, α≈0.04), 118px, bowed on a fixed lattice.
- Camera: one Catmull-Rom rail; handheld damped on fast pushes; 1/90s sub-sample blur during fast travel only.
- Safe area: titles/captions/hero art ≥60px inside the viewport at every camera pose (LAW 4) — enforced by `bun studio/tools/safearea.mjs --world world.mjs --timings timings.mjs` (exits 1 on breach).
- Underlines/circles: never cross type; ≥40px clearance below the last line (LAW 6).
- No text collisions: no text overlaps any other text, hero art, or stroke, at any frame (LAW 8).
- Framing: compose on thirds/phi grids; one hero per beat; grid anchors verified at pose (bible §1–§2).
- Sourced media (LAW 1 + LAW 9): **at least one** licensed, real (non-AI) external asset MUST appear in the film — printed props, grade-matched full-frame plates/B-roll (ffmpeg frame extraction → `drawImage`), or documented assets — always with `assets-credits.csv` rows (`studio/engine/clips.mjs`). Never raw/ungraded stock, never AI-generated media. Name the asset in the beat's Assets cell.
