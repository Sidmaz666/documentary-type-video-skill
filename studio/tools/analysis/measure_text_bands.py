"""Measure exact text-band bboxes in reference frames at key beats.
Converts screen measurements -> world coordinates using camera keys.
Output: per-frame list of ink bands (y0,y1,x0,x1,height) + red bboxes.
"""
import sys
import numpy as np
from PIL import Image

# camera keys at beat (camx, camy, zoom) at beat time; screen = (wx-camx)*zoom+1920, (wy-camy)*zoom+823
CAM = {
    'hook': (1400, 1045, 1.0),
    'idea': (4366, 1200, 1.0),
    'milk': (7604, 1100, 1.0),
    'timeline': (10900, 1323, 1.0),
    'genes': (13000, 1398, 1.0),
    'toast': (17000, 1300, 1.0),
}
# 1-indexed frame number -> scene tag
SAMPLES = {
    14: 'hook', 20: 'hook', 30: 'hook', 40: 'hook', 110: 'hook', 140: 'hook',
    169: 'idea', 180: 'idea', 200: 'idea', 240: 'idea', 290: 'idea', 330: 'idea',
    352: 'milk', 370: 'milk', 400: 'milk', 430: 'milk', 460: 'milk', 487: 'milk',
    500: 'timeline', 520: 'timeline', 550: 'timeline', 580: 'timeline', 620: 'timeline', 649: 'timeline',
    656: 'genes', 680: 'genes', 700: 'genes', 720: 'genes', 750: 'genes', 781: 'genes',
    790: 'toast', 820: 'toast', 850: 'toast', 900: 'toast', 940: 'toast', 975: 'toast',
}

def bands(mask, min_count=25, gap=6):
    rows = np.where(mask.sum(axis=1) > min_count)[0]
    out = []
    if len(rows) == 0:
        return out
    start = rows[0]; prev = rows[0]
    for r in rows[1:]:
        if r - prev > gap:
            out.append((start, prev)); start = r
        prev = r
    out.append((start, prev))
    return out

def analyze(path):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.int16)
    # paper is cream ~ (243,238,220); ink dark. luminance threshold
    lum = (im[:, :, 0] * 0.6 + im[:, :, 1] * 0.34 + im[:, :, 2] * 0.06)
    ink = lum < 150
    _, W = ink.shape
    # exclude photo-print regions (they are big solid blobs) -> report instead of excluding
    red = (im[:, :, 0] > 130) & (im[:, :, 0] - im[:, :, 1] > 55) & (im[:, :, 0] - im[:, :, 2] > 55)
    return im, ink, red

def report(frame, scene):
    path = f'frames/ref_dense/ref_{frame:04d}.png'
    _, ink, red = analyze(path)
    camx, camy, zoom = CAM[scene]
    inv = lambda x, y: (int(round((x - 1920) / zoom + camx)), int(round((y - 823) / zoom + camy)))
    print(f'\n=== frame {frame:03d} ({scene}) ===')
    for (y0, y1) in bands(ink, min_count=30):
        xs = np.where(ink[y0:y1 + 1].any(axis=0))[0]
        if len(xs) == 0: continue
        x0, x1 = int(xs[0]), int(xs[-1])
        h = y1 - y0
        if h < 8: continue  # skip thin rules here
        wx, wy = inv((x0 + x1) / 2, y0)
        wcx, wcy = inv((x0 + x1) / 2, (y0 + y1) / 2)
        density = ink[y0:y1 + 1, x0:x1 + 1].mean()
        print(f'  ink band y={y0}-{y1} (h={h}) x={x0}-{x1} wx={wcx} wyTop={wy} fill={density:.2f}')
    # red elements
    for (y0, y1) in bands(red, min_count=12):
        xs = np.where(red[y0:y1 + 1].any(axis=0))[0]
        if len(xs) == 0: continue
        x0, x1 = int(xs[0]), int(xs[-1])
        if y1 - y0 < 4 and x1 - x0 < 4: continue
        rcx, rcy = inv((x0 + x1) / 2, (y0 + y1) / 2)
        print(f'  RED y={y0}-{y1} x={x0}-{x1} (w={x1-x0} h={y1-y0}) world_center=({rcx},{rcy})')

if __name__ == '__main__':
    frs = sys.argv[1:] if len(sys.argv) > 1 else [str(k) for k in SAMPLES]
    for f in map(int, frs):
        report(f, SAMPLES[f])
