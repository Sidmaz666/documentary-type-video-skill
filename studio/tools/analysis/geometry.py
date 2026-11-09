"""Final geometry extraction: element boxes (ink vs red) in targeted windows."""
import sys
import numpy as np
from PIL import Image

def masks(frame):
    im = np.asarray(Image.open(f'frames/ref_dense/ref_{frame:04d}.png').convert('RGB')).astype(np.int16)
    lum = im[:, :, 0] * 0.6 + im[:, :, 1] * 0.34 + im[:, :, 2] * 0.06
    ink = lum < 150
    red = (im[:, :, 0] > 130) & (im[:, :, 0] - im[:, :, 1] > 55) & (im[:, :, 0] - im[:, :, 2] > 55)
    return ink & ~red, red

def seg(ink, y0, y1, x0, x1, gap=8, minrow=6):
    band = ink[y0:y1, x0:x1]
    prof = band.sum(axis=1)
    rows = np.where(prof > minrow)[0]
    out = []
    if len(rows):
        s = p = rows[0]
        for r in rows[1:]:
            if r - p > gap:
                out.append((s, p)); s = r
            p = r
        out.append((s, p))
    res = []
    for (a, b) in out:
        if a == b: continue
        sl = band[a:b + 1]
        cols = np.where(sl.any(axis=0))[0]
        res.append({'y': [y0 + a, y0 + b], 'h': b - a,
                    'x': [x0 + int(cols[0]), x0 + int(cols[-1])],
                    'cx': float(x0 + (cols[0] + cols[-1]) / 2), 'cy': float(y0 + (a + b) / 2)})
    return res

TASKS = [
    # frame, ink windows, red windows
    (330, [((380, 1120), (1500, 3600))], [((300, 1300), (100, 1400))]),
    (40,  [((630, 850), (150, 1140))], [((900, 1350), (1000, 2400))]),
    (165, [((1300, 1620), (700, 3300))], [((300, 1500), (200, 3800))]),
    (390, [((350, 800), (1900, 3300))], [((450, 1450), (0, 300))]),
    (460, [((930, 1110), (300, 3000))], [((1500, 1500), (0, 1))]),
    (620, [((1020, 1320), (350, 1400)), ((1200, 1320), (150, 3800)), ((60, 1250), (100, 1800)), ((100, 1150), (1900, 3600))], [((1020, 1360), (350, 1350)), ((1230, 1320), (1300, 2300))]),
    (910, [((0, 720), (700, 3100))], [((0, 700), (0, 50))]),
    (778, [((150, 280), (450, 1950)), ((250, 1480), (900, 1550)), ((330, 1400), (1800, 3000)), ((1380, 1560), (500, 3000))], [((700, 1000), (2200, 2700)), ((650, 750), (950, 1400))]),
]
for (f, iwins, rwins) in TASKS:
    ink, red = masks(f)
    print(f'=== frame {f} ===')
    for (y0, y1), (x0, x1) in iwins:
        for r in seg(ink, y0, y1, x0, x1):
            print(f'  INK y={r["y"]} h={r["h"]} x={r["x"]} c=({r["cx"]:.0f},{r["cy"]:.0f})')
    for (y0, y1), (x0, x1) in rwins:
        for r in seg(red, y0, y1, x0, x1, gap=14):
            print(f'  RED y={r["y"]} h={r["h"]} x={r["x"]} c=({r["cx"]:.0f},{r["cy"]:.0f})')
