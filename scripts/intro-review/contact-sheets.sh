#!/bin/sh
# Builds 4×5 contact sheets (20 frames each) from docs/review/frames, like the reference storyboard,
# plus one sheet sampled at the storyboard's own moments. Needs ffmpeg (Homebrew build: no drawtext,
# so the page burns the timestamps into the frames itself).
set -eu

REVIEW_DIR="${1:-docs/review}"
FRAMES_DIR="$REVIEW_DIR/frames"
FRAMES_PER_SECOND=30
SHEET_FILTER="scale=480:-1,tile=4x5:padding=6:margin=6:color=black"

rm -f "$REVIEW_DIR"/sheet-*.png "$REVIEW_DIR"/storyboard-aligned.png

# Every frame, 20 per sheet
ffmpeg -v error -y -framerate "$FRAMES_PER_SECOND" -i "$FRAMES_DIR/%04d.png" \
    -vf "$SHEET_FILTER" -fps_mode passthrough "$REVIEW_DIR/sheet-%02d.png"

# The storyboard's 20 clip times (action from 0.75 s to 4.5 s), mapped onto the 4.0 s intro
ALIGNED_DIR="$REVIEW_DIR/aligned"
rm -rf "$ALIGNED_DIR" && mkdir -p "$ALIGNED_DIR"
index=0
for clip_seconds in 0.875 1.0 1.125 1.375 1.5 1.625 1.75 1.875 2.0 2.25 2.5 2.75 3.0 3.125 3.375 3.625 3.875 4.125 4.375 4.5; do
    frame=$(awk -v clip="$clip_seconds" -v fps="$FRAMES_PER_SECOND" \
        'BEGIN { printf "%04d", int((clip - 0.75) * 4 / 3.75 * fps + 0.5) }')
    cp "$FRAMES_DIR/$frame.png" "$ALIGNED_DIR/$(printf '%04d' "$index").png"
    index=$((index + 1))
done
ffmpeg -v error -y -i "$ALIGNED_DIR/%04d.png" -vf "$SHEET_FILTER" -frames:v 1 \
    "$REVIEW_DIR/storyboard-aligned.png"

echo "Contact sheets in $REVIEW_DIR"
