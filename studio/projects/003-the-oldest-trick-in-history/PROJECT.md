# 003 — The Oldest Trick in the History Still Works, Right?

**Title (exact):** The Oldest Trick in the History Still Works, Right?

**ONE idea:** How did a personal relationship at the top of the world's most important
AI company become a national-security and corporate-governance crisis — and does the
evidence support the oldest playbook in espionage, or something more complicated?

**Format:** 5:40 investigative-documentary essay, 21:9 (2560×1098, 30fps, 10,198 frames).
LAW 2 — duration = VO (339.925 s). VO: Kokoro am_michael @ 1.18.

**House/grade:** documentary-grade (warm key / cool shadow, heavier grain); Song Nian
(清·松年) MET DP204810 ink-wash multiply plate α≈0.09; paper world + ink cast.

## Master of decisions

- **Resolution 2560×1098 (not 4K).** 10,198 frames at 4K on a 4 GB sandbox risk OOM;
  2560×1098 keeps 21:9 geometry, full paper detail, and renders in viable time. 001
  was 4K/10 s-class; this is the production-length decision. Revisit if a 4K re-render
  is later scheduled on bigger hardware.
- **Camera:** single Catmull-Rom rail, `makeVariedRail(keys, 7)` — every transit bends
  diagonal/arc (LAW 10); seed 7 chosen after LAW 4 sweep (re-seed down on failure).
- **Vibe plate:** one constant plate whole-film (Song Nian landscape) — cohesion.
- **Fact discipline (LAW research-sourcing):** every claim traces to SOURCES.md /
  CLAIM_LEDGER.md. Contested items are voiced with attribution ("reported", "alleged",
  "Singapore denied", "China said"). The film NEVER states a honey trap occurred.
- **No fake evidence:** all on-screen "documents" are labelled illustrations; no
  fabricated memos/messages/photos of private encounters; no AI imagery; Mata Hari,
  Markus Wolf, Monica Witt images are licensed prints (see ASSET_MANIFEST.md).
- **Music bed:** Tchaikovsky, Pathétique IV (Adagio lamentoso), Musopen performance —
  PD/PD (LAW 1b). Ducked −6..−8 dB under VO. Bed audible from 0:00.

## QC log

