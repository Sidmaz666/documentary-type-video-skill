# 002 — Ink & Ember

**Status: DELIVERED (test film)** — `public/film/002-ink-and-ember.mp4`, published 2026-11-09; FINAL-FILE LAW verified twice (739 frames; video 24.633 s == audio 24.618 s).

## The brief (one paragraph)

A 25-second test film for the rebuilt pipeline (new engine quality: presets, letterpress stamps, contact shadows, laworchestrated research ledger, Kokoro VO, LAW 8 shot cards). Subject: ink — the oldest memory technology we have. The ONE idea: **everything you have ever read began as a stubborn black promise.** Narrated in the user's house voice (Kokoro `am_michael`, verified locally 2026-11-09). It doubles as the end-to-end proof of the post-audit toolchain.

## Format
- 1920×822 (21:9 class, even dimensions) · 30 fps · duration = VO length (24.62 s, LAW 2) · test resolution, not the 4K master format
- One continuous camera move across a 4000px board, tail pull-back
- Claim discipline: SOURCES.md ledger green before render (research-sourcing skill)

## Checklist before building
- [x] `assets/vo.m4a` — Kokoro am_michael, 24.62 s (LAW 2)
- [x] `assets/vo-timings.whisper.json` — ASR word timestamps (60 words)
- [x] `SOURCES.md` — 4 claims, all verified 2026-11-09
- [ ] `BEATS.md` — shot cards for every beat (LAW 8)
- [ ] `assets/assets-credits.csv` — classical bed row (Satie, CC0) + any other external assets
- [ ] QC stills at every beat + transitions
- [ ] FINAL-FILE LAW on the published MP4

## Decision log
| v | Decision |
|---|----------|
| v1 | scaffolded from templates/project; claims verified against Britannica Kids (ink, printing press) and MFA CAMEO (carbon-based ink) — ledger SOURCES.md |
| v2 | VO synthesized locally with Kokoro am_michael (user's house voice default); timings from ASR word anchors; Satie Gymnopédie No.1 (Teknopazzo, CC0) reused from 001's verified bed (SHA-1 match) |
| v3 | QC still sweep caught 3 defects: hook stamp beheaded + dot/type collision (zone A rewritten), MOVABLE TYPE colliding with stamps (moved inside the press sheet as its headline), ink drop falling through the mask-up text (drop moved right, text kept left). All fixed; 12-beat still sweep clean. |
| v4 | Mix QC failed the house anchor (−21.0 LUFS vs −14.5 area): Kokoro VO sits ~9.8 dB low by design — added `voGain` option to `mixVoWithBus` (default 1.0), 002 uses 2.6 → Mix −15.4 LUFS, TP −1.6 dBTP. Re-muxed, re-verified. |
