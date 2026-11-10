export type FilmScene = {
  id: string;
  title: string;
  line: string;
  start: number;
  end: number;
  hero: string;
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
    tagline: "A code-drawn documentary · 24.6 seconds · one continuous camera move",
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
    sizeMB: 18.0,
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
      "External source assets (LAW 9): Qing-dynasty ink cake print (Cleveland Museum of Art, CC0 1.0); Gutenberg Bible leaf print (Harry Ransom Center scan, PD); constant ink-wash background plate (John Webber, Kealakekua Bay, 1779 — Honolulu Academy of Arts scan, PD)",
      "VO: Kokoro-82M (Apache-2.0), local synthesis — no cloud voice services",
      "Score: Satie, Gymnopédie No. 1 — CC0 recording, ducked under narration",
      "Rendered at 1920×822 (test-resolution 21:9 class), 30 fps, 739 frames, chunk-encoded H.264",
    ],
  },
];

export const featuredFilm = films[0];
