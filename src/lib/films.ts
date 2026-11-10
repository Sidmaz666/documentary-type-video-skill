export type FilmScene = {
  id: string;
  title: string;
  line: string;
  start: number;
  end: number;
  hero: string;
};

export type FilmAlternate = {
  label: string;
  url: string;
  note: string;
};

export type Film = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  videoUrl: string;
  zipUrl: string;
  duration: number;
  frames: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  sizeMB: number;
  scenes: FilmScene[];
  audio: {
    vo: string;
    sfx: string;
    music: string;
    musicCredit: string;
  };
  credits: string[];
  /** sidecar captions (SRT) when published */
  captions?: string;
  /** alternate masters (e.g. 16:9 paper-extension) */
  alternates?: FilmAlternate[];
};

/**
 * Film manifest — canonical per-film metadata/credits. No app consumes this in-repo;
 * the showcase site (when it exists) renders from here. Slug/file naming must match
 * public/film/<slug>.mp4. Film #002 appears by adding one entry.
 */
export const films: Film[] = [
  {
    slug: "001-the-bravest-snack-in-history",
    title: "The Bravest Snack in History",
    tagline: "A code-drawn documentary · 32.5 seconds · one continuous camera move",
    description:
      "Ten thousand years ago, a starving hunter met a wild cow — and humanity got its bravest snack. Every frame of this film is drawn by a canvas program onto a 20,000px paper world: prints drop in like physical photographs, ink draws itself, a line-art cow walks the baseline, and the camera never stops moving.",
    videoUrl: "/film/001-the-bravest-snack-in-history.mp4",
    zipUrl: "/bravest-snack-project.zip",
    duration: 32.533,
    frames: 976,
    width: 3840,
    height: 1646,
    fps: 30,
    codec: "H.264 + AAC",
    sizeMB: 42.5,
    scenes: [
      {
        id: "hook",
        title: "The Wild Cow",
        line: "Ten thousand years ago, one starving hunter stood face to face with a wild cow.",
        start: 0,
        end: 5.55,
        hero: "10,000 YEARS AGO stamps · hunter draws · red circle on the aurochs print",
      },
      {
        id: "idea",
        title: "The Wildest Idea",
        line: "Then he watched her calf drink... and had the wildest idea in human history. What if I drank that too?",
        start: 5.55,
        end: 11.63,
        hero: "calf print drops with a physical bounce · a faint ink ? grows, then types huge",
      },
      {
        id: "milk",
        title: "Milk.",
        line: "Milk. Fresh food every single day, straight from an animal that walks beside you.",
        start: 11.63,
        end: 16.57,
        hero: "giant MILK. stamps · a line-art Holstein walks the baseline, hooves panned left→right",
      },
      {
        id: "timeline",
        title: "9,000 BC",
        line: "Goats and sheep came first, around nine thousand BC. Cows followed fast.",
        start: 16.57,
        end: 21.77,
        hero: "timeline draws itself · goat print · red circle lands on BC · cow print + arrow",
      },
      {
        id: "genes",
        title: "Lactase Persistence",
        line: "And we even evolved for it. Adults who could drink milk survived and spread.",
        start: 21.77,
        end: 26.24,
        hero: "field-note card · depth-sorted DNA helix draws · Europe/Africa map with spread arrows",
      },
      {
        id: "toast",
        title: "The Toast",
        line: "So next time you pour a cold glass of milk... you are tasting the bravest snack in history.",
        start: 26.24,
        end: 32.533,
        hero: "milk-pour print drops · final type stamps line by line · red underline · slow pull-back, fade out",
      },
    ],
    audio: {
      vo: "Human narration (user's own recording), anchored to the waveform by silence detection",
      sfx: "Every visual moment scored by code-synthesized sound: stamp thuds, typewriter keys, pencil scratches, paper drops, hoof-clops, map pings, camera whooshes",
      music: "Erik Satie — Gymnopédie No. 1 (1888, public domain), piano recording (CC0, Teknopazzo), trimmed to length, faded, sidechain-ducked under the narration",
      musicCredit: "Satie / Teknopazzo — CC0, via Wikimedia Commons",
    },
    credits: [
      "Every frame composited by a canvas program — no AI-generated media (LAW 1)",
      "Photos enter as physical prints: PD lithograph (aurochs), Unsplash ×2, Pexels ×2",
      "Score: Erik Satie, Gymnopédie No. 1 — CC0 recording, ducked under narration",
      "Rendered at 3840×1646 (21:9), 30 fps, 976 frames, chunk-encoded H.264",
    ],
  },
  {
    slug: "002-ink-and-ember",
    title: "Ink & Ember",
    tagline: "A code-drawn documentary · 24.6 seconds · one continuous, ever-varying camera move",
    description:
      "Ink is the oldest memory technology we have. Five thousand years of lampblack and glue, ground and dried, poured into movable type — every story you have ever read began as a stubborn black promise. Every frame composited by a canvas program onto a two-axis-grid paper board washed with a constant ink-wash plate (Webber, 1779, PD): the seed dot, the scribe, the press, the falling drop — anchored by two real artifacts as physical prints (a Qing-dynasty ink cake, CC0; a Gutenberg Bible leaf, public domain).",
    videoUrl: "/film/002-ink-and-ember.mp4",
    zipUrl: "",
    duration: 24.633,
    frames: 739,
    width: 1920,
    height: 822,
    fps: 30,
    codec: "H.264 + AAC",
    sizeMB: 17.3,
    captions: "/film/002-ink-and-ember.en.srt",
    alternates: [
      { label: "16:9 paper-extension master (1920×1080)", url: "/film/002-ink-and-ember-16x9.mp4", note: "same paper world and camera rail re-framed to a taller canvas — extra laid paper, no bars, no crop (LAW 4 safe at every pose)" },
    ],
    scenes: [
      { id: "hook", title: "Ink.", line: "Five thousand years ago, ink was memory you could carry.", start: 0, end: 3.9, hero: "red seed dot + ping · INK. stamp · 'five thousand years of memory' types on" },
      { id: "china", title: "China", line: "In China, scribes ground lampblack with glue into sticks — ink that outlasted kings.", start: 3.9, end: 10.0, hero: "stickman scribe + mortar arcs · pine-soot ink stick drops in · soot motes" },
      { id: "gutenberg", title: "1440", line: "Around fourteen forty, Gutenberg split the word into movable type. And in fourteen fifty five, the Gutenberg Bible poured from the press.", start: 10.0, end: 19.3, hero: "type case rises · press sheet types itself · 1440./1455. stamps" },
      { id: "everything", title: "Everything You Have Ever Read", line: "Everything you have ever read began as a stubborn black promise.", start: 18.98, end: 22.76, hero: "mask-up type wipe · a stretching ink drop falls clear of the words" },
      { id: "remember", title: "It Remembers.", line: "This is ink. It remembers.", start: 22.76, end: 24.633, hero: "drop lands · ink pool ripples · IT REMEMBERS. stamp · fade out" },
    ],
    audio: {
      vo: "Kokoro-82M local TTS (am_michael, calm professional male), word-anchored timings via whisper ASR",
      sfx: "Pencil scratches, paper drops, stamp thuds, camera whooshes — all code-synthesized",
      music: "Erik Satie — Gymnopédie No. 1 (1888, public domain), piano recording (Teknopazzo, CC0), reused from 001's verified bed; trimmed to length, faded, sidechain-ducked under the narration",
      musicCredit: "Satie / Teknopazzo — CC0, via Wikimedia Commons",
    },
    credits: [
      "Every frame composited by a canvas program — no AI-generated media (LAW 1)",
      "External source assets (LAW 9): Qing-dynasty ink cake print (Cleveland Museum of Art, CC0 1.0); Gutenberg Bible leaf print (Harry Ransom Center scan, PD); constant ink-wash background plate (John Webber, Kealakekua Bay, 1779 — Honolulu Academy of Arts scan, PD); Ming-dynasty calligraphy handscroll print (Met DP-13230-001, Ni Yuanlu / Huang Daozhou — CC0, cropped for print)",
      "Typography: Liu Jian Mao Cao (OFL 1.1) brush stamp for the hook INK.; Archivo Black / Caveat / Noto Serif display faces",
      "VO: Kokoro-82M (Apache-2.0), local synthesis — no cloud voice services",
      "Score: Satie, Gymnopédie No. 1 — CC0 recording, ducked under narration",
      "Rendered at 1920×822 (test-resolution 21:9 class), 30 fps, 739 frames, chunk-encoded H.264",
    ],
  },
  {
    slug: "003-the-oldest-trick-in-history",
    title: "The Oldest Trick in the History Still Works, Right?",
    tagline: "An investigative documentary · 5:40 · one continuous, ever-varying camera move",
    description:
      "On November 8, 2026, Jensen Huang told his staff he had been unfaithful to his wife — and NVIDIA's board announced an independent investigation within hours. Every frame of this film is drawn by a canvas program onto a paper world washed with a constant ink-wash plate (Song Nian, 清·松年, Met DP204810, CC0): the drawn chip, the memo card, the money chain, the history wall — anchored by three real artifacts as physical prints (Markus Wolf, Bundesarchiv, CC BY-SA 3.0 de; Monica Witt, FBI wanted poster, PD; Mata Hari (Jacob Merkelbach portrait, ca. 1906), PD) plus a fourth — Huang himself (jh_2023, official portrait, Office of the President ROC, CC BY 2.0). Every contested claim is attributed on screen and in SOURCE_REGISTER.md; denied or unproven claims are labelled as such; no honourable audience is left believing the honey trap verdict has been reached by any authority.",
    videoUrl: "/film/003-the-oldest-trick-in-history.mp4",
    zipUrl: "",
    duration: 339.925,
    frames: 10198,
    width: 2560,
    height: 1098,
    fps: 30,
    codec: "H.264 + AAC",
    sizeMB: 371,
    captions: "/film/003-the-oldest-trick-in-history.en.srt",
    alternates: [
      { label: "16:9 paper-extension master (1920×1080)", url: "/film/003-the-oldest-trick-in-history-16x9.mp4", note: "same paper world and camera rail re-framed to a taller canvas — extra laid paper, no bars, no crop (LAW 4 safe at every pose)" },
      { label: "YouTube thumbnail (primary)", url: "/film/003-the-oldest-trick-in-history-thumb.png", note: "HONEY TRAP? — asked, not asserted; jh_2023 CC BY 2.0 portrait, grade-matched house paper print style (attribution in the video description)" },
      { label: "YouTube thumbnail (A/B variant)", url: "/film/003-the-oldest-trick-in-history-thumb-alt.png", note: "AN AFFAIR? / AN OPERATION? — same portrait, title question as handwriting" },
    ],
    scenes: [
      {
        id: "hook",
        title: "The Letter",
        line: "On the eighth of November, twenty twenty-six, the founder and chief executive of NVIDIA sent a letter to his employees.",
        start: 0,
        end: 26.6,
        hero: "red seed dot + ping · quote mask-up “I WAS UNFAITHFUL TO MY WIFE.” · underline · JENSEN HUANG ATTRIBUTION · AN INDEPENDENT INVESTIGATION stamp",
      },
      {
        id: "stakes",
        title: "The Stakes",
        line: "Jensen Huang co-founded NVIDIA in 1993 and has run it ever since.",
        start: 26.6,
        end: 56.1,
        hero: "drawn chip 1993 · $4T JUL 2025 · $5T OCT 2025 stamps · jh_2023 print",
      },
      {
        id: "alice",
        title: "The Other Huang",
        line: "The woman at the center of this is another Huang — Alice Huang, no relation. Not charged. Not heard from.",
        start: 56.1,
        end: 81.1,
        hero: "ALICE HUANG typewriter · relationship diagram: two circles + ? · REPORTED — NEVER CHARGED",
      },
      {
        id: "mss",
        title: "MSS — Reported",
        line: "According to reporting based on US intelligence assessments, surveillance unmasked a contact that identified Jensen Huang as the American on the other end of the line.",
        start: 81.1,
        end: 113.9,
        hero: "MSS — REPORTED red stamp · illustrative memo card: MEMO · SPRING 2026 with redaction bars (labelled: no public document) · RUBIO OVERSAW · SPRING 2026",
      },
      {
        id: "denials",
        title: "Both Sides on the Table",
        line: "Neither the CIA nor the White House has confirmed it. Singapore's Ministry of Home Affairs replied flatly: no such investigations existed.",
        start: 113.9,
        end: 148.6,
        hero: "L/R ledger columns REPORTED vs DENIED · NO REASON TO BELIEVE stamp",
      },
      {
        id: "money",
        title: "The Money Trail",
        line: "Its Malaysian affiliate, Speedmatrix, reportedly bought at least four-point-eight billion dollars of equipment containing NVIDIA technology between June 2024 and February 2026.",
        start: 148.6,
        end: 181.9,
        hero: "$4.8B red stamp · MEGASPEED → SPEEDMATRIX chain cards · NORMAL AND NOT UNUSUAL · THOROUGHLY INVESTIGATED AND DEBUNKED LAST YEAR",
      },
      {
        id: "playbook",
        title: "The Playbook Is Older Than the Microchip",
        line: "None of this is new. Mata Hari was executed by France in 1917. The Stasi ran Romeos. Monica Witt defected. Christine Fang cultivated mayors.",
        start: 181.9,
        end: 233.1,
        hero: "spine timeline 1917→1950s–80s→2013→2011–15 with erosion · Mata Hari / Markus Wolf / Monica Witt prints · FANG note card · ACCESS · INTIMACY · LEVERAGE stamp",
      },
      {
        id: "washington",
        title: "Why Washington Cares",
        line: "Since October 2022, America has required licenses for its most advanced AI chips to reach China.",
        start: 233.1,
        end: 262.3,
        hero: "OCT 2022 BIS RULES · APR 2025 $5.5B CHARGE · MAY 2026 ZERO DELIVERIES stamps · US→CN corridor arc labels",
      },
      {
        id: "fallout",
        title: "The Cost, Cash",
        line: "On November ninth, NVIDIA fell about four-point-three percent — one hundred ninety billion dollars, in a day.",
        start: 262.3,
        end: 288.7,
        hero: "NOVEMBER 9, 2026 typewriter · drawn cliff-line stock chart · $178.67 stamp · KISTENMACHER v. NVIDIA note card (disclosure claims only — captioned as such)",
      },
      {
        id: "wall",
        title: "What We Actually Know",
        line: "Confirmed. Reported. Unknown. The evidence does not let anyone say honey trap as a fact. It lets everyone ask the question.",
        start: 288.7,
        end: 315.1,
        hero: "three-panel evidence wall: CONFIRMED / REPORTED / UNKNOWN",
      },
      {
        id: "question",
        title: "Still Works?",
        line: "The oldest trick in history. Trust is the one system nobody has patched.",
        start: 315.1,
        end: 339.925,
        hero: "THE OLDEST TRICK IN THE HISTORY mask-up · STILL WORKS? red stamp · end-card strata: allegations notice + full sources/credits block",
      },
    ],
    audio: {
      vo: "Kokoro-82M local TTS (am_michael, calm professional male), word-anchored timings via whisper ASR; VO raised +9.5 dB (voGain 3.0) to the −14.5 LUFS house anchor",
      sfx: "Pencil scratches, paper drops, stamp thuds, camera whooshes — all code-synthesized",
      music: "Pyotr Ilyich Tchaikovsky — Symphony No. 6 in B minor, Op. 74 (Pathétique), IV. Finale (1893, public domain), recording (Musopen, PD/CC0), trimmed to length, faded, sidechain-ducked under the narration; audible from 0:00",
      musicCredit: "Tchaikovsky — Pathétique, IV (PD) · Musopen recording — PD, via musopen.org",
    },
    credits: [
      "Every frame composited by a canvas program — no AI-generated media (LAW 1)",
      "External source assets (LAW 9): Jensen Huang print (jh_2023.jpg — official portrait, Office of the President ROC, CC BY 2.0); Mata Hari print (public domain, Wikimedia Commons); Markus Wolf print (Bundesarchiv, Elke Schöps, 183-1989-1208-420, CC BY-SA 3.0 de); Monica Witt print (FBI — most wanted, public domain); constant ink-wash background plate (Song Nian, 清·松年, Met DP204810, CC0)",
      "Typography: Archivo Black · Noto Serif · Caveat · system display faces (OFL/Apache where external)",
      "VO: Kokoro-82M (Apache-2.0), local synthesis — no cloud voice services",
      "Score: Tchaikovsky — Symphony No. 6, Op. 74 (Pathétique), IV. Finale (PD) · Musopen recording (PD), trimmed, faded and sidechain-ducked under narration",
      "Rendered at 2560×1098 (21:9 class), 30 fps, 10,198 frames, chunk-encoded H.264",
      "Claim discipline: every factual claim traced in SOURCES.md / SOURCE_REGISTER.md; contested claims attributed on screen; no authority has found a honey trap — this film reports allegations, it does not assert guilt",
    ],
  },
];

export const featuredFilm = films[0];
