#!/bin/sh
# Moon texture: paints the 2048 px master in headless Chromium (paint.js), then exports the
# 1024 px WebP the scene loads. Needs the global playwright-cli and cwebp.
# Usage: sh scripts/moon-texture/run.sh
set -eu

MASTER_DIR="$(pwd)/docs/review/moon"
MASTER_FILE="$MASTER_DIR/moon-2048.png"
OUTPUT_FILE="$(pwd)/public/textures/moon.webp"
SESSION="moon-texture"
SCRIPT_DIR="$(dirname "$0")"

mkdir -p "$MASTER_DIR" "$(dirname "$OUTPUT_FILE")"
# run-code wraps the file in parentheses: drop the statement's trailing semicolon (Prettier adds it)
sed -e "s|__OUT_FILE__|$MASTER_FILE|" -e '$ s/;$//' "$SCRIPT_DIR/paint.js" \
    > "$MASTER_DIR/paint.generated.js"

playwright-cli -s="$SESSION" open > /dev/null
playwright-cli -s="$SESSION" run-code --filename="$MASTER_DIR/paint.generated.js" \
    > "$MASTER_DIR/result.txt"
playwright-cli -s="$SESSION" close > /dev/null

if ! grep -q 'MOON_TEXTURE=DONE' "$MASTER_DIR/result.txt"; then
    cat "$MASTER_DIR/result.txt" >&2
    exit 1
fi
cwebp -quiet -resize 1024 1024 -q 90 -alpha_q 100 "$MASTER_FILE" -o "$OUTPUT_FILE"
echo "Master: $MASTER_FILE"
echo "Texture: $OUTPUT_FILE ($(du -h "$OUTPUT_FILE" | cut -f1))"
