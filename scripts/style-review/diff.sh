#!/bin/sh
# Percentage of pixels that differ (any channel by more than THRESHOLD/255) between two folders of
# screenshots. Writes <name>.diff.png next to the current image when it exceeds MAX_PERCENT.
# Usage: sh diff.sh <baseline dir> <current dir>
set -eu

BASELINE_DIR="$1"
CURRENT_DIR="$2"
THRESHOLD=2
MAX_PERCENT=0.5
DIFF_FILTER="[0:v]format=gbrp[a];[1:v]format=gbrp[b];[a][b]blend=all_mode=difference,format=gray,lut=c0='if(gt(val,$THRESHOLD),255,0)'"

for baseline in "$BASELINE_DIR"/*.png; do
    name="$(basename "$baseline" .png)"
    current="$CURRENT_DIR/$name.png"
    mean="$(ffmpeg -v error -i "$baseline" -i "$current" \
        -filter_complex "$DIFF_FILTER,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" \
        -f null - | sed -n 's/.*YAVG=//p')"
    percent="$(echo "$mean" | awk '{ printf "%.3f", $1 / 255 * 100 }')"
    flag=""
    if awk -v p="$percent" -v max="$MAX_PERCENT" 'BEGIN { exit !(p > max) }'; then
        ffmpeg -v error -y -i "$baseline" -i "$current" -filter_complex "$DIFF_FILTER" \
            -frames:v 1 "$CURRENT_DIR/$name.diff.png"
        flag="  <-- above $MAX_PERCENT%, see $CURRENT_DIR/$name.diff.png"
    fi
    echo "$name: $percent%$flag"
done
