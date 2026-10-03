#!/usr/bin/env bash
# Extract every frame of the reference video (native 60 fps) for analysis /
# comparison. Frames are indexed from 0: reference/frames/f00000.jpg = t 0 s,
# fNNNNN.jpg = t NNNNN/60 s. ~200 MB, git-ignored.
#
#   ./scripts/extract-reference.sh [path/to/lemlist_1080p.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="${1:-reference/lemlist_1080p.mp4}"
mkdir -p reference/frames
if [ "$SRC" != "reference/lemlist_1080p.mp4" ]; then cp "$SRC" reference/lemlist_1080p.mp4; fi
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels -of compact reference/lemlist_1080p.mp4
ffmpeg -v error -y -i reference/lemlist_1080p.mp4 -vsync 0 -q:v 2 -start_number 0 reference/frames/f%05d.jpg
echo "$(ls reference/frames | wc -l) frames in reference/frames"
