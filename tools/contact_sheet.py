#!/usr/bin/env python3
"""Per-scene comparison contact sheets: for every scene of src/timeline.json,
N instants (evenly spread + listed events), each shown as
[reference | reconstruction] at 480x270, with the frame number.

  python tools/contact_sheet.py [reference.mp4] [reconstruction.mp4] [--per-scene 4]

Writes docs/analysis/contact_sheets/<scene>.jpg (small JPEGs, versioned).
"""
import os, sys, json, subprocess
import numpy as np, cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ref = args[0] if len(args) > 0 else os.path.join(ROOT, 'reference', 'lemlist_1080p.mp4')
rec = args[1] if len(args) > 1 else os.path.join(ROOT, 'renders', 'lemlist_reconstruction.mp4')
per = int(sys.argv[sys.argv.index('--per-scene') + 1]) if '--per-scene' in sys.argv else 4
out = os.path.join(ROOT, 'docs', 'analysis', 'contact_sheets')
os.makedirs(out, exist_ok=True)
W, H = 480, 270

def grab(path, frames):
    sel = '+'.join('eq(n\\,%d)' % f for f in frames)
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f"select='{sel}',scale={W}:{H}:flags=area", '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True, check=True)
    a = np.frombuffer(p.stdout, np.uint8)
    return a.reshape(-1, H, W, 3)

tl = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
for s in tl['scenes']:
    a, b = s['in'], s['out'] - 1
    fr = sorted(set([int(round(a + (b - a) * k / max(per - 1, 1))) for k in range(per)] + [v for v in s.get('events', {}).values() if a <= v <= b][:4]))
    A, B = grab(ref, fr), grab(rec, fr)
    rows = []
    for i, f in enumerate(fr):
        row = np.concatenate([A[i], np.full((H, 6, 3), 30, np.uint8), B[i]], axis=1)
        cv2.putText(row, 'f%d  ref | recon' % f, (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv2.LINE_AA)
        rows.append(row); rows.append(np.full((6, row.shape[1], 3), 30, np.uint8))
    img = np.concatenate(rows[:-1], axis=0)
    cv2.imwrite(os.path.join(out, '%s.jpg' % s['id']), img, [cv2.IMWRITE_JPEG_QUALITY, 72])
    print(s['id'], fr)
