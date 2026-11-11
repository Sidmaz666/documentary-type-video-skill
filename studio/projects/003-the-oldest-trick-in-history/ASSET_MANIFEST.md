# ASSET_MANIFEST — provenance & licence (LAW 1)

Downloaded 2026-11-10 into `assets/clips/` and `assets/music/`. Credits CSV rows:
`assets/assets-credits.csv`. All images enter the timeline as **printed props**
(grade-matched); the Song Nian handscroll is the constant **multiply vibe plate**
(α≈0.09). Nothing is used raw/ungraded; nothing is AI-generated; no news-agency
(AP/Reuters/Getty) imagery is used. The SATIRE section of YouTube policy is not a
factor: zero fabricated evidence — every document motif drawn in-canvas is labelled
as illustration.

| Asset | Source | Licence | Author | Attribution | Use |
|---|---|---|---|---|---|
| jh_2023.jpg | Wikimedia Commons (File:Jensen_Huang_20231109.jpg) | CC BY 2.0 | Office of the President, ROC (Taiwan) / 總統府 | Required — end-card + CSV row 01 | ACT 2 print |
| mata_hari.jpg | Wikimedia Commons (File:Mata_Hari,_by_Jacob_Merkelbach.jpg) | Public Domain | Jacob Merkelbach | Not required (credited anyway) | ACT 4 print |
| markus_wolf.jpg | Wikimedia Commons (File:Bundesarchiv_Bild_183-1989-1208-420,_Markus_Wolf.jpg) | CC BY-SA 3.0 de | Elke Schöps / Bundesarchiv | Required — end-card + CSV row 04 | ACT 4 print |
| monica_witt.png | Wikimedia Commons (File:Monica_Elfriede_Witt.png) | Public Domain | FBI (US federal work) | Not required | ACT 4 print |
| songnian_landscape.jpg | Wikimedia Commons (File:清_松年_山水_手卷-Landscape_MET_DP204810.jpg) | CC0 1.0 | Song Nian / The Met Open Access | Not required | Vibe plate (whole film) |
| pathetique_iv.flac | Wikimedia Commons (File:Tchaikovsky_-_Symphony_No._6…IV._Finale_–_Adagio_lamentoso_(Musopen_Symphony).flac) | Public Domain | Tchaikovsky (comp.) / Musopen Symphony (perf.) | Not required | Music bed |

## YouTube packaging (outside the timeline)
`thumbnail.mjs` (run: `bun thumbnail.mjs`) composes the 1280×720 thumbnails from
the SAME CC BY 2.0 portrait (re-graded in-canvas; CSV row 10): primary
`HONEY TRAP?` (`out/thumb.png` → `public/film/003-…-thumb.png`) and variant
Both ask a question — neither asserts a conclusion. CC BY 2.0 attribution for
thumbnail use rides in the YouTube description credit block (VIDEO_METADATA.md).

## Vibe plate & grade
`drawBackgroundPlate` multiply at α≈0.075 (v14, after v13's 0.16 read too heavy) — RETILED v13: ~7200px tiles with
feathered L/R edges, built ONCE at module load (viewport-culled). An earlier
whole-board stretch at α=0.09 was invisible. Warm split-tone grade (`documentary-grade`
preset), vignette 0.34, grain 0.62. Prints fade in situ only — never
drop-ins across the safe band (LAW 4).

## Credits end-card (composited)
Jacob Merkelbach (PD) · Bundesarchiv Bild 183-1989-1208-420 — Elke Schöps (CC BY-SA
3.0 de) · Office of the President (Taiwan) (CC BY 2.0) · CMA 1976.1 (CC0) · Will
Buckner (CC BY 2.0) · Benh LIEU SONG (CC BY-SA 4.0) · pteron60 (CC BY 2.0) ·
IQRemix (CC BY-SA 2.0) · ORNL (CC BY 2.0) · Jefferson Lab (PDM) · aherrero (CC BY-SA
2.0) · FBI (PD) · Met Open Access DP204810, Song Nian (CC0) · Musopen Symphony —
Tchaikovsky Op. 74 (PD) · Voice: Kokoro-82M (Apache-2.0) · Opuscar Studio.

## Print inventory — v13 (all in-situ fades, LAW 4)
- `palace.jpg` — CMA 1976.1 “In the Palace” handscroll, CC0; ACT 1 (ancient cold open), beside XI SHI; crop 990×308 from the 3400×329 open-access scan.
- `hq.jpg` — NVIDIA HQ sign, Will Buckner, CC BY 2.0 (Flickr via Wikimedia); ACT 2; on-frame credit “HQ SIGN · CC BY 2.0”.
- `sg.jpg` — Marina Bay at dusk, Benh LIEU SONG, CC BY-SA 4.0 (Wikimedia Commons); ACT 3; “MARINA BAY · CC BY-SA 4.0”.
- `wh.jpg` — White House south facade, pteron60, CC BY 2.0 (Flickr); ACT 4; “WHITE HOUSE · CC BY 2.0”.
- `bj.jpg` — Great Hall of the People, IQRemix, CC BY-SA 2.0 (Flickr); ACT 5; “GREAT HALL · CC BY-SA 2.0”.
- `hpc.jpg` — Summit supercomputer, Oak Ridge National Laboratory (oakridgelabnews), CC BY 2.0 (Flickr); ACT 6; captioned on frame “ILLUSTRATIVE: SUPERCOMPUTER-CLASS COMPUTE” — not presented as Megaspeed infrastructure.
- `racks.jpg` — data-center racks, Jefferson Lab, Public Domain Mark (US DOE); ACT 7→8 transit; “PDM”.
- `nyse.jpg` — NYSE trading floor, aherrero, CC BY-SA 2.0 (Flickr); ACT 9; “NYSE FLOOR · CC BY-SA 2.0”.

## Alice Huang photograph policy (v13)
No freely licensable photograph of Alice Huang exists (verified via Wikimedia
Commons, Openverse and Flickr search; news-agency images are out of scope for
LAW 1). The film shows an honest ABSENCE: a redacted “PRESS FILE / ALICE HUANG”
card with empty redaction bars and a rotated red NOT PICTURED stamp, plus the
caption “NO LICENSED PHOTOGRAPH EXISTS”. Gravitas first, joke second, fabrication never.

## Narration v13 (LAW 2)
Ancient cold open (Xi Shi / 36 Stratagems / 美人計 brush stamp) → Gen-Z comedic
register throughout, allegations still attributed. Kokoro am_michael @ 1.0 →
VO 303.061 s; ASR (whisper-tiny.en, 744 words) anchors `timings.mjs`; SFX
re-anchored; FRAMES 9092.
