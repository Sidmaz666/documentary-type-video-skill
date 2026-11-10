# PROJECTS — index

**Production targets:** test reels like 001/002 exist to prove the pipeline; they are NOT the product. Shipped films are **5–6-minute** or **10–12-minute** illustrated essays (VO-driven, one zone per ~20–40 s of narration, long boards, `makeVariedRail` camera transits throughout, QC still sweep at every pose, SRT captions + a 16:9 paper-extension master published alongside the 21:9 master).

| # | slug | title | status | length | notes |
|---|------|-------|--------|--------|-------|
| 001 | `the-bravest-snack-in-history` | The Bravest Snack in History | **DELIVERED** — canonical MP4 (`public/film/001-the-bravest-snack-in-history.mp4`) restored from the user's upload after the Nov 2026 sandbox wipe; render source reconstructed (not byte-equivalent). Grandfathered from LAW 9's new gate (its prints already satisfy LAW 9); never re-rendered — its MP4 is the user's artifact | 32.533 s | history of milk / lactase persistence; user's own narration + timings.json; 4:5 / 9:16 alternates N/A (source is the user's MP4) |
| 002 | `002-ink-and-ember` | Ink & Ember | **DELIVERED (test film)** — 24.6 s, 1920×822 test-resolution 21:9-class master, Kokoro am_michael VO, Satie CC0 bed (+trimLead, audible from 0:00, tail swell), two-axis grid paper, safe-area tool PASS (99/99), **LAW 9 source assets in-frame** (Qing ink-cake CMA CC0 print + Gutenberg Bible leaf HRC PD print + Webber 1779 PD vibe plate + Ming calligraphy handscroll Met DP-13230-001 CC0 print, credits rows 14–18), Liu Jian Mao Cao brush hook (OFL, row 17), transition-variety camera rail (`makeVariedRail`, seed 2: deep-dive → diag-rise → low-swoop → high-arc, LAW 10), tail reprise + sources end-card, SRT captions + 16:9 paper-extension alternate | 24.633 s | ink history; 30 s-cap test artifact proving research→VO→render→publish + LAW 8/9/10 craft bar |

## Deliverables per film

| Deliverable | 001 | 002 |
|-------------|-----|-----|
| 21:9 master (21:9 class, H.264+AAC) | `public/film/001-the-bravest-snack-in-history.mp4` | `public/film/002-ink-and-ember.mp4` |
| 16:9 paper-extension master | n/a (source is the user's MP4) | `public/film/002-ink-and-ember-16x9.mp4` (rendered via `studio/tools/deliver.mjs`) |
| SRT captions (sidecar) | n/a | `public/film/002-ink-and-ember.en.srt` |
| Key stills | n/a | `public/film/stills/002-ink-and-ember-*.png` (hook / everything / remember) |
| Credits CSV | `studio/projects/001-…/assets/assets-credits.csv` | rows 07–09, 14–18 |

## 001 — known scope (read this first)

001 predates LAW 9/10. Its picture contains LAW 1-real prints (PD lithograph, Unsplash ×2, Pexels ×2) and its bed is the same CC0 Satie — it satisfies the spirit of both laws — but it ships on the user's recorded narration and is the **canonical delivered artifact**: it is never re-rendered, re-timed, or "improved" without an explicit user request. All new work holds the 002 bar.
