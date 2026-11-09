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
 * Site manifest — the screening room renders every film from here.
 * Film #002 appears by adding one entry (slug must match public/film/<slug>.mp4).
 */
export const films: Film[] = [
  {
    slug: "the-bravest-snack-in-history",
    title: "The Bravest Snack in History",
    tagline: "A code-drawn documentary · 32.5 seconds · one continuous camera move",
    description:
      "Ten thousand years ago, a starving hunter met a wild cow — and humanity got its bravest snack. Every frame of this film is drawn by a canvas program onto a 20,000px paper world: prints drop in like physical photographs, ink draws itself, a line-art cow walks the baseline, and the camera never stops moving.",
    videoUrl: "/film/the-bravest-snack-in-history.mp4",
    zipUrl: "/bravest-snack-project.zip",
    duration: 32.533,
    frames: 976,
    width: 3840,
    height: 1646,
    fps: 30,
    codec: "H.264 + AAC",
    sizeMB: 80,
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
      "Every frame drawn by a canvas program — no AI video, no stock footage",
      "Photos enter as physical prints: PD lithograph (aurochs), Unsplash ×2, Pexels ×2",
      "Score: Erik Satie, Gymnopédie No. 1 — CC0 recording, ducked under narration",
      "Rendered at 3840×1646 (21:9), 30 fps, 976 frames, chunk-encoded H.264",
    ],
  },
];

export const featuredFilm = films[0];
