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
    tagline: "An investigative documentary · 5:03 · one continuous, ever-varying camera move",
    description:
      "Twenty-five hundred years before the microchip, the King of Wu fell for the most expensive gift ever wrapped — Xi Shi, stratagem 31 of 36: the beauty trap. This film is the story of the week that trick came back: on November 8, 2026, Jensen Huang told his staff he had been unfaithful to his wife — and NVIDIA's board announced an independent investigation within hours. Every frame is drawn by a canvas program onto a paper world washed with a retiled ink-wash plate (Song Nian, 清·松年, Met DP204810, CC0): the drawn chip, the memo card, the money chain, the history wall — anchored by real licensed artifacts as physical prints (the Cleveland Museum's CC0 \"In the Palace\" handscroll beside Xi Shi; Mata Hari, PD; Markus Wolf, Bundesarchiv, CC BY-SA 3.0 de; Monica Witt, FBI wanted poster, PD; Huang himself, official portrait, Office of the President ROC, CC BY 2.0; NVIDIA HQ sign, Will Buckner, CC BY 2.0; Marina Bay, Benh LIEU SONG, CC BY-SA 4.0; White House, pteron60, CC BY 2.0; Great Hall of the People, IQRemix, CC BY-SA 2.0; Summit supercomputer, ORNL, CC BY 2.0; Jefferson Lab racks, PDM; NYSE floor, aherrero, CC BY-SA 2.0). Every contested claim is attributed on screen and in SOURCE_REGISTER.md; denied or unproven claims are labelled as such; no honourable audience is left believing the honey trap verdict has been reached by any authority.",
    videoUrl: "/film/003-the-oldest-trick-in-history.mp4",
    zipUrl: "",
    duration: 303.061,
    frames: 9092,
    width: 2560,
    height: 1098,
    fps: 30,
    codec: "H.264 + AAC",
    sizeMB: 360,
    captions: "/film/003-the-oldest-trick-in-history.en.srt",
    alternates: [
      { label: "16:9 paper-extension master (1920×1080)", url: "/film/003-the-oldest-trick-in-history-16x9.mp4", note: "same paper world and camera rail re-framed to a taller canvas — extra laid paper, no bars, no crop (LAW 4 safe at every pose)" },
      { label: "YouTube thumbnail (primary)", url: "/film/003-the-oldest-trick-in-history-thumb.png", note: "HONEY TRAP? — asked, not asserted; jh_2023 CC BY 2.0 portrait, grade-matched house paper print style (attribution in the video description)" },
      { label: "YouTube thumbnail (A/B variant)", url: "/film/003-the-oldest-trick-in-history-thumb-alt.png", note: "AN AFFAIR? / AN OPERATION? — same portrait, title question as handwriting" },
    ],
    scenes: [
      {
        id: "hook",
        title: "The Oldest Gift",
        line: "Twenty five hundred years before the microchip, the King of Wu fell for the most expensive gift ever wrapped. Stratagem thirty one of thirty six: the beauty trap.",
        start: 0,
        end: 25.34,
        hero: "WU–YUE date line · quote mask-up “THE MOST EXPENSIVE GIFT EVER WRAPPED.” · XI SHI + palace-scroll print (CMA 1976.1, CC0) · 美人計 brush stamp · WU PARTIES / YUE WINS",
      },
      {
        id: "stakes",
        title: "The Furnace",
        line: "NVIDIA is the most important chip company on earth — the five trillion dollar furnace the entire AI boom is welded to.",
        start: 25.34,
        end: 53.42,
        hero: "drawn chip 1993 · $4T JUL 2025 · $5T OCT 2025 stamps · HQ-sign print (CC BY 2.0) · jh_2023 print",
      },
      {
        id: "alice",
        title: "The Other Huang",
        line: "The woman at the center is Alice Huang. No relation. There is no public photograph of her that anyone can legally license, print, or screen grab.",
        start: 53.42,
        end: 74.88,
        hero: "ALICE HUANG typewriter · relationship diagram: two circles + ? · Marina Bay print (CC BY-SA 4.0) · NOT PICTURED redacted press-file card",
      },
      {
        id: "mss",
        title: "MSS — Reported",
        line: "Surveillance unmasked the contact — and identified Alice Huang as a suspected asset of China's Ministry of State Security. Alleged. Not charged. Not proven. But briefed.",
        start: 74.88,
        end: 109.24,
        hero: "MSS — REPORTED red stamp · illustrative memo card (labelled: no public memo exists) · White House print (CC BY 2.0) · RUBIO OVERSAW · SPRING 2026",
      },
      {
        id: "denials",
        title: "Both Sides on the Table",
        line: "Singapore says no such investigation exists. China called the reports groundless speculation, smears, slander. The CIA said nothing at all.",
        start: 109.24,
        end: 140.86,
        hero: "L/R ledger columns REPORTED vs DENIED · Great Hall print (CC BY-SA 2.0) · NO REASON TO BELIEVE stamp",
      },
      {
        id: "money",
        title: "The Money Trail",
        line: "Bloomberg traced at least four point eight billion dollars of NVIDIA chip flows through those companies between February twenty twenty four and February twenty twenty six.",
        start: 140.86,
        end: 171.8,
        hero: "$4.8B red stamp · MEGASPEED → SPEEDMATRIX chain cards · Summit supercomputer print (CC BY 2.0, ILLUSTRATIVE) · NORMAL AND NOT UNUSUAL · DEBUNKED LAST YEAR",
      },
      {
        id: "playbook",
        title: "The Playbook Ships",
        line: "Mata Hari was executed in nineteen seventeen. East Germany ran Romeo agents. Monica Witt walked away to Iran. Christine Fang cultivated politicians — then vanished.",
        start: 171.8,
        end: 213.36,
        hero: "spine timeline 1917→1950s–80s→2013→2011–15 with erosion · Mata Hari / Markus Wolf / Monica Witt prints · FANG note card · Jefferson Lab racks transit print (PDM) · ACCESS · INTIMACY · LEVERAGE",
      },
      {
        id: "washington",
        title: "Why Washington Cares",
        line: "In October twenty twenty two, export controls turned advanced AI chips into weapons grade hardware. Suddenly, a CEO's personal life is a customs checkpoint.",
        start: 213.36,
        end: 238.68,
        hero: "OCT 2022 BIS RULES · APR 2025 $5.5B CHARGE · MAY 2026 ZERO DELIVERIES stamps · US→CN corridor arc labels",
      },
      {
        id: "fallout",
        title: "The Cost, Cash",
        line: "November ninth: NVIDIA dropped four point three percent — roughly one hundred ninety billion dollars in value, deleted before lunch.",
        start: 238.68,
        end: 262.56,
        hero: "NOVEMBER 9, 2026 typewriter · drawn cliff-line stock chart · NYSE floor print (CC BY-SA 2.0) · $178.67 stamp · KISTENMACHER v. NVIDIA note card (disclosure claims only)",
      },
      {
        id: "wall",
        title: "What We Actually Know",
        line: "Confirmed: he admitted the affair. Reported: the MSS link, the memo, the briefing. Denied: Beijing. Singapore. Unknown: whether this was an operation at all.",
        start: 262.56,
        end: 282.28,
        hero: "three-panel evidence wall: CONFIRMED / REPORTED / UNKNOWN",
      },
      {
        id: "question",
        title: "Still Works?",
        line: "Maybe it was love. Maybe it was tradecraft. Maybe it was both. Trust has always been the cheapest door to kick in. And it has never been patched.",
        start: 282.28,
        end: 303.061,
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
      "External source assets (LAW 9): \"In the Palace\" handscroll print (CMA 1976.1, CC0); Jensen Huang print (jh_2023.jpg — official portrait, Office of the President ROC, CC BY 2.0); NVIDIA HQ sign (Will Buckner, CC BY 2.0); Marina Bay dusk (Benh LIEU SONG, CC BY-SA 4.0); White House (pteron60, CC BY 2.0); Great Hall of the People (IQRemix, CC BY-SA 2.0); Summit supercomputer (ORNL, CC BY 2.0); Jefferson Lab data-center racks (PDM); NYSE floor (aherrero, CC BY-SA 2.0); Mata Hari print (public domain, Wikimedia Commons); Markus Wolf print (Bundesarchiv, Elke Schöps, 183-1989-1208-420, CC BY-SA 3.0 de); Monica Witt print (FBI — most wanted, public domain); retiled ink-wash background plate (Song Nian, 清·松年, Met DP204810, CC0)",
      "Typography: Archivo Black · Anton · Noto Serif · Caveat · Liu Jian Mao Cao (美人計 brush glyphs) — OFL/Apache where external",
      "VO: Kokoro-82M (Apache-2.0), local synthesis — no cloud voice services",
      "Score: Tchaikovsky — Symphony No. 6, Op. 74 (Pathétique), IV. Finale (PD) · Musopen recording (PD), trimmed, faded and sidechain-ducked under narration",
      "Rendered at 2560×1098 (21:9 class), 30 fps, 9,092 frames, chunk-encoded H.264",
      "Claim discipline: every factual claim traced in SOURCES.md / SOURCE_REGISTER.md; contested claims attributed on screen; no authority has found a honey trap — this film reports allegations, it does not assert guilt",
    ],
  },
];

export const featuredFilm = films[0];
