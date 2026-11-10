# PROJECT NNN — <Title>

**Status: BRIEF** — fill this in before drawing.

## The brief (one paragraph)

What is this film? Who is it for? What is the ONE idea? (Edit this.)

## Format

- 3840×1646 (21:9) · 30 fps · duration = VO length (LAW 2)
- One continuous camera move across the paper board, **every zone-to-zone transit diagonal/arc (LAW 10)** — `makeVariedRail(keys, seed)` in `timings.mjs`; never a straight right through every scene. Long boards (5–6 / 10–12 min productions) repeat this law dozens of times; the engine's anti-repeat bank exists for that.
- No AI-generated media (LAW 1). **At least one real (licensed) external asset MUST appear in the film** (LAW 9 — images/clips/photos; printed props, grade-matched plates/B-roll, or documented assets — always with `assets-credits.csv` rows). A film with zero external source assets is a failure.

## Checklist before building

- [ ] `assets/vo.m4a` — narration in (user's own voice, or Kokoro per AGENTS.md)
- [ ] `assets/timings.json` — scene anchors
- [ ] `SOURCES.md` — every VO claim traced to a primary source (research-sourcing skill)
- [ ] `BEATS.md` — the beat table filled in (creative contract)
- [ ] `assets/assets-credits.csv` — one row per external asset (no exceptions, incl. CC0)
- [ ] **external source asset (REQUIRED ≥1, LAW 9)**: `bun ../../engine/clips.mjs search/fetch ...` → `assets/clips/`, review CSV row. Fetch manifest + CSV rows before building
- [ ] music bed: PD/CC0 classical recording in `assets/music/` (LAW 1b); mix must be **audible from 0:00** — `mixVoWithBus` trims leading silence automatically (`trimLead: true`); verify −38 dB silence run < 0.3 s at open
- [ ] safe-area sweep clean: `bun ../../studio/tools/safearea.mjs --world world.mjs --timings timings.mjs` (LAW 4; exits 1 on breach)
- [ ] (recommended) background vibe plate: one constant, low-α multiply plate (engine `drawBackgroundPlate`), credits-CSV row; sources micro-credit end-card in the tail

## Decision log

| v | Decision |
|---|----------|
| v1 | scaffolded from templates/project |
