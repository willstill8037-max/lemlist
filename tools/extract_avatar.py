#!/usr/bin/env python3
"""Extract a circular avatar photo from a reference frame into a PNG with alpha.

The avatars (portrait photos) are static raster assets that only exist in the
video, so they are cut out of the sharpest, largest instance we could find.
Usage:
  python tools/extract_avatar.py FRAME CX CY R OUT.png [--refine] [--scale 2]
    FRAME  : reference frame index (reads reference/frames/fNNNNN.jpg)
    CX CY R: approximate circle centre / radius in frame pixels
    --refine: refine centre/radius by maximising the radial edge strength
The result is written at native resolution (optionally upscaled with --scale)
with an anti-aliased circular alpha mask. Provenance is appended to
assets/images/PROVENANCE.md by the caller (see docs/ASSETS.md).
"""
import sys, cv2, numpy as np

def refine(img, cx, cy, r):
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 1.2)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1)
    best = None
    angs = np.linspace(0, 2 * np.pi, 180, endpoint=False)
    for dx in np.arange(-4, 4.01, 0.5):
        for dy in np.arange(-4, 4.01, 0.5):
            for dr in np.arange(-5, 5.01, 0.5):
                x = cx + dx + (r + dr) * np.cos(angs); y = cy + dy + (r + dr) * np.sin(angs)
                xi = np.clip(x.round().astype(int), 0, g.shape[1] - 1); yi = np.clip(y.round().astype(int), 0, g.shape[0] - 1)
                s = np.abs(gx[yi, xi] * np.cos(angs) + gy[yi, xi] * np.sin(angs)).mean()
                if best is None or s > best[0]: best = (s, cx + dx, cy + dy, r + dr)
    return best[1:]

def main():
    a = sys.argv[1:]
    frame, cx, cy, r, out = int(a[0]), float(a[1]), float(a[2]), float(a[3]), a[4]
    scale = float(a[a.index('--scale') + 1]) if '--scale' in a else 1.0
    img = cv2.imread('reference/frames/f%05d.jpg' % frame)
    if '--refine' in a:
        cx, cy, r = refine(img, cx, cy, r)
    r_in = r - 1.0  # stay inside the photo edge (avoid the background ring)
    pad = int(np.ceil(r_in)) + 1
    x0, y0 = int(round(cx)) - pad, int(round(cy)) - pad
    crop = img[y0:y0 + 2 * pad, x0:x0 + 2 * pad].astype(np.float32)
    if scale != 1.0:
        crop = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
    h, w = crop.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    ccx, ccy = (cx - x0) * scale - 0.5 * (scale - 1), (cy - y0) * scale - 0.5 * (scale - 1)
    d = np.sqrt((xx - ccx) ** 2 + (yy - ccy) ** 2)
    alpha = np.clip(r_in * scale - d + 0.5, 0, 1) * 255
    rgba = np.dstack([np.clip(crop, 0, 255), alpha]).astype(np.uint8)
    cv2.imwrite(out, rgba)
    print('%s <- frame %d centre (%.1f, %.1f) radius %.1f px, size %dx%d' % (out, frame, cx, cy, r, w, h))

if __name__ == '__main__':
    main()
