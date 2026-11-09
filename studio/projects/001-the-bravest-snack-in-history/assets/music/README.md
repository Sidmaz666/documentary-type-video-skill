# music/

Provenance of this film's classical music bed (MUSIC LAW, AGENTS.md §2 LAW 1b).

## Selected bed — RE-SOURCED (Nov 2026)

**Erik Satie — Gymnopédie No. 1** (published Paris, 1888; composition PD —
Satie died 1925), piano recording performed by **Teknopazzo** (own work),
released **CC0 1.0 Universal Public Domain Dedication** — the performer waived
all copyright and neighbouring rights worldwide, so the *performance* is
explicitly PD-equivalent, not merely the composition.

- File page: `https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1..ogg`
  (the file `File:Erik_Satie_-_Gymnopedie_No.1.ogg` was **renamed** to this
  title by user Mitar on 2022-02-10 — same recording, restored/fixed container;
  the old link now redirects)
- License URL: `https://creativecommons.org/publicdomain/zero/1.0/deed.en`
- Direct source: `https://upload.wikimedia.org/wikipedia/commons/b/b7/Gymnopedie_No._1..ogg`
- Source integrity: `gymnopedie_no1_source.ogg` SHA-1
  `1465775de774068e2d0d24b9ea852b323b4fb0d1` — verified identical to the SHA-1
  published in the Commons structured data for this file.
- Files here:
  - `gymnopedie_no1_source.ogg` — original as downloaded (Ogg FLAC, 204.8 s,
    6,502,597 bytes, SHA-1 above). Archived, never fed to the mix directly.
  - `gymnopedie_no1.ogg` — working copy converted to **Ogg Vorbis q5**
    (44.1s not needed: 22.05 kHz stereo, 204.8 s). This is the path
    `sfx-plan.mjs → musicBed()` picks up automatically.

## Rejected / absent alternatives

- `File:Erik_Satie_-_Gymnopedie_No.1.ogg` — the previously cited title; no
  longer present under that exact name (renamed, see above). Not absent-deleted.
- Robin Alciatore (Musopen) recording,
  `File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg` — PD
  dedication, but Musopen requested in-line attribution; superseded by the
  cleaner CC0 Teknopazzo take.
- Kevin MacLeod — Gymnopédie No 1 (Commons + FMA) — **CC-BY 3.0**, rejected
  (v7 review: attribution obligations unwanted for the archive).
- Michael Laucke classical-guitar recording (Commons) — CC-BY-SA 4.0 (plus PD
  claims); not piano, and CC-BY-SA is a rejected license class here.
- David Hernando Vitores sax/piano arrangements — CC-BY-SA 4.0, rejected.
- Synthesized/MIDI renditions — banned outright by MUSIC LAW (must be real
  recordings).

## Rules (unchanged)

- Trim to the VO length (`trimTo: T.DUR`), fade in/out, sidechain-duck under
  the voiceover (≈6–8 dB dip while speech is present) — implemented in
  `engine/sfx.mjs → mixVoWithBus`.
- **Never two beds:** with a classical asset present, the synth drone fallback
  stays retired for this film.

Note: film 001's audio mix was already delivered inside the published MP4
(the surviving canonical artifact); this bed is archived so the mix can be
re-built from source at any time and so future films can reuse a verified
CC0 classical asset.
