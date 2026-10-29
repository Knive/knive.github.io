#!/bin/sh
# Scene review: screenshots of the hero and each section centred, the framing numbers from
# window.__scene.measure() (trees, ground, moon, dagger) at four viewports, and the frame cost of
# the hidden scenery. Needs the dev server running (pnpm run dev), the global playwright-cli and ffmpeg.
# Usage: pnpm run scene:review [base URL, default http://localhost:5173/]
set -eu

BASE_URL="${1:-http://localhost:5173/}"
REVIEW_DIR="$(pwd)/docs/review/scene"
SESSION="scene-review"
SCRIPT_DIR="$(dirname "$0")"

rm -rf "$REVIEW_DIR" && mkdir -p "$REVIEW_DIR"
# run-code wraps the file in parentheses: drop the statement's trailing semicolon (Prettier adds it)
sed -e "s|__OUT_DIR__|$REVIEW_DIR|" -e "s|__BASE_URL__|$BASE_URL|" -e '$ s/;$//' \
    "$SCRIPT_DIR/shoot.js" > "$REVIEW_DIR/shoot.generated.js"

playwright-cli -s="$SESSION" open > /dev/null
playwright-cli -s="$SESSION" run-code --filename="$REVIEW_DIR/shoot.generated.js" \
    > "$REVIEW_DIR/result.txt"
playwright-cli -s="$SESSION" close > /dev/null

if ! grep -q 'SCENE_REVIEW=DONE' "$REVIEW_DIR/result.txt"; then
    cat "$REVIEW_DIR/result.txt" >&2
    exit 1
fi
# run-code returns the text as a JSON string: print it with real line breaks
sed -n '2p' "$REVIEW_DIR/result.txt" | sed -e 's/^"//' -e 's/"$//' -e 's/\\n/\n/g' | grep -v SCENE_REVIEW

for viewport in desktop mobile; do
    ffmpeg -v error -y -pattern_type glob -i "$REVIEW_DIR/$viewport-*.png" \
        -vf "scale=480:-1,tile=6x1:padding=6:margin=6:color=black" -frames:v 1 \
        "$REVIEW_DIR/sheet-$viewport.png"
done
echo "Screenshots and contact sheets in $REVIEW_DIR"
