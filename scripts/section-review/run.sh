#!/bin/sh
# Section review: screenshots with the canvas visible of the hero and each section centred, at
# desktop and mobile sizes, plus Skills in French (the longest title), and a contact sheet per
# viewport. Needs the dev server running (pnpm run dev), the global playwright-cli and ffmpeg.
# Usage: pnpm run sections:review <step name> [base URL, default http://localhost:5173/]
set -eu

STEP="${1:?usage: sections:review <step name> [base URL]}"
BASE_URL="${2:-http://localhost:5173/}"
REVIEW_DIR="$(pwd)/docs/review/sections"
OUT_DIR="$REVIEW_DIR/$STEP"
SESSION="section-review"
SCRIPT_DIR="$(dirname "$0")"

rm -rf "$OUT_DIR" && mkdir -p "$OUT_DIR"
# run-code wraps the file in parentheses: drop the statement's trailing semicolon (Prettier adds it)
sed -e "s|__OUT_DIR__|$OUT_DIR|" -e "s|__BASE_URL__|$BASE_URL|" -e '$ s/;$//' \
    "$SCRIPT_DIR/shoot.js" > "$REVIEW_DIR/shoot.generated.js"

playwright-cli -s="$SESSION" open > /dev/null
playwright-cli -s="$SESSION" run-code --filename="$REVIEW_DIR/shoot.generated.js" \
    > "$OUT_DIR/result.txt"
playwright-cli -s="$SESSION" close > /dev/null

if ! grep -q 'SECTION_SHOTS=DONE' "$OUT_DIR/result.txt"; then
    cat "$OUT_DIR/result.txt" >&2
    exit 1
fi

for viewport in desktop mobile; do
    ffmpeg -v error -y -pattern_type glob -i "$OUT_DIR/$viewport-*.png" \
        -vf "scale=480:-1,tile=7x1:padding=6:margin=6:color=black" -frames:v 1 \
        "$OUT_DIR/sheet-$viewport.png"
done
echo "Screenshots and contact sheets in $OUT_DIR"
