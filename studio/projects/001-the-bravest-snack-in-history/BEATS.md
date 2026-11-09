# BEATS — The Bravest Snack in History (creative contract)

One continuous camera move across the 20,000px board. Times come from `timings.mjs` (the user's `timings.json`). No cut ever happens; zones dim back as the camera leaves.

| Time | Narration | The one hero | On-screen text | SFX |
|------|-----------|--------------|----------------|-----|
| 0.5–1.7 | "Ten thousand years ago," | the paper board itself | "10,000" / "YEARS AGO" stamps | stamp thud ×2 |
| 1.9–5.2 | "one starving hunter stood face to face with a wild cow." | hunter (stickman, spear) → aurochs print (01) | red line, red circle around the aurochs, "THE WILD COW" | pencil scratches |
| 5.6–7.1 | "Then he watched her calf drink..." | calf print (02) drops with a bounce | — | paper whump |
| 7.2–9.9 | "...and had the wildest idea in human history." | faint ink "?" growing | growing "?" | — |
| 9.9–11.6 | "What if I drank that too?" | the typed question; calf dims | "WHAT IF I / DRANK THAT TOO?" (typewriter) | typewriter keys |
| 11.7–16.2 | "Milk. Fresh food every single day, straight from an animal that walks beside you." | walking Holstein cow | "MILK." stamp + "FRESH FOOD. EVERY SINGLE DAY." | stamp thud + 7 clops panned L→R |
| 16.7–21.8 | "Goats and sheep came first, around nine thousand B C. Cows followed fast." | timeline rule + goat print (04) + cow print (05) | "9000 BC", red circle on BC, red arrow to the cow | scratches |
| 21.9–26.2 | "And we even evolved for it. Adults who could drink milk survived and spread." | field-note card → DNA helix → spread map | "WE EVOLVED FOR IT." / "LACTASE PERSISTENCE" | map ping + whoosh-ticks |
| 26.3–31.6 | "So next time you pour a cold glass of milk... you are tasting the bravest snack in history." | milk-pour print (06) | "THE BRAVEST SNACK" / "IN HISTORY." stamps, line by line | stamp thuds ×2 (+ paper whump at 26.5) |
| 31.35–31.85 | (last word lands: "…history.") | the red underline | red underline below "IN HISTORY." — ≥40px clearance (LAW 6) | pencil scratch |
| 31.6–32.5 | (tail) | the board itself | slow pull-back revealing the zones | soft whoosh; fade out |

## Texture & motion feel

- **Boil:** every stroke/text/character jitters ±2.4px / ±0.002rad, quantized to 8 fps steps — pencil-test feel, never shimmer. Hashed from world coordinates: byte-deterministic, order-independent.
- **Paper:** laid paper everywhere — fiber grain (α≈0.03 strokes), blotches (radial gradients α≈0.02–0.04), world-aligned rules every 118px at α≈0.05, gently bowed on a fixed lattice so lines never crawl under the camera.
- **Camera:** one Catmull-Rom rail, C1-continuous (holds keep drifting toward the next move). Handheld noise damped during fast pushes. Temporal motion blur: sub-samples at 1/90s spacing during fast travel only (looser spacing ghosts structure — banned).
- **Dim-backs:** each zone fades to ~0 as the camera leaves it; old heroes never bleed into the next beat's frame.
- **Safe area:** titles/captions sit ≥60px inside the viewport at every camera pose in their window (LAW 4); per-zone guard bands are commented in `world.mjs`.
- **Underline:** draws at `T.underlineF = [31.35, 31.85]`, after the final stamp (29.2), landing on the last spoken word, 75px below the text bottom (LAW 6).
