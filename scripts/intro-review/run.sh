#!/bin/sh
# Intro review: frame dump at 30 fps (t = 0 to 5.1), numeric checks, contact sheets.
# Needs the dev server running (pnpm run dev) and the global playwright-cli.
# Usage: pnpm run intro:review [base URL, default http://localhost:5173/]
set -eu

BASE_URL="${1:-http://localhost:5173/}"
REVIEW_DIR="$(pwd)/docs/review"
SESSION="intro-review"
SCRIPT_DIR="$(dirname "$0")"

rm -rf "$REVIEW_DIR/frames" && mkdir -p "$REVIEW_DIR/frames"
# run-code wraps the file in parentheses: drop the statement's trailing semicolon (Prettier adds it)
sed -e "s|__OUT_DIR__|$REVIEW_DIR|" -e "s|__BASE_URL__|$BASE_URL|" -e '$ s/;$//' \
    "$SCRIPT_DIR/dump-frames.js" > "$REVIEW_DIR/dump-frames.generated.js"

playwright-cli -s="$SESSION" open > /dev/null
playwright-cli -s="$SESSION" run-code --filename="$REVIEW_DIR/dump-frames.generated.js" \
    > "$REVIEW_DIR/checks.txt"
playwright-cli -s="$SESSION" close > /dev/null

sh "$SCRIPT_DIR/contact-sheets.sh" "$REVIEW_DIR"
# run-code prints the returned string JSON-escaped: unescape it for reading
sed -n '/### Result/,/### Ran/p' "$REVIEW_DIR/checks.txt" | sed -e 's/\\n/\n/g' -e 's/\\"/"/g' | sed '1d;$d'

if grep -q 'INTRO_CHECKS=FAILED' "$REVIEW_DIR/checks.txt"; then
    echo "Intro checks FAILED" >&2
    exit 1
fi
echo "Intro checks passed"
