#!/bin/sh
# Scroll review: ground slide frames and one real-time frame dump per section transition,
# each tiled into a contact sheet. Needs the dev server running (pnpm run dev),
# the global playwright-cli and ffmpeg.
# Usage: pnpm run scroll:review [base URL, default http://localhost:5173/]
set -eu

BASE_URL="${1:-http://localhost:5173/}"
REVIEW_DIR="$(pwd)/docs/review/scroll"
SESSION="scroll-review"
SCRIPT_DIR="$(dirname "$0")"
SHEET_FILTER="scale=480:-1,tile=4x4:padding=6:margin=6:color=black"

rm -rf "$REVIEW_DIR" && mkdir -p "$REVIEW_DIR"
for name in ground experience skills projects education contact; do
    mkdir -p "$REVIEW_DIR/$name"
done
# run-code wraps the file in parentheses: drop the statement's trailing semicolon (Prettier adds it)
sed -e "s|__OUT_DIR__|$REVIEW_DIR|" -e "s|__BASE_URL__|$BASE_URL|" -e '$ s/;$//' \
    "$SCRIPT_DIR/dump-frames.js" > "$REVIEW_DIR/dump-frames.generated.js"

playwright-cli -s="$SESSION" open > /dev/null
playwright-cli -s="$SESSION" run-code --filename="$REVIEW_DIR/dump-frames.generated.js" \
    > "$REVIEW_DIR/result.txt"
playwright-cli -s="$SESSION" close > /dev/null

for name in ground experience skills projects education contact; do
    ffmpeg -v error -y -i "$REVIEW_DIR/$name/%04d.png" -vf "$SHEET_FILTER" -frames:v 1 \
        "$REVIEW_DIR/sheet-$name.png"
done

if ! grep -q 'SCROLL_FRAMES=DONE' "$REVIEW_DIR/result.txt"; then
    cat "$REVIEW_DIR/result.txt" >&2
    exit 1
fi
echo "Contact sheets in $REVIEW_DIR"
