# music/ (MUSIC LAW)

Use **real classical recordings only**: composition and performance must be
Public Domain or CC0 (no MIDI, no synth). Store the recording here and add a
provenance row to `../assets-credits.csv` (composer, performer, license,
source URL, rejected alternatives). Trim/fade/sidechain-duck under VO in the
engine mix (`sfx-plan.mjs` → `musicBed()` returns `{ path, trimTo: T.DUR, gain, fadeIn, fadeOut }`).
**Never two beds**: if a classical asset exists, the drone fallback is retired.