| v | Defect / check | Resolution |
|---|----------------|------------|
| v13 | **Full creative rebuild — ancient cold open + Gen-Z tone + scene-fill** — VO rewritten: S01 opens on the 36 Stratagems beauty trap (Xi Shi → King of Wu/Yue, "the story as the ancients tell it", 美人計 brush stamp via Liu Jian Mao Cao, CMA 1976.1 "In the Palace" print — CC0); allegations still attributed; ~15 dry punchlines. Kokoro am_michael @ 1.0 → VO 303.061 s (LAW 2); whisper ASR (744 words) re-anchored `timings.mjs`, `sfx-plan.mjs`, `world.mjs` (all stamps/cards/prints re-timed to v13 VO); FRAMES 10,198→9,092. **Every scene now carries sourced imagery**: +8 new licensed prints (hq.jpg CC BY 2.0 Will Buckner; sg.jpg CC BY-SA 4.0 Benh LIEU SONG; wh.jpg CC BY 2.0 pteron60; bj.jpg CC BY-SA 2.0 IQRemix; hpc.jpg CC BY 2.0 ORNL — captioned "ILLUSTRATIVE: SUPERCOMPUTER-CLASS COMPUTE"; racks.jpg PDM Jefferson Lab; nyse.jpg CC BY-SA 2.0 aherrero; palace.jpg CC0 CMA, ffmpeg-cropped from the 3400×329 scan) with on-frame micro-credits. **Alice Huang photograph: none legally licensable → honest absence** (redacted PRESS FILE card + rotated NOT PICTURED stamp + "NO LICENSED PHOTOGRAPH EXISTS"). **Vibe plate now VISIBLE** — was one whole-board stretch @ α 0.09 (featureless); now ~7200-px tiles, L/R-feathered, built once at module load, viewport-culled, multiply @ α 0.16. **SFX SRT**: regenerated from v13 whisper timings (65 cues). **Credits CSV** renumbered (05 Song Nian, 06 Pathétique, 07 VO, 08 fonts, 09 thumbnail, 10–17 new prints); phantom DOE/NREL row removed everywhere (end-card + ASSET_MANIFEST). | Full re-render (21:9 + 16:9); LAW 4 sweep **SAFE AREA OK 1213/1213 in 16 s** (post-tile-cull; prior >1 h freeze); FINAL-FILE LAW ok both masters (9,092 frames; video 303.067 s == audio 303.061 s); I −15.2 LUFS, TP −2.0 dBFS; lens: Xi Shi claim enters SOURCES.md #30 (traditional narrative, labelled semi-legendary) + CLAIM_LEDGER #36; i8 deliver.mjs now wipes out/16x9 before render (stale-part concat class, +17 phantom frames incident) |
| v12 | **Published TP violated DoD on re-measure** — 192k AAC mux reconstructs transients: WAV TP −1.0 → published MP4 **−0.8 dBFS** (ceiling −0.9). Engine fix: (1) `mixVoWithBus` gained `masterTrim` (post-limiter headroom for lossy masters; 003 uses −0.4 dB), (2) `muxAndPublish` AAC bitrate 192k → **320k**. Re-measured: mix I −15.4 LUFS / published TP **−1.1 dBFS** on BOTH masters (21:9 + 16:9), bed still audibly present from 0:00 (trimLead — silencedetect clean 0–7.7 s), FINAL-FILE LAW re-verified (10,198 frames; video 339.933 s == audio 339.925 s) | Re-muxed both masters from existing video-only.mp4 (`bun build.mjs --no-video` + inline `muxAndPublish` for the 16:9 loopback) |
| v12 | **YouTube packaging added** — `VIDEO_METADATA.md` (exact title, chapters on the `T.scenes` clock, description with traceable source links verified against SOURCE_REGISTER.md, tags, pinned comment, fact-discipline reminders), `thumbnail.mjs` + published `public/film/003-…-thumb.png` (`HONEY TRAP?`, asked not asserted) and `…-thumb-alt.png` (`AN AFFAIR? / AN OPERATION?` variant) — both from the row-01 CC BY 2.0 portrait, attribution in the description; CSV row 10 | films.ts `alternates` carries both thumbnails; films.ts `sizeMB` 368→371 |
| v11 | **LAW 4 sweep failed 153/1360 frames** at first full pass — every zone's hero crossed the outer 60px band as the camera passed it (full-bleed S07 spine line crossed both bands constantly; Mata Hari print entered the left band at t≈190; Fang card + '2011–15' tick entered the right strip at t≈214–219; evidenceWall panels beheaded the top band at t≈295.5; KISTENMACHER card crossed in S09's deep-dip transit; $4.8B stamp beheaded at the low-swoop recovery t≈176) | S01/S03/S04/S06/S09/S10 zone outTs pulled earlier (heroes dissolve before the band — house dim-back rule); S02 Jensen print moved 8330→8150 with fade-out by 52.2; S06 chain cards ±700 at 640px wide, chainFlow y 300→345 (clears the low-swoop dip); S07 spine line lightened to α=0.45 and now erodes segment-by-segment via `fadeExit`/`fadeEntry` helpers keyed on element edges (nothing drawn while any part is in the band); Mata Hari/Wolf/Witt prints, captions, ticks, ACCESS·INTIMACY·LEVERAGE stamp, S07 title and FANG card all got directional in-situ fades; S08 zone shifted +700px right with stamp/label fades; evidenceWall re-laid at y 470 (620×470 cards, ≥170px headroom); **chapter-break interludes added to every empty transit band** (t≈20.4/51.9/76.8/109.6/283.7). **Sweep then reports SAFE AREA OK: 1360/1360.** |
| v11 | **FINAL-FILE LAW** after full re-render | Re-verified on both masters: 21:9 and 16:9 — 10,198 frames each; video 339.933s == audio 339.925s (10-frame AAC/MP4 container skew, within spec) |
| v11 | **Mix below house anchor** — Kokoro VO sits ~9.5 dB low; mix read −23.5 LUFS vs the ≈−14.5 anchor (002 solves the same thing with voGain 2.6–3.5) | `voGain: 3.0` → mix **−15.0 LUFS integrated, TP −1.0 dBFS**, bed audible from 0:00 (trimLead), re-muxed and re-published |
| v11 | **SRT captions unusable** — auto-merged whisper SRT had overlapping cues (one 16s cue), ASR mis-hearings ("Envidia", "Wang", "Romeo's") | Rebuilt from the canonical script aligned to whisper ASR word timings (SequenceMatcher): 148 cues, 917/917 script words, two-line cues ≤42 chars, proper timing — copied to `public/film/003-the-oldest-trick-in-history.en.srt` and staged in project as `assets/subtitles.en.srt` |
| v11 | **End-card CJK glyphs rendered as □□□** (house serif has no CJK coverage) | "總統府 (CC BY 2.0)" → "Office of the President ROC (CC BY 2.0)"; 3 final chunks re-rendered in both masters (t≥317.2); re-concat + re-mux + FINAL-FILE LAW re-verified; remember key still re-shot |
| v11 | **jh_2023 credit wrong** in films.ts ("AP agency photo") | Corrected to official portrait, Office of the President ROC, CC BY 2.0 (Wikimedia Commons file page — required attribution, end-card block already carries it); films.ts also fixed ("agency photograph, AP" → "official portrait, Office of the President ROC, CC BY 2.0"; Mata Hari phrase corrected) |
| v11 | **Key stills stale** (002-reel times): hook half-typed, remember showed empty paper | hook @12.0 (quote + underline + attribution), everything @168.0 ($4.8B chain), remember @322.0 (end-card, latin-only credits) |
| v11 | Lint / typecheck | Both clean (`bun run lint`, `bun run typecheck`) |
| v10 | First full render + publish | 42 chunks sequential (OOM law), concat probe per LAW 3, published `public/film/003-the-oldest-trick-in-history.mp4` |

## Manifest rows

`src/lib/films.ts` — entry `003-the-oldest-trick-in-history` added (21:9 master, 16:9 alternate via `studio/tools/deliver.mjs`, SRT sidecar, **YouTube thumbnails (primary + A/B variant) in `alternates`**, 11 scene shots with VO lines, credits rows incl. LAW 9 assets + Pathétique IV Musopen PD recording). `studio/PROJECTS.md` — 003 row + deliverables table updated. `public/film/stills/003-the-oldest-trick-in-history-{hook,everything,remember}.png` key stills published. `public/film/003-the-oldest-trick-in-history-16x9.mp4` 16:9 paper-extension master published. Thumbnails published: `public/film/003-the-oldest-trick-in-history-thumb.png` + `…-thumb-alt.png`.
