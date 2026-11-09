"""Row/column ink probes for exact per-line text geometry.
Usage: probe.py <frame> <y0> <y1> [<y0> <y1> ...]
Prints a smoothed row-dark伯爵 profile with line segmentation per window.
"""
import sys
import numpy as np
from PIL import Image

def load(frame):
    im = np.asarray(Image.open(f'frames/ref_dense/ref_{frame:04d}.png').convert('RGB')).astype(np.int16)
    lum = im[:, :, 0] * 0.6 + im[:, :, 1] * 0.34 + im[:, :, 2] * 0.06
    return (lum < 150)

def probe(ink, y0, y1, thresh=8):
    print(f'-- window y={y0}..{y1}')
    prof = ink[y0:y1].sum(axis=1)
    rows = np.where(prof > thresh)[0]
    if len(rows) == 0:
        return
    segs = []
    start = prev = rows[0]
    for r in rows[1:]:
        if r - prev > 4:
            segs.append((start, prev)); start = r
        prev = r
    segs.append((start, prev))
    for (a, b) in segs:
        band = ink[y0 + a:y0 + b + 1]
        cols = np.where(band.any(axis=0))[0]
        x0, x1 = int(cols[0]), int(cols[-1])
        cx = (x0 + x1) / 2
        cy_all = y0 + (a + b) / 2
        # column profile gaps within band (word spacing)
        colprof = band.sum(axis=0)
        gaps = []
        c0 = None
        for i in range(x1 - x0 + 1):
            if colprof[x0 + i] > 0:
                if c0 is None:
                    pass
                c0 = i
            else:
                if c0 is not None:
                    startg = c0; 
                pass
        print(f'   line y={y0+a}-{y0+b} h={b-a} x={x0}-{x1} w={x1-x0} fill={band[:,x0:x1+1].mean():.2f} center=({cx:.0f},{cy_all:.0f})')

def main():
    args = list(map(int, sys.argv[1:]))
    frame = args[0]
    ink = load(frame)
    win_pairs = args[1:]
    print(f'=== frame {frame} ===')
    for i in range(0, len(win_pairs), 2):
        probe(ink, win_pairs[i], win_pairs[i + 1])

if __name__ == '__main__':
    main()
