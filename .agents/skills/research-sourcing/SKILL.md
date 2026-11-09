---
name: research-sourcing
description: The agentic real-source research workflow for documentary VO and claims — every factual line in a script is traced to primary, verifiable sources BEFORE writing or rendering. Covers the claim ledger (SOURCES.md), source hierarchy (.gov/institutions/peer-reviewed → journalism last), the ≥2-sources rule for contested numbers, tooling (agent-browser, get-image, clips.mjs), pre-render fact-check gates, on-screen citations, and projects/<slug>/SOURCES.md discipline. Use whenever a film makes factual claims (history, science, health, geography), when writing PROJECT.md briefs/BEATS, or when auditing a script before render. Never fabricate sources; unverifiable claims get cut, hedged, or flagged — never shipped as fact.
---

# Real-Source Research Workflow (documentary-grade)

The rule: **no unsourced claim reaches the timeline.** A documentary VO is an argument; every link in the chain must hold. This is the workflow; `SOURCES.md` (per project) is the artifact.

## 0 · The claim ledger — `SOURCES.md`
Every project that asserts facts keeps one. Table:

| # | Claim (verbatim VO line) | Source | Publisher | Accessed | Quote/timestamp | Confidence |
|---|--------------------------|--------|-----------|----------|-----------------|------------|
| 1 | "Goats and sheep came first, around nine thousand BC" | `https://…` (primary) | Smithsonian / .gov | 2026-11-09 | "…domesticated ~8500 BC…" | high |
| 2 | "Lactase persistence spread…" | `https://…` DOI | Nature/PNAS | 2026-11-09 | fig 2 | high |

Confidence: **high** (2+ independent primary sources agree) · **medium** (single strong source) · **low** (conflicting/weak — cut or hedge on-screen) · **rejected** (unverifiable — removed).

## 1 · Source hierarchy (what counts as real)
1. **Primary/institutional**: US federal (NASA, USGS, NOAA, LoC, NARA, CDC, Smithsonian), national museums, university archives, national archives of other countries, intergovernmental bodies (UN, UNESCO, WHO, FAO, World Bank).
2. **Peer-reviewed**: journals & preprints with DOI (Nature, Science, PNAS, eLife, Antiquity); verify author/institution/date.
3. **Primary data**: datasets cited directly (Natural Earth, OSM/Overture, US Census, World Bank).
4. **Reputable journalism** — only for recent events; trace to the primary they cite.
5. **Wikipedia/blogs/social** — leads only; always follow to the primary citation at the foot of the article. Never cite as sole source.
6. **AI-generated summaries** — never a source. Ever. (LAW 1 for media; this is the same law for facts.)

## 2 · The agentic loop
1. **Seed** — from the brief (PROJECT.md), list every factual claim the VO will need. Include numbers, dates, names, causal claims ("X caused Y"), superlatives ("first/oldest/largest").
2. **Fetch** — use `agent-browser` to open candidate pages, `get-image` to locate archives, `clips.mjs` if the claim involves media we'll show. Read the actual page — never trust a snippet.
3. **Ledger** — fill `SOURCES.md`. Quote the exact supporting sentence. If two sources disagree, both go in; confidence = low; the script hedges or cuts.
4. **Write only from the ledger** — VO pass: each sentence maps to ledger rows (cite `[#n]` in the BEATS.md narration column for contested claims).
5. **Pre-render fact-check gate** — re-read the finished VO line-by-line against the ledger. Any line without a green row is cut, hedged ("researchers estimate…", "written sources say…"), or re-timed. **No render starts on a failing gate.**
6. **Post-render audit** — spot-check three random claims on the final video; confirm on-screen text (dates/names) matches the ledger. Discrepancy = re-render the offending beat.

## 3 · On-screen citation practice (when to show sources)
- Essay films with contested numbers: a 1.5 s small Noto Serif footnote card per claim block is enough (`SOURCES.md` # → short URL shown).
- Always in the tail/end-card: full source list for anything an audience could contest.
- Museum/archive images in frame already carry license credit (LAW 1) — separate line from fact-sources; don't merge them.

## 4 · Hard prohibitions
- No invented citations, DOIs, URLs, or quotes. If you can't find it, it doesn't exist for this film.
- No single-source superlatives ("the oldest…") shipped as fact — cut or attribute ("claimed to be").
- No "facts" from memory. Memory proposes; the ledger disposes.
- No laundering press releases into peer-reviewed findings.
- No citing the film's own prior beats as sources (self-citation).

## 5 · Repo integration
- `templates/project/SOURCES.md` — scaffold (ledger template); `new.sh` echoes it.
- `BEATS.md` narration cells may carry `[#n]` refs — the creative contract stays readable.
- Definition of Done: claim ledger green before first render (AGENTS.md §6).
- Tooling: `.agents/skills/get-image` (finding archives), `.agents/skills/agent-browser` (reading pages), `studio/engine/clips.mjs` (media for shown-facts).

## 6 · 10-minute claim hygiene checklist (per film)
- [ ] Every number/date in VO has a ledger row with a URL you opened today
- [ ] Contested claims: ≥2 independent sources or hedged on-screen
- [ ] No confidence:low claims stated as fact without hedge
- [ ] End-card/tail carries the source list
- [ ] Media rows in `assets-credits.csv` are separate from fact rows (both exist)
