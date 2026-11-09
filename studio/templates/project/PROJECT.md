# PROJECT NNN — <Title>

**Status: BRIEF** — fill this in before drawing.

## The brief (one paragraph)

What is this film? Who is it for? What is the ONE idea? (Edit this.)

## Format

- 3840×1646 (21:9) · 30 fps · duration = VO length (LAW 2)
- One continuous camera move across the paper board (LAW: camera)
- No AI-generated media (LAW 1). Licensed, real (non-AI) stock images/video/clips allowed as printed props, grade-matched plates/B-roll, or documented assets — always with `assets-credits.csv` rows

## Checklist before building

- [ ] `assets/vo.m4a` — narration in (user's own voice, or Kokoro per AGENTS.md)
- [ ] `assets/timings.json` — scene anchors
- [ ] `SOURCES.md` — every VO claim traced to a primary source (research-sourcing skill)
- [ ] `BEATS.md` — the beat table filled in (creative contract)
- [ ] `assets/assets-credits.csv` — one row per external asset (no exceptions, incl. CC0)
- [ ] sourced media (optional): `bun ../../engine/clips.mjs search/fetch ...` → `assets/clips/`, review CSV row (LAW 1)
- [ ] music bed (optional): PD/CC0 classical recording in `assets/music/` (LAW 1b)

## Decision log

| v | Decision |
|---|----------|
| v1 | scaffolded from templates/project |
