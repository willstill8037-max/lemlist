#!/usr/bin/env python3
"""Frame-by-frame metrics between the reference video and the reconstruction.

  python tools/fidelity_metrics.py [reference.mp4] [reconstruction.mp4]

Writes docs/analysis/fidelity_per_frame.csv (frame, MAE 0-255, PSNR dB,
edge-IoU) and docs/analysis/fidelity_per_scene.csv + fidelity_curve.png.
MAE/PSNR are computed on 480x270 downscales (fast, robust to sub-pixel
offsets); edge-IoU compares Canny edge maps (dilated 2 px) at 960x540 and is a
better proxy for "is the text/shape in the same place" than MAE, which is
dominated by large flat backgrounds. Neither replaces looking at the frames.
"""
import os, sys, json, subprocess
import numpy as np, cv2
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ref = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'reference', 'lemlist_1080p.mp4')
rec = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'renders', 'lemlist_reconstruction.mp4')
out = os.path.join(ROOT, 'docs', 'analysis')

def frames(path, w, h):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    n = w * h * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3)

def edges(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    e = cv2.Canny(g, 40, 110)
    return cv2.dilate(e, np.ones((5, 5), np.uint8)) > 0

rows = []
for i, (a, b) in enumerate(zip(frames(ref, 960, 540), frames(rec, 960, 540))):
    sa, sb = cv2.resize(a, (480, 270), interpolation=cv2.INTER_AREA).astype(np.float32), cv2.resize(b, (480, 270), interpolation=cv2.INTER_AREA).astype(np.float32)
    mae = float(np.abs(sa - sb).mean())
    mse = float(((sa - sb) ** 2).mean()); psnr = 99.0 if mse == 0 else 10 * np.log10(255 ** 2 / mse)
    ea, eb = edges(a), edges(b)
    u = (ea | eb).sum(); iou = float((ea & eb).sum() / u) if u else 1.0
    rows.append((i, mae, psnr, iou))
rows = np.array(rows)
np.savetxt(os.path.join(out, 'fidelity_per_frame.csv'), rows, delimiter=',', fmt=['%d', '%.2f', '%.2f', '%.3f'], header='frame,mae,psnr_db,edge_iou', comments='')
tl = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
with open(os.path.join(out, 'fidelity_per_scene.csv'), 'w') as fh:
    fh.write('scene,in,out,title,mean_mae,median_psnr_db,mean_edge_iou,worst_frame,worst_mae\n')
    for s in tl['scenes']:
        m = (rows[:, 0] >= s['in']) & (rows[:, 0] < s['out'])
        if not m.any(): continue
        r = rows[m]; w = r[np.argmax(r[:, 1])]
        fh.write('%s,%d,%d,"%s",%.2f,%.2f,%.3f,%d,%.2f\n' % (s['id'], s['in'], s['out'], s['title'], r[:, 1].mean(), np.median(r[:, 2]), r[:, 3].mean(), w[0], w[1]))
fig, ax = plt.subplots(2, 1, figsize=(24, 7), sharex=True)
ax[0].plot(rows[:, 0], rows[:, 1], lw=0.6); ax[0].set_ylabel('MAE (0-255)')
ax[1].plot(rows[:, 0], rows[:, 3], lw=0.6, color='g'); ax[1].set_ylabel('edge IoU'); ax[1].set_xlabel('frame (60 fps)')
for s in tl['scenes']:
    for a_ in ax: a_.axvline(s['in'], color='r', lw=0.4, alpha=0.5)
    ax[0].text(s['in'] + 3, ax[0].get_ylim()[1] * 0.9, s['id'], fontsize=7)
plt.tight_layout(); plt.savefig(os.path.join(out, 'fidelity_curve.png'), dpi=60)
print('frames compared:', len(rows), '| mean MAE %.2f | median PSNR %.1f dB | mean edge IoU %.3f' % (rows[:, 1].mean(), np.median(rows[:, 2]), rows[:, 3].mean()))
