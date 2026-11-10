# BEATS — The Oldest Trick in the History Still Works, Right?

Every row is a **shot card** (LAW 8). Grid: T = thirds anchor (frame coords, camera at
zone), hero on the line, never dead-center. All text: clear of viewport edges at pose
±0.5 s and at entry/exit; ≥60 px design-band clearance; no two text layers overlap;
no stroke crosses type (LAW 4/6/8). Coordinates are WORLD px. Camera keys in
timings.mjs. VO anchors = vo-timings.whisper.json.

| # | In (s) | Out (s) | Intent | Shot / Move | Grid · Hero | Text layers (y, size, font, style) | Cues / SFX | Assets |
|---|--------|---------|--------|-------------|-------------|-------------------------------------|-----------|--------|
| S01 | 0.0 | 26.6 | The question hooks; no facts yet beyond the memo itself | ECU-ish hold; micro push-in 0.92→0.94 | L-third · red seed dot hero | typewriter "NOV 8, 2026" (y 250, 44, hand) · quote mask-up "I WAS UNFAITHFUL TO MY WIFE." (y 470, 84, display, LAW 6 underline ≥40px below) | VO: unfaithful 8.70 · board 17.74 · airSwell · thud @17.74 | — |
| S02 | 26.6 | 56.1 | Establish the stakes (company, policy) | drift arrival beat · gentle push | R-third · drawn chip hero | stamp "1993" (y 300, 120) · stamp "$4T · JUL 2025" (y 520, 88) · stamp "$5T · OCT 2025" (y 660, 88, red) | ping 35.92 · thud 39.74 | jh_2023 print (left-third) |
| S03 | 56.1 | 81.1 | The other Huang, reported-not-charged | observational hold, 0.97 | C-third · identity note-card hero | typewriter "ALICE HUANG" (y 260, 92) · "MEGASPEED · SINGAPORE" (y 380, 40) · "REPORTED — NEVER CHARGED" (y 640, 32, serif) · relationship diagram (two circles + ?) | paper tick 56.8 · teletype | — |
| S04 | 81.1 | 113.9 | The allegation, attributed | slow push-in 0.95→0.97 | L-third · red MSS outline stamp hero | stamp "MSS — REPORTED" (y 250, 96, outline red) · note card: "MEMO · SPRING 2026" + redaction bars + caption "illustration — no public document" (y 430) · typewriter "RUBIO OVERSAW · SPRING 2026" (y 720, 30) | bed enters 81.5 (ducked) · paper whump ×2 | songnian plate |
| S05 | 113.9 | 148.6 | Both sides on the table; discipline | hard split-hold, 0.96 | two columns on L/R thirds | ledger card L "REPORTED" / R "DENIED" (y 300, 64) · serif lines below each (y 420/470/520, 26) · stamp "NO REASON TO BELIEVE" (y 760, 40, serif, ink) | silence gap before 144.2 · low note 140.9 | — |
| S06 | 148.6 | 181.9 | Follow the money trail | slow L→R chain read (cards at ±700), 0.94, + pan drift | procession L→R · chain diagram hero | stamp "$4.8B" (y 250, 110, red) · chain cards "MEGASPEED → SPEEDMATRIX (MY)" (y 470, 40) · two quote cards: "NORMAL AND NOT UNUSUAL" (y 650, 30) · "THOROUGHLY INVESTIGATED AND DEBUNKED LAST YEAR" (y 720, 24) | server ambience · cash thud 161.4 | — (external print removed; S06 stays ink-only) |
| S07 | 181.9 | 233.1 | History rhymes — show the playbook | wide lateral drift across the wall, 0.92 | wall of prints, thirds ×3 | spine timeline 1917→2013→2015→2026 (y 250, 34) · prints: Mata Hari (y 390) · Wolf (y 390) · Witt (y 390) · typewriter "ACCESS · INTIMACY · LEVERAGE" (y 760, 44) | whoosh ×3 · sub boom 184.5 | mata_hari · markus_wolf · monica_witt prints |
| S08 | 233.1 | 262.3 | Why Washington cares — plates & licenses | diag transit in; static-logic hold, 0.95 | R-third · arc corridor hero | stamp "OCT 2022 — BIS RULES" (y 270, 34) · stamp "APR 2025 — $5.5B CHARGE" (y 380, 34) · stamp "MAY 2026 — ZERO DELIVERIES" (y 490, 40, red) · "BIS LICENSE REQUIRED" outline stamp | teletype arpeggio | chips glyph (drawn) |
| S09 | 262.3 | 288.7 | The cost, cash | chart draw-on, 0.96 | L-third · cliff line hero | stamp "−4.3%" (y 300, 120, red) · "≈ $190B IN A DAY" (y 430, 44) · note card "KISTENMACHER v. NVIDIA (N.D. CAL.) — disclosure claims only" (y 640, 26) | chart whoosh-down · thump 278.3 | — |
| S10 | 288.7 | 315.1 | The evidence wall — confirmed/reported/unknown | pull-in to the wall, 0.97 | center wall · three panels | three panels: CONFIRMED / REPORTED / UNKNOWN (y 300, 56) · serif rows (y 400–640, 24–28) | two heartbeats · silence | — |
| S11 | 315.1 | 339.925 | The question outlives the film | slow settle → tail pull-back | center · question hero | stamp echo "THE OLDEST TRICK IN THE HISTORY" (y 330, 88) · "STILL WORKS?" (y 450, 150, red) · end-card strata: sources + credits (y 640–980, 16–22px serif) | bed swell · downbeat 339.8 · fadeOut | songnian plate |

## Safe-area notes
- Camera dim-backs begin 0.4 s before each zone exit; prints fade in situ, never drop in.
- S04 memo card: width ≤1400, bottom ≤ y 760 — clear of caption band.
- S07 prints: tops ≥ y 250, bottoms ≤ y 700; captions ≤ y 800.
- End-card strata: mask-ups 130..300 / credits 940..1040 — re-check at t_end−1.0 / −0.3 / 0.
