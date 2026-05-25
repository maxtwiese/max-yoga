#!/usr/bin/env bash
# Regenerate web-ready WebPs from originals in img/objects/.
#
# Source:  img/objects/*.{png,jpeg,jpg}   (gitignored; live locally only)
# Output:  img/web/*.webp                 (committed to the repo)
#
# Usage:   ./scripts/optimize-images.sh [filename]
#          ./scripts/optimize-images.sh            # processes everything
#          ./scripts/optimize-images.sh iris       # only iris.{png,jpeg,jpg}
#
# Requires: cwebp (Homebrew: `brew install webp`)

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v cwebp >/dev/null 2>&1; then
  echo "error: cwebp not found. install with: brew install webp" >&2
  exit 1
fi

mkdir -p img/web

# WebP at q=82 with alpha_q=90 is a sweet spot for photographic cutouts —
# small files (~100–250 KB at 1200px) and clean edges.
QUALITY=82
ALPHA_Q=90
MAX_EDGE=1200

process() {
  local src="$1"
  local name="${src##*/}"
  name="${name%.*}"
  local dst="img/web/${name}.webp"
  cwebp -q "$QUALITY" -alpha_q "$ALPHA_Q" -m 6 \
        -resize "$MAX_EDGE" 0 -mt -quiet \
        "$src" -o "$dst"
  printf "  %-44s  %s\n" "$name.webp" "$(ls -lh "$dst" | awk '{print $5}')"
}

filter="${1:-}"

if [ -n "$filter" ]; then
  base="${filter%.*}"
  src=""
  for ext in png jpeg jpg; do
    if [ -f "img/objects/${base}.${ext}" ]; then
      src="img/objects/${base}.${ext}"
      break
    fi
  done
  [ -n "$src" ] || { echo "not found: $filter"; exit 1; }
  echo "Processing: $src"
  process "$src"
else
  echo "Processing all originals →"
  shopt -s nullglob
  for f in img/objects/*.png img/objects/*.jpeg img/objects/*.jpg; do
    process "$f"
  done
fi

echo "done."
