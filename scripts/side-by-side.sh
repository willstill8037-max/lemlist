#!/usr/bin/env bash
# Builds renders/compare_side_by_side.mp4: reference (left) | reconstruction
# (right), 1920x540, 60 fps, with frame numbers burnt in, and the source audio.
#
#   ./scripts/side-by-side.sh [reference.mp4] [reconstruction.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
REF="${1:-reference/lemlist_1080p.mp4}"
REC="${2:-renders/lemlist_reconstruction.mp4}"
FONT="$(fc-match -f '%{file}' 'DejaVu Sans Mono' 2>/dev/null || true)"
DT="drawtext=fontfile='${FONT}':fontsize=22:fontcolor=white:box=1:boxcolor=black@0.55:x=10:y=10"
ffmpeg -v error -y -i "$REF" -i "$REC" -filter_complex \
  "[0:v]scale=960:540:flags=area,${DT}:text='REFERENCE  f%{frame_num}'[a];\
   [1:v]scale=960:540:flags=area,${DT}:text='RECONSTRUCTION  f%{frame_num}'[b];\
   [a][b]hstack=inputs=2,format=yuv420p[v]" \
  -map '[v]' -map 0:a -c:v libx264 -preset slow -crf 23 -c:a copy -r 60 -movflags +faststart renders/compare_side_by_side.mp4
ls -la renders/compare_side_by_side.mp4
