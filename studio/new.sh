#!/usr/bin/env bash
# new.sh — scaffold the next film project from templates/project.
#   bash studio/new.sh <slug> "<Title>"
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STUDIO="$ROOT/studio"

slug="${1:-}"
title="${2:-}"

if [[ -z "$slug" || -z "$title" ]]; then
  echo "usage: bash studio/new.sh <slug> \"<Title>\"" >&2
  exit 2
fi

# slug must be lowercase-kebab
if ! [[ "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "error: slug must be lowercase-kebab (a-z, 0-9, dashes): got '$slug'" >&2
  exit 1
fi

# next project number
n=1
while compgen -G "$STUDIO/projects/$(printf '%03d' "$n")-*" > /dev/null; do
  n=$((n + 1))
done
num="$(printf '%03d' "$n")"
dest="$STUDIO/projects/${num}-${slug}"

if [[ -e "$dest" ]]; then
  echo "error: $dest already exists" >&2
  exit 1
fi

mkdir -p "$dest/assets/music" "$dest/assets/clips" "$dest/out" "$dest/frames"
# copy template files (all files under template, preserving relative dirs)
( cd "$STUDIO/templates/project" && find . -type f -print0 | while IFS= read -r -d '' f; do
    mkdir -p "$dest/$(dirname "$f")"
    cp "$f" "$dest/$f"
  done )

# stamp slug + title into the copies (build.mjs slug, PROJECT.md title)
sed -i "s/NNN-your-slug/${num}-${slug}/" "$dest/build.mjs"
sed -i "s/NNN — <Title>/${num} — ${title}/" "$dest/PROJECT.md"
sed -i "s/<Title>/${title}/g" "$dest/BEATS.md"

echo "scaffolded: $dest"
echo
echo "next steps:"
echo "  cd $dest"
echo "  1. write the brief in PROJECT.md"
echo "  2. research claims → SOURCES.md ledger (.agents/skills/research-sourcing) BEFORE writing the VO"
echo "  2b. add narration + anchors: assets/vo.m4a  assets/timings.json   (LAW 2: duration = VO)"
echo "  3. fill BEATS.md (the creative contract) and timings.mjs (single clock)"
echo "  4. (optional) source licensed media (LAW 1): bun ../../engine/clips.mjs search commons \"query\""
echo "     fetch: bun ../../engine/clips.mjs fetch commons <File|url> --project ${num}-${slug} --id 20"
echo "     review license, append csvRow to assets/assets-credits.csv (LAW 1: props/plates/B-roll, grade-matched, never raw)"
echo "  5. draw world.mjs → score sfx-plan.mjs (same clock T)"
echo "  6. QC stills + safearea sweep, then the LAW 14 gate: bun build.mjs --preview"
echo "     present sheet + preview, wait for explicit user OK, then bun build.mjs --yes"
echo "  7. FINAL-FILE LAW probe, fill synopsis.txt (contributors + sources with links), update src/lib/films.ts, commit"
