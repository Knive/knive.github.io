#!/bin/sh
# Style review: HTML-layer screenshots (canvas hidden) of the hero and each section, then a pixel
# diff against the baseline. Needs the dev server running (pnpm run dev), the global playwright-cli
# and ffmpeg.
# Usage: pnpm run style:review baseline|current [base URL, default http://localhost:5173/]
set -eu

TARGET="${1:?usage: style:review baseline|current [base URL]}"
BASE_URL="${2:-http://localhost:5173/}"
REVIEW_DIR="$(pwd)/docs/review/style"
OUT_DIR="$REVIEW_DIR/$TARGET"
SESSION="style-review"
SCRIPT_DIR="$(dirname "$0")"

rm -rf "$OUT_DIR" && mkdir -p "$OUT_DIR"
# run-code wraps the file in parentheses: drop the statement's trailing semicolon (Prettier adds it)
sed -e "s|__OUT_DIR__|$OUT_DIR|" -e "s|__BASE_URL__|$BASE_URL|" -e '$ s/;$//' \
    "$SCRIPT_DIR/shoot.js" > "$REVIEW_DIR/shoot.generated.js"

playwright-cli -s="$SESSION" open > /dev/null
playwright-cli -s="$SESSION" run-code --filename="$REVIEW_DIR/shoot.generated.js" \
    > "$REVIEW_DIR/result.txt"
playwright-cli -s="$SESSION" close > /dev/null

if ! grep -q 'STYLE_SHOTS=DONE' "$REVIEW_DIR/result.txt"; then
    cat "$REVIEW_DIR/result.txt" >&2
    exit 1
fi

if [ "$TARGET" != baseline ]; then
    sh "$SCRIPT_DIR/diff.sh" "$REVIEW_DIR/baseline" "$OUT_DIR"
fi
